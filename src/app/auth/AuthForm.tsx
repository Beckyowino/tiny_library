"use client";

import Link from "next/link";
import { useActionState } from "react";
import { signIn, signUp } from "./actions";

type AuthMode = "sign-in" | "sign-up";

export default function AuthForm({ mode }: { mode: AuthMode }) {
  const isSignUp = mode === "sign-up";
  const [state, formAction, isPending] = useActionState(
    isSignUp ? signUp : signIn,
    {},
  );

  return (
    <section className="w-full max-w-md border border-[#d7d7d4] bg-white p-6 sm:p-8">
      <p className="text-[10px] uppercase tracking-[0.18em] text-[#bd674d]">
        Tiny Library account
      </p>
      <h1 className="mt-2 text-2xl font-semibold text-[#202321]">
        {isSignUp ? "Create an account" : "Welcome back"}
      </h1>
      <p className="mt-2 text-sm leading-6 text-[#4e5551]">
        {isSignUp
          ? "Sign up to borrow books and keep track of your loans."
          : "Sign in to manage your library loans."}
      </p>

      <form action={formAction} className="mt-6 space-y-4">
        {isSignUp && (
          <label className="block text-xs text-[#333]">
            Name <span className="text-[#777]">(optional)</span>
            <input
              name="displayName"
              type="text"
              autoComplete="name"
              maxLength={100}
              className="mt-1 min-h-11 w-full border border-[#d7d7d4] px-3 text-sm outline-none focus:border-[#293b37]"
            />
          </label>
        )}
        <label className="block text-xs text-[#333]">
          Email
          <input
            name="email"
            type="email"
            autoComplete="email"
            required
            className="mt-1 min-h-11 w-full border border-[#d7d7d4] px-3 text-sm outline-none focus:border-[#293b37]"
          />
        </label>
        <label className="block text-xs text-[#333]">
          Password
          <input
            name="password"
            type="password"
            autoComplete={isSignUp ? "new-password" : "current-password"}
            required
            className="mt-1 min-h-11 w-full border border-[#d7d7d4] px-3 text-sm outline-none focus:border-[#293b37]"
          />
        </label>

        {state.error && (
          <p role="alert" className="text-sm text-red-700">
            {state.error}
          </p>
        )}
        {state.message && (
          <p role="status" className="text-sm text-[#293b37]">
            {state.message}
          </p>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="min-h-11 w-full bg-[#293b37] px-4 text-[10px] tracking-[0.12em] text-white transition hover:bg-[#bd674d] disabled:cursor-wait disabled:opacity-60"
        >
          {isPending
            ? "PLEASE WAIT..."
            : isSignUp
              ? "CREATE ACCOUNT"
              : "SIGN IN"}
        </button>
      </form>

      <p className="mt-5 text-sm text-[#4e5551]">
        {isSignUp ? "Already have an account?" : "New to Tiny Library?"}{" "}
        <Link
          href={isSignUp ? "/auth/sign-in" : "/auth/sign-up"}
          className="text-[#a34e38] underline underline-offset-2"
        >
          {isSignUp ? "Sign in" : "Create an account"}
        </Link>
      </p>
    </section>
  );
}
