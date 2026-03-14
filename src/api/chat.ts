import {httpClient} from './httpClient';
import type {CompanyChatResponseDto, ResponseModel} from '../types/api';

export interface CreateChatRequestDto {
    name: string;
    scope: number;
    companyId: number;
    departmentId?: number;
    teamId?: number;
}

export const chatApi = {
    getCompanyChats: (companyId: number): Promise<ResponseModel<CompanyChatResponseDto[]>> =>
        httpClient
            .get<ResponseModel<CompanyChatResponseDto[]>>(`/company/${companyId}/chats/my`)
            .then((response) => response.data),

    createChat: (companyId: number, payload: CreateChatRequestDto): Promise<ResponseModel<CompanyChatResponseDto>> =>
        httpClient
            .post<ResponseModel<CompanyChatResponseDto>>(`/company/${companyId}/chats/create`, payload)
            .then((response) => response.data),
};