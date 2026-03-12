import { useMemo, useState, type FormEvent } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';

import { useAuth } from '../hooks/useAuth';

function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}

export function LoginPage() {
  const navigate = useNavigate();
  const { login, isAuthenticated, isLoading, clearError } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isSubmitDisabled = useMemo(() => isLoading || !email.trim() || !password, [email, isLoading, password]);

  if (isAuthenticated) {
    return <Navigate to="/lobby" replace />;
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    clearError();
    setErrorMessage(null);

    try {
      await login({
        email: email.trim(),
        password,
      });

      navigate('/lobby', { replace: true });
    } catch (error) {
      setErrorMessage(getErrorMessage(error, 'Unable to sign in.'));
    }
  };

  return (
    <main className="page auth-page">
      <h1>Login</h1>

      <form className="form" onSubmit={handleSubmit} noValidate>
        <label htmlFor="login-email">Email</label>
        <input
          id="login-email"
          name="email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />

        <label htmlFor="login-password">Password</label>
        <input
          id="login-password"
          name="password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />

        {errorMessage ? (
          <div className="error" role="alert" aria-live="assertive">
            <p>{errorMessage}</p>
          </div>
        ) : null}

        <button type="submit" disabled={isSubmitDisabled}>
          {isLoading ? 'Signing in...' : 'Sign in'}
        </button>
      </form>
    </main>
  );
}
