import { useState, type FormEvent } from 'react';

import { companyApi } from '../api/company';
import { PositionPermissions } from '../types/api';

interface CreatePositionFormProps {
  companyId: number;
  titleInputId: string;
}

function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}

export function CreatePositionForm({ companyId, titleInputId }: CreatePositionFormProps) {
  const [positionTitle, setPositionTitle] = useState('');
  const [positionPermissions, setPositionPermissions] = useState(0);
  const [isCreatingPosition, setIsCreatingPosition] = useState(false);
  const [positionErrorMessage, setPositionErrorMessage] = useState<string | null>(null);
  const [positionSuccessMessage, setPositionSuccessMessage] = useState<string | null>(null);

  const togglePermission = (permission: PositionPermissions) => {
    setPositionPermissions((prev) => ((prev & permission) ? prev & ~permission : prev | permission));
  };

  const handleCreatePosition = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setPositionErrorMessage(null);
    setPositionSuccessMessage(null);

    const trimmedTitle = positionTitle.trim();

    if (!trimmedTitle) {
      setPositionErrorMessage('Position title is required.');
      return;
    }

    if (!Number.isFinite(companyId) || companyId <= 0) {
      setPositionErrorMessage('Invalid company ID.');
      return;
    }

    setIsCreatingPosition(true);

    try {
      const response = await companyApi.createPosition(companyId, {
        title: trimmedTitle,
        permissions: positionPermissions,
      });

      const isSuccess = response.IsSuccess ?? response.isSuccess ?? false;

      if (!isSuccess) {
        setPositionErrorMessage(response.Message ?? response.message ?? 'Failed to create position.');
        return;
      }

      setPositionSuccessMessage('Position created successfully.');
      setPositionTitle('');
      setPositionPermissions(0);
    } catch (error) {
      setPositionErrorMessage(getErrorMessage(error, 'Failed to create position.'));
    } finally {
      setIsCreatingPosition(false);
    }
  };

  return (
    <section id="owner-panel-position" className="form">
      <h3>Create Position</h3>
      <form onSubmit={handleCreatePosition} noValidate>
        <label htmlFor={titleInputId}>Position title</label>
        <input id={titleInputId} value={positionTitle} onChange={(event) => setPositionTitle(event.target.value)} required />

        <fieldset>
          <legend>Permissions</legend>

          <div>
            <input
              id={`permission-create-department-${companyId}`}
              type="checkbox"
              checked={(positionPermissions & PositionPermissions.CreateDepartment) !== 0}
              onChange={() => togglePermission(PositionPermissions.CreateDepartment)}
            />
            <label htmlFor={`permission-create-department-${companyId}`}>Create Department</label>
          </div>

          <div>
            <input
              id={`permission-create-position-${companyId}`}
              type="checkbox"
              checked={(positionPermissions & PositionPermissions.CreatePosition) !== 0}
              onChange={() => togglePermission(PositionPermissions.CreatePosition)}
            />
            <label htmlFor={`permission-create-position-${companyId}`}>Create Position</label>
          </div>

          <div>
            <input
              id={`permission-create-chat-${companyId}`}
              type="checkbox"
              checked={(positionPermissions & PositionPermissions.CreateChat) !== 0}
              onChange={() => togglePermission(PositionPermissions.CreateChat)}
            />
            <label htmlFor={`permission-create-chat-${companyId}`}>Create Chat</label>
          </div>

          <div>
            <input
              id={`permission-add-chat-member-${companyId}`}
              type="checkbox"
              checked={(positionPermissions & PositionPermissions.AddChatMember) !== 0}
              onChange={() => togglePermission(PositionPermissions.AddChatMember)}
            />
            <label htmlFor={`permission-add-chat-member-${companyId}`}>Add Chat Member</label>
          </div>

          <div>
            <input
              id={`permission-remove-chat-member-${companyId}`}
              type="checkbox"
              checked={(positionPermissions & PositionPermissions.RemoveChatMember) !== 0}
              onChange={() => togglePermission(PositionPermissions.RemoveChatMember)}
            />
            <label htmlFor={`permission-remove-chat-member-${companyId}`}>Remove Chat Member</label>
          </div>

          <div>
            <input
              id={`permission-edit-message-${companyId}`}
              type="checkbox"
              checked={(positionPermissions & PositionPermissions.EditMessage) !== 0}
              onChange={() => togglePermission(PositionPermissions.EditMessage)}
            />
            <label htmlFor={`permission-edit-message-${companyId}`}>Edit Message</label>
          </div>

          <div>
            <input
              id={`permission-delete-message-${companyId}`}
              type="checkbox"
              checked={(positionPermissions & PositionPermissions.DeleteMessage) !== 0}
              onChange={() => togglePermission(PositionPermissions.DeleteMessage)}
            />
            <label htmlFor={`permission-delete-message-${companyId}`}>Delete Message</label>
          </div>
        </fieldset>

        {positionErrorMessage ? (
          <div className="error" role="alert">
            <p>{positionErrorMessage}</p>
          </div>
        ) : null}

        {positionSuccessMessage ? (
          <div role="status">
            <p>{positionSuccessMessage}</p>
          </div>
        ) : null}

        <button type="submit" disabled={isCreatingPosition}>
          {isCreatingPosition ? 'Creating...' : 'Create Position'}
        </button>
      </form>
    </section>
  );
}
