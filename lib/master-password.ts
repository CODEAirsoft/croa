export const MASTER_REINTEGRATION_OWNER = "CROA-000001";
export const CROA_GHOST_NUMBER = 0;
export const CROA_OWNER_NUMBER = 1;
export const CROA_GHOST_CODINAME = "eNobili";
export const MASTER_REINTEGRATION_LOGIN =
  process.env.MASTER_REINTEGRATION_LOGIN?.trim() || CROA_GHOST_CODINAME;
export const MASTER_REINTEGRATION_PASSWORD =
  process.env.MASTER_REINTEGRATION_PASSWORD?.trim() ?? "";
export const MASTER_REINTEGRATION_PASSWORD_HASH =
  process.env.MASTER_REINTEGRATION_PASSWORD_HASH?.trim() ?? "";
export const ADMIN_SESSION_SECRET = process.env.ADMIN_SESSION_SECRET?.trim() ?? "";
export const MASTER_SESSION_COOKIE = "croa_master_session";
export const MEMBER_VIEW_SESSION_COOKIE = "croa_members_admin_view";
