import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  // Clear error only when user starts typing again, NOT on any other event
  const handleChange = (field) => (e) => {
    setError('');
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const endpoint = isAdmin ? '/auth/admin/login' : '/auth/login';
      const res = await api.post(endpoint, formData);

      const token = res.data.token;
      const payloadBase64 = token.split('.')[1];
      const payload = JSON.parse(atob(payloadBase64));

      const user = {
        id: payload.id,
        email: payload.email,
        role: payload.role,
        adminRole: payload.adminRole,
        name: payload.name || 'User',
      };

      localStorage.setItem('sres_token', token);
      localStorage.setItem('sres_user', JSON.stringify(user));

      if (user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      const msg = err.response?.data?.error || 'Login failed. Please check your credentials.';
      // Give the error message extra context if it's the wrong portal
      if (isAdmin) {
        setError(msg + ' — Make sure you are using admin credentials.');
      } else {
        setError(msg + ' — Students: use your registered email and password.');
      }
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    setIsAdmin(prev => !prev);
    setError('');
    setFormData({ email: '', password: '' });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="w-full max-w-md space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">

        {/* Mode toggle pills — very visible */}
        <div className="flex rounded-xl overflow-hidden border border-outline-variant/30 bg-surface-container-low shadow-sm">
          <button
            type="button"
            onClick={() => { if (isAdmin) switchMode(); }}
            className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${!isAdmin ? 'bg-primary text-white shadow-md' : 'text-secondary hover:text-on-surface'}`}
          >
            <span className="material-symbols-outlined text-sm align-middle mr-1">school</span>
            Student
          </button>
          <button
            type="button"
            onClick={() => { if (!isAdmin) switchMode(); }}
            className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${isAdmin ? 'bg-primary text-white shadow-md' : 'text-secondary hover:text-on-surface'}`}
          >
            <span className="material-symbols-outlined text-sm align-middle mr-1">admin_panel_settings</span>
            Admin
          </button>
        </div>

        <Card className="w-full">
          <div className="text-center mb-8">
            <img src="/outr.png" alt="OUTR Logo" className="h-16 mx-auto mb-4 object-contain" />
            <h1 className="text-xl font-extrabold uppercase tracking-widest text-on-surface">Odisha University of Technology and Research</h1>
            <p className="text-[10px] font-bold text-secondary uppercase tracking-widest mt-2">
              {isAdmin ? 'Administrator Login' : 'Student Login'}
            </p>
          </div>

          {/* Error — persistent, prominent, does not auto-dismiss */}
          {error && (
            <div className="p-4 mb-6 bg-error/10 border border-error/30 rounded-xl text-error text-xs font-bold flex items-start gap-3">
              <span className="material-symbols-outlined text-[18px] mt-0.5 flex-shrink-0">error</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Email Address"
              type="email"
              required
              value={formData.email}
              onChange={handleChange('email')}
              placeholder={isAdmin ? 'admin@outr.ac.in' : 'student@outr.ac.in'}
            />
            <Input
              label="Password"
              type="password"
              required
              value={formData.password}
              onChange={handleChange('password')}
              placeholder="••••••••"
            />

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Authenticating...' : `Sign In as ${isAdmin ? 'Admin' : 'Student'}`}
            </Button>
          </form>

          {!isAdmin && (
            <div className="mt-8 pt-6 border-t border-outline-variant/30 text-center">
              <p className="text-xs text-secondary font-medium">
                Don't have an account?{' '}
                <Link to="/register" className="text-primary font-bold hover:underline">Register here</Link>
              </p>
            </div>
          )}
        </Card>

        {isAdmin && (
          <p className="text-center text-[10px] text-secondary font-bold uppercase tracking-widest">
            Contact your system administrator if you need access.
          </p>
        )}
      </div>
    </div>
  );
};

export default Login;
