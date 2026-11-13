"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "../lib/supabase/server";

export type AuthFormState = {
  error?: string;
  message?: string;
};

function getCredentials(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Enter your email address and password." };
  }

  return { email, password };
}

export async function signIn(
  _previousState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const credentials = getCredentials(formData);
  if ("error" in credentials) return credentials;

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(credentials);

  if (error) return { error: error.message };

  redirect("/books");
}

export async function signUp(
  _previousState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const credentials = getCredentials(formData);
  if ("error" in credentials) return credentials;

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (!siteUrl) {
    return { error: "Set NEXT_PUBLIC_SITE_URL in your environment first." };
  }

  const displayName = String(formData.get("displayName") ?? "").trim();
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    ...credentials,
    options: {
      data: displayName ? { display_name: displayName } : {},
      emailRedirectTo: new URL("/auth/callback", siteUrl).toString(),
    },
  });

  if (error) return { error: error.message };
  if (data.session) redirect("/books");

  return {
    message:
      "Account created. Check your email for a confirmation link before signing in.",
  };
}

export async function signOut() {
  const supabase = await createClient();
  const { error } = await supabase.auth.signOut();

  if (error) {
    throw new Error(`Could not sign out: ${error.message}`);
  }

  revalidatePath("/", "layout");
  redirect("/");
}
