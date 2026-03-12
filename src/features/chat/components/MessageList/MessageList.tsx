import { useEffect, useRef } from 'react';

import styles from './MessageList.module.css';
import {TypingIndicator} from "../TypingIndicator/TypingIndicator";
import {MessageBubble} from "../MessageBubble/MessageBubble";
import type {MessageResponseDto} from "../../../../types/api";

const CURRENT_USER_ID = 'me';


interface MessageListProps {
  messages: MessageResponseDto[];
  isLoadingHistory: boolean;
  isSending: boolean;
}

export function MessageList({ messages, isLoadingHistory, isSending }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isSending]);

  return (
      <section className={styles.section} aria-live="polite">
        {isLoadingHistory ? (
            <p className={styles.loading}>Loading history…</p>
        ) : messages.length === 0 ? (
            <div className={styles.empty}>
              <span className={styles.emptyIcon}>✦</span>
              <span>No messages yet</span>
            </div>
        ) : (
            <ul className={styles.list}>
              {messages.map((message) => (
                  <MessageBubble
                      key={message.id}
                      content={message.content}
                      senderId={message.senderId}
                      isSelf={message.senderId === CURRENT_USER_ID}
                  />
              ))}
            </ul>
        )}

        {isSending && <TypingIndicator />}

        <div ref={bottomRef} />
      </section>
  );
}