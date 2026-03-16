import {useMemo} from 'react';
import type {OwnerPanelTab} from '../hooks/useOwnerPanel';
import type {CompanyChatResponseDto, UserPositionResponseDto} from '../types/api';
import {CreateDepartmentForm} from './CreateDepartmentForm';
import {CreatePositionForm} from './CreatePositionForm';
import {CreateChatForm} from './CreateChatForm';
import {CompanySettingsForm} from './CompanySettingsForm';
import '../styles/ownerPanel.css';

interface OwnerPanelProps {
    companyId: number;
    isOpen: boolean;
    onClose: () => void;
    canCreateDepartment: boolean;
    canCreatePosition: boolean;
    canCreateChat: boolean;
    ownerPanelTab: OwnerPanelTab;
    toggleOwnerPanelSection: (section: Exclude<OwnerPanelTab, 'none'>) => void;
    positions: UserPositionResponseDto[];
    isPositionsLoading: boolean;
    positionsErrorMessage: string | null;
    onChatCreated: (chat: CompanyChatResponseDto) => void;
    onPositionCreated: (position: { id: number; title: string; inviteCode: string }) => void;
    companyDescription?: string;
    companyLogoUrl?: string;
    onCompanyUpdated: (description: string, logoUrl?: string) => void;
}

export function OwnerPanel({
                               companyId,
                               isOpen,
                               onClose,
                               canCreateDepartment,
                               canCreatePosition,
                               canCreateChat,
                               ownerPanelTab,
                               toggleOwnerPanelSection,
                               positions,
                               isPositionsLoading,
                               positionsErrorMessage,
                               onChatCreated,
                               onPositionCreated,
                               companyDescription,
                               companyLogoUrl,
                               onCompanyUpdated,
                           }: OwnerPanelProps) {
    const isDepartmentOpen = ownerPanelTab === 'department';
    const isPositionOpen = ownerPanelTab === 'position';
    const isMyPositionsOpen = ownerPanelTab === 'myPositions';
    const isCreateChatOpen = ownerPanelTab === 'createChat';
    const isCompanySettingsOpen = ownerPanelTab === 'companySettings';

    const departmentNameInputId = useMemo(() => `department-name-${companyId}`, [companyId]);
    const departmentDescriptionInputId = useMemo(() => `department-description-${companyId}`, [companyId]);
    const positionTitleInputId = useMemo(() => `position-title-${companyId}`, [companyId]);

    if (!isOpen) return null;

    const NavBtn = ({
                        section,
                        label,
                        disabled = false,
                    }: {
        section: Exclude<OwnerPanelTab, 'none'>;
        label: string;
        disabled?: boolean;
    }) => (
        <button
            type="button"
            className="op-nav-btn"
            onClick={() => toggleOwnerPanelSection(section)}
            disabled={disabled}
            aria-expanded={ownerPanelTab === section}
        >
            {label}
            <svg className="op-nav-chevron" width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M3 5l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"
                      strokeLinejoin="round"/>
            </svg>
        </button>
    );

    return (
        <div className="company-owner-panel-backdrop" onClick={onClose} role="presentation">
            <aside
                className="company-owner-panel"
                role="dialog"
                aria-modal="true"
                aria-label="Owner Panel"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="company-owner-panel-header">
                    <h2>Owner Panel</h2>
                    <button type="button" onClick={onClose} aria-label="Close">
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                            <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.5"
                                  strokeLinecap="round"/>
                        </svg>
                    </button>
                </div>

                <div className="op-nav">
                    <NavBtn section="companySettings" label="Company Settings"/>
                    {isCompanySettingsOpen && (
                        <CompanySettingsForm
                            companyId={companyId}
                            currentDescription={companyDescription}
                            currentLogoUrl={companyLogoUrl}
                            onUpdated={onCompanyUpdated}
                        />
                    )}

                    <NavBtn section="createChat" label="Create Chat" disabled={!canCreateChat}/>
                    {isCreateChatOpen && (
                        <CreateChatForm companyId={companyId} onCreated={onChatCreated}/>
                    )}

                    <NavBtn section="department" label="Create Department" disabled={!canCreateDepartment}/>
                    {isDepartmentOpen && (
                        <CreateDepartmentForm
                            companyId={companyId}
                            nameInputId={departmentNameInputId}
                            descriptionInputId={departmentDescriptionInputId}
                        />
                    )}

                    <NavBtn section="position" label="Create Position" disabled={!canCreatePosition}/>
                    {isPositionOpen && (
                        <CreatePositionForm companyId={companyId} titleInputId={positionTitleInputId} onCreated={onPositionCreated}/>
                    )}

                    <NavBtn section="myPositions" label="My Positions"/>
                    {isMyPositionsOpen && (
                        <section id="owner-panel-my-positions" className="op-section">
                            {isPositionsLoading && <p className="op-empty">Loading…</p>}

                            {!isPositionsLoading && positionsErrorMessage && (
                                <div className="op-error">
                                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                                        <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.5"/>
                                        <path d="M7 4v3.5" stroke="currentColor" strokeWidth="1.5"
                                              strokeLinecap="round"/>
                                        <circle cx="7" cy="10" r="0.75" fill="currentColor"/>
                                    </svg>
                                    {positionsErrorMessage}
                                </div>
                            )}

                            {!isPositionsLoading && !positionsErrorMessage && positions.length === 0 && (
                                <p className="op-empty">No positions created yet.</p>
                            )}

                            {!isPositionsLoading && !positionsErrorMessage && positions.length > 0 && (
                                <ul className="op-positions-list">
                                    {positions.map((position) => (
                                        <li key={position.id} className="op-position-item">
                                            <span className="op-position-title">{position.title}</span>
                                            <code className="op-position-code">{position.inviteCode}</code>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </section>
                    )}
                </div>
            </aside>
        </div>
    );
}