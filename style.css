/* =========================================================
   SUPABASE CONFIGURATION
   Public browser key only.
   NEVER put the service_role / secret key in this file.
   ========================================================= */

const SUPABASE_URL = "https://wnntlkuhtldkxfynjoxg.supabase.co";

const SUPABASE_ANON_KEY = "sb_publishable_YWcRJj7Ihh3Osu4tG_HVXw_kZLB5RCv";

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
