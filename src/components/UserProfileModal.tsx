import { useEffect, useState } from 'react';
import { authApi } from '../api';
import { resolveAvatarUrl } from '../utils/avatarUrl';
import type { UserProfileResponseDto } from '../types/api';
import '../styles/userProfileModal.css';

interface UserProfileModalProps {
    userId: string;
    onClose: () => void;
}

export function UserProfileModal({ userId, onClose }: UserProfileModalProps) {
    const [user, setUser] = useState<UserProfileResponseDto | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        void authApi.getUserProfile(userId).then((response) => {
            const data = response.Data ?? response.data;
            if (data) setUser(data);
        }).finally(() => setIsLoading(false));
    }, [userId]);

    const initials = user
        ? `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`.toUpperCase() || user.email[0].toUpperCase()
        : '?';

    const displayName = user?.firstName && user?.lastName
        ? `${user.firstName} ${user.lastName}`
        : user?.email ?? '';

    return (
        <div className="upm-backdrop" onClick={onClose} role="presentation">
            <div className="upm-card" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
                <button className="upm-close" type="button" onClick={onClose} aria-label="Close">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                </button>

                {isLoading ? (
                    <div className="upm-loading">
                        <span className="upm-spinner" />
                    </div>
                ) : (
                    <>
                        <div className="upm-avatar">
                            {resolveAvatarUrl(user?.avatarUrl)
                                ? <img src={resolveAvatarUrl(user?.avatarUrl)} alt={displayName} className="upm-avatar-img" />
                                : <span className="upm-avatar-initials">{initials}</span>}
                        </div>

                        <div className="upm-info">
                            <p className="upm-name">{displayName}</p>
                            <p className="upm-email">{user?.email}</p>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}