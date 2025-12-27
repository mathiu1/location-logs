import { useState, useEffect } from 'react';
import api from '../api';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

// Fix for default marker icon in leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const AdminDashboard = () => {
    const [logs, setLogs] = useState([]);
    const [users, setUsers] = useState([]);
    const [selectedLog, setSelectedLog] = useState(null);
    const [activeTab, setActiveTab] = useState('logs');

    // Filters
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [selectedUser, setSelectedUser] = useState('');



    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchUsers();
        fetchLogs();
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await api.get('/auth/users');
            setUsers(res.data);
        } catch (err) {
            console.error('Failed to fetch users', err);
        }
    };

    const fetchLogs = async () => {
        try {
            setLoading(true);
            const params = {};
            if (startDate) params.startDate = startDate;
            if (endDate) params.endDate = endDate;
            if (selectedUser) params.userId = selectedUser;

            const res = await api.get('/logs', { params });
            // Handle both array response and paginated response just in case
            const logData = Array.isArray(res.data) ? res.data : (res.data.logs || []);
            setLogs(logData);


        } catch (err) {
            console.error('Failed to fetch logs', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        fetchLogs();
    };

    return (
        <div className="container dashboard-grid">
            <div className="sidebar card">
                <h3>Admin Panel</h3>
                <button
                    className={`btn ${activeTab !== 'logs' ? 'btn-secondary' : ''}`}
                    onClick={() => setActiveTab('logs')}
                    style={{ width: '100%', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}
                >
                    📍 User Logs
                </button>
                <button
                    className={`btn ${activeTab !== 'users' ? 'btn-secondary' : ''}`}
                    onClick={() => setActiveTab('users')}
                    style={{ width: '100%', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                    👥 User List
                </button>
            </div>

            <div className="main-content">
                {activeTab === 'logs' && (
                    <>
                        <div className="card">
                            <h3>Log Filters</h3>
                            <form onSubmit={handleSearch} className="filters">
                                <div className="filter-group">
                                    <label>User</label>
                                    <select
                                        className="input-field"
                                        value={selectedUser}
                                        onChange={(e) => setSelectedUser(e.target.value)}
                                        style={{ minWidth: '150px' }}
                                    >
                                        <option value="">All Users</option>
                                        {users.map(u => (
                                            <option key={u._id} value={u._id}>{u.username}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="filter-group">
                                    <label>Start Date</label>
                                    <input
                                        type="date"
                                        className="input-field"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                    />
                                </div>
                                <div className="filter-group">
                                    <label>End Date</label>
                                    <input
                                        type="date"
                                        className="input-field"
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                    />
                                </div>
                                <div className="filter-group" style={{ flexGrow: 1, display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-end' }}>
                                    <button type="submit" className="btn">Search Logs</button>
                                </div>
                            </form>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>

                            <div className="card">
                                <h3>Map Visualization</h3>
                                {selectedLog ? (
                                    <div className="map-container" style={{ height: '400px' }}>
                                        <MapContainer
                                            key={`${selectedLog._id}`}
                                            center={[selectedLog.location.lat, selectedLog.location.lng]}
                                            zoom={15}
                                            style={{ height: '100%', width: '100%' }}
                                        >
                                            <TileLayer
                                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                                attribution='&copy; OpenStreetMap contributors'
                                            />
                                            <Marker position={[selectedLog.location.lat, selectedLog.location.lng]}>
                                                <Popup>
                                                    User: {selectedLog.userId?.username}<br />
                                                    Time: {new Date(selectedLog.timestamp).toLocaleString()}
                                                </Popup>
                                            </Marker>
                                        </MapContainer>
                                    </div>
                                ) : (
                                    <div style={{ height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                                        Select a log to view
                                    </div>
                                )}
                            </div>
                            <div className="card">
                                <h3>Recent Activity</h3>
                                <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
                                    <table className="modern-table">
                                        <thead>
                                            <tr>
                                                <th>User</th>
                                                <th>Time</th>
                                                <th>Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {logs?.map(log => (
                                                <tr key={log._id}>
                                                    <td><strong>{log.userId?.username || 'Unknown'}</strong></td>
                                                    <td>
                                                        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                                            {new Date(log.timestamp).toLocaleDateString()}
                                                        </span>
                                                        <br />
                                                        {new Date(log.timestamp).toLocaleTimeString()}
                                                    </td>
                                                    <td>
                                                        <button className="btn" style={{ padding: '0.25rem 0.75rem', fontSize: '0.8rem' }} onClick={() => setSelectedLog(log)}>View</button>
                                                    </td>
                                                </tr>
                                            ))}
                                            {logs?.length === 0 && <tr><td colSpan="3" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No logs found matching criteria</td></tr>}
                                        </tbody>
                                    </table>
                                </div>



                            </div>


                        </div>
                    </>
                )}

                {activeTab === 'users' && (
                    <div className="card">
                        <h3>Registered Users</h3>
                        <table className="modern-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Username</th>
                                    <th>Role</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map(u => (
                                    <tr key={u._id}>
                                        <td style={{ fontFamily: 'monospace', color: 'var(--accent)' }}>{u._id}</td>
                                        <td>{u.username}</td>
                                        <td>
                                            <span style={{
                                                padding: '0.25rem 0.75rem',
                                                borderRadius: '2rem',
                                                fontSize: '0.75rem',
                                                fontWeight: 'bold',
                                                background: u.role === 'admin' ? 'rgba(99, 102, 241, 0.2)' : 'rgba(56, 189, 248, 0.2)',
                                                color: u.role === 'admin' ? '#818cf8' : '#38bdf8',
                                                border: `1px solid ${u.role === 'admin' ? '#818cf8' : '#38bdf8'}`
                                            }}>
                                                {u.role.toUpperCase()}
                                            </span>
                                        </td>
                                        <td style={{ color: 'var(--success)' }}>Active</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;
