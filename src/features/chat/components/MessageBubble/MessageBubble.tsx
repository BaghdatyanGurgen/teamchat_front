import styles from './MessageBubble.module.css';

interface MessageBubbleProps {
  content: string;
  senderId: string | null | undefined;
  isSelf: boolean;
}

export function MessageBubble({ content, senderId, isSelf }: MessageBubbleProps) {
  return (
      <li className={`${styles.item} ${isSelf ? styles.self : styles.other}`}>
        {!isSelf && (
            <span className={styles.sender}>{senderId ?? 'Unknown'}</span>
        )}
        <div className={styles.bubble}>{content}</div>
      </li>
  );
}