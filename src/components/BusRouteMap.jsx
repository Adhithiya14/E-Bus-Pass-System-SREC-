import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Tooltip, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { safeFetch } from '../utils/api';
import './BusRouteMap.css';
import { Info, MapPin, Navigation } from 'lucide-react';

// Fix for default marker icons in Leaflet with Webpack/Vite
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIconRetina from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
    iconUrl: markerIcon,
    iconRetinaUrl: markerIconRetina,
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Helper component to auto-fit map bounds to markers
const SetBounds = ({ stops }) => {
    const map = useMap();
    useEffect(() => {
        if (stops.length > 0) {
            const bounds = L.latLngBounds(stops.map(s => [s.lat, s.lng]));
            map.fitBounds(bounds, { padding: [50, 50] });
        }
    }, [stops, map]);
    return null;
};

const BusRouteMap = ({ routeNumber }) => {
    const [stops, setStops] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchStops = async () => {
            setLoading(true);
            setError('');
            try {
                const data = await safeFetch(`/api/route-stops/${routeNumber}`);
                setStops(data);
            } catch (err) {
                console.error("Failed to load stops", err);
                setError('No route map available for this bus.');
            } finally {
                setLoading(false);
            }
        };

        if (routeNumber) {
            fetchStops();
        }
    }, [routeNumber]);

    if (loading) {
        return (
            <div className="map-placeholder loading">
                <div className="spinner"></div>
                <p>Loading Route Map...</p>
            </div>
        );
    }

    if (error || stops.length === 0) {
        return (
            <div className="map-placeholder error">
                <Info size={32} />
                <p>{error || 'Route data not available.'}</p>
            </div>
        );
    }

    const polylinePositions = stops.map(stop => [stop.lat, stop.lng]);

    return (
        <div className="bus-route-map-container">
            <div className="map-header">
                <div className="map-title">
                    <Navigation size={18} />
                    <span>Route {routeNumber} Map Visualization</span>
                </div>
                <div className="map-legend">
                    <span className="legend-item"><span className="dot start"></span> Start</span>
                    <span className="legend-item"><span className="dot stop"></span> Regular Stop</span>
                    <span className="legend-item"><span className="dot end"></span> Destination</span>
                </div>
            </div>

            <div className="leaflet-wrapper">
                <MapContainer
                    center={[stops[0].lat, stops[0].lng]}
                    zoom={13}
                    style={{ height: '100%', width: '100%' }}
                    scrollWheelZoom={false}
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />

                    {stops.map((stop, index) => (
                        <Marker
                            key={index}
                            position={[stop.lat, stop.lng]}
                        >
                            <Popup className="custom-popup">
                                <div className="popup-content">
                                    <div className="stop-index">Stop {stop.order}</div>
                                    <div className="stop-name-popup">{stop.name}</div>
                                    <div className="stop-coords">{stop.lat.toFixed(4)}, {stop.lng.toFixed(4)}</div>
                                </div>
                            </Popup>
                            <Tooltip permanent direction="top" offset={[0, -32]} className="stop-tooltip">
                                {stop.name}
                            </Tooltip>
                        </Marker>
                    ))}

                    <Polyline
                        pathOptions={{ color: '#1F7A5A', weight: 4, dashArray: '10, 10', lineJoin: 'round' }}
                        positions={polylinePositions}
                    />

                    <SetBounds stops={stops} />
                </MapContainer>
            </div>

            <div className="map-footer">
                <MapPin size={14} />
                <span>Visualization based on official stop coordinates</span>
            </div>
        </div>
    );
};

export default BusRouteMap;
