import { useCallback, useEffect, useRef, useState } from 'react';
import { messageApi } from '../api/message';
import { getHubConnection } from '../api/signalRClient';
import type { MessageResponseDto } from '../types/api';
import * as signalR from '@microsoft/signalr';
import { useAuth } from '../store/auth';

export interface ChatMessageViewModel {
    id: string;
    authorName: string;
    authorAvatarUrl?: string;
    content: string;
    createdAt: string;
    isOwn: boolean;
}

function mapMessage(
    message: MessageResponseDto,
    currentUserId?: string,
    currentUserAvatarUrl?: string,
): ChatMessageViewModel {
    const isOwn = !!currentUserId && message.senderId === currentUserId;
    return {
        id: message.id,
        authorName: message.senderName ?? 'Unknown user',
        // Для своих — берём аватар из store (всегда актуальный после обновления профиля),
        // для чужих — из senderAvatarUrl в ответе API
        authorAvatarUrl: isOwn ? currentUserAvatarUrl : message.senderAvatarUrl,
        content: message.content,
        createdAt: message.createdAt,
        isOwn,
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
    const currentUserAvatarUrl = currentUser?.avatarUrl;

    const joinedChatId = useRef<string | null>(null);

    // Refs для SignalR-хендлера — всегда актуальны без пересоздания
    const currentUserIdRef = useRef(currentUserId);
    const currentUserAvatarRef = useRef(currentUserAvatarUrl);
    useEffect(() => {
        currentUserIdRef.current = currentUserId;
        currentUserAvatarRef.current = currentUserAvatarUrl;
    }, [currentUserId, currentUserAvatarUrl]);

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
                .map((m) => mapMessage(m, currentUserIdRef.current, currentUserAvatarRef.current))
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
                    console.warn('SignalR not connected yet');
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
                return [...prev, mapMessage(message, currentUserIdRef.current, currentUserAvatarRef.current)];
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