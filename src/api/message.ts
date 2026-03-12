import { httpClient } from './httpClient';
import type {Guid, MessageResponseDto, ResponseModel, SendMessageRequestDto} from '../types/api';

export const messageApi = {
  getByChatId: (chatId: Guid): Promise<MessageResponseDto[]> =>
      httpClient
          .get<ResponseModel<MessageResponseDto[]>>(`/message/${chatId}`)
          .then((response) => response.data.Data ?? response.data.data ?? []),

  send: (payload: SendMessageRequestDto): Promise<MessageResponseDto> =>
      httpClient
          .post<ResponseModel<MessageResponseDto>>('/message/send', payload)
          .then((response) => {
            const data = response.data.Data ?? response.data.data;
            if (!data) throw new Error(response.data.Message ?? response.data.message ?? 'Failed to send message.');
            return data;
          }),
};