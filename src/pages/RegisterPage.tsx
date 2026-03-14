import { useMemo, useState, useEffect, type FormEvent } from 'react';

import { authApi } from '../api';
import '../styles/registerPage.css';

function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return fallback;
}

export function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const createAccountDisabled = useMemo(
      () => isLoading || !email.trim(),
      [email, isLoading],
  );

  const resetMessages = () => {
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  const handleCreateAccount = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    resetMessages();
    setIsLoading(true);

    try {
      await authApi.createDraft({ email: email.trim() });
      setSuccessMessage('Check your email to verify your account.');
    } catch (error) {
      setErrorMessage(getErrorMessage(error, 'Unable to create draft user.'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
      <main className={`register-root${mounted ? ' register-root--visible' : ''}`}>
        <div className="register-glow register-glow--orange" aria-hidden="true" />
        <div className="register-glow register-glow--blue" aria-hidden="true" />

        <div className="register-card">
          <div className="register-logo" aria-hidden="true">
            <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
              <rect width="36" height="36" rx="10" fill="var(--color-accent)" opacity="0.15" />
              <path
                  d="M10 26 L18 10 L26 26"
                  stroke="var(--color-accent)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
              />
              <path
                  d="M13 20 L23 20"
                  stroke="var(--color-accent)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  fill="none"
              />
            </svg>
          </div>

          <div className="register-heading">
            <h1 className="register-title">Create account</h1>
            <p className="register-subtitle">Enter your email to get started</p>
          </div>

          {successMessage ? (
              <div className="register-success" role="status" aria-live="polite">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                  <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M4.5 7l2 2 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {successMessage}
              </div>
          ) : null}

          <form className="register-form" onSubmit={handleCreateAccount} noValidate>
            <div className="register-field">
              <label className="register-label" htmlFor="register-email">
                Email
              </label>
              <input
                  id="register-email"
                  className="register-input"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@company.com"
                  required
              />
            </div>

            {errorMessage ? (
                <div className="register-error" role="alert" aria-live="assertive">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                    <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M7 4v3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    <circle cx="7" cy="10" r="0.75" fill="currentColor" />
                  </svg>
                  {errorMessage}
                </div>
            ) : null}

            <button
                className="register-btn"
                type="submit"
                disabled={createAccountDisabled}
            >
              {isLoading ? (
                  <span className="register-btn__spinner" aria-hidden="true" />
              ) : null}
              {isLoading ? 'Creating…' : 'Create account'}
            </button>
          </form>

          <p className="register-footer">
            Already have an account?{' '}
            <a href="/login" className="register-link">
              Sign in
            </a>
          </p>
        </div>
      </main>
  );
}