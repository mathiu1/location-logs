import { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <nav className="nav container">
            <Link to="/" className="nav-brand">GeoLogger</Link>

            <button
                className="mobile-menu-btn"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                style={{ fontSize: '1.5rem', cursor: 'pointer', background: 'none', border: 'none', color: 'white' }}
            >
                {isMenuOpen ? '✕' : '☰'}
            </button>

            <div className={`nav-links ${isMenuOpen ? 'active' : ''}`}>
                {user ? (
                    <>
                        <span style={{ color: 'var(--text-muted)', marginRight: '1rem' }}>Welcome, <span style={{ color: 'var(--primary)' }}>{user.username}</span></span>
                        {user.role === 'admin' && <Link to="/admin" onClick={() => setIsMenuOpen(false)}>Admin Panel</Link>}
                        <Link to="/dashboard" onClick={() => setIsMenuOpen(false)}>Dashboard</Link>
                        <button
                            onClick={() => {
                                logout();
                                setIsMenuOpen(false);
                            }}
                            className="btn btn-secondary"
                            style={{ marginLeft: '0.5rem', padding: '0.5rem 1rem', fontSize: '0.8rem' }}
                        >
                            Logout
                        </button>
                    </>
                ) : (
                    <>
                        <Link to="/login" onClick={() => setIsMenuOpen(false)}>Login</Link>
                        <Link to="/register" className="btn" style={{ marginLeft: '1rem', color: 'white', textDecoration: 'none' }} onClick={() => setIsMenuOpen(false)}>Get Started</Link>
                    </>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
