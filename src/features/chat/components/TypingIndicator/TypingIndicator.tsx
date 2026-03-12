import styles from './TypingIndicator.module.css';

export function TypingIndicator() {
  return (
    <div className={styles.typing} aria-label="Sending…">
      <span /><span /><span />
    </div>
  );
}
