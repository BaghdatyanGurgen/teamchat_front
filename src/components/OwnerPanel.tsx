import { useMemo } from 'react';

import type { OwnerPanelTab } from '../hooks/useOwnerPanel';
import type { UserPositionResponseDto } from '../types/api';
import { CreateDepartmentForm } from './CreateDepartmentForm';
import { CreatePositionForm } from './CreatePositionForm';
import '../styles/ownerPanel.css';

interface OwnerPanelProps {
    companyId: number;
    isOpen: boolean;
    onClose: () => void;
    canCreateDepartment: boolean;
    canCreatePosition: boolean;
    ownerPanelTab: OwnerPanelTab;
    toggleOwnerPanelSection: (section: Exclude<OwnerPanelTab, 'none'>) => void;
    positions: UserPositionResponseDto[];
    isPositionsLoading: boolean;
    positionsErrorMessage: string | null;
}

export function OwnerPanel({
                               companyId,
                               isOpen,
                               onClose,
                               canCreateDepartment,
                               canCreatePosition,
                               ownerPanelTab,
                               toggleOwnerPanelSection,
                               positions,
                               isPositionsLoading,
                               positionsErrorMessage,
                           }: OwnerPanelProps) {
    const isDepartmentOpen = ownerPanelTab === 'department';
    const isPositionOpen = ownerPanelTab === 'position';
    const isMyPositionsOpen = ownerPanelTab === 'myPositions';

    const departmentNameInputId = useMemo(() => `department-name-${companyId}`, [companyId]);
    const departmentDescriptionInputId = useMemo(() => `department-description-${companyId}`, [companyId]);
    const positionTitleInputId = useMemo(() => `position-title-${companyId}`, [companyId]);

    if (!isOpen) return null;

    return (
        <div className="company-owner-panel-backdrop" onClick={onClose} role="presentation">
            <aside
                className="company-owner-panel"
                role="dialog"
                aria-modal="true"
                aria-label="Owner Panel"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="company-owner-panel-header">
                    <h2>Owner Panel</h2>
                    <button type="button" onClick={onClose} aria-label="Close">
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                            <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                    </button>
                </div>

                {/* Nav */}
                <div className="op-nav">
                    <button
                        type="button"
                        className="op-nav-btn"
                        onClick={() => toggleOwnerPanelSection('department')}
                        disabled={!canCreateDepartment}
                        aria-expanded={isDepartmentOpen}
                        aria-controls="owner-panel-department"
                    >
                        Create Department
                        <svg className="op-nav-chevron" width="14" height="14" viewBox="0 0 14 14" fill="none">
                            <path d="M3 5l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </button>

                    {isDepartmentOpen && (
                        <CreateDepartmentForm
                            companyId={companyId}
                            nameInputId={departmentNameInputId}
                            descriptionInputId={departmentDescriptionInputId}
                        />
                    )}

                    <button
                        type="button"
                        className="op-nav-btn"
                        onClick={() => toggleOwnerPanelSection('position')}
                        disabled={!canCreatePosition}
                        aria-expanded={isPositionOpen}
                        aria-controls="owner-panel-position"
                    >
                        Create Position
                        <svg className="op-nav-chevron" width="14" height="14" viewBox="0 0 14 14" fill="none">
                            <path d="M3 5l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </button>

                    {isPositionOpen && (
                        <CreatePositionForm companyId={companyId} titleInputId={positionTitleInputId} />
                    )}

                    <button
                        type="button"
                        className="op-nav-btn"
                        onClick={() => toggleOwnerPanelSection('myPositions')}
                        aria-expanded={isMyPositionsOpen}
                        aria-controls="owner-panel-my-positions"
                    >
                        My Positions
                        <svg className="op-nav-chevron" width="14" height="14" viewBox="0 0 14 14" fill="none">
                            <path d="M3 5l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </button>

                    {isMyPositionsOpen && (
                        <section id="owner-panel-my-positions" className="op-section">
                            {isPositionsLoading && <p className="op-empty">Loading…</p>}

                            {!isPositionsLoading && positionsErrorMessage && (
                                <div className="op-error">
                                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                                        <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.5" />
                                        <path d="M7 4v3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                        <circle cx="7" cy="10" r="0.75" fill="currentColor" />
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