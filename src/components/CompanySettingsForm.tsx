import { useState, useRef, type FormEvent, type ChangeEvent } from 'react';
import { companyApi } from '../api/company';
import { resolveAvatarUrl } from '../utils/avatarUrl';
import '../styles/ownerPanel.css';

interface CompanySettingsFormProps {
    companyId: number;
    currentDescription?: string;
    currentLogoUrl?: string;
    onUpdated: (description: string, logoUrl?: string) => void;
}

function getErrorMessage(error: unknown, fallback: string): string {
    if (error instanceof Error && error.message) return error.message;
    return fallback;
}

export function CompanySettingsForm({
                                        companyId,
                                        currentDescription = '',
                                        currentLogoUrl,
                                        onUpdated,
                                    }: CompanySettingsFormProps) {
    const [description, setDescription] = useState(currentDescription);
    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [logoPreview, setLogoPreview] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const resolvedLogo = resolveAvatarUrl(currentLogoUrl);

    const handleLogoChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > 5 * 1024 * 1024) { setErrorMessage('Image must be under 5 MB.'); return; }
        setLogoFile(file);
        const reader = new FileReader();
        reader.onload = (ev) => setLogoPreview(ev.target?.result as string);
        reader.readAsDataURL(file);
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setErrorMessage(null);
        setSuccessMessage(null);
        setIsSaving(true);

        try {
            const response = await companyApi.setCompanyDetails(companyId, description.trim(), logoFile ?? undefined);
            const isSuccess = response.IsSuccess ?? response.isSuccess ?? false;
            const data = response.Data ?? response.data;

            if (!isSuccess || !data) {
                setErrorMessage(response.Message ?? response.message ?? 'Failed to update company.');
                return;
            }

            setSuccessMessage('Company updated!');
            setLogoFile(null);
            onUpdated(data.description, data.logoUrl);
        } catch (error) {
            setErrorMessage(getErrorMessage(error, 'Failed to update company.'));
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <section id="owner-panel-company-settings" className="op-section">
            <form className="op-form" onSubmit={handleSubmit} noValidate>

                <div className="op-company-logo-row">
                    <label className="op-company-logo-upload" htmlFor="company-logo-input" title="Change logo">
                        {logoPreview || resolvedLogo
                            ? <img src={logoPreview ?? resolvedLogo} alt="Logo" className="op-company-logo-img" />
                            : <span className="op-company-logo-placeholder">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <rect x="2" y="4" width="16" height="12" rx="2" stroke="currentColor" strokeWidth="1.5"/>
                    <circle cx="7.5" cy="9" r="1.5" stroke="currentColor" strokeWidth="1.5"/>
                    <path d="M2 14l4-3 3 2.5 3-3 4 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </span>
                        }
                        <div className="op-company-logo-overlay" aria-hidden="true">
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                <path d="M8 1v14M1 8h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                            </svg>
                        </div>
                        <input
                            id="company-logo-input"
                            ref={fileInputRef}
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            style={{ display: 'none' }}
                            onChange={handleLogoChange}
                        />
                    </label>
                    <div className="op-company-logo-hint">
                        {logoFile
                            ? <span className="op-company-logo-hint-name">{logoFile.name}</span>
                            : <span>Click to upload logo</span>
                        }
                        <span className="op-company-logo-hint-sub">JPEG, PNG or WebP · max 5 MB</span>
                    </div>
                </div>

                <div className="op-field">
                    <label className="op-label" htmlFor="company-description-input">Description</label>
                    <textarea
                        id="company-description-input"
                        className="op-textarea"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="What does your company do…"
                        rows={3}
                    />
                </div>

                {errorMessage ? (
                    <div className="op-error" role="alert" aria-live="assertive">
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                            <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.5" />
                            <path d="M7 4v3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                            <circle cx="7" cy="10" r="0.75" fill="currentColor" />
                        </svg>
                        {errorMessage}
                    </div>
                ) : null}

                {successMessage ? (
                    <div className="op-success" role="status" aria-live="polite">
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                            <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.5" />
                            <path d="M4.5 7l2 2 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        {successMessage}
                    </div>
                ) : null}

                <button className="op-btn" type="submit" disabled={isSaving}>
                    {isSaving ? <span className="op-spinner" aria-hidden="true" /> : null}
                    {isSaving ? 'Saving…' : 'Save changes'}
                </button>
            </form>
        </section>
    );
}