/**
 * Institution admin panel (separate app: lms-admin-panel). In production each institution lives at
 * `<slug>.edupro.com`; locally the panel runs on http://localhost:3000.
 */
export const ADMIN_PANEL_URL = (process.env.NEXT_PUBLIC_ADMIN_PANEL_URL ?? "http://localhost:3000").replace(/\/$/, "");

/** Panel URL that opens an institution as the platform owner (the panel reads `?impersonate=`). */
export const impersonateUrl = (institutionId: string) => `${ADMIN_PANEL_URL}/?impersonate=${encodeURIComponent(institutionId)}`;
