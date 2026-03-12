import { useMemo } from 'react';

import type { OwnerPanelTab } from '../hooks/useOwnerPanel';
import type { UserPositionResponseDto } from '../types/api';
import { CreateDepartmentForm } from './CreateDepartmentForm';
import { CreatePositionForm } from './CreatePositionForm';

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

  if (!isOpen) {
    return null;
  }

  return (
      <div className="company-owner-panel-backdrop" onClick={onClose} role="presentation">
        <aside
            className="company-owner-panel"
            role="dialog"
            aria-modal="true"
            aria-label="Owner Panel"
            onClick={(event) => event.stopPropagation()}
        >
          <div className="company-owner-panel-header">
            <h2>Owner Panel</h2>
            <button type="button" onClick={onClose}>
              X
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <button
                type="button"
                onClick={() => toggleOwnerPanelSection('department')}
                disabled={!canCreateDepartment}
                aria-expanded={isDepartmentOpen}
                aria-controls="owner-panel-department"
            >
              Create Department
            </button>

            {isDepartmentOpen ? (
                <CreateDepartmentForm
                    companyId={companyId}
                    nameInputId={departmentNameInputId}
                    descriptionInputId={departmentDescriptionInputId}
                />
            ) : null}

            <button
                type="button"
                onClick={() => toggleOwnerPanelSection('position')}
                disabled={!canCreatePosition}
                aria-expanded={isPositionOpen}
                aria-controls="owner-panel-position"
            >
              Create Position
            </button>

            {isPositionOpen ? (
                <CreatePositionForm companyId={companyId} titleInputId={positionTitleInputId} />
            ) : null}

            <button
                type="button"
                onClick={() => toggleOwnerPanelSection('myPositions')}
                aria-expanded={isMyPositionsOpen}
                aria-controls="owner-panel-my-positions"
            >
              My Positions
            </button>

            {isMyPositionsOpen ? (
                <section id="owner-panel-my-positions" className="form">
                  {isPositionsLoading ? <p>Loading...</p> : null}
                  {!isPositionsLoading && positionsErrorMessage ? <p className="error">{positionsErrorMessage}</p> : null}
                  {!isPositionsLoading && !positionsErrorMessage && positions.length === 0 ? (
                      <p>No positions created yet.</p>
                  ) : null}
                  {!isPositionsLoading && !positionsErrorMessage && positions.length > 0 ? (
                      <ul>
                        {positions.map((position) => (
                            <li key={position.id}>
                              {position.title} - <code>{position.inviteCode}</code>
                            </li>
                        ))}
                      </ul>
                  ) : null}
                </section>
            ) : null}
          </div>

          {/* Future owner actions go here */}
        </aside>
      </div>
  );
}