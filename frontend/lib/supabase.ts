import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://ooskupwykeyivcmatjty.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "demo-anon-key";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

export const DEMO_GUEST_USER = {
  id: "demo-guest-user-00000000",
  email: "guest.demo@carbonsense.io",
  user_metadata: { full_name: "Guest Auditor (Demo)" },
  is_guest: true,
};

export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;

  // 1. Check guest demo session
  const guestToken = localStorage.getItem("carbonsense_guest_token");
  if (guestToken) return guestToken;

  // 2. Check Supabase session in localStorage
  try {
    const supabaseKey = `sb-${new URL(supabaseUrl).hostname.split(".")[0]}-auth-token`;
    const sessionRaw = localStorage.getItem(supabaseKey) || localStorage.getItem("supabase.auth.token");
    if (sessionRaw) {
      const parsed = JSON.parse(sessionRaw);
      return parsed.access_token || parsed?.currentSession?.access_token || null;
    }
  } catch (e) {}

  // 3. Fallback to default demo session for convenience
  return "demo-guest-token";
}

export function setGuestDemoSession() {
  if (typeof window === "undefined") return;
  localStorage.setItem("carbonsense_guest_token", "demo-guest-token");
  localStorage.setItem("carbonsense_user_email", "guest.demo@carbonsense.io");
  document.cookie = "cs_session=demo-guest-token; path=/; max-age=604800";
}

export function setSupabaseUserSession(token: string, email?: string) {
  if (typeof window === "undefined") return;
  localStorage.removeItem("carbonsense_guest_token");
  if (email) localStorage.setItem("carbonsense_user_email", email);
  document.cookie = `cs_session=${token}; path=/; max-age=604800`;
}

export function clearUserSession() {
  if (typeof window === "undefined") return;
  localStorage.removeItem("carbonsense_guest_token");
  localStorage.removeItem("carbonsense_user_email");
  document.cookie = "cs_session=; path=/; max-age=0";
  try {
    supabase.auth.signOut();
  } catch (e) {}
}

export async function getUserSession() {
  if (typeof window === "undefined") return null;

  // Check Supabase session first
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      const meta = session.user.user_metadata || {};
      const avatarUrl = meta.avatar_url || meta.picture || null;
      return {
        id: session.user.id,
        email: session.user.email,
        name: meta.full_name || meta.name || session.user.email?.split("@")[0],
        avatarUrl,
        token: session.access_token,
        isGuest: false,
      };
    }
  } catch (e) {}

  // Check guest demo session
  const guestToken = localStorage.getItem("carbonsense_guest_token");
  if (guestToken || (typeof document !== "undefined" && document.cookie.includes("cs_session=demo-guest-token"))) {
    return {
      id: DEMO_GUEST_USER.id,
      email: DEMO_GUEST_USER.email,
      name: "Guest Auditor (Demo)",
      avatarUrl: null,
      token: "demo-guest-token",
      isGuest: true,
    };
  }

  return null;
}

