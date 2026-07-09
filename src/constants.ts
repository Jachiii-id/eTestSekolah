// Shared by both the client app (src/) and the Node seed script (scripts/) —
// keep this file free of import.meta.env / browser-only APIs.

export const AUTH_EMAIL_DOMAIN = 'etest-labschool.local';
export const MAX_VIOLATIONS = 3;
export const TOTAL_QUESTIONS = 40;
export const DEFAULT_DURATION_MINUTES = 60;

export function usernameToEmail(username: string): string {
  return `${username.toLowerCase()}@${AUTH_EMAIL_DOMAIN}`;
}
