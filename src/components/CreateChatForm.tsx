import { useState, type FormEvent } from 'react';
import { chatApi } from '../api/chat';
import type { CompanyChatResponseDto } from '../types/api';
import '../styles/ownerPanel.css';

interface CreateChatFormProps {
    companyId: number;
    onCreated: (chat: CompanyChatResponseDto) => void;
}

function getErrorMessage(error: unknown, fallback: string): string {
    if (error instanceof Error && error.message) return error.message;
    return fallback;
}

export function CreateChatForm({ companyId, onCreated }: CreateChatFormProps) {
    const [name, setName] = useState('');
    const [isCreating, setIsCreating] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setErrorMessage(null);
        setSuccessMessage(null);

        const trimmedName = name.trim();
        if (!trimmedName) { setErrorMessage('Chat name is required.'); return; }

        setIsCreating(true);
        try {
            const response = await chatApi.createChat(companyId, {
                name: trimmedName,
                scope: 0,
                companyId,
            });

            const isSuccess = response.IsSuccess ?? response.isSuccess ?? false;
            const chat = response.Data ?? response.data;

            if (!isSuccess || !chat) {
                setErrorMessage(response.Message ?? response.message ?? 'Failed to create chat.');
                return;
            }

            setSuccessMessage(`#${chat.name} created!`);
            setName('');
            onCreated(chat);
        } catch (error) {
            setErrorMessage(getErrorMessage(error, 'Failed to create chat.'));
        } finally {
            setIsCreating(false);
        }
    };

    return (
        <section id="owner-panel-create-chat" className="op-section">
            <form className="op-form" onSubmit={handleSubmit} noValidate>
                <div className="op-field">
                    <label className="op-label" htmlFor="chat-name-input">Chat name</label>
                    <input
                        id="chat-name-input"
                        className="op-input"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="general…"
                        required
                    />
                </div>

                {errorMessage ? (
                    <div className="op-error" role="alert" aria-live="assertive">
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                            <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.5" />
                            <path d="M7 4v3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                            <circle cx="7" cy="10" r="0.75" fill="currentColor" />
                        </svg>
                        {errorMessage}
                    </div>
                ) : null}

                {successMessage ? (
                    <div className="op-success" role="status" aria-live="polite">
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                            <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.5" />
                            <path d="M4.5 7l2 2 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        {successMessage}
                    </div>
                ) : null}

                <button className="op-btn" type="submit" disabled={isCreating}>
                    {isCreating ? <span className="op-spinner" aria-hidden="true" /> : null}
                    {isCreating ? 'Creating…' : 'Create chat'}
                </button>
            </form>
        </section>
    );
}