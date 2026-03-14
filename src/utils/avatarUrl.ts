const API_BASE = 'http://localhost:5263';

export function resolveAvatarUrl(avatarUrl?: string | null): string | undefined {
    if (!avatarUrl) return undefined;
    if (avatarUrl.startsWith('http')) return avatarUrl;
    if (avatarUrl.startsWith('/uploads/')) {
        const withoutPrefix = avatarUrl.slice('/uploads/'.length);
        return `${API_BASE}/api/files/${withoutPrefix}`;
    }
    return `${API_BASE}${avatarUrl}`;
}