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

function getSiteUrl() {
  const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  const vercelHost =
    process.env.VERCEL_ENV === "production"
      ? process.env.VERCEL_PROJECT_PRODUCTION_URL
      : process.env.VERCEL_URL;
  const fallbackUrl = vercelHost ? `https://${vercelHost}` : undefined;

  if (configuredUrl) {
    try {
      const url = new URL(configuredUrl);
      const isLocalhost =
        url.hostname === "localhost" || url.hostname === "127.0.0.1";

      if (process.env.VERCEL && isLocalhost) {
        return fallbackUrl;
      }

      if (url.protocol === "https:" || isLocalhost) {
        return url.origin;
      }
    } catch {
      return fallbackUrl;
    }
  }

  return fallbackUrl;
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

  const siteUrl = getSiteUrl();
  if (!siteUrl) {
    return {
      error:
        "Set NEXT_PUBLIC_SITE_URL or configure the Vercel deployment URL before signing up.",
    };
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
