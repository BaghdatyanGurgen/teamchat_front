const API_BASE = 'http://localhost:5263';

export function resolveAvatarUrl(avatarUrl?: string | null): string | undefined {
    if (!avatarUrl) return undefined;
    if (avatarUrl.startsWith('http')) return avatarUrl;
    return `${API_BASE}${avatarUrl}`;
}