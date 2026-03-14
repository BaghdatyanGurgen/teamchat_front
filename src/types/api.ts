export type Guid = string;

export interface ResponseModel<T> {
  IsSuccess: boolean;
  Message?: string;
  Data?: T;
  isSuccess?: boolean;
  message?: string;
  data?: T;
}

export interface UserProfileResponseDto {
  id: Guid;
  email: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  companyId?: number;
  departmentId?: number;
  teamId?: number;
}

export interface AuthResponseDto {
  profile: UserProfileResponseDto;
  accessToken: string;
  refreshToken: string;
}

export interface LoginRequestDto {
  email: string;
  password: string;
}

export interface RefreshTokenRequestDto {
  token: string;
  refreshToken: string;
}

export interface LogoutResponseDto {
  message: string;
}

export interface CreateDraftRequestDto {
  email: string;
}

export interface RegisterEmailResponseDto {
  userId: Guid;
  message: string;
}

export interface VerifyEmailRequestDto {
  userId: Guid;
  token: string;
}

export interface VerifyEmailResponseDto {
  isSuccess: boolean;
  message?: string;
}

export interface SetPasswordRequestDto {
  userId: Guid;
  password: string;
}

export interface SetPasswordResponseDto {
  isSuccess: boolean;
  message?: string;
}

export interface SetUserProfileRequestDto {
  firstName: string;
  lastName: string;
}

export interface CreateChatRequestDto {
  name: string;
  scope: number;
  departmentId?: number;
  teamId?: number;
  companyId: number;
}

export interface ChatResponseDto {
  id: Guid;
  name: string;
  scope: number;
  departmentId?: number;
  teamId?: number;
  companyId: number;
  createdAt?: string;
}

export interface CompanyChatResponseDto {
  id: Guid;
  name: string;
  createdAt: string;
}

export enum PositionPermissions {
  All = 2147483647,
  None = 0,
  CreateDepartment = 1 << 0,
  CreatePosition = 1 << 1,
  CreateChat = 1 << 2,
  AddChatMember = 1 << 3,
  RemoveChatMember = 1 << 4,
  EditMessage = 1 << 5,
  DeleteMessage = 1 << 6,
}

export interface CompanyUserResponseDto {
  id: number;
  userId: Guid;
  companyId: number;
  positionId: number;
  joinedAt: string;
  isActive: boolean;
  permissions: number;
}

export interface MessageResponseDto {
  id: Guid;
  chatId: Guid;
  senderId?: Guid;
  senderName?: string;
  senderAvatarUrl?: string;
  content: string;
  createdAt: string;
  editedAt?: string;
}

export interface SendMessageRequestDto {
  chatId: Guid;
  content: string;
}

export interface CompanyResponseDto {
  id: number;
  name: string;
  description?: string;
  logoUrl?: string;
}

export interface CreateCompanyRequestDto {
  name: string;
}

export interface SetCompanyDetailsRequestDto {
  description: string;
  logoFile: File;
}

export interface SetCompanyDetailsResponseDto {
  id: number;
  name: string;
  description: string;
  logoUrl?: string;
}

export interface CreateCompanyDepartmentRequestDto {
  name: string;
  description: string;
}

export interface CreateCompanyDepartmentResponseDto {
  id: number;
  companyId: number;
  name: string;
  description: string;
}

export interface CreateCompanyPositionRequestDto {
  title: string;
  permissions: number;
}

export interface CreateCompanyPositionResponseDto {
  id: number;
  companyId: number;
  title: string;
  permissions: number;
}

export interface UserPositionResponseDto {
  id: number;
  title: string;
  inviteCode: string;
}