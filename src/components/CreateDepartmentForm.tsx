import { useState, type FormEvent } from 'react';

import { companyApi } from '../api/company';
import '../styles/ownerPanel.css';

interface CreateDepartmentFormProps {
  companyId: number;
  nameInputId: string;
  descriptionInputId: string;
}

function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return fallback;
}

export function CreateDepartmentForm({ companyId, nameInputId, descriptionInputId }: CreateDepartmentFormProps) {
  const [departmentName, setDepartmentName] = useState('');
  const [departmentDescription, setDepartmentDescription] = useState('');
  const [isCreatingDepartment, setIsCreatingDepartment] = useState(false);
  const [departmentErrorMessage, setDepartmentErrorMessage] = useState<string | null>(null);
  const [departmentSuccessMessage, setDepartmentSuccessMessage] = useState<string | null>(null);

  const handleCreateDepartment = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setDepartmentErrorMessage(null);
    setDepartmentSuccessMessage(null);

    const trimmedName = departmentName.trim();
    const trimmedDescription = departmentDescription.trim();

    if (!trimmedName) { setDepartmentErrorMessage('Department name is required.'); return; }
    if (!trimmedDescription) { setDepartmentErrorMessage('Department description is required.'); return; }
    if (!Number.isFinite(companyId) || companyId <= 0) { setDepartmentErrorMessage('Invalid company ID.'); return; }

    setIsCreatingDepartment(true);

    try {
      const response = await companyApi.createDepartment(companyId, {
        name: trimmedName,
        description: trimmedDescription,
      });

      const isSuccess = response.IsSuccess ?? response.isSuccess ?? false;
      if (!isSuccess) {
        setDepartmentErrorMessage(response.Message ?? response.message ?? 'Failed to create department.');
        return;
      }

      setDepartmentSuccessMessage('Department created successfully.');
      setDepartmentName('');
      setDepartmentDescription('');
    } catch (error) {
      setDepartmentErrorMessage(getErrorMessage(error, 'Failed to create department.'));
    } finally {
      setIsCreatingDepartment(false);
    }
  };

  return (
      <section id="owner-panel-department" className="op-section">
        <form className="op-form" onSubmit={handleCreateDepartment} noValidate>

          <div className="op-field">
            <label className="op-label" htmlFor={nameInputId}>Department name</label>
            <input
                id={nameInputId}
                className="op-input"
                value={departmentName}
                onChange={(e) => setDepartmentName(e.target.value)}
                placeholder="Engineering…"
                required
            />
          </div>

          <div className="op-field">
            <label className="op-label" htmlFor={descriptionInputId}>Description</label>
            <textarea
                id={descriptionInputId}
                className="op-textarea"
                value={departmentDescription}
                onChange={(e) => setDepartmentDescription(e.target.value)}
                placeholder="What does this department do…"
                rows={3}
                required
            />
          </div>

          {departmentErrorMessage ? (
              <div className="op-error" role="alert" aria-live="assertive">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                  <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M7 4v3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  <circle cx="7" cy="10" r="0.75" fill="currentColor" />
                </svg>
                {departmentErrorMessage}
              </div>
          ) : null}

          {departmentSuccessMessage ? (
              <div className="op-success" role="status" aria-live="polite">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                  <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M4.5 7l2 2 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {departmentSuccessMessage}
              </div>
          ) : null}

          <button className="op-btn" type="submit" disabled={isCreatingDepartment}>
            {isCreatingDepartment ? <span className="op-spinner" aria-hidden="true" /> : null}
            {isCreatingDepartment ? 'Creating…' : 'Create department'}
          </button>

        </form>
      </section>
  );
}