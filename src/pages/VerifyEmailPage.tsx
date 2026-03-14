import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { authApi } from '../api';
import '../styles/authPage.css';

export function VerifyEmailPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [mounted, setMounted] = useState(false);

    useEffect(() => { setMounted(true); }, []);

    useEffect(() => {
        const userId = searchParams.get('userId');
        const token = searchParams.get('token');
        let redirectTimer: ReturnType<typeof setTimeout> | undefined;

        if (!userId || !token) { setStatus('error'); return; }

        void authApi
            .verifyEmail({ userId, token })
            .then((response) => {
                if (response.isSuccess) {
                    setStatus('success');
                    redirectTimer = setTimeout(() => {
                        navigate(`/set-password?userId=${encodeURIComponent(userId)}`, { replace: true });
                    }, 1500);
                    return;
                }
                setStatus('error');
            })
            .catch(() => setStatus('error'));

        return () => { if (redirectTimer) clearTimeout(redirectTimer); };
    }, [navigate, searchParams]);

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
                    <h1 className="auth-title">Verify Email</h1>
                    <p className="auth-subtitle">
                        {status === 'loading' && 'Verifying your email address…'}
                        {status === 'success' && 'Email verified! Redirecting…'}
                        {status === 'error' && 'Verification failed.'}
                    </p>
                </div>

                <div className="auth-status">
                    {status === 'loading' && (
                        <div className="auth-status__spinner" aria-label="Loading" />
                    )}
                    {status === 'success' && (
                        <div className="auth-status__icon auth-status__icon--success">
                            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                                <circle cx="14" cy="14" r="13" stroke="currentColor" strokeWidth="1.5" />
                                <path d="M8 14l4 4 8-8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>
                    )}
                    {status === 'error' && (
                        <div className="auth-status__icon auth-status__icon--error">
                            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                                <circle cx="14" cy="14" r="13" stroke="currentColor" strokeWidth="1.5" />
                                <path d="M9 9l10 10M19 9L9 19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                            </svg>
                        </div>
                    )}
                </div>

                {status === 'error' && (
                    <p className="auth-footer">
                        <a className="auth-link" href="/register">Back to registration</a>
                    </p>
                )}
            </div>
        </main>
    );
}