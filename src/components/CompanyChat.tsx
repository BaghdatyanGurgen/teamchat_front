import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';

import { useChatMessages } from '../hooks/useChatMessages';
import '../styles/companyChat.css';

interface CompanyChatProps {
    companyId: number;
    chatId: string;
}

function formatTimestamp(value: string): string {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function CompanyChat({chatId }: CompanyChatProps) {
    const { messages, isLoading, errorMessage, isSending, sendMessage } =
        useChatMessages(chatId);

    const [draftMessage, setDraftMessage] = useState('');

    const scrollAnchorRef = useRef<HTMLDivElement | null>(null);

    const isSubmitDisabled = useMemo(
        () => isSending || !draftMessage.trim(),
        [isSending, draftMessage]
    );

    useEffect(() => {
        scrollAnchorRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const message = draftMessage.trim();
        if (!message) return;

        await sendMessage(message);
        setDraftMessage('');
    };

    return (
        <section className="company-chat">

            {isLoading && <p className="chat-info">Loading messages...</p>}

            {errorMessage && (
                <div className="chat-error" role="alert" aria-live="assertive">
                    {errorMessage}
                </div>
            )}

            <div className="chat-messages">

                {messages.map((message) => (
                    <article key={message.id} className={`chat-message${message.isOwn ? ' chat-message--own' : ''}`}>

                        <div className="chat-avatar">
                            {message.authorName.charAt(0).toUpperCase()}
                        </div>

                        <div className="chat-message-content">

                            <div className="chat-message-header">
                                <span className="chat-author">{message.authorName}</span>
                                <span className="chat-time">
                    {formatTimestamp(message.createdAt)}
                </span>
                            </div>

                            <div className="chat-text">{message.content}</div>

                        </div>

                    </article>
                ))}

                <div ref={scrollAnchorRef} />

            </div>

            <form className="chat-input-form" onSubmit={handleSubmit}>

                <input
                    className="chat-input"
                    id={`company-chat-message-${chatId}`}
                    value={draftMessage}
                    onChange={(event) => setDraftMessage(event.target.value)}
                    placeholder="Type a message..."
                />

                <button
                    className="chat-send-button"
                    type="submit"
                    disabled={isSubmitDisabled}
                >
                    {isSending ? 'Sending...' : 'Send'}
                </button>

            </form>

        </section>
    );
}