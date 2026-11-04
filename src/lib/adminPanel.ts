/**
 * Institution admin panel (separate app: lms-admin-panel). In production each institution lives at
 * `<slug>.edupro.com`; locally the panel runs on http://localhost:3000.
 */
export const ADMIN_PANEL_URL = (process.env.NEXT_PUBLIC_ADMIN_PANEL_URL ?? "http://localhost:3000").replace(/\/$/, "");

/**
 * Panel URL that signs in as the institution with a 1-hour impersonation token. The token rides in the URL
 * fragment, which browsers never send to servers or in Referer headers; the panel stores it and strips it.
 */
export const impersonateUrl = (token: string) => `${ADMIN_PANEL_URL}/#impersonate=${encodeURIComponent(token)}`;
