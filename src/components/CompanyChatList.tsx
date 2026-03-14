import type { CompanyChatResponseDto } from '../types/api';
import '../styles/companyChatList.css';

interface CompanyChatListProps {
    chats: CompanyChatResponseDto[];
    isLoading: boolean;
    errorMessage: string | null;
    selectedChatId: string | null;
    onSelectChat: (chatId: string) => void;
}

export function CompanyChatList({
                                    chats,
                                    isLoading,
                                    errorMessage,
                                    selectedChatId,
                                    onSelectChat,
                                }: CompanyChatListProps) {
    return (
        <div className="company-chat-list-root">
            {isLoading && <p className="sidebar-info">Loading chats...</p>}
            {!isLoading && chats.length === 0 && !errorMessage && (
                <p className="sidebar-info">No chats yet</p>
            )}
            {!isLoading && errorMessage && (
                <p className="sidebar-info sidebar-info--error">{errorMessage}</p>
            )}

            {!isLoading && chats.length > 0 && (
                <ul className="company-chat-list">
                    {chats.map((chat) => (
                        <li key={chat.id}>
                            <button
                                type="button"
                                className={
                                    selectedChatId === chat.id
                                        ? 'company-chat-item active'
                                        : 'company-chat-item'
                                }
                                onClick={() => onSelectChat(chat.id)}
                            >
                                <span className="chat-icon">#</span>
                                <span className="chat-name">{chat.name}</span>
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}