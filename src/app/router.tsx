import { Navigate, Route, Routes } from 'react-router-dom';

import { ProtectedRoute } from './components/ProtectedRoute';
import { ChatPage } from '../pages/ChatPage';
import { CompanyLobbyPage } from '../pages/CompanyLobbyPage';
import { LobbyPage } from '../pages/LobbyPage';
import { LoginPage } from '../pages/LoginPage';
import { ProfilePage } from '../pages/ProfilePage';
import { RegisterPage } from '../pages/RegisterPage';
import { SetPasswordPage } from '../pages/SetPasswordPage';
import { VerifyEmailPage } from '../pages/VerifyEmailPage';

export function AppRouter() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/verify-email" element={<VerifyEmailPage />} />
      <Route path="/set-password" element={<SetPasswordPage />} />

      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<ChatPage />} />
        <Route path="/lobby" element={<LobbyPage />} />
        <Route path="/company/:companyId" element={<CompanyLobbyPage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
