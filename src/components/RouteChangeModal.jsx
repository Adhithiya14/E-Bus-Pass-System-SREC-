import React, { useState, useEffect } from 'react';
import { X, MapPin, Calendar, FileText } from 'lucide-react';
import './ApplyPassModal.css'; // Reuse existing modal styles

const RouteChangeModal = ({ isOpen, onClose, userId, currentRoute, routes, onSubmit }) => {
    const [formData, setFormData] = useState({
        newRoute: '',
        travelDate: '',
        reason: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (!formData.newRoute || !formData.travelDate || !formData.reason) {
            setError('All fields are required');
            setLoading(false);
            return;
        }

        const today = new Date().toISOString().split('T')[0];
        if (formData.travelDate < today) {
            setError('Travel date cannot be in the past');
            setLoading(false);
            return;
        }

        try {
            await onSubmit({
                userId,
                originalRoute: currentRoute,
                newRoute: formData.newRoute,
                travelDate: formData.travelDate,
                reason: formData.reason
            });
            onClose();
        } catch (err) {
            setError(err.message || 'Failed to submit request');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content apply-pass-modal">
                <button className="modal-close" onClick={onClose}><X size={24} /></button>

                <div className="modal-header">
                    <h2>Request Route Change</h2>
                    <p>Request a temporary one-day route override.</p>
                </div>

                {error && <div className="error-message"><X size={16} /> {error}</div>}

                <form onSubmit={handleSubmit} className="apply-form">
                    <div className="form-section">
                        <h4>Trip Details</h4>

                        <div className="form-group">
                            <label><MapPin size={16} /> New Route</label>
                            <select
                                value={formData.newRoute}
                                onChange={(e) => setFormData({ ...formData, newRoute: e.target.value })}
                                required
                            >
                                <option value="">Select Route</option>
                                {routes
                                    .filter(r => r.route_number !== currentRoute)
                                    .map(r => (
                                        <option key={r.id} value={r.route_number}>
                                            Route #{r.route_number} - {r.route_name}
                                        </option>
                                    ))
                                }
                            </select>
                        </div>

                        <div className="form-group">
                            <label><Calendar size={16} /> Travel Date</label>
                            <input
                                type="date"
                                value={formData.travelDate}
                                onChange={(e) => setFormData({ ...formData, travelDate: e.target.value })}
                                min={new Date().toISOString().split('T')[0]}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label><FileText size={16} /> Reason</label>
                            <textarea
                                value={formData.reason}
                                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                                placeholder="Why do you need this change?"
                                rows="3"
                                required
                            />
                        </div>
                    </div>

                    <div className="form-actions">
                        <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn-primary" disabled={loading}>
                            {loading ? 'Submitting...' : 'Submit Request'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RouteChangeModal;
