import Link from "next/link";
import { redirect } from "next/navigation";
import Navbar from "../components/Navbar";
import { getBookById } from "../lib/books";
import { createClient } from "../lib/supabase/server";
import ReturnButton from "./ReturnButton";

function formatDate(value: string) {
  return new Date(`${value}T12:00:00Z`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

export default async function LoansPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/sign-in");
  }

  const { data: loans, error } = await supabase
    .from("loans")
    .select("id, copy_id, borrowed_at, due_date, returned_at")
    .order("borrowed_at", { ascending: false });

  if (error) {
    throw new Error(`Could not load your loans: ${error.message}`);
  }

  const { data: copies, error: copiesError } = loans.length
    ? await supabase
        .from("book_copies")
        .select("id, book_id")
        .in(
          "id",
          loans.map((loan) => loan.copy_id),
        )
    : { data: [], error: null };

  if (copiesError) {
    throw new Error(`Could not load book details: ${copiesError.message}`);
  }

  const bookIdsByCopyId = new Map(
    copies.map((copy) => [copy.id, copy.book_id]),
  );

  return (
    <div className="min-h-dvh">
      <Navbar />
      <main className="mx-auto w-full max-w-5xl px-5 py-10 sm:px-8 sm:py-14">
        <p className="text-[10px] uppercase tracking-[0.18em] text-[#bd674d]">
          Your library account
        </p>
        <h1 className="mt-2 text-3xl font-semibold text-[#202321]">My Loans</h1>
        <p className="mt-2 text-sm text-[#4e5551]">
          Books are due 14 days after borrowing. Return a book here when
          you&apos;re finished.
        </p>

        {!loans.length ? (
          <div className="mt-8 border border-[#d7d7d4] bg-white p-6">
            <p className="text-sm text-[#4e5551]">
              You haven&apos;t borrowed any books yet.
            </p>
            <Link
              href="/books"
              className="mt-4 inline-block text-xs tracking-wide text-[#a34e38] underline underline-offset-2"
            >
              BROWSE BOOKS
            </Link>
          </div>
        ) : (
          <ul className="mt-8 divide-y divide-[#d7d7d4] border-y border-[#d7d7d4]">
            {loans.map((loan) => {
              const book = getBookById(
                String(bookIdsByCopyId.get(loan.copy_id) ?? ""),
              );
              const active = loan.returned_at === null;

              return (
                <li
                  key={loan.id}
                  className="flex flex-col gap-4 py-5 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <h2 className="font-medium text-[#202321]">
                      {book?.name ?? "Book"}
                    </h2>
                    {book && (
                      <p className="mt-1 text-sm text-[#4e5551]">
                        {book.author}
                      </p>
                    )}
                    <p className="mt-2 text-xs text-[#737873]">
                      Borrowed {formatDate(loan.borrowed_at.slice(0, 10))}
                      {" · "}
                      {active
                        ? `Due ${formatDate(loan.due_date)}`
                        : `Returned ${formatDate(loan.returned_at!.slice(0, 10))}`}
                    </p>
                  </div>
                  {active ? (
                    <ReturnButton loanId={loan.id} />
                  ) : (
                    <span className="text-[10px] tracking-[0.1em] text-[#737873]">
                      RETURNED
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </main>
    </div>
  );
}
