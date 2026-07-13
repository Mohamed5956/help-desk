import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';

const STATUS_OPTIONS = ['all', 'open', 'pending', 'closed'];

const STATUS_BADGE_CLASS = {
    open: 'bg-success',
    pending: 'bg-warning text-dark',
    closed: 'bg-secondary',
};

export default function Dashboard() {
    const { user, isAdmin, logout } = useAuth();

    const [tickets, setTickets] = useState([]);
    const [meta, setMeta] = useState(null);
    const [status, setStatus] = useState('all');
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchTickets = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const params = { page };
            if (status !== 'all') params.status = status;

            const { data } = await api.get('/tickets', { params });
            setTickets(data.data);
            setMeta(data.meta);
        } catch (err) {
            setError('Could not load tickets. Please try again.');
        } finally {
            setLoading(false);
        }
    }, [status, page]);

    useEffect(() => {
        fetchTickets();
    }, [fetchTickets]);

    function handleStatusChange(newStatus) {
        setStatus(newStatus);
        setPage(1);
    }

    return (
        <div className="container py-4">
            <header className="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom">
                <h1 className="h3 mb-0">Helpdesk</h1>
                <div className="d-flex align-items-center gap-3">
          <span>
            {user?.name}{' '}
              {isAdmin && <span className="badge bg-dark ms-1">Admin</span>}
          </span>
                    <button onClick={logout} className="btn btn-outline-secondary btn-sm">
                        Log out
                    </button>
                </div>
            </header>

            <div className="btn-group mb-4" role="group" aria-label="Status filter">
                {STATUS_OPTIONS.map((s) => (
                    <button
                        key={s}
                        type="button"
                        className={`btn btn-sm ${status === s ? 'btn-primary' : 'btn-outline-primary'}`}
                        onClick={() => handleStatusChange(s)}
                        disabled={status === s}
                    >
                        {s.charAt(0).toUpperCase() + s.slice(1)}
                    </button>
                ))}
            </div>

            {error && (
                <div className="alert alert-danger" role="alert">
                    {error}
                </div>
            )}

            {loading ? (
                <div className="d-flex justify-content-center py-5">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading…</span>
                    </div>
                </div>
            ) : tickets.length === 0 ? (
                <div className="text-center text-muted py-5">No tickets found.</div>
            ) : (
                <div className="table-responsive">
                    <table className="table table-hover align-middle">
                        <thead>
                        <tr>
                            <th>Status</th>
                            <th>Title</th>
                            {isAdmin && <th>Owner</th>}
                            <th>Replies</th>
                        </tr>
                        </thead>
                        <tbody>
                        {tickets.map((ticket) => (
                            <tr key={ticket.id}>
                                <td>
                    <span className={`badge ${STATUS_BADGE_CLASS[ticket.status]}`}>
                      {ticket.status}
                    </span>
                                </td>
                                <td>
                                    <Link to={`/tickets/${ticket.id}`} className="text-decoration-none">
                                        {ticket.title}
                                    </Link>
                                </td>
                                {isAdmin && <td className="text-muted">{ticket.user.name}</td>}
                                <td className="text-muted">{ticket.replies_count}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            )}

            {meta && meta.last_page > 1 && (
                <nav aria-label="Ticket pagination" className="d-flex justify-content-center mt-4">
                    <ul className="pagination">
                        <li className={`page-item ${page <= 1 ? 'disabled' : ''}`}>
                            <button className="page-link" onClick={() => setPage((p) => p - 1)}>
                                Previous
                            </button>
                        </li>
                        <li className="page-item disabled">
              <span className="page-link">
                Page {meta.current_page} of {meta.last_page}
              </span>
                        </li>
                        <li className={`page-item ${page >= meta.last_page ? 'disabled' : ''}`}>
                            <button className="page-link" onClick={() => setPage((p) => p + 1)}>
                                Next
                            </button>
                        </li>
                    </ul>
                </nav>
            )}
        </div>
    );
}