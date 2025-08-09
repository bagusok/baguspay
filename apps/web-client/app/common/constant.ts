export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
export const DEFAULT_LOCALE = "id";
export const SUPPORTED_LANGUAGES = ["en", "id", "ms"];
export const DEFAULT_THEME = "light";
export const SUPPORTED_THEMES = ["light", "dark", "system"];
export const DEVICE_ID_KEY = "deviceId";

export const ACCESS_TOKEN = "_baguspay.auth_token";
export const REFRESH_TOKEN = "_baguspay.refresh_token";
export const REFRESH_TOKEN_EXPIRED_AT = "_baguspay.refresh_token_expired_at";
export const ACCESS_TOKEN_EXPIRED_AT = "_baguspay.access_token_expired_at";

export const SESSION_KEY = "__baguspay.session";

export const APP_VERSION = import.meta.env.VITE_APP_VERSION || "1.0.0";
