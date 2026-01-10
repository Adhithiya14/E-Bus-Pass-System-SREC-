import React, { useState } from 'react';
import { Search } from 'lucide-react';
import './BusRoutes.css';

const routesData = [
    { id: 1, name: "Campus Loop A", points: "Main Gate - Library - Hostels", time: "07:30 AM - 10:00 PM", busNo: "KA-01-AB-1234" },
    { id: 2, name: "City Center Express", points: "City Station - Campus Main", time: "08:00 AM - 06:00 PM", busNo: "KA-01-XY-9876" },
    { id: 3, name: "North Wing Shuttle", points: "North P.G. - Science Block", time: "07:45 AM - 09:30 PM", busNo: "KA-53-MN-4567" },
    { id: 4, name: "South Residency", points: "South Gate - Sports Complex", time: "08:15 AM - 08:00 PM", busNo: "KA-05-PQ-2345" },
    { id: 5, name: "Evening Special", points: "Campus - Metro Station", time: "05:00 PM - 11:00 PM", busNo: "KA-01-ZZ-1122" },
];

const BusRoutes = () => {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredRoutes = routesData.filter(route =>
        route.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        route.points.toLowerCase().includes(searchTerm.toLowerCase())
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
                                <th>Route Name</th>
                                <th>Pickup Points</th>
                                <th>Timing</th>
                                <th>Bus Number</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredRoutes.length > 0 ? (
                                filteredRoutes.map(route => (
                                    <tr key={route.id} data-aos="fade-up">
                                        <td className="route-name">
                                            {route.name}
                                            <span className="status-dot"></span>
                                        </td>
                                        <td>{route.points}</td>
                                        <td>{route.time}</td>
                                        <td><span className="bus-badge">{route.busNo}</span></td>
                                    </tr>
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
