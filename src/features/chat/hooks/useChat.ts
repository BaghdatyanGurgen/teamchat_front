import { useCallback, useEffect, useMemo, useState } from 'react';
import { HubConnection, HubConnectionBuilder, HubConnectionState, LogLevel } from '@microsoft/signalr';

import { messageApi } from '../../../api/message';
import { useAuth } from '../../../hooks/useAuth';
import type { MessageResponseDto } from '../../../types/api';

const RECEIVE_EVENT = 'receiveMessage';
const JOIN_METHOD = 'joinChat';
const LEAVE_METHOD = 'leaveChat';
const SEND_METHOD = 'sendMessageToChat';

interface UseChatResult {
  messages: MessageResponseDto[];
  isLoadingHistory: boolean;
  isSending: boolean;
  error: string | null;
  sendMessage: (content: string) => Promise<void>;
  reloadHistory: () => Promise<void>;
}

export function useChat(chatId: string | null | undefined): UseChatResult {
  const { accessToken } = useAuth();

  const [messages, setMessages] = useState<MessageResponseDto[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [connection, setConnection] = useState<HubConnection | null>(null);

  const safeChatId = useMemo(() => (chatId && chatId.trim() ? chatId : null), [chatId]);

  const reloadHistory = useCallback(async () => {
    if (!safeChatId) {
      setMessages([]);
      return;
    }

    setIsLoadingHistory(true);
    setError(null);

    try {
      const history = await messageApi.getByChatId(safeChatId);
      setMessages(history);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load messages.');
    } finally {
      setIsLoadingHistory(false);
    }
  }, [safeChatId]);

  useEffect(() => {
    void reloadHistory();
  }, [reloadHistory]);

  useEffect(() => {
    if (!safeChatId || !accessToken) {
      return;
    }

    let activeConnection: HubConnection | null = null;
    let cancelled = false;

    const setupConnection = async () => {
      try {
        const hub = new HubConnectionBuilder()
          .withUrl('/hubs/chat', {
            accessTokenFactory: () => accessToken,
          })
          .withAutomaticReconnect()
          .configureLogging(LogLevel.Warning)
          .build();

        activeConnection = hub;
        setConnection(hub);

        hub.on(RECEIVE_EVENT, (message: MessageResponseDto) => {
          if (message.chatId !== safeChatId) {
            return;
          }

          setMessages((prev) => {
            if (prev.some((item) => item.id === message.id)) {
              return prev;
            }
            return [...prev, message];
          });
        });

        await hub.start();

        if (cancelled) {
          return;
        }

        await hub.invoke(JOIN_METHOD, safeChatId);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to connect to chat.');
        }
      }
    };

    void setupConnection();

    return () => {
      cancelled = true;

      if (!activeConnection) {
        return;
      }

      activeConnection.off(RECEIVE_EVENT);

      void (async () => {
        if (activeConnection?.state === HubConnectionState.Connected && safeChatId) {
          await activeConnection.invoke(LEAVE_METHOD, safeChatId).catch(() => undefined);
        }
        await activeConnection?.stop().catch(() => undefined);
      })();

      setConnection(null);
    };
  }, [accessToken, safeChatId]);

  const sendMessage = useCallback(
    async (content: string) => {
      const trimmedContent = content.trim();

      if (!safeChatId || !accessToken || !trimmedContent) {
        return;
      }

      setIsSending(true);
      setError(null);

      try {
        if (!connection || connection.state !== HubConnectionState.Connected) {
          throw new Error('Chat connection is not ready.');
        }

        await connection.invoke(SEND_METHOD, safeChatId, trimmedContent);
      } catch (hubError) {
        try {
          const created = await messageApi.send({
            chatId: safeChatId,
            content: trimmedContent,
          });
          setMessages((prev) => [...prev, created]);
        } catch (apiError) {
          setError(
            apiError instanceof Error ? apiError.message : hubError instanceof Error ? hubError.message : 'Failed to send message.',
          );
        }
      } finally {
        setIsSending(false);
      }
    },
    [accessToken, connection, safeChatId],
  );

  return {
    messages,
    isLoadingHistory,
    isSending,
    error,
    sendMessage,
    reloadHistory,
  };
}
