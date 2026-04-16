import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, storedHash: string) {
  const [salt, hash] = storedHash.split(":");

  if (!salt || !hash) {
    return false;
  }

  const derivedHash = scryptSync(password, salt, 64);
  const originalHash = Buffer.from(hash, "hex");

  if (derivedHash.length !== originalHash.length) {
    return false;
  }

  return timingSafeEqual(derivedHash, originalHash);
}

export function verifyPlainSecret(value: string, expected: string) {
  const normalizedValue = Buffer.from(value);
  const normalizedExpected = Buffer.from(expected);

  if (normalizedValue.length !== normalizedExpected.length) {
    return false;
  }

  return timingSafeEqual(normalizedValue, normalizedExpected);
}
