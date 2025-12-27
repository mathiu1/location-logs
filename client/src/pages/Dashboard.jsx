import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../api';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { toast } from 'react-toastify';

const Dashboard = () => {
    const { user } = useContext(AuthContext);
    const [location, setLocation] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleLogLocation = () => {
        if (!navigator.geolocation) {
            toast.error('Geolocation is not supported by your browser');
            return;
        }

        setLoading(true);
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                try {
                    await api.post('/logs', { lat: latitude, lng: longitude });
                    setLocation({ lat: latitude, lng: longitude });
                    toast.success('Location logged successfully!');
                } catch (err) {
                    toast.error('Failed to log location');
                } finally {
                    setLoading(false);
                }
            },
            (error) => {
                toast.error('Error getting location: ' + error.message);
                setLoading(false);
            }
        );
    };

    return (
        <div className="container">
            <div className="card">
                <h1>User Dashboard</h1>
                <p style={{ color: 'var(--text-secondary)' }}>Welcome, {user?.username}.</p>

                <div style={{ marginTop: '2rem' }}>
                    <p>Click the button below to log your current location to the database.</p>
                    <button className="btn" onClick={handleLogLocation} disabled={loading}>
                        {loading ? 'Logging...' : 'Log Current Location'}
                    </button>
                </div>

                {location && (
                    <div style={{ marginTop: '2rem' }}>
                        <h3>Your Last Logged Location</h3>
                        <div style={{ height: '400px', width: '100%', borderRadius: '1rem', overflow: 'hidden' }}>
                            <MapContainer center={[location.lat, location.lng]} zoom={15} style={{ height: '100%', width: '100%' }}>
                                <TileLayer
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                />
                                <Marker position={[location.lat, location.lng]}>
                                    <Popup>
                                        Lat: {location.lat}, Lng: {location.lng}
                                    </Popup>
                                </Marker>
                            </MapContainer>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
