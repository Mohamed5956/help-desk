import { useEffect, useState } from 'react';
import api from '../api/client';
import Navbar from "../layouts/Navbar.jsx";

export default function Users() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchUsers();
    }, []);

    async function fetchUsers() {
        try {
            setLoading(true);
            setError('');

            const { data } = await api.get('/users');

            setUsers(data.data);
        } catch (err) {
            setError(
                err.response?.data?.message || 'Failed to load users.'
            );
        } finally {
            setLoading(false);
        }
    }

    async function handleRoleChange(id, role) {
        try {
            await api.put(`/users/${id}`, { role });

            setUsers((prev) =>
                prev.map((user) =>
                    user.id === id
                        ? { ...user, role }
                        : user
                )
            );
        } catch (err) {
            alert(
                err.response?.data?.message ||
                'Failed to update user role.'
            );
        }
    }

    async function handleDelete(id) {
        const confirmed = window.confirm(
            'Are you sure you want to delete this user?'
        );

        if (!confirmed) return;

        try {
            await api.delete(`/users/${id}`);

            setUsers((prev) =>
                prev.filter((user) => user.id !== id)
            );
        } catch (err) {
            alert(
                err.response?.data?.message ||
                'Failed to delete user.'
            );
        }
    }

    if (loading) {
        return (
            <div className="container py-5">
                <h4>Loading users...</h4>
            </div>
        );
    }

    return (
        <>
            <Navbar />
            <div className="container py-5">
                <h2 className="mb-4">Users</h2>

                {error && (
                    <div className="alert alert-danger">
                        {error}
                    </div>
                )}

                <table className="table table-bordered table-hover align-middle">
                    <thead className="table-light">
                    <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th width="180">Role</th>
                        <th width="120">Actions</th>
                    </tr>
                    </thead>

                    <tbody>
                    {users.length === 0 ? (
                        <tr>
                            <td
                                colSpan="5"
                                className="text-center"
                            >
                                No users found.
                            </td>
                        </tr>
                    ) : (
                        users.map((user) => (
                            <tr key={user.id}>
                                <td>{user.id}</td>

                                <td>{user.name}</td>

                                <td>{user.email}</td>

                                <td>
                                    <select
                                        className="form-select"
                                        value={user.role}
                                        onChange={(e) =>
                                            handleRoleChange(
                                                user.id,
                                                e.target.value
                                            )
                                        }
                                    >
                                        <option value="user">
                                            User
                                        </option>

                                        <option value="admin">
                                            Admin
                                        </option>
                                    </select>
                                </td>

                                <td>
                                    <button
                                        className="btn btn-danger btn-sm"
                                        onClick={() =>
                                            handleDelete(user.id)
                                        }
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))
                    )}
                    </tbody>
                </table>
            </div>
        </>
    );
}