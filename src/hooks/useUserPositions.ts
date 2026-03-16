import {useCallback, useEffect, useState} from 'react';
import { companyApi } from '../api';
import type { UserPositionResponseDto } from '../types/api';

function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}

export function useUserPositions(companyId: number) {
  const [positions, setPositions] = useState<UserPositionResponseDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!Number.isFinite(companyId) || companyId <= 0) {
      setPositions([]);
      setErrorMessage('Invalid company ID.');
      setIsLoading(false);
      return;
    }

    let isMounted = true;
    setIsLoading(true);
    setErrorMessage(null);

    void companyApi
        .getUserPositions(companyId)
        .then((response) => {
          if (!isMounted) return;

          setPositions(response.data ?? []);
        })
        .catch((error) => {
          if (!isMounted) return;

          setPositions([]);
          setErrorMessage(getErrorMessage(error, 'Failed to load positions.'));
        })
        .finally(() => {
          if (isMounted) setIsLoading(false);
        });

    return () => {
      isMounted = false;
    };
  }, [companyId]);

  const addPosition = useCallback((position: UserPositionResponseDto) => {
    setPositions((prev) => prev.some((p) => p.id === position.id) ? prev : [...prev, position]);
  }, []);

  return { positions, isLoading, errorMessage, addPosition };
}