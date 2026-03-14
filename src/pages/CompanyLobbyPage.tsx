import { useMemo, useState, useEffect } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';

import { CompanyChatList } from '../components/CompanyChatList';
import { CompanyChat } from '../components/CompanyChat';
import { OwnerPanel } from '../components/OwnerPanel';
import { useAuth } from '../store/auth';
import { useCompanyChats } from '../hooks/useCompanyChats';
import { useCompanyPermissions } from '../hooks/useCompanyPermissions';
import { useOwnerPanel } from '../hooks/useOwnerPanel';
import { useUserPositions } from '../hooks/useUserPositions';
import { authApi } from '../api';
import type { CompanyChatResponseDto, CompanyResponseDto } from '../types/api';

import { useUnreadCounts } from '../hooks/useUnreadCounts';
import '../styles/companyLobby.css';

export function CompanyLobbyPage() {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();
    const { companyId: companyIdParam } = useParams<{ companyId: string }>();
    const companyId = useMemo(() => Number(companyIdParam), [companyIdParam]);

    const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
    const [company, setCompany] = useState<CompanyResponseDto | null>(null);

    useEffect(() => {
        if (!Number.isFinite(companyId) || companyId <= 0) return;
        void authApi.getMyCompanies().then((response) => {
            const companies = response.Data ?? response.data ?? [];
            const found = companies.find((c) => c.id === companyId);
            if (found) setCompany(found);
        });
    }, [companyId]);

    const { chats, isLoading: isChatsLoading, errorMessage: chatsErrorMessage, addChat } =
        useCompanyChats(companyId);

    const { canCreateDepartment, canCreatePosition, canCreateChat } =
        useCompanyPermissions(companyId);

    const { positions, isLoading: isPositionsLoading, errorMessage: positionsErrorMessage } =
        useUserPositions(companyId);

    const { unreadCounts, markAsRead } = useUnreadCounts(companyId);

    const { isOwnerPanelOpen, ownerPanelTab, openOwnerPanel, closeOwnerPanel, toggleOwnerPanelSection } =
        useOwnerPanel();

    const canAccessOwnerPanel = useMemo(
        () => canCreateDepartment || canCreatePosition || canCreateChat,
        [canCreateDepartment, canCreatePosition, canCreateChat]
    );

    const handleSelectChat = (chatId: string) => {
        setSelectedChatId(chatId);
        markAsRead(chatId);
    };

    const selectedChat = chats.find((chat) => chat.id === selectedChatId) ?? null;

    const handleChatCreated = (chat: CompanyChatResponseDto) => {
        addChat(chat);
        setSelectedChatId(chat.id);
        closeOwnerPanel();
    };

    const handleCompanyUpdated = (description: string, logoUrl?: string) => {
        setCompany((prev) => prev ? { ...prev, description, logoUrl: logoUrl ?? prev.logoUrl } : prev);
    };

    if (!isAuthenticated) return <Navigate to="/login" replace />;

    return (
        <main className="company-layout">

            <aside className="chat-sidebar">
                <button className="sidebar-back-btn" type="button" onClick={() => navigate('/lobby')}>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                        <path d="M9 2L4 7l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Lobby
                </button>

                <p className="sidebar-title">Chats</p>

                <CompanyChatList
                    chats={chats}
                    isLoading={isChatsLoading}
                    errorMessage={chatsErrorMessage}
                    selectedChatId={selectedChatId}
                    onSelectChat={handleSelectChat}
                    unreadCounts={unreadCounts}
                />
            </aside>

            <section className="chat-main">
                <div className="chat-topbar">
                    <h2>{selectedChat ? selectedChat.name : 'Select chat'}</h2>

                    {canAccessOwnerPanel && (
                        <button className="owner-btn" onClick={openOwnerPanel}>
                            Owner Panel
                        </button>
                    )}
                </div>

                <div className="chat-container">
                    {selectedChat ? (
                        <CompanyChat companyId={companyId} chatId={selectedChat.id} />
                    ) : (
                        <div className="chat-placeholder">
                            Select a chat to start messaging
                        </div>
                    )}
                </div>
            </section>

            {canAccessOwnerPanel && (
                <OwnerPanel
                    companyId={companyId}
                    isOpen={isOwnerPanelOpen}
                    onClose={closeOwnerPanel}
                    canCreateDepartment={canCreateDepartment}
                    canCreatePosition={canCreatePosition}
                    canCreateChat={canCreateChat}
                    ownerPanelTab={ownerPanelTab}
                    toggleOwnerPanelSection={toggleOwnerPanelSection}
                    positions={positions}
                    isPositionsLoading={isPositionsLoading}
                    positionsErrorMessage={positionsErrorMessage}
                    onChatCreated={handleChatCreated}
                    companyDescription={company?.description}
                    companyLogoUrl={company?.logoUrl}
                    onCompanyUpdated={handleCompanyUpdated}
                />
            )}
        </main>
    );
}