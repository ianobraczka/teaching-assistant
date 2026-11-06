/** Schoology / Assessment Assistant password gate (cookie + SITE_PASSWORD env). */

export const SITE_ACCESS_COOKIE = "ta_site_access";
export const SITE_ACCESS_MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30 days

export function getSitePassword(): string | undefined {
  const value = process.env.SITE_PASSWORD?.trim();
  return value ? value : undefined;
}

/** True when SITE_PASSWORD is set — Assessment Assistant requires the access cookie. */
export function isSitePasswordEnabled(): boolean {
  return Boolean(getSitePassword());
}

export async function hashSitePassword(password: string): Promise<string> {
  const data = new TextEncoder().encode(`teaching-assistant:v1:${password}`);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export async function getExpectedAccessToken(): Promise<string | null> {
  const password = getSitePassword();
  if (!password) {
    return null;
  }
  return hashSitePassword(password);
}

export async function isValidAccessToken(token: string | undefined | null): Promise<boolean> {
  if (!token) {
    return false;
  }
  const expected = await getExpectedAccessToken();
  if (!expected || token.length !== expected.length) {
    return false;
  }
  // Constant-time-ish compare for equal-length hex strings
  let mismatch = 0;
  for (let i = 0; i < expected.length; i += 1) {
    mismatch |= expected.charCodeAt(i) ^ token.charCodeAt(i);
  }
  return mismatch === 0;
}
