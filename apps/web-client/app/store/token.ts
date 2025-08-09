import { atom } from "jotai";
import { atomWithStorage, createJSONStorage } from "jotai/utils";
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAt: Date | string;
  refreshTokenExpiresAt: Date | string;
}

export const AUTH_TOKEN_KEY = "auth-tokens";

const dummyStorage = {
  getItem: (_key: string): string | null => null,
  setItem: (_key: string, _newValue: string | null): void => {},
  removeItem: (_key: string): void => {},
};

// 2. Buat storage yang dinamis: periksa apakah 'window' ada.
const storage = createJSONStorage<AuthTokens | null>(() => {
  // Pengecekan ini adalah kunci dari SSR-safety
  if (typeof window === "undefined") {
    // Jika di server, kembalikan storage palsu
    return dummyStorage;
  } else {
    // Jika di client, kembalikan localStorage yang asli
    return localStorage;
  }
});

// --- TIDAK ADA PERUBAHAN DARI SINI KE BAWAH ---

// 3. Definisi atom sekarang menjadi SSR-safe karena 'storage' kita sudah cerdas
export const authTokenAtom = atomWithStorage<AuthTokens | null>(
  AUTH_TOKEN_KEY,
  null, // Nilai awal tetap null
  storage,
  {
    getOnInit: true, // Opsi ini baik untuk hidrasi di client
  },
);

export const isAuthenticatedAtom = atom((get) => !!get(authTokenAtom));
export const accessTokenAtom = atom((get) => get(authTokenAtom)?.accessToken);
export const refreshTokenAtom = atom((get) => get(authTokenAtom)?.refreshToken);

export const isAccessTokenExpiredAtom = atom((get) => {
  const tokens = get(authTokenAtom);
  if (!tokens?.accessTokenExpiresAt) {
    return true;
  }
  return Date.now() > new Date(tokens.accessTokenExpiresAt).getTime();
});

export const isRefreshTokenExpiredAtom = atom((get) => {
  const tokens = get(authTokenAtom);
  if (!tokens?.refreshTokenExpiresAt) {
    return true;
  }
  return Date.now() > new Date(tokens.refreshTokenExpiresAt).getTime();
});
