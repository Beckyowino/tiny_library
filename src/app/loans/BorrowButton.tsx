"use client";

import Link from "next/link";
import { useActionState } from "react";
import { borrowBook } from "./actions";

export default function BorrowButton({
  bookId,
  authenticated,
  available,
  alreadyBorrowed,
}: {
  bookId: number;
  authenticated: boolean;
  available: boolean;
  alreadyBorrowed: boolean;
}) {
  const [state, formAction, isPending] = useActionState(borrowBook, {});

  if (state.borrowed) {
    return (
      <div className="mt-8">
        <p role="status" className="text-sm text-[#293b37]">
          {state.message}
        </p>
        <Link
          href="/loans"
          className="mt-2 inline-block text-xs text-[#a34e38] underline underline-offset-2"
        >
          VIEW MY LOANS
        </Link>
      </div>
    );
  }

  if (alreadyBorrowed) {
    return (
      <p className="mt-8 text-sm text-[#4e5551]">
        You already have this book on loan.{" "}
        <Link href="/loans" className="text-[#a34e38] underline underline-offset-2">
          View My Loans
        </Link>
      </p>
    );
  }

  if (!available || state.unavailable) {
    return (
      <p role="status" className="mt-8 text-sm text-[#737873]">
        This book is currently unavailable to borrow.
      </p>
    );
  }

  if (!authenticated) {
    return (
      <div className="mt-8">
        <Link
          href="/auth/sign-in"
          className="inline-flex min-h-11 items-center bg-[#293b37] px-5 text-[10px] tracking-[0.12em] text-white transition hover:bg-[#bd674d]"
        >
          SIGN IN TO BORROW
        </Link>
        <p className="mt-2 text-xs text-[#737873]">
          Books can be borrowed for 14 days.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <form action={formAction}>
        <input type="hidden" name="bookId" value={bookId} />
        <button
          type="submit"
          disabled={isPending}
          className="min-h-11 bg-[#293b37] px-5 text-[10px] tracking-[0.12em] text-white transition hover:bg-[#bd674d] disabled:cursor-wait disabled:opacity-60"
        >
          {isPending ? "BORROWING..." : "BORROW THIS BOOK"}
        </button>
      </form>
      <p className="mt-2 text-xs text-[#737873]">
        Borrow this book for 14 days.
      </p>
      {state.error && (
        <p role="alert" className="mt-3 text-sm text-red-700">
          {state.error}
        </p>
      )}
    </div>
  );
}
