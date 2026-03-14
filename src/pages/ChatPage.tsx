import {Navigate, useSearchParams} from 'react-router-dom';
import {useAuth} from '../store/auth';
import {ChatPage as FeatureChatPage} from '../features/chat/pages/ChatPage';

export function ChatPage() {
    const {isAuthenticated} = useAuth();
    const [searchParams] = useSearchParams();
    const chatId = (searchParams.get('chatId') ?? '').trim();

    if (!isAuthenticated) {
        return <Navigate to="/login" replace/>;
    }

    if (!chatId) {
        return (
            <main className="page">
                <h1>Chat</h1>
                <p>Open a chat by providing <code>?chatId=&lt;guid&gt;</code> in the URL.</p>
            </main>
        );
    }

    return <FeatureChatPage chatId={chatId}/>;
}