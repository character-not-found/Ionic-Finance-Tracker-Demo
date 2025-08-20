// src/services/authService.ts
import { Preferences } from '@capacitor/preferences';

let accessToken: string | null = null;

/**
 * Saves the access token to both in-memory cache and secure storage.
 * @param token The access token to save.
 */
export const setToken = async (token: string): Promise<void> => {
    accessToken = token;
    await Preferences.set({
        key: 'access_token',
        value: token,
    });
};

/**
 * Retrieves the access token from the in-memory cache first, then from secure storage if not found.
 * @returns The access token or null if it does not exist.
 */
export const getToken = async (): Promise<string | null> => {
    if (accessToken) {
        return accessToken;
    }

    const { value } = await Preferences.get({ key: 'access_token' });
    if (value) {
        accessToken = value;
    }

    return accessToken;
};

/**
 * Removes the access token from both in-memory cache and secure storage.
 */
export const clearToken = async (): Promise<void> => {
    accessToken = null;
    await Preferences.remove({ key: 'access_token' });
};