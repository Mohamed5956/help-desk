import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import Navbar from "../layouts/Navbar.jsx";

export default function AdminUsers() {
    const { user: currentUser } = useAuth();

    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ name: '', email: '', password: '', role: 'user' });
    const [formErrors, setFormErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);

    // Per-row state, keyed by user id, so one row updating/erroring
    // doesn't affect the rest of the table.
    const [rowBusy, setRowBusy] = useState({});
    const [rowError, setRowError] = useState({});

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const { data } = await api.get('/users');
            setUsers(data.data);
        } catch (err) {
            setError('Could not load users. Please try again.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    function updateField(field, value) {
        setForm((prev) => ({ ...prev, [field]: value }));
    }

    async function handleCreate(e) {
        e.preventDefault();
        setFormErrors({});
        setSubmitting(true);
        try {
            await api.post('/users', form);
            setForm({ name: '', email: '', password: '', role: 'user' });
            setShowForm(false);
            await fetchUsers();
        } catch (err) {
            if (err.response?.status === 422) {
                setFormErrors(err.response.data.errors || {});
            } else {
                setFormErrors({ general: ['Something went wrong. Please try again.'] });
            }
        } finally {
            setSubmitting(false);
        }
    }

    async function handleRoleChange(userId, newRole) {
        setRowError((prev) => ({ ...prev, [userId]: null }));
        setRowBusy((prev) => ({ ...prev, [userId]: true }));
        try {
            const { data } = await api.patch(`/users/${userId}`, { role: newRole });
            setUsers((prev) => prev.map((u) => (u.id === userId ? data.data : u)));
        } catch (err) {
            // Backend's UpdateUserAction throws a ValidationException for the
            // "last admin" guard — surfaced as errors.role, same shape as any
            // other 422 in this app.
            const message = err.response?.data?.errors?.role?.[0] || 'Could not update role.';
            setRowError((prev) => ({ ...prev, [userId]: message }));
        } finally {
            setRowBusy((prev) => ({ ...prev, [userId]: false }));
        }
    }

    async function handleDelete(userId, userName) {
        if (!window.confirm(`Delete ${userName}? This also deletes all of their tickets and replies. This cannot be undone.`)) {
            return;
        }
        setRowError((prev) => ({ ...prev, [userId]: null }));
        setRowBusy((prev) => ({ ...prev, [userId]: true }));
        try {
            await api.delete(`/users/${userId}`);
            setUsers((prev) => prev.filter((u) => u.id !== userId));
        } catch (err) {
            const message = err.response?.data?.errors?.user?.[0] || 'Could not delete user.';
            setRowError((prev) => ({ ...prev, [userId]: message }));
            setRowBusy((prev) => ({ ...prev, [userId]: false }));
        }
    }

    return (
        <>
            <Navbar />
            <div className="container py-4">
                <div className="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom">
                    <div>
                        <Link to="/" className="d-inline-block mb-2 text-decoration-none small">
                            ← Back to dashboard
                        </Link>
                        <h1 className="h3 mb-0">Users</h1>
                    </div>
                    <button className="btn btn-primary" onClick={() => setShowForm((v) => !v)}>
                        {showForm ? 'Cancel' : '+ New User'}
                    </button>
                </div>

                {showForm && (
                    <div className="card shadow-sm mb-4">
                        <div className="card-body">
                            <form onSubmit={handleCreate}>
                                {formErrors.general && (
                                    <div className="alert alert-danger py-2">{formErrors.general[0]}</div>
                                )}
                                <div className="row g-3">
                                    <div className="col-md-6">
                                        <label className="form-label">Name</label>
                                        <input
                                            className="form-control"
                                            value={form.name}
                                            onChange={(e) => updateField('name', e.target.value)}
                                            required
                                        />
                                        {formErrors.name && <div className="text-danger small">{formErrors.name[0]}</div>}
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label">Email</label>
                                        <input
                                            type="email"
                                            className="form-control"
                                            value={form.email}
                                            onChange={(e) => updateField('email', e.target.value)}
                                            required
                                        />
                                        {formErrors.email && <div className="text-danger small">{formErrors.email[0]}</div>}
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label">Password</label>
                                        <input
                                            type="password"
                                            className="form-control"
                                            value={form.password}
                                            onChange={(e) => updateField('password', e.target.value)}
                                            required
                                            minLength={8}
                                        />
                                        {formErrors.password && <div className="text-danger small">{formErrors.password[0]}</div>}
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label">Role</label>
                                        <select
                                            className="form-select"
                                            value={form.role}
                                            onChange={(e) => updateField('role', e.target.value)}
                                        >
                                            <option value="user">User</option>
                                            <option value="admin">Admin</option>
                                        </select>
                                    </div>
                                </div>
                                <button type="submit" className="btn btn-primary mt-3" disabled={submitting}>
                                    {submitting ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2" role="status" />
                                            Creating…
                                        </>
                                    ) : (
                                        'Create User'
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>
                )}

                {error && <div className="alert alert-danger">{error}</div>}

                {loading ? (
                    <div className="d-flex justify-content-center py-5">
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Loading…</span>
                        </div>
                    </div>
                ) : (
                    <div className="table-responsive">
                        <table className="table table-hover align-middle">
                            <thead>
                            <tr>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Role</th>
                                <th>Joined</th>
                                <th></th>
                            </tr>
                            </thead>
                            <tbody>
                            {users.map((u) => {
                                const isSelf = u.id === currentUser.id;
                                const busy = Boolean(rowBusy[u.id]);
                                return (
                                    <tr key={u.id}>
                                        <td>{u.name}</td>
                                        <td>{u.email}</td>
                                        <td style={{ minWidth: '160px' }}>
                                            <select
                                                className="form-select form-select-sm"
                                                value={u.role}
                                                disabled={busy || isSelf}
                                                onChange={(e) => handleRoleChange(u.id, e.target.value)}
                                            >
                                                <option value="user">User</option>
                                                <option value="admin">Admin</option>
                                            </select>
                                            {rowError[u.id] && (
                                                <div className="text-danger small mt-1">{rowError[u.id]}</div>
                                            )}
                                        </td>
                                        <td className="text-muted">{new Date(u.created_at).toLocaleDateString()}</td>
                                        <td>
                                            <button
                                                className="btn btn-outline-danger btn-sm"
                                                disabled={busy || isSelf}
                                                onClick={() => handleDelete(u.id, u.name)}
                                                title={isSelf ? "You can't delete your own account" : undefined}
                                            >
                                                {busy ? '…' : 'Delete'}
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </>
    );
}