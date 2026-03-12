import { useState, type FormEvent } from 'react';

import { companyApi } from '../api/company';

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

    if (!trimmedName) {
      setDepartmentErrorMessage('Department name is required.');
      return;
    }

    if (!trimmedDescription) {
      setDepartmentErrorMessage('Department description is required.');
      return;
    }

    if (!Number.isFinite(companyId) || companyId <= 0) {
      setDepartmentErrorMessage('Invalid company ID.');
      return;
    }

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
    <section id="owner-panel-department" className="form">
      <h3>Create Department</h3>
      <form onSubmit={handleCreateDepartment} noValidate>
        <label htmlFor={nameInputId}>Department name</label>
        <input id={nameInputId} value={departmentName} onChange={(event) => setDepartmentName(event.target.value)} required />

        <label htmlFor={descriptionInputId}>Description</label>
        <textarea
          id={descriptionInputId}
          value={departmentDescription}
          onChange={(event) => setDepartmentDescription(event.target.value)}
          required
        />

        {departmentErrorMessage ? (
          <div className="error" role="alert" aria-live="assertive">
            <p>{departmentErrorMessage}</p>
          </div>
        ) : null}

        {departmentSuccessMessage ? (
          <div role="status" aria-live="polite">
            <p>{departmentSuccessMessage}</p>
          </div>
        ) : null}

        <button type="submit" disabled={isCreatingDepartment}>
          {isCreatingDepartment ? 'Creating...' : 'Create department'}
        </button>
      </form>
    </section>
  );
}
