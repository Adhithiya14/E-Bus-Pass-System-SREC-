import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import './BusRoutes.css';
import { safeFetch } from '../utils/api';

const BusRoutes = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [routes, setRoutes] = useState([]);
    const [loading, setLoading] = useState(true);

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
    const formatStops = (stopsStr) => {
        if (!stopsStr) return "No stops listed";
        const stops = stopsStr.split(',').map(s => s.trim());

        return (
            <div className="stops-list">
                {stops.map((stop, index) => (
                    <div key={index} className="stop-item">
                        <span className="stop-name">{stop}</span>
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
                                <th>Boarding Stops</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="3" className="text-center">Loading routes...</td></tr>
                            ) : filteredRoutes.length > 0 ? (
                                filteredRoutes.map(route => (
                                    <tr key={route.id} data-aos="fade-up">
                                        <td>
                                            <div className="bus-info">
                                                <div className="bus-plate" style={{ fontSize: '1.2rem', fontWeight: '800', color: '#1F7A5A' }}>{route.bus_number}</div>
                                            </div>
                                        </td>
                                        <td className="route-name">
                                            {route.route_name}
                                        </td>
                                        <td>
                                            {formatStops(route.stops)}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="3" className="no-results">No routes found matching your search.</td>
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
