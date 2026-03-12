import { httpClient } from './httpClient';
import type { CompanyChatResponseDto, ResponseModel } from '../types/api';

export const chatApi = {
  getCompanyChats: (companyId: number): Promise<ResponseModel<CompanyChatResponseDto[]>> =>
      httpClient
          .get<ResponseModel<CompanyChatResponseDto[]>>(`/company/${companyId}/chats/my`)
          .then((response) => response.data),
};