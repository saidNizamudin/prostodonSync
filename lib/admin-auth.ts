export const ADMIN_VERIFIED_STORAGE_KEY = "verified";
export const ADMIN_VERIFIED_COOKIE = "admin_verified";
export const ADMIN_VERIFIED_EVENT = "admin-verified";

export function readAdminVerifiedFromStorage(): boolean {
  if (typeof window === "undefined") return false;
  return window.sessionStorage.getItem(ADMIN_VERIFIED_STORAGE_KEY) === "true";
}

export function setAdminVerified(): void {
  if (typeof window === "undefined") return;

  window.sessionStorage.setItem(ADMIN_VERIFIED_STORAGE_KEY, "true");
  document.cookie = `${ADMIN_VERIFIED_COOKIE}=1; path=/; max-age=86400; SameSite=Lax`;
  window.dispatchEvent(new Event(ADMIN_VERIFIED_EVENT));
}

export function ensureAdminCookie(): void {
  if (typeof document === "undefined") return;
  if (readAdminVerifiedFromStorage()) {
    document.cookie = `${ADMIN_VERIFIED_COOKIE}=1; path=/; max-age=86400; SameSite=Lax`;
  }
}

export function clearAdminVerified(): void {
  if (typeof window === "undefined") return;

  window.sessionStorage.removeItem(ADMIN_VERIFIED_STORAGE_KEY);
  document.cookie = `${ADMIN_VERIFIED_COOKIE}=; path=/; max-age=0; SameSite=Lax`;
  window.dispatchEvent(new Event(ADMIN_VERIFIED_EVENT));
}
