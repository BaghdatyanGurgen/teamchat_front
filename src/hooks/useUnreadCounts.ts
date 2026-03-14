import { useCallback, useEffect, useState } from 'react';
import { messageApi } from '../api/message';

export function useUnreadCounts(companyId: number) {
    const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});

    const fetchUnreadCounts = useCallback(async () => {
        if (!Number.isFinite(companyId) || companyId <= 0) return;
        try {
            const counts = await messageApi.getUnreadCounts(companyId);
            setUnreadCounts(counts);
        } catch {
            // silent
        }
    }, [companyId]);

    useEffect(() => { void fetchUnreadCounts(); }, [fetchUnreadCounts]);

    const markAsRead = useCallback((chatId: string) => {
        setUnreadCounts((prev) => {
            const next = { ...prev };
            delete next[chatId];
            return next;
        });
    }, []);

    return { unreadCounts, markAsRead, refetch: fetchUnreadCounts };
}