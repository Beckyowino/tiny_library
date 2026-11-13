This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Supabase setup

1. Copy `.env.example` to `.env.local`.
2. In your Supabase project's **Settings → API**, set `NEXT_PUBLIC_SUPABASE_URL` to the project URL and `NEXT_PUBLIC_SUPABASE_ANON_KEY` to its publishable (or legacy anon) key.
3. Set `NEXT_PUBLIC_SITE_URL` to `http://localhost:3000` for local development.
4. In Supabase **Authentication → URL Configuration**, set the Site URL to `http://localhost:3000` and add `http://localhost:3000/auth/callback` as a Redirect URL.
5. Start the app and use **SIGN IN** in the navigation to create an account or sign in. Email confirmation must be enabled/disabled as desired in Supabase Auth settings.

For production, set the environment variables to the deployed app's values and add its `/auth/callback` URL to Supabase's allowed Redirect URLs.

## Loan reminder emails with Google Apps Script

The script in `supabase/apps-script/Code.gs` sends email through your Gmail account, so you do not need to own a domain or use Resend. It uses `Africa/Nairobi` dates and creates a daily trigger targeting 9 AM Nairobi time (Google may run time-based triggers within a window around the selected hour). Consumer Google accounts currently have a daily recipient quota; check Google's [Apps Script quotas](https://developers.google.com/apps-script/guides/services/quotas) before using this for a larger library.

1. In Supabase **SQL Editor**, run `supabase/migrations/202611120002_loan_reminder_delivery.sql`. This updates active loans to use Nairobi-based due dates and adds reminder delivery/retry tracking. Also run `supabase/migrations/202611130001_service_role_reminder_read_access.sql` to grant the reminder script read access to book and loan records. Do this before running the script.
2. In Supabase **SQL Editor**, also run `supabase/migrations/202611130002_book_borrow_availability.sql`. It adds the secure availability check used by book detail pages to hide the borrow button when no copies are available or the signed-in user already has that book on loan.
3. In your browser, visit [script.google.com](https://script.google.com), click **New project**, and name it `Tiny Library Reminders`.
4. In `Code.gs`, replace the starter function with the contents of `supabase/apps-script/Code.gs`, then click **Save**.
5. In Supabase **Project Settings → API Keys**, find the secret service-role key. Copy it privately; it bypasses database row-level security. Never put it in this repository, a `NEXT_PUBLIC_` variable, or a chat message.
6. In Apps Script, open **Project Settings** (gear icon) → **Script Properties** → **Add script property**, and add:

   | Property | Value |
   |---|---|
   | `SUPABASE_URL` | Your project's URL, e.g. `https://YOUR_PROJECT_REF.supabase.co` |
   | `SUPABASE_SERVICE_ROLE_KEY` | The secret service-role key from Supabase |

7. In Apps Script **Project Settings → Time zone**, choose **(GMT+03:00) Nairobi**.
8. In the function selector next to **Debug**, choose `installDailyReminderTrigger`, click **Run**, and approve the Google permissions. This installs one daily trigger and removes any older trigger for the same handler.
9. To test, choose `sendLoanReminders` in the function selector and click **Run**. Use an active test loan due in two days in Nairobi time and an email account you can check. In Apps Script, open **Executions** to see whether it succeeded. Run it a second time; the reminder record should cause the second run to skip sending the same reminder.
10. In Supabase **Table Editor → loan_reminders**, check that a delivered test has `status = sent`. Failed attempts appear as `failed` with an error in `last_error`, and are retried on a later run while the loan is still eligible. Returned loans are not sent reminders.

The email comes from the Google account that authorized the script, with the display name `Tiny Library`. Keep Apps Script access restricted to trusted editors because its Script Properties contain a Supabase service-role key. The reminder scheduler runs independently of Vercel; deploying the Next.js app does not deploy or enable this Apps Script project.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
