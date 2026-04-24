import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await api.post('/auth/register', formData);
      const res = await api.post('/auth/login', { email: formData.email, password: formData.password });
      localStorage.setItem('sres_token', res.data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-extrabold uppercase tracking-widest text-on-surface">Create Account</h1>
          <div className="h-1 w-12 bg-primary rounded-full mx-auto mt-4"></div>
        </div>

        {error && <div className="p-3 mb-6 bg-error/10 border border-error/50 rounded-lg text-error text-sm text-center font-medium">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-6">
          <Input 
            label="Full Name" 
            type="text" 
            required
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            placeholder="John Doe"
          />
          <Input 
            label="Email Address" 
            type="email" 
            required
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            placeholder="john@university.edu"
          />
          <Input 
            label="Password" 
            type="password" 
            required
            value={formData.password}
            onChange={(e) => setFormData({...formData, password: e.target.value})}
            placeholder="••••••••"
          />
          
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Creating Account...' : 'Continue'}
          </Button>
        </form>

        <div className="mt-8 pt-6 border-t border-outline-variant/30 text-center">
          <p className="text-xs text-secondary font-medium">
            Already registered? <Link to="/" className="text-primary font-bold hover:underline">Sign In here</Link>
          </p>
        </div>
      </Card>
    </div>
  );
};

export default Register;
