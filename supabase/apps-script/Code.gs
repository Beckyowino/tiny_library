const LIBRARY_TIME_ZONE = "Africa/Nairobi";
const REMINDER_HANDLER = "sendLoanReminders";

function installDailyReminderTrigger() {
  const properties = PropertiesService.getScriptProperties();
  const supabaseUrl = properties.getProperty("SUPABASE_URL");
  const serviceRoleKey = properties.getProperty("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      "Add SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in Project Settings > Script Properties first.",
    );
  }

  ScriptApp.getProjectTriggers()
    .filter((trigger) => trigger.getHandlerFunction() === REMINDER_HANDLER)
    .forEach((trigger) => ScriptApp.deleteTrigger(trigger));

  ScriptApp.newTrigger(REMINDER_HANDLER)
    .timeBased()
    .everyDays(1)
    .atHour(9)
    .inTimezone(LIBRARY_TIME_ZONE)
    .create();
}

function sendLoanReminders() {
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(1000)) {
    console.log("A reminder run is already in progress.");
    return;
  }

  try {
    const properties = PropertiesService.getScriptProperties();
    const supabaseUrl = properties.getProperty("SUPABASE_URL");
    const serviceRoleKey = properties.getProperty("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error(
        "Add SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in Script Properties.",
      );
    }

    const baseUrl = supabaseUrl.replace(/\/+$/, "");
    const today = Utilities.formatDate(
      new Date(),
      LIBRARY_TIME_ZONE,
      "yyyy-MM-dd",
    );
    const lastReminderDate = addDays(today, 2);
    const selection =
      "id,user_id,due_date,book_copies!inner(books!inner(title,author))";
    const query =
      "select=" +
      encodeURIComponent(selection) +
      "&returned_at=is.null&due_date=lte." +
      encodeURIComponent(lastReminderDate);
    const loans = supabaseRequest(
      baseUrl,
      serviceRoleKey,
      "GET",
      "/rest/v1/loans?" + query,
    );

    const results = { date: today, sent: 0, failed: 0, skipped: 0 };
    loans.forEach((loan) => {
      const remainingDays = daysUntil(loan.due_date, today);
      const reminderType = getReminderType(remainingDays);
      if (!reminderType) return;

      try {
        const claimed = supabaseRequest(
          baseUrl,
          serviceRoleKey,
          "POST",
          "/rest/v1/rpc/claim_loan_reminder",
          {
            p_loan_id: loan.id,
            p_reminder_type: reminderType,
          },
        );

        if (!claimed) {
          results.skipped += 1;
          return;
        }

        const account = supabaseRequest(
          baseUrl,
          serviceRoleKey,
          "GET",
          "/auth/v1/admin/users/" + encodeURIComponent(loan.user_id),
        );
        const user = account.user || account;
        if (!user.email) {
          throw new Error("Borrower account has no email address.");
        }

        const book = Array.isArray(loan.book_copies)
          ? loan.book_copies[0].books
          : loan.book_copies.books;
        const copy = getReminderCopy(reminderType, remainingDays);
        const dueDate = formatDueDate(loan.due_date);
        const safeTitle = escapeHtml(book.title);
        const safeAuthor = escapeHtml(book.author);
        const safeMessage = escapeHtml(copy.message);

        GmailApp.sendEmail(user.email, copy.subject, copy.message +
          "\n\n" + book.title + " by " + book.author +
          "\nDue date: " + dueDate +
          "\n\nTiny Library", {
            htmlBody:
              "<p>" +
              safeMessage +
              "</p><p><strong>" +
              safeTitle +
              "</strong> by " +
              safeAuthor +
              "<br>Due date: " +
              escapeHtml(dueDate) +
              "</p><p>Tiny Library</p>",
            name: "Tiny Library",
          });

        supabaseRequest(
          baseUrl,
          serviceRoleKey,
          "POST",
          "/rest/v1/rpc/mark_loan_reminder_sent",
          {
            p_loan_id: loan.id,
            p_reminder_type: reminderType,
          },
        );
        results.sent += 1;
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Unexpected reminder error.";
        console.error("Reminder failed for loan " + loan.id + ": " + message);
        try {
          supabaseRequest(
            baseUrl,
            serviceRoleKey,
            "POST",
            "/rest/v1/rpc/mark_loan_reminder_failed",
            {
              p_loan_id: loan.id,
              p_reminder_type: reminderType,
              p_error: message.slice(0, 1000),
            },
          );
        } catch (recordError) {
          console.error(
            "Could not record reminder failure for loan " +
              loan.id +
              ": " +
              (recordError instanceof Error
                ? recordError.message
                : "Unexpected database error."),
          );
        }
        results.failed += 1;
      }
    });

    console.log(JSON.stringify(results));
    return results;
  } finally {
    lock.releaseLock();
  }
}

function supabaseRequest(baseUrl, serviceRoleKey, method, path, body) {
  const options = {
    method: method,
    headers: {
      apikey: serviceRoleKey,
      Authorization: "Bearer " + serviceRoleKey,
    },
    muteHttpExceptions: true,
  };

  if (body !== undefined) {
    options.contentType = "application/json";
    options.payload = JSON.stringify(body);
  }

  const response = UrlFetchApp.fetch(baseUrl + path, options);
  const status = response.getResponseCode();
  const text = response.getContentText();

  if (status < 200 || status >= 300) {
    throw new Error(
      "Supabase returned HTTP " + status + ": " + text.slice(0, 500),
    );
  }

  return text ? JSON.parse(text) : null;
}

function getReminderType(remainingDays) {
  if (remainingDays <= 0) return "due_today";
  if (remainingDays <= 2) return "two_days_before";
  return null;
}

function getReminderCopy(type, remainingDays) {
  if (type === "two_days_before") {
    return remainingDays === 2
      ? {
          subject: "Your Tiny Library book is due in 2 days",
          message: "This is a friendly reminder that your book is due in 2 days.",
        }
      : {
          subject: "Your Tiny Library book is due tomorrow",
          message: "This is a friendly reminder that your book is due tomorrow.",
        };
  }

  if (remainingDays === 0) {
    return {
      subject: "Your Tiny Library book is due today",
      message: "Your book is due today. Please return it to the library.",
    };
  }

  const daysLate = Math.abs(remainingDays);
  return {
    subject: "Your Tiny Library book is overdue",
    message:
      "Your book was due " +
      daysLate +
      (daysLate === 1 ? " day ago." : " days ago.") +
      " Please return it to the library.",
  };
}

function addDays(date, days) {
  const value = new Date(date + "T00:00:00.000Z");
  value.setUTCDate(value.getUTCDate() + days);
  return value.toISOString().slice(0, 10);
}

function daysUntil(dueDate, today) {
  return (
    (Date.parse(dueDate + "T00:00:00.000Z") -
      Date.parse(today + "T00:00:00.000Z")) /
    86400000
  );
}

function formatDueDate(date) {
  return Utilities.formatDate(
    new Date(date + "T00:00:00.000Z"),
    "UTC",
    "d MMMM yyyy",
  );
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, function (character) {
    return {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    }[character];
  });
}
