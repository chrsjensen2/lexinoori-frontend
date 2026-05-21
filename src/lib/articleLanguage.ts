import { supabase } from "@/integrations/supabase/client";

export async function getUserLanguage(): Promise<string> {
  try {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user) return "en";
    const { data: profile } = await (supabase as any)
      .from("profiles")
      .select("primary_language")
      .eq("user_id", userData.user.id)
      .maybeSingle();
    return profile?.primary_language || "en";
  } catch {
    return "en";
  }
}

export function pickLang<T = any>(row: any, base: string, language: string): T {
  const suffix = language === "en" ? "" : `_${language}`;
  return (row?.[`${base}${suffix}`] ?? row?.[base]) as T;
}

export const TRANSLATED_COLS = "headline, body_standard, headline_da, body_standard_da, headline_de, body_standard_de, headline_es, body_standard_es";
