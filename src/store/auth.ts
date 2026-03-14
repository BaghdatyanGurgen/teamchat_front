import {create} from 'zustand';
import {createJSONStorage, persist} from 'zustand/middleware';

import {authApi} from '../api';
import {setUnauthorizedHandler} from '../api';
import type {LoginRequestDto, UserProfileResponseDto} from '../types/api';

const AUTH_STORAGE_KEY = 'teamchat.auth';

interface AuthState {
    accessToken: string | null;
    refreshToken: string | null;

    currentUser: UserProfileResponseDto | null;

    isAuthenticated: boolean;
    isLoading: boolean;
    hasHydrated: boolean;

    error: string | null;

    hydrate: () => void;

    login: (payload: LoginRequestDto) => Promise<void>;
    logout: () => Promise<void>;
    refreshTokens: () => Promise<boolean>;

    setCurrentUser: (user: UserProfileResponseDto | null) => void;

    clearError: () => void;
}

type AuthStoreSlice = Pick<
    AuthState,
    'accessToken' | 'refreshToken' | 'currentUser' | 'isAuthenticated'
>;

function isResponseSuccess(response: {
    IsSuccess?: boolean;
    isSuccess?: boolean;
}) {
    return response.IsSuccess ?? response.isSuccess ?? false;
}

function applyUnauthorizedHandler(logout: () => Promise<void>) {
    setUnauthorizedHandler(() => {
        void logout();
    });
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            accessToken: null,
            refreshToken: null,

            currentUser: null,

            isAuthenticated: false,
            isLoading: false,
            hasHydrated: false,

            error: null,

            hydrate: () => {
                applyUnauthorizedHandler(get().logout);
            },

            login: async (payload) => {
                set({isLoading: true, error: null});

                try {
                    const response = await authApi.login(payload);
                    const authData = response.Data ?? response.data;

                    console.log("LOGIN RESPONSE:", authData);
                    console.log("PROFILE OBJECT:", authData?.profile);
                    console.log("PROFILE ID:", authData?.profile?.id);

                    if (!isResponseSuccess(response) || !authData) {
                        throw new Error(response.Message ?? response.message ?? 'Login failed');
                    }

                    set({
                        accessToken: authData.accessToken,
                        refreshToken: authData.refreshToken,
                        currentUser: authData.profile,
                        isAuthenticated: true,
                        isLoading: false,
                    });

                } catch (error) {
                    set({
                        accessToken: null,
                        refreshToken: null,
                        currentUser: null,
                        isAuthenticated: false,
                        isLoading: false,
                        error: error instanceof Error ? error.message : 'Login failed',
                    });

                    throw error;
                }
            },

            logout: async () => {
                const {accessToken, refreshToken} = get();

                set({isLoading: true});

                try {
                    if (accessToken && refreshToken) {
                        await authApi.logout();
                    }
                } catch {
                } finally {
                    set({
                        accessToken: null,
                        refreshToken: null,
                        currentUser: null,
                        isAuthenticated: false,
                        isLoading: false,
                        error: null,
                    });
                }
            },

            refreshTokens: async () => {
                const {accessToken, refreshToken} = get();

                if (!accessToken || !refreshToken) {
                    set({
                        accessToken: null,
                        refreshToken: null,
                        currentUser: null,
                        isAuthenticated: false,
                    });

                    return false;
                }

                try {
                    const response = await authApi.refreshToken({
                        token: accessToken,
                        refreshToken,
                    });

                    const authData = response.Data ?? response.data;

                    if (!isResponseSuccess(response) || !authData) {
                        throw new Error(response.Message ?? response.message ?? 'Token refresh failed');
                    }

                    set({
                        accessToken: authData.accessToken,
                        refreshToken: authData.refreshToken,
                        currentUser: authData.profile,
                        isAuthenticated: true,
                        error: null,
                    });

                    return true;

                } catch {
                    set({
                        accessToken: null,
                        refreshToken: null,
                        currentUser: null,
                        isAuthenticated: false,
                    });

                    return false;
                }
            },

            setCurrentUser: (user) => {
                set({currentUser: user});
            },

            clearError: () => {
                set({error: null});
            },
        }),
        {
            name: AUTH_STORAGE_KEY,

            storage: createJSONStorage(() => localStorage),

            partialize: (state): AuthStoreSlice => ({
                accessToken: state.accessToken,
                refreshToken: state.refreshToken,
                currentUser: state.currentUser,
                isAuthenticated: state.isAuthenticated,
            }),

            onRehydrateStorage: () => (state) => {
                if (!state) return;

                state.hasHydrated = true;

                applyUnauthorizedHandler(state.logout);
            },
        }
    )
);

export function useAuth(): AuthState {
    return useAuthStore();
}