import {useMemo, useState, useEffect} from 'react';
import {Navigate, useNavigate, useParams} from 'react-router-dom';
import {CompanyChatList} from '../components/CompanyChatList';
import {CompanyChat} from '../components/CompanyChat';
import {OwnerPanel} from '../components/OwnerPanel';
import {useAuth} from '../store/auth';
import {useCompanyChats} from '../hooks/useCompanyChats';
import {useCompanyPermissions} from '../hooks/useCompanyPermissions';
import {useOwnerPanel} from '../hooks/useOwnerPanel';
import {useUserPositions} from '../hooks/useUserPositions';
import {authApi} from '../api';
import type {CompanyChatResponseDto, CompanyResponseDto} from '../types/api';
import {useUnreadCounts} from '../hooks/useUnreadCounts';
import { useTheme } from '../hooks/useTheme';
import '../styles/companyLobby.css';
import {useCompanyDepartments} from "../hooks/useCompanyDepartment";

export function CompanyLobbyPage() {
    const navigate = useNavigate();
    const { theme, toggleTheme } = useTheme();
    const {isAuthenticated} = useAuth();
    const {companyId: companyIdParam} = useParams<{ companyId: string }>();
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

    const {chats, isLoading: isChatsLoading, errorMessage: chatsErrorMessage, addChat} =
        useCompanyChats(companyId);

    const {canCreateDepartment, canCreatePosition, canCreateChat} =
        useCompanyPermissions(companyId);

    const { departments, isLoading: isDepartmentsLoading, addDepartment } = useCompanyDepartments(companyId);

    const {positions, isLoading: isPositionsLoading, errorMessage: positionsErrorMessage, addPosition} =
        useUserPositions(companyId);

    const {unreadCounts, markAsRead} = useUnreadCounts(companyId);

    const {isOwnerPanelOpen, ownerPanelTab, openOwnerPanel, closeOwnerPanel, toggleOwnerPanelSection} =
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
        setCompany((prev) => prev ? {...prev, description, logoUrl: logoUrl ?? prev.logoUrl} : prev);
    };

    if (!isAuthenticated) return <Navigate to="/login" replace/>;

    return (
        <main className="company-layout">

            <aside className="chat-sidebar">
                <button className="sidebar-back-btn" type="button" onClick={() => navigate('/lobby')}>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                        <path d="M9 2L4 7l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"
                              strokeLinejoin="round"/>
                    </svg>
                    Lobby
                </button>

                <button className="sidebar-theme-btn" type="button" onClick={toggleTheme} title={theme === 'dark' ? 'Light mode' : 'Dark mode'}>
                    {theme === 'dark' ? (
                        <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                            <circle cx="8" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.4"/>
                            <path d="M8 1v1.5M8 13.5V15M1 8h1.5M13.5 8H15M3.05 3.05l1.06 1.06M11.89 11.89l1.06 1.06M3.05 12.95l1.06-1.06M11.89 4.11l1.06-1.06" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                        </svg>
                    ) : (
                        <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                            <path d="M13.5 10A5.5 5.5 0 016 2.5a5.5 5.5 0 100 11 5.5 5.5 0 007.5-3.5z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    )}
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
                        <CompanyChat companyId={companyId} chatId={selectedChat.id}/>
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
                    onPositionCreated={addPosition}
                    onDepartmentCreated={addDepartment}
                    departments={departments}
                    isDepartmentsLoading={isDepartmentsLoading}
                    companyDescription={company?.description}
                    companyLogoUrl={company?.logoUrl}
                    onCompanyUpdated={handleCompanyUpdated}
                />
            )}
        </main>
    );
}