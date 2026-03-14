import {useMemo, useState, useEffect, type FormEvent} from 'react';
import {Navigate, useNavigate} from 'react-router-dom';
import {useAuth} from '../store/auth';
import '../styles/loginPage.css';

function getErrorMessage(error: unknown, fallback: string): string {
    if (error instanceof Error && error.message) {
        return error.message;
    }
    return fallback;
}

export function LoginPage() {
    const navigate = useNavigate();
    const {login, isAuthenticated, isLoading, clearError} = useAuth();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const isSubmitDisabled = useMemo(
        () => isLoading || !email.trim() || !password,
        [email, isLoading, password],
    );

    if (isAuthenticated) {
        return <Navigate to="/lobby" replace/>;
    }

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        clearError();
        setErrorMessage(null);

        try {
            await login({email: email.trim(), password});
            navigate('/lobby', {replace: true});
        } catch (error) {
            setErrorMessage(getErrorMessage(error, 'Unable to sign in.'));
        }
    };

    return (
        <main className={`login-root${mounted ? ' login-root--visible' : ''}`}>
            {/* Ambient background glows */}
            <div className="login-glow login-glow--orange" aria-hidden="true"/>
            <div className="login-glow login-glow--blue" aria-hidden="true"/>

            <div className="login-card">
                {/* Logo mark */}
                <div className="login-logo" aria-hidden="true">
                    <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
                        <rect width="36" height="36" rx="10" fill="var(--color-accent)" opacity="0.15"/>
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

                <div className="login-heading">
                    <h1 className="login-title">Welcome back</h1>
                    <p className="login-subtitle">Sign in to your workspace</p>
                </div>

                <form className="login-form" onSubmit={handleSubmit} noValidate>
                    <div className="login-field">
                        <label className="login-label" htmlFor="login-email">
                            Email
                        </label>
                        <input
                            id="login-email"
                            className="login-input"
                            name="email"
                            type="email"
                            autoComplete="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@company.com"
                            required
                        />
                    </div>

                    <div className="login-field">
                        <label className="login-label" htmlFor="login-password">
                            Password
                        </label>
                        <input
                            id="login-password"
                            className="login-input"
                            name="password"
                            type="password"
                            autoComplete="current-password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    {errorMessage ? (
                        <div className="login-error" role="alert" aria-live="assertive">
                            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                                <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.5"/>
                                <path d="M7 4v3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                                <circle cx="7" cy="10" r="0.75" fill="currentColor"/>
                            </svg>
                            {errorMessage}
                        </div>
                    ) : null}

                    <button
                        className="login-btn"
                        type="submit"
                        disabled={isSubmitDisabled}
                    >
                        {isLoading ? (
                            <span className="login-btn__spinner" aria-hidden="true"/>
                        ) : null}
                        {isLoading ? 'Signing in…' : 'Sign in'}
                    </button>
                </form>

                <p className="login-footer">
                    No account?{' '}
                    <a href="/register" className="login-link">
                        Create one
                    </a>
                </p>
            </div>
        </main>
    );
}