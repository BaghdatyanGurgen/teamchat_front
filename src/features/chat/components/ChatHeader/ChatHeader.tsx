import styles from './ChatHeader.module.css';

interface ChatHeaderProps {
    chatId: string;
}

export function ChatHeader({chatId}: ChatHeaderProps) {
    return (
        <header className={styles.header}>
            <div className={styles.avatar}>C</div>
            <div className={styles.info}>
                <h1 className={styles.title}>Chat</h1>
                <span className={styles.status}>Online</span>
            </div>
            <span className={styles.id}>#{chatId.slice(0, 8)}</span>
        </header>
    );
}
