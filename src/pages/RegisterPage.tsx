import { useMemo, useState, type FormEvent } from 'react';

import { authApi } from '../api/auth';

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
  const createAccountDisabled = useMemo(() => isLoading || !email.trim(), [email, isLoading]);

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
    <main className="page auth-page">
      <h1>Email Registration</h1>

      {errorMessage ? (
        <div className="error" role="alert" aria-live="assertive">
          <p>{errorMessage}</p>
        </div>
      ) : null}

      {successMessage ? (
        <div role="status" aria-live="polite">
          <p>{successMessage}</p>
        </div>
      ) : null}

      <form className="form" onSubmit={handleCreateAccount} noValidate>
        <label htmlFor="register-email">Email</label>
        <input
          id="register-email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />

        <button type="submit" disabled={createAccountDisabled}>
          {isLoading ? 'Creating...' : 'Create account'}
        </button>
      </form>
    </main>
  );
}
