import { httpClient } from './httpClient';
import type { Guid, MessageResponseDto, ResponseModel } from '../types/api';

export const messageApi = {
    getByChatId: (chatId: Guid): Promise<MessageResponseDto[]> =>
        httpClient
            .get<ResponseModel<MessageResponseDto[]>>(`/message/${chatId}`)
            .then((response) => response.data.Data ?? response.data.data ?? []),

    send: (chatId: Guid, content: string, attachment?: File): Promise<MessageResponseDto> => {
        const formData = new FormData();
        formData.append('chatId', chatId);
        formData.append('content', content);
        if (attachment) formData.append('attachment', attachment);

        return httpClient
            .post<ResponseModel<MessageResponseDto>>('/message/send', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            })
            .then((response) => {
                const data = response.data.Data ?? response.data.data;
                if (!data) throw new Error(response.data.Message ?? response.data.message ?? 'Failed to send message.');
                return data;
            });
    },

    edit: (messageId: Guid, content: string): Promise<MessageResponseDto> =>
        httpClient
            .patch<ResponseModel<MessageResponseDto>>(`/message/${messageId}`, { content })
            .then((response) => {
                const data = response.data.Data ?? response.data.data;
                if (!data) throw new Error(response.data.Message ?? response.data.message ?? 'Failed to edit message.');
                return data;
            }),

    delete: (messageId: Guid): Promise<void> =>
        httpClient.delete(`/message/${messageId}`).then(() => undefined),

    markAllAsRead: (chatId: Guid): Promise<void> =>
        httpClient.post(`/message/${chatId}/read`).then(() => undefined),

    getUnreadCounts: (companyId: number): Promise<Record<string, number>> =>
        httpClient
            .get<ResponseModel<Record<string, number>>>(`/message/unread/${companyId}`)
            .then((response) => response.data.Data ?? response.data.data ?? {}),
};