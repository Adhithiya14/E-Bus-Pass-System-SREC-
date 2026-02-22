import React, { useState, useEffect } from 'react';
import { Search, Map as MapIcon, ChevronDown, ChevronUp } from 'lucide-react';
import './BusRoutes.css';
import { safeFetch } from '../utils/api';
import BusRouteMap from './BusRouteMap';

const BusRoutes = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [routes, setRoutes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedRouteForMap, setSelectedRouteForMap] = useState(null);

    useEffect(() => {
        fetchRoutes();
    }, []);

    const fetchRoutes = async () => {
        try {
            const data = await safeFetch('/api/routes');
            setRoutes(data);
        } catch (err) {
            console.error("Failed to fetch routes", err);
        } finally {
            setLoading(false);
        }
    };

    // Helper to format stops and timings
    const formatStops = (stopsStr, timingsStr) => {
        if (!stopsStr) return "No stops listed";
        const stops = stopsStr.split(',').map(s => s.trim());
        const timings = timingsStr ? timingsStr.split(',').map(t => t.trim()) : [];

        return (
            <div className="stops-list">
                {stops.map((stop, index) => (
                    <div key={index} className="stop-item" style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', padding: '4px 0' }}>
                        <span className="stop-name" style={{ fontWeight: '500', color: '#334155' }}>{stop}</span>
                        {timings[index] && <span className="stop-time" style={{ color: '#1F7A5A', fontWeight: '700', fontSize: '0.9rem' }}>{timings[index]}</span>}
                    </div>
                ))}
            </div>
        );
    };

    const filteredRoutes = routes.filter(route =>
        route.route_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        route.stops.toLowerCase().includes(searchTerm.toLowerCase()) ||
        route.route_number.toString().includes(searchTerm)
    );

    const toggleMap = (routeNumber) => {
        if (selectedRouteForMap === routeNumber) {
            setSelectedRouteForMap(null);
        } else {
            setSelectedRouteForMap(routeNumber);
        }
    };

    return (
        <section id="routes" className="routes-section">
            <div className="container">
                <div className="section-header text-center">
                    <h2 className="section-title">Bus Routes & Schedule</h2>
                    <div className="title-underline"></div>
                </div>

                <div className="routes-controls">
                    <div className="search-bar">
                        <Search className="search-icon" size={20} />
                        <input
                            type="text"
                            placeholder="Search routes or pickup points..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="routes-table-wrapper">
                    <table className="routes-table">
                        <thead>
                            <tr>
                                <th>Bus Number</th>
                                <th>Route Name</th>
                                <th>Boarding Stops & Timings</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="4" className="text-center">Loading routes...</td></tr>
                            ) : filteredRoutes.length > 0 ? (
                                filteredRoutes.map(route => (
                                    <React.Fragment key={route.id}>
                                        <tr data-aos="fade-up">
                                            <td>
                                                <div className="bus-info">
                                                    <div className="bus-plate" style={{ fontSize: '1.2rem', fontWeight: '800', color: '#1F7A5A' }}>{route.route_number}</div>
                                                    <div className="bus-subtext" style={{ fontSize: '0.8rem', color: '#64748b' }}>Plate: {route.bus_number}</div>
                                                </div>
                                            </td>
                                            <td className="route-name">
                                                {route.route_name}
                                            </td>
                                            <td>
                                                {formatStops(route.stops, route.timings)}
                                            </td>
                                            <td>
                                                <button
                                                    className={`view-map-btn ${String(selectedRouteForMap) === String(route.route_number) ? 'active' : ''}`}
                                                    onClick={() => toggleMap(route.route_number)}
                                                >
                                                    {selectedRouteForMap === route.route_number ? (
                                                        <><ChevronUp size={16} /> Hide Map</>
                                                    ) : (
                                                        <><MapIcon size={16} /> View Map</>
                                                    )}
                                                </button>
                                            </td>
                                        </tr>
                                        {String(selectedRouteForMap) === String(route.route_number) && (
                                            <tr>
                                                <td colSpan="4" className="map-row-cell">
                                                    <BusRouteMap routeNumber={route.route_number} />
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4" className="no-results">No routes found matching your search.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </section>
    );
};

export default BusRoutes;
