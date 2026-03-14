import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import {BrowserRouter} from 'react-router-dom';

import {App} from './app/App';
import {useAuthStore} from './store/auth';
import './styles/global.css';
import './styles.css';

useAuthStore.getState().hydrate();

createRoot(document.getElementById('root') as HTMLElement).render(
    <StrictMode>
        <BrowserRouter>
            <App/>
        </BrowserRouter>
    </StrictMode>,
);