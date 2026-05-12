"use server";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function signUpAction(
  email: string,
  password: string,
  emailRedirectTo: string,
  userData: Record<string, unknown>
): Promise<{ userId: string | null; error: string | null }> {
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: { flowType: "implicit" },
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // Server component – cookie setting may be read-only
          }
        },
      },
    }
  );

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: userData,
      emailRedirectTo,
    },
  });

  if (error) return { userId: null, error: error.message };
  if (!data.user) return { userId: null, error: "Ismeretlen hiba történt." };
  return { userId: data.user.id, error: null };
}
