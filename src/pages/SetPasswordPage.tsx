import { useMemo, useState, type FormEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { authApi } from '../api';
import '../styles/authPage.css';

function getErrorMessage(error: unknown, fallback: string): string {
    if (error instanceof Error && error.message) return error.message;
    return fallback;
}

export function SetPasswordPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const userId = searchParams.get('userId') ?? '';

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [mounted, setMounted] = useState(false);

    useMemo(() => { setTimeout(() => setMounted(true), 0); }, []);

    const isSubmitDisabled = useMemo(
        () => isLoading || !userId.trim() || !password || password !== confirmPassword,
        [confirmPassword, isLoading, password, userId],
    );

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setErrorMessage(null);

        if (password !== confirmPassword) {
            setErrorMessage('Passwords do not match.');
            return;
        }

        setIsLoading(true);

        try {
            const response = await authApi.setPassword({ userId, password });

            if (!response.isSuccess) {
                setErrorMessage(response.message || 'Failed to set password.');
                return;
            }

            navigate('/login', { replace: true });
        } catch (error) {
            setErrorMessage(getErrorMessage(error, 'Unable to set password.'));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <main className={`auth-root${mounted ? ' auth-root--visible' : ''}`}>
            <div className="auth-glow auth-glow--orange" aria-hidden="true" />
            <div className="auth-glow auth-glow--blue" aria-hidden="true" />

            <div className="auth-card">
                <div className="auth-logo" aria-hidden="true">
                    <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
                        <rect width="36" height="36" rx="10" fill="var(--color-accent)" opacity="0.15" />
                        <path d="M10 26 L18 10 L26 26" stroke="var(--color-accent)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                        <path d="M13 20 L23 20" stroke="var(--color-accent)" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                </div>

                <div className="auth-heading">
                    <h1 className="auth-title">Set Password</h1>
                    <p className="auth-subtitle">Choose a strong password for your account.</p>
                </div>

                <form className="auth-form" onSubmit={handleSubmit} noValidate>
                    <div className="auth-field">
                        <label className="auth-label" htmlFor="set-password">Password</label>
                        <input
                            id="set-password"
                            className="auth-input"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    <div className="auth-field">
                        <label className="auth-label" htmlFor="set-confirm-password">Confirm password</label>
                        <input
                            id="set-confirm-password"
                            className="auth-input"
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    {errorMessage && (
                        <div className="auth-error" role="alert" aria-live="assertive">
                            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                                <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.5" />
                                <path d="M7 4v3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                <circle cx="7" cy="10" r="0.75" fill="currentColor" />
                            </svg>
                            {errorMessage}
                        </div>
                    )}

                    <button className="auth-btn" type="submit" disabled={isSubmitDisabled}>
                        {isLoading && <span className="auth-btn__spinner" aria-hidden="true" />}
                        {isLoading ? 'Saving…' : 'Set Password'}
                    </button>
                </form>

                <p className="auth-footer">
                    Already have an account? <a className="auth-link" href="/login">Sign in</a>
                </p>
            </div>
        </main>
    );
}