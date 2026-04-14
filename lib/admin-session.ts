import { MASTER_SESSION_COOKIE, MEMBER_VIEW_SESSION_COOKIE } from "@/lib/master-password";

type CookieStoreLike = {
  get(name: string): { value?: string } | undefined;
};

export function hasAdministrativeSession(cookieStore: CookieStoreLike) {
  return (
    cookieStore.get(MASTER_SESSION_COOKIE)?.value === "authorized" ||
    cookieStore.get(MEMBER_VIEW_SESSION_COOKIE)?.value === "authorized"
  );
}
