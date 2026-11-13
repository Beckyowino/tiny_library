"use client";

import { useActionState } from "react";
import { returnBook } from "./actions";

export default function ReturnButton({ loanId }: { loanId: string }) {
  const [state, formAction, isPending] = useActionState(returnBook, {});

  return (
    <div>
      <form action={formAction}>
        <input type="hidden" name="loanId" value={loanId} />
        <button
          type="submit"
          disabled={isPending}
          className="min-h-9 border border-[#293b37] px-3 text-[10px] tracking-[0.1em] text-[#293b37] transition hover:bg-[#293b37] hover:text-white disabled:cursor-wait disabled:opacity-60"
        >
          {isPending ? "RETURNING..." : "RETURN BOOK"}
        </button>
      </form>
      {state.error && (
        <p role="alert" className="mt-2 text-xs text-red-700">
          {state.error}
        </p>
      )}
      {state.message && (
        <p role="status" className="mt-2 text-xs text-[#293b37]">
          {state.message}
        </p>
      )}
    </div>
  );
}
