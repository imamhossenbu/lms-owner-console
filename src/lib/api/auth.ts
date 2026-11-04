import { apiRequest } from "./client";

/** Password step: a session token, or a 2FA challenge to finish with `twoFactorLogin`. */
export type LoginResponse = { token: string; twoFactorRequired?: undefined } | { twoFactorRequired: true; challengeToken: string; token?: undefined };

export interface OwnerProfile {
  id: string;
  name: string;
  email: string;
  role: string;
}

export const authApi = {
  login: (email: string, password: string) => apiRequest<LoginResponse>("POST", "/auth/login", { email, password }, { anonymous: true }),
  twoFactorLogin: (challengeToken: string, code: string) => apiRequest<{ token: string }>("POST", "/auth/2fa/login", { challengeToken, code }, { anonymous: true }),
  /** Profile for an explicit token (right after sign-in, before the session is stored). */
  profile: (token: string) => apiRequest<OwnerProfile>("GET", "/user/me", undefined, { token }),
};
