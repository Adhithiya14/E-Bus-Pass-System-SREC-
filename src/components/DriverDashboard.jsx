import React, { useState, useEffect } from 'react';
import {
    Bus, Users, MapPin, Clock, Bell, LogOut,
    Play, Square, ChevronRight, AlertTriangle,
    Info, CheckCircle, Settings, Save, RefreshCw,
    Map as MapIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { safeFetch } from '../utils/api';
import './DriverDashboard.css';
import BusRouteMap from './BusRouteMap';

const DriverDashboard = ({ user, onLogout }) => {
    const [activeTab, setActiveTab] = useState('bus-details');
    const [busData, setBusData] = useState(null);
    const [students, setStudents] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [updating, setUpdating] = useState(false);
    const [showMap, setShowMap] = useState(false);

    // Timings state
    const [timings, setTimings] = useState({
        morning: '',
        evening: ''
    });


    useEffect(() => {
        fetchInitialData();
    }, [user.id]);

    const fetchInitialData = async () => {
        setLoading(true);
        try {
            const busInfo = await safeFetch(`/api/driver/bus-details/${user.id}`);
            const busNum = busInfo.bus_number;

            const notifs = await safeFetch(`/api/driver/notifications?busNumber=${busNum}`);

            setBusData(busInfo);
            setNotifications(notifs);
            setTimings({
                morning: busInfo.morning_timing || '',
                evening: busInfo.evening_timing || ''
            });

            if (busInfo.route_number) {
                const studentList = await safeFetch(`/api/driver/students/${busInfo.route_number}?busNumber=${busNum}`);
                setStudents(studentList);
            }
        } catch (err) {
            setError('Failed to load dashboard data');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };


    const handleSaveTimings = async () => {
        setUpdating(true);
        try {
            await safeFetch('/api/driver/update-timings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    driverId: user.id,
                    morning_timing: timings.morning,
                    evening_timing: timings.evening
                })
            });
            setBusData(prev => ({ ...prev, morning_timing: timings.morning, evening_timing: timings.evening }));
            alert('Timings saved successfully!');
        } catch (err) {
            alert('Failed to save timings');
        } finally {
            setUpdating(false);
        }
    };

    if (loading) return (
        <div className="driver-loading">
            <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
            >
                <RefreshCw size={48} color="#6366f1" />
            </motion.div>
            <p style={{ marginTop: '20px' }}>Initializing Premium Dashboard...</p>
        </div>
    );

    return (
        <div className="driver-dashboard">
            {/* Sidebar */}
            <aside className="driver-sidebar">
                <div className="sidebar-logo">
                    <Bus size={32} />
                    <span>QRide Driver</span>
                </div>

                <nav className="driver-nav">
                    <button
                        className={`nav-item ${activeTab === 'bus-details' ? 'active' : ''}`}
                        onClick={() => setActiveTab('bus-details')}
                    >
                        <Bus size={20} /> <span>Assigned Bus</span>
                    </button>
                    <button
                        className={`nav-item ${activeTab === 'students' ? 'active' : ''}`}
                        onClick={() => setActiveTab('students')}
                    >
                        <Users size={20} /> <span>Students</span>
                    </button>
                    <button
                        className={`nav-item ${activeTab === 'notifications' ? 'active' : ''}`}
                        onClick={() => setActiveTab('notifications')}
                    >
                        <Bell size={20} />
                        <span>System Alerts</span>
                    </button>
                </nav>

                <button className="nav-item logout-btn-sidebar" onClick={onLogout}>
                    <LogOut size={20} /> <span>Logout</span>
                </button>
            </aside>

            {/* Main Content */}
            <main className="driver-main">
                <header className="driver-header">
                    <div className="driver-welcome">
                        <p>Welcome back,</p>
                        <h1>{user.name}</h1>
                    </div>
                </header>

                <div className="driver-stats-grid">
                    <div className="glass-panel stat-card-driver">
                        <div className="stat-icon bus"><Bus size={24} /></div>
                        <div className="stat-info">
                            <span>Bus Number</span>
                            <h3>{busData?.bus_number}</h3>
                        </div>
                    </div>
                    <div className="glass-panel stat-card-driver">
                        <div className="stat-icon students"><Users size={24} /></div>
                        <div className="stat-info">
                            <span>Students</span>
                            <h3>{students.length}</h3>
                        </div>
                    </div>
                    <div className="glass-panel stat-card-driver">
                        <div className="stat-icon status"><MapPin size={24} /></div>
                        <div className="stat-info">
                            <span>Route</span>
                            <h3>{busData?.route_number}</h3>
                        </div>
                    </div>
                </div>

                <div className="driver-content">
                    <AnimatePresence mode="wait">
                        {activeTab === 'bus-details' && (
                            <motion.div
                                key="bus"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="tab-panel"
                            >
                                <div className="glass-panel timing-management">
                                    <div className="card-header">
                                        <Clock size={28} color="var(--driver-primary)" />
                                        <h2>Daily Trip Timings</h2>
                                    </div>
                                    <div className="timing-inputs-row">
                                        <div className="timing-field">
                                            <label>Morning Trip</label>
                                            <input
                                                type="text"
                                                placeholder="e.g. 07:45 AM"
                                                value={timings.morning}
                                                onChange={(e) => setTimings({ ...timings, morning: e.target.value })}
                                            />
                                        </div>
                                        <div className="timing-field">
                                            <label>Evening Trip</label>
                                            <input
                                                type="text"
                                                placeholder="e.g. 04:50 PM"
                                                value={timings.evening}
                                                onChange={(e) => setTimings({ ...timings, evening: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <button
                                        className="save-timings-large"
                                        onClick={handleSaveTimings}
                                        disabled={updating}
                                    >
                                        {updating ? 'Saving...' : <><Save size={20} /> Save My Timings</>}
                                    </button>
                                </div>

                                <div className="glass-panel map-section-driver" style={{ marginTop: '20px' }}>
                                    <div className="card-header">
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                            <MapIcon size={28} color="var(--driver-primary)" />
                                            <div>
                                                <h2 style={{ margin: 0 }}>Route Map & Schedule</h2>
                                                <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0 }}>
                                                    {busData?.route_name || 'Assigned Route'}
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            className={`toggle-map-btn-driver ${showMap ? 'active' : ''}`}
                                            onClick={() => setShowMap(!showMap)}
                                        >
                                            {showMap ? 'Hide Details' : 'View Route Details'}
                                        </button>
                                    </div>

                                    {showMap && (
                                        <div className="driver-map-wrapper" style={{ padding: '20px', animation: 'fadeIn 0.5s ease-out' }}>
                                            {/* Schedule Table (Matching Home Page) */}
                                            <div className="boarding-schedule-driver" style={{ marginBottom: '25px', background: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                                                <h3 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '15px', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <div style={{ width: '4px', height: '18px', background: 'var(--driver-primary)', borderRadius: '2px' }}></div>
                                                    Boarding Stops & Official Timings
                                                </h3>
                                                <div className="stops-grid-driver" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px' }}>
                                                    {busData?.stops ? busData.stops.split(',').map((stop, index) => {
                                                        const timings = busData.timings ? busData.timings.split(',') : [];
                                                        return (
                                                            <div key={index} className="stop-card-driver" style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 15px', background: 'white', borderRadius: '8px', border: '1px solid #f1f5f9', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                                                                <span style={{ fontWeight: '600', color: '#334155', fontSize: '0.9rem' }}>{stop.trim()}</span>
                                                                {timings[index] && <span style={{ color: 'var(--driver-primary)', fontWeight: '700', fontSize: '0.85rem' }}>{timings[index].trim()}</span>}
                                                            </div>
                                                        );
                                                    }) : (
                                                        <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>No stop information available.</p>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Map Visualization */}
                                            <BusRouteMap routeNumber={busData?.bus_number || busData?.route_number} />
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        )}

                        {activeTab === 'students' && (
                            <motion.div
                                key="students"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="tab-panel"
                            >
                                <div className="glass-panel">
                                    <div className="driver-card-header">
                                        <h2>Assigned Students</h2>
                                    </div>

                                    <div className="driver-table-container">
                                        <table className="driver-table">
                                            <thead>
                                                <tr>
                                                    <th>Roll Number</th>
                                                    <th>Name</th>
                                                    <th>Department</th>
                                                    <th>Phone</th>
                                                    <th>Status</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {students.map((student, i) => (
                                                    <tr key={i}>
                                                        <td>{student.roll_number}</td>
                                                        <td>{student.name}</td>
                                                        <td>{student.department}</td>
                                                        <td style={{ fontSize: '0.9rem', color: 'var(--driver-primary)', fontWeight: '600' }}>
                                                            {student.phone_number || 'N/A'}
                                                        </td>
                                                        <td>
                                                            <span className={`status-badge ${student.status || 'registered'}`}>
                                                                {student.status || 'New'}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {activeTab === 'notifications' && (
                            <motion.div
                                key="notif"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="tab-panel"
                            >
                                <div className="notifications-list">
                                    <h2 style={{ marginBottom: '1.5rem' }}>System Alerts</h2>
                                    {notifications.length > 0 ? (
                                        notifications.map((n, i) => (
                                            <div key={i} className="glass-panel notification-card">
                                                <div className="notif-title">{n.message}</div>
                                                <div className="notif-time">{new Date(n.created_at).toLocaleString()}</div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="glass-panel" style={{ textAlign: 'center', padding: '3rem' }}>
                                            <CheckCircle size={48} color="var(--driver-primary)" style={{ marginBottom: '1rem' }} />
                                            <p>No new notifications</p>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </main>
        </div>
    );
};

export default DriverDashboard;
