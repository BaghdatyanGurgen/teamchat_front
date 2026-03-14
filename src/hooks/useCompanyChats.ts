import { useEffect, useState, useCallback } from 'react';
import { chatApi } from '../api';
import type { CompanyChatResponseDto } from '../types/api';

function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}

export function useCompanyChats(companyId: number) {
  const [chats, setChats] = useState<CompanyChatResponseDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!Number.isFinite(companyId) || companyId <= 0) {
      setChats([]);
      setErrorMessage('Invalid company ID.');
      setIsLoading(false);
      return;
    }

    let isMounted = true;
    setIsLoading(true);
    setErrorMessage(null);

    void chatApi
        .getCompanyChats(companyId)
        .then((response) => {
          if (!isMounted) return;
          const isSuccess = response.IsSuccess ?? response.isSuccess ?? false;
          if (!isSuccess) {
            setChats([]);
            setErrorMessage(response.Message ?? response.message ?? 'Failed to load chats.');
            return;
          }
          setChats(response.Data ?? response.data ?? []);
        })
        .catch((error) => {
          if (!isMounted) return;
          setChats([]);
          setErrorMessage(getErrorMessage(error, 'Failed to load chats.'));
        })
        .finally(() => {
          if (isMounted) setIsLoading(false);
        });

    return () => { isMounted = false; };
  }, [companyId]);

  const addChat = useCallback((chat: CompanyChatResponseDto) => {
    setChats((prev) => prev.some((c) => c.id === chat.id) ? prev : [...prev, chat]);
  }, []);

  return { chats, isLoading, errorMessage, addChat };
}