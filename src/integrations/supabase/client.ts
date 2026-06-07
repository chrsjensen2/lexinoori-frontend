import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";

const SUPABASE_URL = "https://lqrbulluplvwlvogpfeb.supabase.co";
const SUPABASE_PUBLISHABLE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxxcmJ1bGx1cGx2d2x2b2dwZmViIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA3NzcxNzcsImV4cCI6MjA5NjM1MzE3N30.X6TujncBuRuoKDKMU9hEjNch3Mt9DC_uUQMucOSBvaY"; // paste your full anon key here

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: typeof window !== "undefined" ? localStorage : undefined,
    persistSession: true,
    autoRefreshToken: true,
  },
});
