"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "../lib/supabase/server";

export type LoanActionState = {
  error?: string;
  message?: string;
  borrowed?: boolean;
  unavailable?: boolean;
};

export async function borrowBook(
  _previousState: LoanActionState,
  formData: FormData,
): Promise<LoanActionState> {
  const bookId = Number(formData.get("bookId"));
  if (!Number.isSafeInteger(bookId) || bookId < 1) {
    return { error: "That book could not be identified." };
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    return { error: userError.message };
  }
  if (!user) {
    return { error: "Sign in to borrow a book." };
  }

  const { error } = await supabase.rpc("borrow_book", {
    p_book_id: bookId,
  });

  if (error) {
    if (error.message.includes("No copies of this book are currently available")) {
      return {
        error: "Sorry, this book is no longer available.",
        unavailable: true,
      };
    }
    return { error: error.message };
  }

  revalidatePath(`/books/${bookId}`);
  revalidatePath("/loans");

  return {
    message: "Book borrowed. See My Loans for the due date.",
    borrowed: true,
  };
}

export async function returnBook(
  _previousState: LoanActionState,
  formData: FormData,
): Promise<LoanActionState> {
  const loanId = String(formData.get("loanId") ?? "");
  if (
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      loanId,
    )
  ) {
    return { error: "That loan could not be identified." };
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    return { error: userError.message };
  }
  if (!user) {
    return { error: "Sign in to return a book." };
  }

  const { error } = await supabase.rpc("return_book", {
    p_loan_id: loanId,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/loans");
  return { message: "Book returned." };
}
