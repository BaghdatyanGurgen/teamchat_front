import {FormEvent, useMemo, useState} from 'react';
import {useChat} from '../hooks/useChat';
import styles from './ChatPage.module.css';
import {MessageList} from "../components/MessageList/MessageList";
import {ChatHeader} from "../components/ChatHeader/ChatHeader";
import {ChatInput} from "../components/ChatInput/ChatInput";

interface ChatPageProps {
    chatId: string;
}

export function ChatPage({chatId}: ChatPageProps) {
    const {messages, isLoadingHistory, isSending, error, sendMessage} = useChat(chatId);
    const [content, setContent] = useState('');

    const isSubmitDisabled = useMemo(
        () => isSending || !content.trim() || !chatId.trim(),
        [chatId, content, isSending],
    );

    const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!content.trim()) return;
        await sendMessage(content);
        setContent('');
    };

    return (
        <main className={styles.page}>
            <ChatHeader chatId={chatId}/>

            {error && (
                <p className={styles.error} role="alert" aria-live="assertive">
                    {error}
                </p>
            )}

            <MessageList
                messages={messages}
                isLoadingHistory={isLoadingHistory}
                isSending={isSending}
            />

            <ChatInput
                value={content}
                onChange={setContent}
                onSubmit={onSubmit}
                disabled={isSubmitDisabled}
                isSending={isSending}
            />
        </main>
    );
}