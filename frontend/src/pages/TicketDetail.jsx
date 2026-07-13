import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';

const STATUS_BADGE_CLASS = {
    open: 'bg-success',
    pending: 'bg-warning text-dark',
    closed: 'bg-secondary',
};

export default function TicketDetail() {
    const { id } = useParams();
    const { user, isAdmin } = useAuth();

    const [ticket, setTicket] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [replyBody, setReplyBody] = useState('');
    const [replyError, setReplyError] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    const [statusUpdating, setStatusUpdating] = useState(false);
    const [statusError, setStatusError] = useState(null);

    const fetchTicket = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const { data } = await api.get(`/tickets/${id}`);
            setTicket(data.data);
        } catch (err) {
            if (err.response?.status === 403) {
                setError("You don't have access to this ticket.");
            } else if (err.response?.status === 404) {
                setError('Ticket not found.');
            } else {
                setError('Could not load this ticket. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchTicket();
    }, [fetchTicket]);

    async function handleReplySubmit(e) {
        e.preventDefault();
        setReplyError(null);
        setSubmitting(true);
        try {
            await api.post(`/tickets/${id}/replies`, { body: replyBody });
            setReplyBody('');
            await fetchTicket();
        } catch (err) {
            setReplyError(
                err.response?.data?.errors?.body?.[0] || 'Could not post your reply. Please try again.'
            );
        } finally {
            setSubmitting(false);
        }
    }

    async function handleStatusChange(newStatus) {
        setStatusError(null);
        setStatusUpdating(true);
        try {
            const { data } = await api.patch(`/tickets/${id}`, { status: newStatus });
            setTicket(data.data);
        } catch (err) {
            setStatusError(err.response?.data?.errors?.status?.[0] || 'Could not update status.');
        } finally {
            setStatusUpdating(false);
        }
    }

    if (loading) {
        return (
            <div className="container py-5 d-flex justify-content-center">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading…</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container py-4">
                <div className="alert alert-danger" role="alert">
                    {error}
                </div>
                <Link to="/" className="btn btn-outline-secondary btn-sm">
                    ← Back to dashboard
                </Link>
            </div>
        );
    }

    return (
        <div className="container py-4" style={{ maxWidth: '720px' }}>
            <Link to="/" className="d-inline-block mb-3 text-decoration-none">
                ← Back to dashboard
            </Link>

            <div className="card shadow-sm mb-4">
                <div className="card-body">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                        <h1 className="h4 mb-0">{ticket.title}</h1>

                        {isAdmin ? (
                            <div className="d-flex align-items-center gap-2">
                                {statusUpdating && (
                                    <span className="spinner-border spinner-border-sm" role="status" />
                                )}
                                <select
                                    className="form-select form-select-sm"
                                    style={{ width: 'auto' }}
                                    value={ticket.status}
                                    disabled={statusUpdating}
                                    onChange={(e) => handleStatusChange(e.target.value)}
                                >
                                    <option value="open">Open</option>
                                    <option value="pending">Pending</option>
                                    <option value="closed">Closed</option>
                                </select>
                            </div>
                        ) : (
                            <span className={`badge ${STATUS_BADGE_CLASS[ticket.status]}`}>
                {ticket.status}
              </span>
                        )}
                    </div>

                    {statusError && (
                        <div className="alert alert-danger py-2 mb-3" role="alert">
                            {statusError}
                        </div>
                    )}

                    <p className="text-muted small mb-3">Opened by {ticket.user.name}</p>
                    <p className="mb-0">{ticket.description}</p>
                </div>
            </div>

            <h2 className="h5 mb-3">Replies</h2>

            {ticket.replies.length === 0 ? (
                <p className="text-muted">No replies yet.</p>
            ) : (
                <ul className="list-unstyled d-flex flex-column gap-3 mb-4">
                    {ticket.replies.map((reply) => {
                        const isMine = reply.user.id === user.id;
                        return (
                            <li key={reply.id} className={`d-flex ${isMine ? 'justify-content-end' : ''}`}>
                                <div
                                    className={`card ${isMine ? 'bg-primary text-white' : 'bg-light'}`}
                                    style={{ maxWidth: '80%' }}
                                >
                                    <div className="card-body py-2 px-3">
                                        <div className="d-flex justify-content-between align-items-center mb-1 gap-3">
                                            <strong className="small">
                                                {reply.user.name}
                                                {reply.user.role === 'admin' && (
                                                    <span
                                                        className={`badge ms-1 ${isMine ? 'bg-light text-dark' : 'bg-dark'}`}
                                                    >
                            Admin
                          </span>
                                                )}
                                            </strong>
                                            <time className={`small ${isMine ? 'text-white-50' : 'text-muted'}`}>
                                                {new Date(reply.created_at).toLocaleString()}
                                            </time>
                                        </div>
                                        <p className="mb-0">{reply.body}</p>
                                    </div>
                                </div>
                            </li>
                        );
                    })}
                </ul>
            )}

            <div className="card shadow-sm">
                <div className="card-body">
                    <form onSubmit={handleReplySubmit}>
                        {replyError && (
                            <div className="alert alert-danger py-2" role="alert">
                                {replyError}
                            </div>
                        )}
                        <div className="mb-3">
                            <label htmlFor="reply" className="form-label">Add a reply</label>
                            <textarea
                                id="reply"
                                className="form-control"
                                rows={3}
                                value={replyBody}
                                onChange={(e) => setReplyBody(e.target.value)}
                                required
                                placeholder="Write a reply…"
                            />
                        </div>
                        <button type="submit" className="btn btn-primary" disabled={submitting}>
                            {submitting ? (
                                <>
                                    <span className="spinner-border spinner-border-sm me-2" role="status" />
                                    Posting…
                                </>
                            ) : (
                                'Post Reply'
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}