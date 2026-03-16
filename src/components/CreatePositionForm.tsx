import {useState, type FormEvent} from 'react';
import {companyApi} from '../api';
import {PositionPermissions} from '../types/api';
import '../styles/ownerPanel.css';

interface CreatePositionFormProps {
    companyId: number;
    titleInputId: string;
    onCreated?: (position: { id: number; title: string; inviteCode: string }) => void;
}

function getErrorMessage(error: unknown, fallback: string): string {
    if (error instanceof Error && error.message) {
        return error.message;
    }
    return fallback;
}

const PERMISSIONS = [
    {key: PositionPermissions.CreateDepartment, label: 'Create Department'},
    {key: PositionPermissions.CreatePosition, label: 'Create Position'},
    {key: PositionPermissions.CreateChat, label: 'Create Chat'},
    {key: PositionPermissions.AddChatMember, label: 'Add Chat Member'},
    {key: PositionPermissions.RemoveChatMember, label: 'Remove Chat Member'},
    {key: PositionPermissions.EditMessage, label: 'Edit Message'},
    {key: PositionPermissions.DeleteMessage, label: 'Delete Message'},
];

export function CreatePositionForm({companyId, titleInputId, onCreated}: CreatePositionFormProps) {
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

            const data = response.Data ?? response.data;
            setPositionSuccessMessage('Position created successfully.');
            setPositionTitle('');
            setPositionPermissions(0);
            if (data) onCreated?.({ id: data.id, title: data.title, inviteCode: data.inviteCode ?? '' });
        } catch (error) {
            setPositionErrorMessage(getErrorMessage(error, 'Failed to create position.'));
        } finally {
            setIsCreatingPosition(false);
        }
    };

    return (
        <section id="owner-panel-position" className="op-section">
            <form className="op-form" onSubmit={handleCreatePosition} noValidate>

                <div className="op-field">
                    <label className="op-label" htmlFor={titleInputId}>Position title</label>
                    <input
                        id={titleInputId}
                        className="op-input"
                        value={positionTitle}
                        onChange={(e) => setPositionTitle(e.target.value)}
                        placeholder="Manager…"
                        required
                    />
                </div>

                <fieldset className="op-fieldset">
                    <legend className="op-legend">Permissions</legend>
                    <div className="op-permissions">
                        {PERMISSIONS.map(({key, label}) => (
                            <label key={key} className="op-permission-item">
                                <input
                                    type="checkbox"
                                    className="op-checkbox"
                                    id={`permission-${key}-${companyId}`}
                                    checked={(positionPermissions & key) !== 0}
                                    onChange={() => togglePermission(key)}
                                />
                                <span className="op-permission-label">{label}</span>
                            </label>
                        ))}
                    </div>
                </fieldset>

                {positionErrorMessage ? (
                    <div className="op-error" role="alert" aria-live="assertive">
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                            <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.5"/>
                            <path d="M7 4v3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                            <circle cx="7" cy="10" r="0.75" fill="currentColor"/>
                        </svg>
                        {positionErrorMessage}
                    </div>
                ) : null}

                {positionSuccessMessage ? (
                    <div className="op-success" role="status" aria-live="polite">
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                            <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.5"/>
                            <path d="M4.5 7l2 2 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"
                                  strokeLinejoin="round"/>
                        </svg>
                        {positionSuccessMessage}
                    </div>
                ) : null}

                <button className="op-btn" type="submit" disabled={isCreatingPosition}>
                    {isCreatingPosition ? <span className="op-spinner" aria-hidden="true"/> : null}
                    {isCreatingPosition ? 'Creating…' : 'Create position'}
                </button>

            </form>
        </section>
    );
}