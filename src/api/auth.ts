import { httpClient } from './httpClient';
import type {
  AuthResponseDto,
  CreateCompanyRequestDto,
  CreateDraftRequestDto,
  LoginRequestDto,
  LogoutResponseDto,
  RefreshTokenRequestDto,
  RegisterEmailResponseDto,
  ResponseModel,
  CompanyResponseDto,
  SetPasswordRequestDto,
  SetPasswordResponseDto,
  SetUserProfileRequestDto,
  UserProfileResponseDto,
  VerifyEmailRequestDto,
  VerifyEmailResponseDto,
} from '../types/api';

export const authApi = {
  login: (payload: LoginRequestDto): Promise<ResponseModel<AuthResponseDto>> =>
    httpClient.post<ResponseModel<AuthResponseDto>>('/user/login', payload).then((response) => response.data),

  refreshToken: (payload: RefreshTokenRequestDto): Promise<ResponseModel<AuthResponseDto>> =>
    httpClient.post<ResponseModel<AuthResponseDto>>('/user/refresh-token', payload).then((response) => response.data),

  logout: (): Promise<LogoutResponseDto> =>
    httpClient.post<LogoutResponseDto>('/user/logout').then((response) => response.data),

  createDraft: (payload: CreateDraftRequestDto): Promise<RegisterEmailResponseDto> =>
    httpClient.post<RegisterEmailResponseDto>('/user/create-draft', payload).then((response) => response.data),

  verifyEmail: (payload: VerifyEmailRequestDto): Promise<VerifyEmailResponseDto> =>
    httpClient.post<VerifyEmailResponseDto>('/user/verify-email', payload).then((response) => response.data),

  setPassword: (payload: SetPasswordRequestDto): Promise<SetPasswordResponseDto> =>
    httpClient.post<SetPasswordResponseDto>('/user/set-password', payload).then((response) => response.data),

  getMyCompanies: (): Promise<ResponseModel<CompanyResponseDto[]>> =>
    httpClient.get<ResponseModel<CompanyResponseDto[]>>('/company/my-companies').then((response) => response.data),

  createCompany: (payload: CreateCompanyRequestDto): Promise<ResponseModel<CompanyResponseDto>> =>
    httpClient.post<ResponseModel<CompanyResponseDto>>('/company/create-company', payload).then((response) => response.data),

  joinCompanyByInvite: (payload: { inviteCode: string }): Promise<ResponseModel<CompanyResponseDto>> =>
    httpClient.post<ResponseModel<CompanyResponseDto>>('/company/join-by-invite', payload).then((response) => response.data),

  setUserProfile: (payload: SetUserProfileRequestDto): Promise<UserProfileResponseDto> =>
    httpClient.patch<UserProfileResponseDto>('/user/set-user-profile', payload).then((response) => response.data),

  uploadAvatar: (formData: FormData): Promise<{ isSuccess: boolean; message?: string }> =>
      httpClient
          .post('/user/avatar', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          })
          .then((response) => response.data),
};
