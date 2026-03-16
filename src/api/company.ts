import {httpClient} from './httpClient';
import type {
    CompanyUserResponseDto,
    CreateCompanyDepartmentRequestDto,
    CreateCompanyDepartmentResponseDto,
    CreateCompanyPositionRequestDto,
    CreateCompanyPositionResponseDto,
    ResponseModel,
    SetCompanyDetailsResponseDto,
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

    getDepartments: (companyId: number): Promise<ResponseModel<CreateCompanyDepartmentResponseDto[]>> =>
        httpClient
            .get<ResponseModel<CreateCompanyDepartmentResponseDto[]>>(`/company/${companyId}/departments`)
            .then((response) => response.data),

    getUserPositions: (companyId: number): Promise<ResponseModel<UserPositionResponseDto[]>> =>
        httpClient
            .get<ResponseModel<UserPositionResponseDto[]>>(`/company/${companyId}/positions/user`)
            .then((response) => response.data),

    setCompanyDetails: async (
        companyId: number,
        description: string,
        logoFile?: File,
    ): Promise<ResponseModel<SetCompanyDetailsResponseDto>> => {
        const formData = new FormData();
        formData.append('description', description);
        if (logoFile) formData.append('logoFile', logoFile);
        const response = await httpClient
            .patch<ResponseModel<SetCompanyDetailsResponseDto>>(`/company/${companyId}/set-details`, formData, {
                headers: {'Content-Type': 'multipart/form-data'},
            });
        return response.data;
    },
};