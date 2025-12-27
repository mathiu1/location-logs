import { useState } from 'react';
import api from '../api';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';

const Register = () => {
    const [formData, setFormData] = useState({ username: '', email: '', password: '', role: 'user' });
    const [clientErrors, setClientErrors] = useState({});
    const navigate = useNavigate();

    const validate = () => {
        let errors = {};
        const usernameRegex = /^[a-zA-Z0-9]+$/;
        if (!formData.username) errors.username = "Username is required";
        else if (!usernameRegex.test(formData.username)) errors.username = "Username must be alphanumeric";
        else if (formData.username.length < 3) errors.username = "Username must be at least 3 characters";

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!formData.email) errors.email = "Email is required";
        else if (!emailRegex.test(formData.email)) errors.email = "Please enter a valid email address";

        if (!formData.password) errors.password = "Password is required";
        else if (formData.password.length < 6) errors.password = "Password must be at least 6 characters";

        setClientErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) {
            toast.error('Please fix validation errors');
            return;
        }

        try {
            await api.post('/auth/register', formData);
            toast.success('Registration successful! Please login.');
            navigate('/login');
        } catch (err) {
            if (err.response && err.response.data.errors) {
                err.response.data.errors.forEach(e => {
                    toast.error(e.msg);
                });
            } else {
                toast.error(err.response?.data?.message || 'Registration failed');
            }
        }
    };

    return (
        <div className="auth-container">
            <div className="card auth-form">
                <h2 style={{ textAlign: 'center', marginBottom: '2rem' }}>Create Account</h2>
                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '1rem' }}>
                        <input
                            type="text"
                            placeholder="Username "
                            className="input-field"
                            value={formData.username}
                            onChange={(e) => {
                                setFormData({ ...formData, username: e.target.value });
                                if (clientErrors.username) setClientErrors({ ...clientErrors, username: null });
                            }}
                            style={{ borderColor: clientErrors.username ? 'var(--error-color)' : '' }}
                        />
                        {clientErrors.username && <small style={{ color: 'var(--error-color)' }}>{clientErrors.username}</small>}
                    </div>

                    <div style={{ marginBottom: '1rem' }} >
                        <input
                            type="email"
                            placeholder="Email"
                            className="input-field"
                            value={formData.email}
                            onChange={(e) => {
                                setFormData({ ...formData, email: e.target.value });
                                if (clientErrors.email) setClientErrors({ ...clientErrors, email: null });
                            }}
                            style={{ borderColor: clientErrors.email ? 'var(--error-color)' : '' }}
                        />
                        {clientErrors.email && <small style={{ color: 'var(--error-color)' }}>{clientErrors.email}</small>}
                    </div>

                    <div style={{ marginBottom: '1rem' }}>
                        <input
                            type="password"
                            placeholder="Password"
                            className="input-field"
                            value={formData.password}
                            onChange={(e) => {
                                setFormData({ ...formData, password: e.target.value });
                                if (clientErrors.password) setClientErrors({ ...clientErrors, password: null });
                            }}
                            style={{ borderColor: clientErrors.password ? 'var(--error-color)' : '' }}
                        />
                        {clientErrors.password && <small style={{ color: 'var(--error-color)' }}>{clientErrors.password}</small>}
                    </div>

                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ marginRight: '1rem' }}>Role:</label>
                        <select
                            className="input-field"
                            value={formData.role}
                            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                        >
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                        </select>
                    </div>
                    <button type="submit" className="btn" style={{ width: '100%' }}>Register</button>
                </form>
                <p style={{ marginTop: '1rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    Already have an account? <Link to="/login" style={{ color: 'var(--accent-color)' }}>Login</Link>
                </p>
            </div>
        </div>
    );
};

export default Register;
