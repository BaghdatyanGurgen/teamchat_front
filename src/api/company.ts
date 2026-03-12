import { httpClient } from './httpClient';
import type {
  CompanyUserResponseDto,
  CreateCompanyDepartmentRequestDto,
  CreateCompanyDepartmentResponseDto,
  CreateCompanyPositionRequestDto,
  CreateCompanyPositionResponseDto,
  ResponseModel,
  UserPositionResponseDto,
} from '../types/api';

export const companyApi = {
  getMyCompanyUser: (companyId: number): Promise<ResponseModel<CompanyUserResponseDto>> =>
      httpClient
          .get<ResponseModel<CompanyUserResponseDto>>(`/company/${companyId}/me`)
          .then((response) => response.data),

  createDepartment: (
      companyId: number,
      payload: CreateCompanyDepartmentRequestDto,
  ): Promise<ResponseModel<CreateCompanyDepartmentResponseDto>> =>
      httpClient
          .post<ResponseModel<CreateCompanyDepartmentResponseDto>>(`/company/${companyId}/departments`, payload)
          .then((response) => response.data),

  createPosition: (
      companyId: number,
      payload: CreateCompanyPositionRequestDto,
  ): Promise<ResponseModel<CreateCompanyPositionResponseDto>> =>
      httpClient
          .put<ResponseModel<CreateCompanyPositionResponseDto>>(`/company/${companyId}/create-position`, payload)
          .then((response) => response.data),

  getUserPositions: (companyId: number): Promise<ResponseModel<UserPositionResponseDto[]>> =>
      httpClient
          .get<ResponseModel<UserPositionResponseDto[]>>(`/company/${companyId}/positions/user`)
          .then((response) => response.data),
};
