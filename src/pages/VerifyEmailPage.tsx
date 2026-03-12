import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { authApi } from '../api/auth';

export function VerifyEmailPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');

  useEffect(() => {
    const userId = searchParams.get('userId');
    const token = searchParams.get('token');
    let redirectTimer: ReturnType<typeof setTimeout> | undefined;

    if (!userId || !token) {
      setStatus('error');
      return;
    }

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
      .catch(() => {
        setStatus('error');
      });

    return () => {
      if (redirectTimer) {
        clearTimeout(redirectTimer);
      }
    };
  }, [navigate, searchParams]);

  if (status === 'loading') {
    return (
      <main className="page auth-page">
        <h1>Verify Email</h1>
        <p>Verifying email...</p>
      </main>
    );
  }

  return (
    <main className="page auth-page">
      <h1>Verify Email</h1>
      {status === 'success' ? <p>Email verified successfully</p> : <p className="error">Email verification failed</p>}
    </main>
  );
}
