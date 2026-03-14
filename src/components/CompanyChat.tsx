import {useEffect, useMemo, useRef, useState, type FormEvent, type KeyboardEvent} from 'react';
import {useChatMessages} from '../hooks/useChatMessages';
import '../styles/companyChat.css';

interface CompanyChatProps {
    companyId: number;
    chatId: string;
}

function formatTimestamp(value: string): string {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'});
}

export function CompanyChat({chatId}: CompanyChatProps) {
    const {
        messages,
        isLoading,
        errorMessage,
        isSending,
        sendMessage,
        editMessage,
        deleteMessage
    } = useChatMessages(chatId);
    const [draftMessage, setDraftMessage] = useState('');
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editingContent, setEditingContent] = useState('');
    const scrollAnchorRef = useRef<HTMLDivElement | null>(null);

    const isSubmitDisabled = useMemo(() => isSending || !draftMessage.trim(), [isSending, draftMessage]);

    useEffect(() => {
        scrollAnchorRef.current?.scrollIntoView({behavior: 'smooth'});
    }, [messages]);

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const message = draftMessage.trim();
        if (!message) return;
        await sendMessage(message);
        setDraftMessage('');
    };

    const startEditing = (id: string, content: string) => {
        setEditingId(id);
        setEditingContent(content);
    };
    const cancelEditing = () => {
        setEditingId(null);
        setEditingContent('');
    };

    const submitEdit = async (messageId: string) => {
        const trimmed = editingContent.trim();
        if (!trimmed) return;
        await editMessage(messageId, trimmed);
        cancelEditing();
    };

    const handleEditKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>, messageId: string) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            void submitEdit(messageId);
        }
        if (e.key === 'Escape') cancelEditing();
    };

    return (
        <section className="company-chat">
            {isLoading && <p className="chat-info">Loading messages...</p>}
            {errorMessage && <div className="chat-error" role="alert" aria-live="assertive">{errorMessage}</div>}

            <div className="chat-messages">
                {messages.map((message) => (
                    <article key={message.id} className={`chat-message${message.isOwn ? ' chat-message--own' : ''}`}>
                        <div className="chat-avatar">
                            {message.authorAvatarUrl
                                ? <img src={message.authorAvatarUrl} alt={message.authorName}
                                       className="chat-avatar-img"/>
                                : message.authorName.charAt(0).toUpperCase()}
                        </div>

                        <div className="chat-message-content">
                            <div className="chat-message-header">
                                <span className="chat-author">{message.authorName}</span>
                                <span className="chat-time">
                                    {formatTimestamp(message.createdAt)}
                                    {message.editedAt && <span className="chat-edited"> · edited</span>}
                                </span>
                            </div>

                            {editingId === message.id ? (
                                <div className="chat-edit-wrapper">
                                    <textarea
                                        className="chat-edit-input"
                                        value={editingContent}
                                        onChange={(e) => setEditingContent(e.target.value)}
                                        onKeyDown={(e) => handleEditKeyDown(e, message.id)}
                                        autoFocus
                                        rows={2}
                                    />
                                    <div className="chat-edit-actions">
                                        <button className="chat-edit-btn chat-edit-btn--save" type="button"
                                                onClick={() => void submitEdit(message.id)}>Save
                                        </button>
                                        <button className="chat-edit-btn chat-edit-btn--cancel" type="button"
                                                onClick={cancelEditing}>Cancel
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="chat-text">{message.content}</div>
                            )}
                        </div>

                        {message.isOwn && editingId !== message.id && (
                            <div className="chat-message-actions">
                                <button className="chat-action-btn" type="button" title="Edit"
                                        onClick={() => startEditing(message.id, message.content)}>
                                    <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                                        <path d="M9 2l2 2L4 11H2V9L9 2z" stroke="currentColor" strokeWidth="1.2"
                                              strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                </button>
                                <button className="chat-action-btn chat-action-btn--delete" type="button" title="Delete"
                                        onClick={() => void deleteMessage(message.id)}>
                                    <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                                        <path d="M2 4h9M5 4V3h3v1M10 4l-.7 7H3.7L3 4" stroke="currentColor"
                                              strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                </button>
                            </div>
                        )}
                    </article>
                ))}
                <div ref={scrollAnchorRef}/>
            </div>

            <form className="chat-input-form" onSubmit={handleSubmit}>
                <input
                    className="chat-input"
                    id={`company-chat-message-${chatId}`}
                    value={draftMessage}
                    onChange={(event) => setDraftMessage(event.target.value)}
                    placeholder="Type a message..."
                />
                <button className="chat-send-button" type="submit" disabled={isSubmitDisabled}>
                    {isSending ? 'Sending...' : 'Send'}
                </button>
            </form>
        </section>
    );
}