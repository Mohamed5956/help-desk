import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import Navbar from '../layouts/Navbar';
import NewTicketForm from '../components/NewTicketForm';

const STATUS_OPTIONS = ['all', 'open', 'pending', 'closed'];

const STATUS_BADGE_CLASS = {
    open: 'bg-success',
    pending: 'bg-warning text-dark',
    closed: 'bg-secondary',
};

export default function Dashboard() {
    const { user, isAdmin } = useAuth();

    const [tickets, setTickets] = useState([]);
    const [meta, setMeta] = useState(null);
    const [status, setStatus] = useState('all');
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [showNewTicket, setShowNewTicket] = useState(false);

    // Per-row delete state, keyed by ticket id, so deleting one row
    // doesn't disable/spin every other row in the table.
    const [deletingId, setDeletingId] = useState(null);
    const [deleteError, setDeleteError] = useState(null);

    const fetchTickets = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const params = { page };

            if (status !== 'all') {
                params.status = status;
            }

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

    function handleTicketCreated() {
        setShowNewTicket(false);
        // Reset to an unfiltered first page so the newly created ticket
        // (status "open") is guaranteed to be visible regardless of
        // whatever filter/page the user was previously on.
        setStatus('all');
        setPage(1);
        fetchTickets();
    }

    async function handleDelete(ticketId, ticketTitle) {
        if (
            !window.confirm(
                `Delete "${ticketTitle}"? This also deletes all its replies. This cannot be undone.`
            )
        ) {
            return;
        }

        setDeleteError(null);
        setDeletingId(ticketId);

        try {
            await api.delete(`/tickets/${ticketId}`);
            // Remove locally rather than refetching — we already know
            // the delete succeeded, so this saves a round trip. Meta
            // (total/last_page) goes slightly stale until the next
            // filter/page change triggers a real refetch, which is an
            // acceptable tradeoff at this scale.
            setTickets((prev) => prev.filter((t) => t.id !== ticketId));
        } catch (err) {
            setDeleteError('Could not delete this ticket. Please try again.');
        } finally {
            setDeletingId(null);
        }
    }

    const stats = {
        total: tickets.length,
        open: tickets.filter((t) => t.status === 'open').length,
        pending: tickets.filter((t) => t.status === 'pending').length,
        closed: tickets.filter((t) => t.status === 'closed').length,
    };

    return (
        <>
            <Navbar />

            <div className="container py-4">

                <div className="text-center mb-4">
                    <h2 className="fw-bold mb-1">Dashboard</h2>

                    <p className="text-muted mb-0">
                        Welcome back,{' '}
                        <span className="fw-semibold">
                            {user?.name}
                        </span>
                    </p>
                </div>

                <div className="row g-3 mb-4">

                    <div className="col-md-3">
                        <div className="card border-0 shadow-sm h-100">
                            <div className="card-body">
                                <small className="text-muted">
                                    Total Tickets
                                </small>

                                <h2 className="fw-bold mb-0">
                                    {stats.total}
                                </h2>
                            </div>
                        </div>
                    </div>

                    <div className="col-md-3">
                        <div className="card border-0 shadow-sm h-100">
                            <div className="card-body">
                                <small className="text-muted">
                                    Open
                                </small>

                                <h2 className="fw-bold text-success mb-0">
                                    {stats.open}
                                </h2>
                            </div>
                        </div>
                    </div>

                    <div className="col-md-3">
                        <div className="card border-0 shadow-sm h-100">
                            <div className="card-body">
                                <small className="text-muted">
                                    Pending
                                </small>

                                <h2 className="fw-bold text-warning mb-0">
                                    {stats.pending}
                                </h2>
                            </div>
                        </div>
                    </div>

                    <div className="col-md-3">
                        <div className="card border-0 shadow-sm h-100">
                            <div className="card-body">
                                <small className="text-muted">
                                    Closed
                                </small>

                                <h2 className="fw-bold text-secondary mb-0">
                                    {stats.closed}
                                </h2>
                            </div>
                        </div>
                    </div>

                </div>

                <div className="card border-0 shadow-sm mb-4">
                    <div className="card-body d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">

                        <div>
                            <h5 className="mb-1 fw-bold">
                                Ticket List
                            </h5>

                            <small className="text-muted">
                                Browse and manage support tickets.
                            </small>
                        </div>

                        <div className="d-flex flex-column flex-md-row align-items-md-center gap-3">

                            <div className="btn-group">

                                {STATUS_OPTIONS.map((s) => (
                                    <button
                                        key={s}
                                        type="button"
                                        className={`btn ${
                                            status === s
                                                ? 'btn-primary'
                                                : 'btn-outline-primary'
                                        }`}
                                        onClick={() => handleStatusChange(s)}
                                    >
                                        {s.charAt(0).toUpperCase() + s.slice(1)}
                                    </button>
                                ))}

                            </div>

                            {/* Tickets are created by standard users only, per the
                                brief — admins manage/resolve, they don't file them. */}
                            {!isAdmin && (
                                <button
                                    type="button"
                                    className="btn btn-success"
                                    onClick={() => setShowNewTicket((v) => !v)}
                                >
                                    {showNewTicket ? 'Cancel' : '+ New Ticket'}
                                </button>
                            )}

                        </div>

                    </div>
                </div>

                {showNewTicket && (
                    <NewTicketForm
                        onCreated={handleTicketCreated}
                        onCancel={() => setShowNewTicket(false)}
                    />
                )}

                {error && (
                    <div
                        className="alert alert-danger shadow-sm"
                        role="alert"
                    >
                        {error}
                    </div>
                )}

                {deleteError && (
                    <div className="alert alert-danger shadow-sm" role="alert">
                        {deleteError}
                    </div>
                )}

                {loading ? (
                    <div className="card border-0 shadow-sm">
                        <div className="card-body py-5 text-center">

                            <div
                                className="spinner-border text-primary mb-3"
                                role="status"
                            >
                                <span className="visually-hidden">
                                    Loading...
                                </span>
                            </div>

                            <p className="text-muted mb-0">
                                Loading tickets...
                            </p>

                        </div>
                    </div>
                ) : tickets.length === 0 ? (
                    <div className="card border-0 shadow-sm">
                        <div className="card-body text-center py-5">

                            <h5>No tickets found</h5>

                            <p className="text-muted mb-0">
                                There are no tickets matching this filter.
                            </p>

                        </div>
                    </div>
                ) : (
                    <div className="card border-0 shadow-sm">

                        <div className="card-header bg-white py-3">
                            <h5 className="mb-0 fw-bold">
                                Support Tickets
                            </h5>
                        </div>

                        <div className="table-responsive">

                            <table className="table table-hover align-middle mb-0">

                                <thead className="table-light">
                                <tr>
                                    <th>Status</th>
                                    <th>Title</th>

                                    {isAdmin && (
                                        <th>Owner</th>
                                    )}

                                    <th className="text-center">
                                        Replies
                                    </th>

                                    {isAdmin && <th></th>}
                                </tr>
                                </thead>

                                <tbody>

                                {tickets.map((ticket) => (
                                    <tr key={ticket.id}>

                                        <td>
                                                <span
                                                    className={`badge px-3 py-2 ${STATUS_BADGE_CLASS[ticket.status]}`}
                                                >
                                                    {ticket.status}
                                                </span>
                                        </td>

                                        <td>
                                            <Link
                                                to={`/tickets/${ticket.id}`}
                                                className="fw-semibold text-decoration-none text-dark"
                                            >
                                                {ticket.title}
                                            </Link>
                                        </td>

                                        {isAdmin && (
                                            <td className="text-muted">
                                                {ticket.user.name}
                                            </td>
                                        )}

                                        <td className="text-center">
                                                <span className="badge bg-light text-dark border px-3 py-2">
                                                    {ticket.replies_count} Replies
                                                </span>
                                        </td>

                                        {isAdmin && (
                                            <td className="text-end">
                                                <button
                                                    type="button"
                                                    className="btn btn-outline-danger btn-sm"
                                                    disabled={deletingId === ticket.id}
                                                    onClick={() => handleDelete(ticket.id, ticket.title)}
                                                >
                                                    {deletingId === ticket.id ? '…' : 'Delete'}
                                                </button>
                                            </td>
                                        )}

                                    </tr>
                                ))}

                                </tbody>

                            </table>

                        </div>

                    </div>
                )}

                {meta && meta.last_page > 1 && (
                    <div className="d-flex justify-content-center mt-4">

                        <nav>

                            <ul className="pagination shadow-sm">

                                <li
                                    className={`page-item ${
                                        page <= 1
                                            ? 'disabled'
                                            : ''
                                    }`}
                                >
                                    <button
                                        className="page-link"
                                        onClick={() =>
                                            setPage((p) => p - 1)
                                        }
                                    >
                                        Previous
                                    </button>
                                </li>

                                <li className="page-item disabled">
                                    <span className="page-link">
                                        Page {meta.current_page} of{' '}
                                        {meta.last_page}
                                    </span>
                                </li>

                                <li
                                    className={`page-item ${
                                        page >= meta.last_page
                                            ? 'disabled'
                                            : ''
                                    }`}
                                >
                                    <button
                                        className="page-link"
                                        onClick={() =>
                                            setPage((p) => p + 1)
                                        }
                                    >
                                        Next
                                    </button>
                                </li>

                            </ul>

                        </nav>

                    </div>
                )}

            </div>
        </>
    );
}