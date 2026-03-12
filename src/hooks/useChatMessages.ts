import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { messageApi } from '../api/message';
import { getHubConnection } from '../api/signalRClient';
import type { MessageResponseDto } from '../types/api';
import * as signalR from '@microsoft/signalr';
import { useAuth } from '../store/auth'

export interface ChatMessageViewModel {
    id: string;
    authorName: string;
    content: string;
    createdAt: string;
    isOwn: boolean;
}

function mapMessage(message: MessageResponseDto, currentUserId?: string): ChatMessageViewModel {
    return {
        id: message.id,
        authorName: message.senderName ?? 'Unknown user',
        content: message.content,
        createdAt: message.createdAt,
        isOwn: !!currentUserId && message.senderId === currentUserId,
    };
}


function getErrorMessage(error: unknown, fallback: string): string {
    if (error instanceof Error && error.message) return error.message;
    return fallback;
}

export function useChatMessages(chatId: string) {
    const [messages, setMessages] = useState<ChatMessageViewModel[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const { currentUser } = useAuth();
    const currentUserId = currentUser?.id;
    const joinedChatId = useRef<string | null>(null);

    const loadMessages = useCallback(async () => {
        if (!chatId) {
            setMessages([]);
            setErrorMessage('Invalid chat context.');
            return;
        }

        setIsLoading(true);
        setErrorMessage(null);

        try {
            const response = await messageApi.getByChatId(chatId);

            const mapped = response
                .map((m) => mapMessage(m,  currentUserId))
                .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
            setMessages(mapped);
        } catch (error) {
            setMessages([]);
            setErrorMessage(getErrorMessage(error, 'Failed to load messages.'));
        } finally {
            setIsLoading(false);
        }
    }, [chatId]);

    useEffect(() => {
        if (!chatId) return;

        const connection = getHubConnection();

        const startAndJoin = async () => {
            try {

                if (connection.state === signalR.HubConnectionState.Disconnected) {
                    await connection.start();
                }

                if (connection.state !== signalR.HubConnectionState.Connected) {
                    console.warn("SignalR not connected yet");
                    return;
                }

                if (joinedChatId.current === chatId) return;

                if (joinedChatId.current) {
                    await connection.invoke('LeaveChat', joinedChatId.current);
                }

                await connection.invoke('JoinChat', chatId);

                joinedChatId.current = chatId;

            } catch (error) {
                console.error('SignalR connection error:', error);
            }
        };

        const handleReceiveMessage = (message: MessageResponseDto) => {
            setMessages((prev) => {
                if (prev.some((m) => m.id === message.id)) return prev;
                return [...prev, mapMessage(message, currentUserId)];
            });
        };

        connection.on('ReceiveMessage', handleReceiveMessage);
        void startAndJoin();

        return () => {
            connection.off('ReceiveMessage', handleReceiveMessage);
        };
    }, [chatId]);

    const sendMessage = useCallback(
        async (content: string) => {
            const trimmedContent = content.trim();
            if (!trimmedContent) return;

            setIsSending(true);
            setErrorMessage(null);

            try {
                await messageApi.send({ chatId, content: trimmedContent });
            } catch (error) {
                setErrorMessage(getErrorMessage(error, 'Failed to send message.'));
            } finally {
                setIsSending(false);
            }
        },
        [chatId],
    );

    useEffect(() => {
        void loadMessages();
    }, [loadMessages]);

    return {
        messages,
        isLoading,
        errorMessage,
        isSending,
        sendMessage,
    };
}