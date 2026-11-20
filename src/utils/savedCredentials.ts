import { Role } from '../types/cbt';

export interface SavedLoginCredentials {
  userId?: string;
  username: string;
  password: string;
  displayName?: string;
  role?: Role;
  savedAt: number;
}

const STORAGE_KEY = 'educbt_saved_credentials_v1';

const encodePayload = (raw: string): string => {
  try {
    const bytes = new TextEncoder().encode(raw);
    let bin = '';
    bytes.forEach(b => {
      bin += String.fromCharCode(b ^ 0x5a);
    });
    return btoa(bin);
  } catch {
    return raw;
  }
};

const decodePayload = (encoded: string): string => {
  try {
    const bin = atob(encoded);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) {
      bytes[i] = bin.charCodeAt(i) ^ 0x5a;
    }
    return new TextDecoder().decode(bytes);
  } catch {
    return encoded;
  }
};

export const loadSavedCredentials = (): SavedLoginCredentials | null => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const decoded = decodePayload(raw);
    const parsed = JSON.parse(decoded) as SavedLoginCredentials;
    if (!parsed || typeof parsed.username !== 'string' || typeof parsed.password !== 'string') {
      return null;
    }
    if (!parsed.username.trim() || !parsed.password) return null;
    return parsed;
  } catch {
    return null;
  }
};

export const saveLoginCredentials = (
  creds: Omit<SavedLoginCredentials, 'savedAt'>
): void => {
  if (typeof window === 'undefined') return;
  try {
    const payload: SavedLoginCredentials = {
      ...creds,
      username: creds.username.trim(),
      savedAt: Date.now(),
    };
    localStorage.setItem(STORAGE_KEY, encodePayload(JSON.stringify(payload)));
  } catch {
    // Ignore storage quota errors
  }
};

export const clearSavedCredentials = (): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {}
};

export const syncSavedCredentialPassword = (
  userId: string,
  newPassword: string,
  identifiers: string[] = []
): void => {
  const existing = loadSavedCredentials();
  if (!existing) return;

  const normalizedIds = identifiers.map(s => s.trim().toLowerCase()).filter(Boolean);
  const existingUserLower = existing.username.trim().toLowerCase();

  const matches =
    (existing.userId && existing.userId === userId) ||
    normalizedIds.includes(existingUserLower);

  if (matches) {
    saveLoginCredentials({
      ...existing,
      password: newPassword,
    });
  }
};
