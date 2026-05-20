import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";

const SUPABASE_URL = "https://dvcjvadunwganeqqdlwi.supabase.co";
const SUPABASE_PUBLISHABLE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR2Y2p2YWR1bndnYW5lcXFkbHdpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkyMjUwMTEsImV4cCI6MjA5NDgwMTAxMX0.g6ivqCneUe3sS_wPxQ8NUv01uOp7nprOvBI3B1q1RFg"; // paste your full anon key here

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: typeof window !== "undefined" ? localStorage : undefined,
    persistSession: true,
    autoRefreshToken: true,
  },
});
