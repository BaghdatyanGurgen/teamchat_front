import { useEffect, useState, type FormEvent } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';

import { authApi } from '../api';
import { useAuth } from '../store/auth';
import type { CompanyResponseDto } from '../types/api';

function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}

export function LobbyPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [companies, setCompanies] = useState<CompanyResponseDto[]>([]);
  const [createdCompany, setCreatedCompany] = useState<CompanyResponseDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [companyName, setCompanyName] = useState('');
  const [createErrorMessage, setCreateErrorMessage] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [inviteCode, setInviteCode] = useState('');
  const [joinErrorMessage, setJoinErrorMessage] = useState<string | null>(null);
  const [isJoining, setIsJoining] = useState(false);

  useEffect(() => {
    let isMounted = true;

    void authApi
      .getMyCompanies()
      .then((response) => {
        if (!isMounted) {
          return;
        }

        const isSuccess = response.IsSuccess ?? response.isSuccess ?? false;
        if (!isSuccess) {
          setErrorMessage(response.Message || response.message || 'Failed to load companies');
          return;
        }

        setCompanies(response.Data ?? response.data ?? []);
      })
      .catch((error) => {
        if (!isMounted) {
          return;
        }

        setErrorMessage(getErrorMessage(error, 'Failed to load companies'));
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!createdCompany) {
      return;
    }

    setCompanies((prevCompanies) => {
      const alreadyExists = prevCompanies.some((company) => company.id === createdCompany.id);
      if (alreadyExists) {
        return prevCompanies;
      }

      return [createdCompany, ...prevCompanies];
    });
  }, [createdCompany]);

  const openCreateForm = () => {
    setIsCreateOpen(true);
    setCreateErrorMessage(null);
  };

  const closeCreateForm = () => {
    setIsCreateOpen(false);
    setCompanyName('');
    setCreateErrorMessage(null);
  };

  const handleCreateCompany = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setCreateErrorMessage(null);

    const trimmedName = companyName.trim();
    if (!trimmedName) {
      setCreateErrorMessage('Company name is required.');
      return;
    }

    setIsCreating(true);

    try {
      const response = await authApi.createCompany({ name: trimmedName });
      const isSuccess = response.IsSuccess ?? response.isSuccess ?? false;
      const company = response.Data ?? response.data;

      if (!isSuccess || !company) {
        setCreateErrorMessage(response.Message || response.message || 'Failed to create company.');
        return;
      }

      setCreatedCompany(company);
      closeCreateForm();
    } catch (error) {
      setCreateErrorMessage(getErrorMessage(error, 'Failed to create company.'));
    } finally {
      setIsCreating(false);
    }
  };

  const handleJoinCompany = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setJoinErrorMessage(null);

    const trimmedInviteCode = inviteCode.trim();
    if (!trimmedInviteCode) {
      setJoinErrorMessage('Invite code is required.');
      return;
    }

    setIsJoining(true);

    try {
      const response = await authApi.joinCompanyByInvite({ inviteCode: trimmedInviteCode });
      const isSuccess = response.IsSuccess ?? response.isSuccess ?? false;
      const company = response.Data ?? response.data;

      if (!isSuccess || !company) {
        setJoinErrorMessage(response.Message || response.message || 'Failed to join company.');
        return;
      }

      setCompanies((prev) => {
        if (prev.some((c) => c.id === company.id)) {
          return prev;
        }

        return [company, ...prev];
      });
      setInviteCode('');
    } catch (error) {
      setJoinErrorMessage(getErrorMessage(error, 'Failed to join company.'));
    } finally {
      setIsJoining(false);
    }
  };

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <main className="page">
      <h1>Lobby</h1>
      <button type="button" onClick={openCreateForm}>
        Create company
      </button>

      <div className="form" style={{ marginTop: 12, marginBottom: 12 }}>
        <form onSubmit={handleJoinCompany} noValidate>
          <label htmlFor="invite-code">Invite code</label>
          <input
            id="invite-code"
            value={inviteCode}
            onChange={(event) => setInviteCode(event.target.value)}
            required
          />

          {joinErrorMessage ? (
            <div className="error" role="alert" aria-live="assertive">
              <p>{joinErrorMessage}</p>
            </div>
          ) : null}

          <button type="submit" disabled={isJoining}>
            {isJoining ? 'Joining...' : 'Join'}
          </button>
        </form>
      </div>

      {isCreateOpen ? (
        <div className="form" style={{ marginTop: 12, marginBottom: 12 }}>
          <form onSubmit={handleCreateCompany} noValidate>
            <label htmlFor="company-name">Company name</label>
            <input
              id="company-name"
              value={companyName}
              onChange={(event) => setCompanyName(event.target.value)}
              required
            />

            {createErrorMessage ? (
              <div className="error" role="alert" aria-live="assertive">
                <p>{createErrorMessage}</p>
              </div>
            ) : null}

            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
              <button type="submit" disabled={isCreating}>
                {isCreating ? 'Creating...' : 'Create'}
              </button>
              <button type="button" onClick={closeCreateForm} disabled={isCreating}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      ) : null}

      {isLoading ? <p>Loading...</p> : null}

      {!isLoading && errorMessage ? (
        <div className="error" role="alert" aria-live="assertive">
          <p>{errorMessage}</p>
        </div>
      ) : null}

      {!isLoading && !errorMessage && companies.length === 0 ? <p>You do not have companies yet</p> : null}

      {!isLoading && !errorMessage && companies.length > 0 ? (
        <section>
          {companies.map((company) => (
            <article
              key={company.id}
              className="form"
              style={{ marginBottom: 12, cursor: 'pointer' }}
              onClick={() => navigate(`/company/${company.id}`)}
            >
              {company.logoUrl ? (
                <img
                  src={company.logoUrl}
                  alt={`Logo ${company.name}`}
                  style={{ width: 56, height: 56, borderRadius: 8, objectFit: 'cover' }}
                />
              ) : null}
              <h2 style={{ margin: 0 }}>{company.name}</h2>
              <p style={{ margin: 0 }}>{company.description?.trim() ? company.description : 'No description'}</p>
            </article>
          ))}
        </section>
      ) : null}
    </main>
  );
}
