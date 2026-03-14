import {useMemo, useState, type FormEvent} from 'react';
import {Navigate} from 'react-router-dom';
import {authApi} from '../api';
import {useAuth} from '../store/auth';

function getErrorMessage(error: unknown, fallback: string): string {
    if (error instanceof Error && error.message) {
        return error.message;
    }

    return fallback;
}

export function ProfilePage() {
    const {isAuthenticated, currentUser, setCurrentUser} = useAuth();

    const [firstName, setFirstName] = useState(currentUser?.firstName ?? '');
    const [lastName, setLastName] = useState(currentUser?.lastName ?? '');
    const [isSaving, setIsSaving] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const isSaveDisabled = useMemo(() => isSaving || !firstName.trim() || !lastName.trim(), [firstName, isSaving, lastName]);

    if (!isAuthenticated) {
        return <Navigate to="/login" replace/>;
    }

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setErrorMessage(null);
        setSuccessMessage(null);
        setIsSaving(true);

        try {
            const updatedProfile = await authApi.setUserProfile({
                firstName: firstName.trim(),
                lastName: lastName.trim(),
            });

            setCurrentUser(updatedProfile);
            setSuccessMessage('Profile updated successfully.');
        } catch (error) {
            setErrorMessage(getErrorMessage(error, 'Unable to update profile.'));
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <main className="page">
            <h1>Profile</h1>

            <section>
                <p>
                    <strong>ID:</strong> {currentUser?.id ?? '-'}
                </p>
                <p>
                    <strong>Email:</strong> {currentUser?.email ?? '-'}
                </p>
            </section>

            <form className="form" onSubmit={handleSubmit} noValidate>
                <label htmlFor="profile-first-name">First Name</label>
                <input
                    id="profile-first-name"
                    value={firstName}
                    onChange={(event) => setFirstName(event.target.value)}
                    required
                />

                <label htmlFor="profile-last-name">Last Name</label>
                <input
                    id="profile-last-name"
                    value={lastName}
                    onChange={(event) => setLastName(event.target.value)}
                    required
                />

                {errorMessage ? (
                    <div className="error" role="alert" aria-live="assertive">
                        <p>{errorMessage}</p>
                    </div>
                ) : null}

                {successMessage ? (
                    <div role="status" aria-live="polite">
                        <p>{successMessage}</p>
                    </div>
                ) : null}

                <button type="submit" disabled={isSaveDisabled}>
                    {isSaving ? 'Saving...' : 'Save Profile'}
                </button>
            </form>
        </main>
    );
}