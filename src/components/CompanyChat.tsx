import React, { useEffect, useMemo, useRef, useState, type FormEvent, type KeyboardEvent } from 'react';
import { useChatMessages } from '../hooks/useChatMessages';
import { resolveAvatarUrl } from '../utils/avatarUrl';
import '../styles/companyChat.css';

interface CompanyChatProps {
    companyId: number;
    chatId: string;
}

function formatTimestamp(value: string): string {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function isImageUrl(url: string): boolean {
    return /\.(jpg|jpeg|png|gif|webp)$/i.test(url);
}

function getFileIcon(url: string): string {
    if (/\.pdf$/i.test(url)) return 'PDF';
    if (/\.(doc|docx)$/i.test(url)) return 'DOC';
    if (/\.(xls|xlsx)$/i.test(url)) return 'XLS';
    if (/\.(zip|rar|7z)$/i.test(url)) return 'ZIP';
    if (/\.txt$/i.test(url)) return 'TXT';
    return 'FILE';
}

export function CompanyChat({ chatId }: CompanyChatProps) {
    const { messages, isLoading, errorMessage, isSending, sendMessage, editMessage, deleteMessage } = useChatMessages(chatId);
    const [draftMessage, setDraftMessage] = useState('');
    const [attachment, setAttachment] = useState<File | null>(null);
    const [attachmentPreview, setAttachmentPreview] = useState<string | null>(null);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editingContent, setEditingContent] = useState('');
    const scrollAnchorRef = useRef<HTMLDivElement | null>(null);
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const isSubmitDisabled = useMemo(
        () => isSending || (!draftMessage.trim() && !attachment),
        [isSending, draftMessage, attachment]
    );

    useEffect(() => { scrollAnchorRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setAttachment(file);
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (ev) => setAttachmentPreview(ev.target?.result as string);
            reader.readAsDataURL(file);
        } else {
            setAttachmentPreview(null);
        }
    };

    const clearAttachment = () => {
        setAttachment(null);
        setAttachmentPreview(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (isSubmitDisabled) return;
        await sendMessage(draftMessage, attachment ?? undefined);
        setDraftMessage('');
        clearAttachment();
    };

    const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && !e.shiftKey && !isSubmitDisabled) {
            e.preventDefault();
            void sendMessage(draftMessage, attachment ?? undefined).then(() => {
                setDraftMessage('');
                clearAttachment();
            });
        }
    };

    const startEditing = (id: string, content: string) => { setEditingId(id); setEditingContent(content); };
    const cancelEditing = () => { setEditingId(null); setEditingContent(''); };

    const submitEdit = async (messageId: string) => {
        const trimmed = editingContent.trim();
        if (!trimmed) return;
        await editMessage(messageId, trimmed);
        cancelEditing();
    };

    const handleEditKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>, messageId: string) => {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); void submitEdit(messageId); }
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
                                ? <img src={message.authorAvatarUrl} alt={message.authorName} className="chat-avatar-img" />
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
                                        <button className="chat-edit-btn chat-edit-btn--save" type="button" onClick={() => void submitEdit(message.id)}>Save</button>
                                        <button className="chat-edit-btn chat-edit-btn--cancel" type="button" onClick={cancelEditing}>Cancel</button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    {message.content && <div className="chat-text">{message.content}</div>}
                                    {message.attachments.length > 0 && (
                                        <div className="chat-attachments">
                                            {message.attachments.map((a) => {
                                                const fullUrl = resolveAvatarUrl(a.fileUrl) ?? a.fileUrl;
                                                return isImageUrl(a.fileUrl) ? (
                                                    <a key={a.id} href={fullUrl} target="_blank" rel="noopener noreferrer">
                                                        <img src={fullUrl} alt="attachment" className="chat-attachment-img" />
                                                    </a>
                                                ) : (
                                                    <a key={a.id} href={fullUrl} target="_blank" rel="noopener noreferrer" className="chat-attachment-file">
                                                        <span className="chat-attachment-file-badge">{getFileIcon(a.fileUrl)}</span>
                                                        <span className="chat-attachment-file-name">{decodeURIComponent(a.fileUrl.split('/').pop() ?? 'file')}</span>
                                                    </a>
                                                );
                                            })}
                                        </div>
                                    )}
                                </>
                            )}
                        </div>

                        {message.isOwn && editingId !== message.id && (
                            <div className="chat-message-actions">
                                <button className="chat-action-btn" type="button" title="Edit" onClick={() => startEditing(message.id, message.content)}>
                                    <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                                        <path d="M9 2l2 2L4 11H2V9L9 2z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                </button>
                                <button className="chat-action-btn chat-action-btn--delete" type="button" title="Delete" onClick={() => void deleteMessage(message.id)}>
                                    <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                                        <path d="M2 4h9M5 4V3h3v1M10 4l-.7 7H3.7L3 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                </button>
                            </div>
                        )}
                    </article>
                ))}
                <div ref={scrollAnchorRef} />
            </div>

            {attachment && (
                <div className="chat-attachment-preview">
                    {attachmentPreview
                        ? <img src={attachmentPreview} alt="preview" className="chat-attachment-preview-img" />
                        : <span className="chat-attachment-preview-name">{attachment.name}</span>}
                    <button className="chat-attachment-preview-remove" type="button" onClick={clearAttachment}>
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                            <path d="M1 1l10 10M11 1L1 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                        </svg>
                    </button>
                </div>
            )}

            <form className="chat-input-form" onSubmit={handleSubmit}>
                <button
                    className="chat-attach-btn"
                    type="button"
                    title="Attach file"
                    onClick={() => fileInputRef.current?.click()}
                >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M13.5 7.5l-6 6a4 4 0 01-5.66-5.66l6.5-6.5a2.5 2.5 0 013.54 3.54l-6.5 6.5a1 1 0 01-1.42-1.42l5.5-5.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                </button>
                <input
                    ref={fileInputRef}
                    type="file"
                    style={{ display: 'none' }}
                    onChange={handleFileChange}
                    accept="image/*,.pdf,.doc,.docx,.txt,.zip"
                />
                <input
                    className="chat-input"
                    id={`company-chat-message-${chatId}`}
                    value={draftMessage}
                    onChange={(event) => setDraftMessage(event.target.value)}
                    onKeyDown={handleInputKeyDown}
                    placeholder="Type a message..."
                />
                <button className="chat-send-button" type="submit" disabled={isSubmitDisabled}>
                    {isSending ? 'Sending...' : 'Send'}
                </button>
            </form>
        </section>
    );
}