import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
    const { user, isAdmin, logout } = useAuth();

    return (
        <nav className="navbar navbar-expand-lg navbar-dark bg-dark shadow-sm mb-4">
            <div className="container">
                <Link className="navbar-brand fw-bold" to="/">
                    🎫 Helpdesk
                </Link>

                <button
                    className="navbar-toggler"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#navbar"
                >
                    <span className="navbar-toggler-icon"></span>
                </button>

                <div className="collapse navbar-collapse" id="navbar">
                    <ul className="navbar-nav me-auto">

                        <li className="nav-item">
                            <NavLink
                                to="/"
                                end
                                className={({ isActive }) =>
                                    `nav-link ${isActive ? 'active fw-semibold' : ''}`
                                }
                            >
                                Tickets
                            </NavLink>
                        </li>

                        {isAdmin && (
                            <li className="nav-item">
                                <NavLink
                                    to="/users"
                                    className={({ isActive }) =>
                                        `nav-link ${isActive ? 'active fw-semibold' : ''}`
                                    }
                                >
                                    Users
                                </NavLink>
                            </li>
                        )}

                    </ul>

                    <div className="d-flex align-items-center gap-3">

                        <div className="text-end">
                            <div className="fw-semibold text-white">
                                {user?.name}
                            </div>

                            <small className="text-light opacity-75">
                                {isAdmin ? 'Administrator' : 'User'}
                            </small>
                        </div>

                        <button
                            className="btn btn-outline-light btn-sm"
                            onClick={logout}
                        >
                            Logout
                        </button>

                    </div>
                </div>
            </div>
        </nav>
    );
}