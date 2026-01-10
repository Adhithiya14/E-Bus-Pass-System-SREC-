import React, { useState, useEffect } from 'react';
import { X, Upload, MapPin, Bus, Clock, FileText, Camera, ChevronLeft, ChevronRight } from 'lucide-react';
import './ApplyPassModal.css';
import { safeFetch } from '../utils/api';

const ApplyPassModal = ({ isOpen, onClose, onApplySubmit, userId }) => {
    const [currentStep, setCurrentStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [routes, setRoutes] = useState([]);
    const [availableStops, setAvailableStops] = useState([]);
    const [formData, setFormData] = useState({
        boarding_point: '',
        bus_stop: '',
        route_number: '',
        duration: '1 Month',
        id_proof: null,
        photo: null
    });

    const [files, setFiles] = useState({
        idProof: null,
        photo: null
    });

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            fetchRoutes();
            setCurrentStep(1);
            setFormData({
                boarding_point: '',
                bus_stop: '',
                route_number: '',
                secondary_routes: [],
                duration: '1 Month',
                id_proof: null,
                photo: null
            });
            setFiles({
                idProof: null,
                photo: null
            });
            setError('');
        } else {
            document.body.style.overflow = 'auto';
        }
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, [isOpen]);

    const fetchRoutes = async () => {
        try {
            const data = await safeFetch('/api/routes');
            setRoutes(data);
        } catch (err) {
            console.error("Error fetching routes:", err);
        }
    };

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name === 'secondary_routes') {
            // value will be the route number to toggle
            setFormData(prev => {
                const current = prev.secondary_routes || [];
                if (current.includes(value)) {
                    return { ...prev, secondary_routes: current.filter(r => r !== value) };
                } else {
                    if (current.length >= 2) return prev; // Max 2 limit
                    return { ...prev, secondary_routes: [...current, value] };
                }
            });
            return;
        }

        setFormData(prev => ({ ...prev, [name]: value }));

        if (name === 'route_number') {
            const selectedRoute = routes.find(r => r.route_number === value);
            if (selectedRoute) {
                setAvailableStops(selectedRoute.stops.split(',').map(s => s.trim()));
                // Reset secondary routes if primary changes to one of them (optional but cleaner)
                setFormData(prev => ({
                    ...prev,
                    bus_stop: '',
                    secondary_routes: (prev.secondary_routes || []).filter(r => r !== value)
                }));
            } else {
                setAvailableStops([]);
            }
        }
    };

    const handleFileChange = (e, field) => {
        const file = e.target.files[0];
        if (file) {
            setFiles(prev => ({ ...prev, [field]: file }));
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({ ...prev, [field === 'idProof' ? 'id_proof' : 'photo']: reader.result }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (!formData.id_proof || !formData.photo) {
            setError('Please upload both ID proof and photo');
            setLoading(false);
            return;
        }

        try {
            const data = await safeFetch('/api/apply-pass', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: userId,
                    boardingPoint: formData.boarding_point,
                    busStop: formData.bus_stop,
                    route_number: formData.route_number,
                    secondaryRoutes: formData.secondary_routes || [],
                    duration: formData.duration,
                    idProof: formData.id_proof,
                    photo: formData.photo
                })
            });

            onApplySubmit(data);
            // onClose(); // Handled by onApplySubmit in parent
        } catch (err) {
            setError(err.message || 'Failed to submit application');
        } finally {
            setLoading(false);
        }
    };

    const nextStep = () => {
        if (currentStep < 2) setCurrentStep(currentStep + 1);
    };

    const prevStep = () => {
        if (currentStep > 1) setCurrentStep(currentStep - 1);
    };

    const canProceedToStep2 = () => {
        return formData.boarding_point && formData.route_number && formData.bus_stop && formData.duration;
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content apply-pass-modal">
                <button className="modal-close" onClick={onClose}><X size={24} /></button>

                <div className="modal-header">
                    <h2>Apply for Bus Pass</h2>
                    <p>Step {currentStep} of 2 - {currentStep === 1 ? 'Travel Details' : 'Document Upload'}</p>
                </div>

                {/* Step Indicator */}
                <div className="step-indicator">
                    <div className={`step ${currentStep >= 1 ? 'active' : ''}`}>
                        <div className="step-number">1</div>
                        <div className="step-label">Travel Details</div>
                    </div>
                    <div className="step-line"></div>
                    <div className={`step ${currentStep >= 2 ? 'active' : ''}`}>
                        <div className="step-number">2</div>
                        <div className="step-label">Documents</div>
                    </div>
                </div>

                {error && <div className="error-message">{error}</div>}

                <form onSubmit={handleSubmit} className="apply-form">
                    {/* Step 1: Travel Details */}
                    {currentStep === 1 && (
                        <div className="form-section">
                            <h3><MapPin size={18} /> Travel Details</h3>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Boarding Point</label>
                                    <input
                                        type="text"
                                        name="boarding_point"
                                        placeholder="e.g. City Center"
                                        value={formData.boarding_point}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Route Number</label>
                                    <select
                                        name="route_number"
                                        value={formData.route_number}
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value="">Select Route</option>
                                        {routes.map(route => (
                                            <option key={route.id} value={route.route_number}>
                                                #{route.route_number} - {route.route_name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Bus Stop</label>
                                    <select
                                        name="bus_stop"
                                        value={formData.bus_stop}
                                        onChange={handleChange}
                                        disabled={!formData.route_number}
                                        required
                                    >
                                        <option value="">Select Stop</option>
                                        {availableStops.map((stop, idx) => (
                                            <option key={idx} value={stop}>{stop}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Duration</label>
                                    <select
                                        name="duration"
                                        value={formData.duration}
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value="1 Month">1 Month</option>
                                        <option value="3 Months">3 Months</option>
                                        <option value="6 Months">6 Months</option>
                                        <option value="1 Year">1 Year</option>
                                    </select>
                                </div>
                            </div>

                            {/* Secondary Routes Selection */}
                            <div className="form-row">
                                <div className="form-group" style={{ flex: '1 1 100%' }}>
                                    <label>
                                        Additional Interchange Routes (Optional)
                                        <span style={{ fontSize: '12px', color: '#666', marginLeft: '8px', fontWeight: 'normal' }}>
                                            Max 2 • Selected: {(formData.secondary_routes || []).length}/2
                                        </span>
                                    </label>
                                    <div className="secondary-routes-container" style={{
                                        display: 'flex',
                                        gap: '10px',
                                        flexWrap: 'wrap',
                                        padding: '10px',
                                        border: '1px solid #e2e8f0',
                                        borderRadius: '12px',
                                        background: '#f8fafc'
                                    }}>
                                        {formData.route_number ? (
                                            routes
                                                .filter(r => r.route_number !== formData.route_number)
                                                .map(route => {
                                                    const isSelected = (formData.secondary_routes || []).includes(route.route_number);
                                                    const isDisabled = !isSelected && (formData.secondary_routes || []).length >= 2;

                                                    return (
                                                        <button
                                                            key={route.id}
                                                            type="button"
                                                            onClick={() => handleChange({ target: { name: 'secondary_routes', value: route.route_number } })}
                                                            disabled={isDisabled}
                                                            style={{
                                                                padding: '8px 16px',
                                                                borderRadius: '20px',
                                                                border: `1px solid ${isSelected ? '#1F7A5A' : '#cbd5e1'}`,
                                                                background: isSelected ? '#1F7A5A' : 'white',
                                                                color: isSelected ? 'white' : '#64748b',
                                                                cursor: isDisabled ? 'not-allowed' : 'pointer',
                                                                opacity: isDisabled ? 0.5 : 1,
                                                                fontSize: '13px',
                                                                fontWeight: '600',
                                                                transition: 'all 0.2s'
                                                            }}
                                                        >
                                                            #{route.route_number}
                                                        </button>
                                                    );
                                                })
                                        ) : (
                                            <div style={{ color: '#94a3b8', fontSize: '13px', fontStyle: 'italic', padding: '10px' }}>
                                                Please select a Primary Route first
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Document Upload */}
                    {currentStep === 2 && (
                        <div className="form-section">
                            <h3><Upload size={18} /> Document Upload</h3>
                            <div className="file-upload-grid">
                                <div className="file-input-group">
                                    <label>ID Proof (College ID / Aadhaar)</label>
                                    <div className={`file-drop-zone ${files.idProof ? 'has-file' : ''}`}>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => handleFileChange(e, 'idProof')}
                                            id="idProof"
                                        />
                                        <label htmlFor="idProof">
                                            <FileText size={24} />
                                            <span>{files.idProof ? files.idProof.name : 'Upload ID Proof'}</span>
                                        </label>
                                    </div>
                                </div>
                                <div className="file-input-group">
                                    <label>Passport Size Photo</label>
                                    <div className={`file-drop-zone ${files.photo ? 'has-file' : ''}`}>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => handleFileChange(e, 'photo')}
                                            id="photo"
                                        />
                                        <label htmlFor="photo">
                                            {formData.photo ? (
                                                <img src={formData.photo} alt="Preview" style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', marginBottom: '10px' }} />
                                            ) : (
                                                <Camera size={24} />
                                            )}
                                            <span>{files.photo ? 'Change Photo' : 'Upload Photo'}</span>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Navigation Buttons */}
                    <div className="form-navigation">
                        <button
                            type="button"
                            className="btn-back"
                            onClick={currentStep === 1 ? onClose : prevStep}
                        >
                            <ChevronLeft size={20} />
                            {currentStep === 1 ? 'Cancel' : 'Back'}
                        </button>

                        {currentStep < 2 ? (
                            <button
                                type="button"
                                className="btn-next"
                                onClick={nextStep}
                                disabled={!canProceedToStep2()}
                            >
                                Next
                                <ChevronRight size={20} />
                            </button>
                        ) : (
                            <button type="submit" className="btn-submit" disabled={loading}>
                                {loading ? 'Submitting...' : 'Submit Application'}
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ApplyPassModal;
