import { useMemo, useState, type FormEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { authApi } from '../api/auth';

function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }

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

  const isSubmitDisabled = useMemo(
    () => isLoading || !userId.trim() || !password || password !== confirmPassword,
    [confirmPassword, isLoading, password, userId],
  );

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);

    if (!userId.trim()) {
      setErrorMessage('Invalid user ID.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await authApi.setPassword({
        userId,
        password,
      });

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
    <main className="page auth-page">
      <h1>Set Password</h1>

      <form className="form" onSubmit={handleSubmit} noValidate>
        <label htmlFor="set-password">Password</label>
        <input
          id="set-password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />

        <label htmlFor="set-confirm-password">Confirm Password</label>
        <input
          id="set-confirm-password"
          type="password"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          required
        />

        {errorMessage ? (
          <div className="error" role="alert" aria-live="assertive">
            <p>{errorMessage}</p>
          </div>
        ) : null}

        <button type="submit" disabled={isSubmitDisabled}>
          {isLoading ? 'Saving...' : 'Set Password'}
        </button>
      </form>
    </main>
  );
}
