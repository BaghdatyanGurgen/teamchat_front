import {Navigate, Outlet, useLocation} from 'react-router-dom';

import {useAuth} from '../../store/auth';

export function ProtectedRoute() {
    const location = useLocation();
    const {isAuthenticated} = useAuth();

    if (!isAuthenticated) {
        return <Navigate to="/login" replace state={{from: location}}/>;
    }

    return <Outlet/>;
}