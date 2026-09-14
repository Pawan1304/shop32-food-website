/* =========================================================
   SUPABASE CONFIGURATION
   Public browser key only.
   NEVER put the service_role / secret key in this file.
   ========================================================= */

const SUPABASE_URL = "https://wnntlkuhtldkxfynjoxg.supabase.co";

const SUPABASE_ANON_KEY = "PASTE_YOUR_PUBLISHABLE_KEY_HERE";

const SUPABASE_BUCKET = "site-photos";

let supabaseClient = null;

if (
  window.supabase &&
  SUPABASE_URL.startsWith("https://") &&
  !SUPABASE_URL.includes("PASTE_YOUR") &&
  !SUPABASE_ANON_KEY.includes("PASTE_YOUR")
) {
  supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
  );
}
