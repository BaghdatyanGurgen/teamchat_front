import { useEffect, useState, useEffect as useMountEffect, type FormEvent } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';

import { authApi } from '../api';
import { useAuth } from '../store/auth';
import type { CompanyResponseDto } from '../types/api';
import '../styles/lobbyPage.css';

function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return fallback;
}

function CompanyCard({
                       company,
                       onClick,
                     }: {
  company: CompanyResponseDto;
  onClick: () => void;
}) {
  const initials = company.name.slice(0, 2).toUpperCase();

  return (
      <article className="lobby-company-card" onClick={onClick} role="button" tabIndex={0}
               onKeyDown={(e) => e.key === 'Enter' && onClick()}>
        <div className="lobby-company-avatar">
          {company.logoUrl ? (
              <img src={company.logoUrl} alt={company.name} className="lobby-company-logo" />
          ) : (
              <span>{initials}</span>
          )}
        </div>
        <div className="lobby-company-info">
          <h2 className="lobby-company-name">{company.name}</h2>
          <p className="lobby-company-desc">
            {company.description?.trim() ? company.description : 'No description'}
          </p>
        </div>
        <svg className="lobby-company-arrow" width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </article>
  );
}

export function LobbyPage() {
  const navigate = useNavigate();
  const { isAuthenticated, logout, currentUser } = useAuth();
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
  const [mounted, setMounted] = useState(false);

  useMountEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    let isMounted = true;

    void authApi
        .getMyCompanies()
        .then((response) => {
          if (!isMounted) return;
          const isSuccess = response.IsSuccess ?? response.isSuccess ?? false;
          if (!isSuccess) {
            setErrorMessage(response.Message || response.message || 'Failed to load companies');
            return;
          }
          setCompanies(response.Data ?? response.data ?? []);
        })
        .catch((error) => {
          if (!isMounted) return;
          setErrorMessage(getErrorMessage(error, 'Failed to load companies'));
        })
        .finally(() => {
          if (isMounted) setIsLoading(false);
        });

    return () => { isMounted = false; };
  }, []);

  useEffect(() => {
    if (!createdCompany) return;
    setCompanies((prev) => {
      if (prev.some((c) => c.id === createdCompany.id)) return prev;
      return [createdCompany, ...prev];
    });
  }, [createdCompany]);

  const openCreateForm = () => { setIsCreateOpen(true); setCreateErrorMessage(null); };
  const closeCreateForm = () => { setIsCreateOpen(false); setCompanyName(''); setCreateErrorMessage(null); };

  const handleCreateCompany = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setCreateErrorMessage(null);
    const trimmedName = companyName.trim();
    if (!trimmedName) { setCreateErrorMessage('Company name is required.'); return; }
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
    if (!trimmedInviteCode) { setJoinErrorMessage('Invite code is required.'); return; }
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
        if (prev.some((c) => c.id === company.id)) return prev;
        return [company, ...prev];
      });
      setInviteCode('');
    } catch (error) {
      setJoinErrorMessage(getErrorMessage(error, 'Failed to join company.'));
    } finally {
      setIsJoining(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return (
      <main className={`lobby-root${mounted ? ' lobby-root--visible' : ''}`}>
        <div className="lobby-glow lobby-glow--orange" aria-hidden="true" />
        <div className="lobby-glow lobby-glow--blue" aria-hidden="true" />

        <div className="lobby-inner">
          {/* Header */}
          <header className="lobby-header">
            <div>
              <h1 className="lobby-title">Your workspaces</h1>
              <p className="lobby-subtitle">Select a company or join a new one</p>
            </div>
            <div className="lobby-header-actions">
              <button className="lobby-btn-primary" type="button" onClick={openCreateForm}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                  <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
                New company
              </button>
              <div className="lobby-user">
                <div className="lobby-user-avatar" aria-hidden="true">
                  {(currentUser?.firstName?.[0] ?? currentUser?.email?.[0] ?? '?').toUpperCase()}
                </div>
                <button className="lobby-btn-logout" type="button" onClick={handleLogout} aria-label="Sign out">
                  <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                    <path d="M6 2H3a1 1 0 00-1 1v9a1 1 0 001 1h3M10 10l3-3-3-3M13 7H6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>
            </div>
          </header>

          {/* Join by invite */}
          <section className="lobby-section">
            <h2 className="lobby-section-title">Join by invite code</h2>
            <form className="lobby-join-form" onSubmit={handleJoinCompany} noValidate>
              <input
                  id="invite-code"
                  className="lobby-input"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value)}
                  placeholder="Paste invite code…"
                  required
              />
              <button className="lobby-btn-secondary" type="submit" disabled={isJoining}>
                {isJoining ? <span className="lobby-spinner" aria-hidden="true" /> : null}
                {isJoining ? 'Joining…' : 'Join'}
              </button>
            </form>
            {joinErrorMessage ? (
                <div className="lobby-error" role="alert" aria-live="assertive">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                    <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M7 4v3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    <circle cx="7" cy="10" r="0.75" fill="currentColor" />
                  </svg>
                  {joinErrorMessage}
                </div>
            ) : null}
          </section>

          {/* Companies list */}
          <section className="lobby-section">
            <h2 className="lobby-section-title">Companies</h2>

            {isLoading ? (
                <p className="lobby-info">Loading…</p>
            ) : errorMessage ? (
                <div className="lobby-error" role="alert">{errorMessage}</div>
            ) : companies.length === 0 ? (
                <p className="lobby-empty">You don't have any companies yet</p>
            ) : (
                <div className="lobby-companies">
                  {companies.map((company) => (
                      <CompanyCard
                          key={company.id}
                          company={company}
                          onClick={() => navigate(`/company/${company.id}`)}
                      />
                  ))}
                </div>
            )}
          </section>
        </div>

        {/* Create company modal */}
        {isCreateOpen ? (
            <div className="lobby-backdrop" onClick={closeCreateForm} role="presentation">
              <div className="lobby-modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label="Create company">
                <div className="lobby-modal-header">
                  <h2 className="lobby-modal-title">New company</h2>
                  <button className="lobby-modal-close" type="button" onClick={closeCreateForm} aria-label="Close">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  </button>
                </div>
                <form onSubmit={handleCreateCompany} noValidate>
                  <div className="lobby-modal-field">
                    <label className="lobby-modal-label" htmlFor="company-name">Company name</label>
                    <input
                        id="company-name"
                        className="lobby-input"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        placeholder="Acme Corp…"
                        required
                        autoFocus
                    />
                  </div>
                  {createErrorMessage ? (
                      <div className="lobby-error" role="alert" aria-live="assertive">
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                          <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.5" />
                          <path d="M7 4v3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                          <circle cx="7" cy="10" r="0.75" fill="currentColor" />
                        </svg>
                        {createErrorMessage}
                      </div>
                  ) : null}
                  <div className="lobby-modal-actions">
                    <button className="lobby-btn-ghost" type="button" onClick={closeCreateForm} disabled={isCreating}>
                      Cancel
                    </button>
                    <button className="lobby-btn-primary" type="submit" disabled={isCreating || !companyName.trim()}>
                      {isCreating ? <span className="lobby-spinner" aria-hidden="true" /> : null}
                      {isCreating ? 'Creating…' : 'Create'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
        ) : null}
      </main>
  );
}