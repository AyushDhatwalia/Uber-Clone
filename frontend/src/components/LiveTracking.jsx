import React, { useState, useEffect, useRef } from 'react'
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet'

const defaultCenter = [20.5937, 78.9629] // Center of India as a sensible default

// Component to handle map center changes
const MapCenterUpdater = ({ position, initialCenterSet }) => {
    const map = useMap();
    useEffect(() => {
        if (position && !initialCenterSet.current) {
            map.flyTo(position, 15);
            initialCenterSet.current = true;
        }
    }, [position, map, initialCenterSet]);
    return null;
};

const LiveTracking = () => {
    const [currentPosition, setCurrentPosition] = useState(null);
    const initialCenterSet = useRef(false);

    useEffect(() => {
        if (!navigator.geolocation) return;

        // Get initial position
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                setCurrentPosition([latitude, longitude]);
            },
            (error) => console.warn('Geolocation error:', error),
            { enableHighAccuracy: true, timeout: 10000 }
        );

        // Watch for position updates
        const watchId = navigator.geolocation.watchPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                setCurrentPosition([latitude, longitude]);
            },
            (error) => console.warn('Watch position error:', error),
            { enableHighAccuracy: true, distanceFilter: 10 }
        );

        return () => navigator.geolocation.clearWatch(watchId);
    }, []);

    return (
        <MapContainer 
            center={currentPosition || defaultCenter} 
            zoom={currentPosition ? 15 : 5} 
            style={{ width: '100%', height: '100%', zIndex: 0 }}
            zoomControl={false}
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {currentPosition && <Marker position={currentPosition} />}
            <MapCenterUpdater position={currentPosition} initialCenterSet={initialCenterSet} />
        </MapContainer>
    );
}

export default LiveTracking