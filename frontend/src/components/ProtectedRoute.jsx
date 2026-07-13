import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Wraps protected routes. Using <Outlet /> (rather than accepting
 * `children` and wrapping each route individually in App.jsx) lets us
 * nest multiple protected routes under one guard declaration, instead
 * of repeating <ProtectedRoute> around every single <Route>.
 */
export default function ProtectedRoute() {
    const { isAuthenticated } = useAuth();

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
}