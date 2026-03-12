import axios, { type AxiosError, type AxiosInstance, type InternalAxiosRequestConfig } from 'axios';

import { useAuthStore } from '../store/auth';
import type { AuthResponseDto, RefreshTokenRequestDto, ResponseModel } from '../types/api';

const REFRESH_ENDPOINT = '/user/refresh-token';

type RetryRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
};

const httpClient: AxiosInstance = axios.create({
  baseURL: 'http://localhost:5263/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

let refreshPromise: Promise<string | null> | null = null;
let unauthorizedHandler: (() => void) | null = null;

function shouldSkipRefresh(url?: string): boolean {
  if (!url) {
    return false;
  }

  const normalized = url.toLowerCase();
  return normalized.includes('/user/login') || normalized.includes(REFRESH_ENDPOINT);
}

function isResponseSuccess<T>(response: ResponseModel<T>): boolean {
  return response.IsSuccess ?? response.isSuccess ?? false;
}

function getResponseData<T>(response: ResponseModel<T>): T | undefined {
  return response.Data ?? response.data;
}

function clearAuthState(): void {
  useAuthStore.setState({
    accessToken: null,
    refreshToken: null,
    isAuthenticated: false,
    userProfile: null,
    currentUser: null,
  });
}

function redirectToLogin(): void {
  if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
    window.location.assign('/login');
  }
}

function handleUnauthorized(): void {
  clearAuthState();
  unauthorizedHandler?.();
  redirectToLogin();
}

async function refreshAccessToken(): Promise<string | null> {
  const { accessToken, refreshToken } = useAuthStore.getState();

  if (!refreshToken) {
    handleUnauthorized();
    return null;
  }

  const payload: RefreshTokenRequestDto = {
    token: accessToken ?? '',
    refreshToken,
  };

  try {
    const response = await httpClient.post<ResponseModel<AuthResponseDto>>(REFRESH_ENDPOINT, payload);
    const authData = getResponseData(response.data);

    if (!isResponseSuccess(response.data) || !authData) {
      handleUnauthorized();
      return null;
    }

    const nextAccessToken = authData.accessToken;
    const nextRefreshToken = authData.refreshToken;

    if (!nextAccessToken || !nextRefreshToken) {
      handleUnauthorized();
      return null;
    }

    useAuthStore.setState({
      accessToken: nextAccessToken,
      refreshToken: nextRefreshToken,
      isAuthenticated: true,
      userProfile: authData.Profile,
      currentUser: authData.Profile,
    });

    return nextAccessToken;
  } catch {
    handleUnauthorized();
    return null;
  }
}

httpClient.interceptors.request.use(async (config) => {
  const { accessToken, refreshToken } = useAuthStore.getState();

  if (accessToken) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${accessToken}`;
    return config;
  }

  if (!refreshToken || shouldSkipRefresh(config.url)) {
    return config;
  }

  if (!refreshPromise) {
    refreshPromise = refreshAccessToken().finally(() => {
      refreshPromise = null;
    });
  }

  const newAccessToken = await refreshPromise;
  if (!newAccessToken) {
    return Promise.reject(new Error('Unauthorized'));
  }

  config.headers = config.headers ?? {};
  config.headers.Authorization = `Bearer ${newAccessToken}`;

  return config;
});

httpClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetryRequestConfig | undefined;

    if (!originalRequest) {
      return Promise.reject(error);
    }

    const unauthorized = error.response?.status === 401;
    if (!unauthorized || originalRequest._retry || shouldSkipRefresh(originalRequest.url)) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    if (!refreshPromise) {
      refreshPromise = refreshAccessToken().finally(() => {
        refreshPromise = null;
      });
    }

    const newAccessToken = await refreshPromise;
    if (!newAccessToken) {
      handleUnauthorized();
      return Promise.reject(error);
    }

    originalRequest.headers = originalRequest.headers ?? {};
    originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

    return httpClient(originalRequest);
  },
);

export function setUnauthorizedHandler(handler: (() => void) | null): void {
  unauthorizedHandler = handler;
}

export { httpClient };
