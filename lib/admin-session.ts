import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import {
  ADMIN_SESSION_SECRET,
  ARBITRATION_SESSION_COOKIE,
  MASTER_REINTEGRATION_PASSWORD,
  MASTER_REINTEGRATION_PASSWORD_HASH,
  MASTER_SESSION_COOKIE,
  MEMBER_VIEW_SESSION_COOKIE,
} from "@/lib/master-password";

type AdminSessionKind = "master" | "member-view" | "arbitration";

type CookieStoreLike = {
  get(name: string): { value?: string } | undefined;
};

type MutableCookieStoreLike = CookieStoreLike & {
  set(
    name: string,
    value: string,
    options?: {
      httpOnly?: boolean;
      sameSite?: "lax" | "strict" | "none";
      secure?: boolean;
      maxAge?: number;
      path?: string;
    },
  ): void;
  delete(name: string): void;
};

const ADMIN_SESSION_TOKEN_VERSION = "v1";

function getAdministrativeSessionSecret() {
  return (
    ADMIN_SESSION_SECRET ||
    MASTER_REINTEGRATION_PASSWORD_HASH ||
    MASTER_REINTEGRATION_PASSWORD ||
    (process.env.NODE_ENV === "production" ? "" : "croa-local-admin-session-secret")
  );
}

function signAdministrativeSessionPayload(payload: string) {
  const secret = getAdministrativeSessionSecret();

  if (!secret) {
    return "";
  }

  return createHmac("sha256", secret).update(payload).digest("base64url");
}

function verifyTokenSignature(payload: string, receivedSignature: string) {
  const expectedSignature = signAdministrativeSessionPayload(payload);

  if (!expectedSignature) {
    return false;
  }

  const expectedBuffer = Buffer.from(expectedSignature);
  const receivedBuffer = Buffer.from(receivedSignature);

  if (expectedBuffer.length !== receivedBuffer.length) {
    return false;
  }

  return timingSafeEqual(expectedBuffer, receivedBuffer);
}

function verifyAdministrativeSessionToken(token?: string, expectedKind?: AdminSessionKind) {
  if (!token) {
    return false;
  }

  const [version, kind, issuedAt, nonce, signature] = token.split(".");

  if (
    version !== ADMIN_SESSION_TOKEN_VERSION ||
    !kind ||
    !issuedAt ||
    !nonce ||
    !signature ||
    (expectedKind && kind !== expectedKind)
  ) {
    return false;
  }

  const issuedAtNumber = Number.parseInt(issuedAt, 10);

  if (!Number.isFinite(issuedAtNumber) || issuedAtNumber <= 0) {
    return false;
  }

  return verifyTokenSignature([version, kind, issuedAt, nonce].join("."), signature);
}

export function createAdministrativeSessionToken(kind: AdminSessionKind) {
  const secret = getAdministrativeSessionSecret();

  if (!secret) {
    throw new Error("A sessão administrativa requer um segredo configurado.");
  }

  const payload = [
    ADMIN_SESSION_TOKEN_VERSION,
    kind,
    Date.now().toString(),
    randomBytes(16).toString("base64url"),
  ].join(".");

  const signature = signAdministrativeSessionPayload(payload);

  if (!signature) {
    throw new Error("Não foi possível assinar a sessão administrativa.");
  }

  return `${payload}.${signature}`;
}

export function getAdministrativeCookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    sameSite: "strict" as const,
    secure: process.env.NODE_ENV === "production",
    maxAge,
    path: "/",
  };
}

export function clearAdministrativeSessions(cookieStore: MutableCookieStoreLike) {
  cookieStore.delete(MASTER_SESSION_COOKIE);
  cookieStore.delete(MEMBER_VIEW_SESSION_COOKIE);
  cookieStore.delete(ARBITRATION_SESSION_COOKIE);
}

export function hasAdministrativeSession(cookieStore: CookieStoreLike) {
  return (
    verifyAdministrativeSessionToken(cookieStore.get(MASTER_SESSION_COOKIE)?.value, "master") ||
    verifyAdministrativeSessionToken(cookieStore.get(MEMBER_VIEW_SESSION_COOKIE)?.value, "member-view")
  );
}

export function hasArbitrationSession(cookieStore: CookieStoreLike) {
  return (
    hasAdministrativeSession(cookieStore) ||
    verifyAdministrativeSessionToken(cookieStore.get(ARBITRATION_SESSION_COOKIE)?.value, "arbitration")
  );
}
