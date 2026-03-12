import { FormEvent } from 'react';
import styles from './ChatInput.module.css';

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  disabled: boolean;
  isSending: boolean;
}

export function ChatInput({ value, onChange, onSubmit, disabled, isSending }: ChatInputProps) {
  return (
    <div className={styles.wrapper}>
      <form className={styles.form} onSubmit={onSubmit}>
        <label htmlFor="chat-message" className={styles.srOnly}>Message</label>
        <input
          id="chat-message"
          className={styles.input}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Write something…"
          autoComplete="off"
        />
        <button
          className={styles.sendBtn}
          type="submit"
          disabled={disabled}
          aria-label="Send"
        >
          <svg className={styles.icon} viewBox="0 0 24 24">
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        </button>
      </form>
    </div>
  );
}
