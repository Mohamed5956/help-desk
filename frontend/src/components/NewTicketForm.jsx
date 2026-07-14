import { useState } from 'react';
import api from '../api/client';

export default function NewTicketForm({ onCreated, onCancel }) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);

    async function handleSubmit(e) {
        e.preventDefault();
        setErrors({});
        setSubmitting(true);
        try {
            await api.post('/tickets', { title, description });
            setTitle('');
            setDescription('');
            onCreated();
        } catch (err) {
            if (err.response?.status === 422) {
                setErrors(err.response.data.errors || {});
            } else {
                setErrors({ general: ['Something went wrong. Please try again.'] });
            }
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div className="card shadow-sm mb-4">
            <div className="card-body">
                <form onSubmit={handleSubmit}>
                    {errors.general && <div className="alert alert-danger py-2">{errors.general[0]}</div>}

                    <div className="mb-3">
                        <label className="form-label">Title</label>
                        <input
                            className="form-control"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                        />
                        {errors.title && <div className="text-danger small">{errors.title[0]}</div>}
                    </div>

                    <div className="mb-3">
                        <label className="form-label">Description</label>
                        <textarea
                            className="form-control"
                            rows={4}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            required
                        />
                        {errors.description && (
                            <div className="text-danger small">{errors.description[0]}</div>
                        )}
                    </div>

                    <div className="d-flex gap-2">
                        <button type="submit" className="btn btn-primary" disabled={submitting}>
                            {submitting ? (
                                <>
                                    <span className="spinner-border spinner-border-sm me-2" role="status" />
                                    Creating…
                                </>
                            ) : (
                                'Create Ticket'
                            )}
                        </button>
                        <button type="button" className="btn btn-outline-secondary" onClick={onCancel}>
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}