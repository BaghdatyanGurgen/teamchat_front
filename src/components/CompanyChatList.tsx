import type {CompanyChatResponseDto} from '../types/api';
import '../styles/companyChatList.css';

interface CompanyChatListProps {
    chats: CompanyChatResponseDto[];
    isLoading: boolean;
    errorMessage: string | null;
    selectedChatId: string | null;
    onSelectChat: (chatId: string) => void;
    unreadCounts?: Record<string, number>;
}

export function CompanyChatList({
                                    chats,
                                    isLoading,
                                    errorMessage,
                                    selectedChatId,
                                    onSelectChat,
                                    unreadCounts = {}
                                }: CompanyChatListProps) {
    return (
        <div className="company-chat-list-root">
            {isLoading && <p className="sidebar-info">Loading chats...</p>}
            {!isLoading && chats.length === 0 && !errorMessage && <p className="sidebar-info">No chats yet</p>}
            {!isLoading && errorMessage && <p className="sidebar-info sidebar-info--error">{errorMessage}</p>}

            {!isLoading && chats.length > 0 && (
                <ul className="company-chat-list">
                    {chats.map((chat) => {
                        const unread = unreadCounts[chat.id] ?? 0;
                        const isActive = selectedChatId === chat.id;
                        return (
                            <li key={chat.id}>
                                <button
                                    type="button"
                                    className={isActive ? 'company-chat-item active' : 'company-chat-item'}
                                    onClick={() => onSelectChat(chat.id)}
                                >
                                    <span className="chat-icon">#</span>
                                    <span className="chat-name">{chat.name}</span>
                                    {unread > 0 && !isActive && (
                                        <span className="chat-unread-badge">{unread > 99 ? '99+' : unread}</span>
                                    )}
                                </button>
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
}