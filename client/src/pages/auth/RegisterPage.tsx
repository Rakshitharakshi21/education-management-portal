import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, EyeOff, UserPlus, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../services/api';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'student' as 'student' | 'teacher' });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) return setError('All fields are required.');
    if (form.password.length < 8) return setError('Password must be at least 8 characters.');
    setError('');
    setIsLoading(true);
    try {
      await authAPI.register(form);
      await login(form.email, form.password);
      toast.success('Welcome to EduPortal! 🎉');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Registration failed. Please try again.';
      setError(msg);
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.8rem', color: '#0F172A', letterSpacing: '-0.02em', margin: '0 0 6px' }}>
        Create your account
      </h1>
      <p style={{ color: '#64748B', margin: '0 0 32px', fontSize: '0.95rem' }}>
        Already have one?{' '}
        <Link to="/login" style={{ color: '#2563EB', fontWeight: 600, textDecoration: 'none' }}>Sign in</Link>
      </p>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', background: '#FEE2E2', border: '1px solid #FECACA', borderRadius: 10, marginBottom: 20 }}
        >
          <AlertCircle size={16} color="#EF4444" />
          <p style={{ margin: 0, color: '#991B1B', fontSize: '0.875rem' }}>{error}</p>
        </motion.div>
      )}

      {/* Role selector */}
      <div style={{ marginBottom: 24 }}>
        <p className="input-label">I am a...</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {(['student', 'teacher'] as const).map((role) => (
            <button
              key={role}
              type="button"
              onClick={() => setForm({ ...form, role })}
              style={{
                padding: '14px', borderRadius: 10, border: `2px solid`,
                borderColor: form.role === role ? '#2563EB' : '#E2E8F0',
                background: form.role === role ? '#EFF6FF' : 'white',
                cursor: 'pointer', transition: 'all 0.15s ease',
                fontWeight: 700, textTransform: 'capitalize',
                color: form.role === role ? '#2563EB' : '#64748B',
                fontSize: '0.9rem',
              }}
            >
              {role === 'student' ? '👨‍🎓' : '👩‍🏫'} {role.charAt(0).toUpperCase() + role.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div>
          <label className="input-label">Full name</label>
          <input
            type="text"
            className="input-field"
            placeholder="Your full name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            disabled={isLoading}
          />
        </div>
        <div>
          <label className="input-label">Email address</label>
          <input
            type="email"
            className="input-field"
            placeholder="you@example.com"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            disabled={isLoading}
          />
        </div>
        <div>
          <label className="input-label">Password</label>
          <div style={{ position: 'relative' }}>
            <input
              type={showPassword ? 'text' : 'password'}
              className="input-field"
              placeholder="At least 8 characters"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              disabled={isLoading}
              style={{ paddingRight: 44 }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer' }}
            >
              {showPassword ? <EyeOff size={18} color="#94A3B8" /> : <Eye size={18} color="#94A3B8" />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="btn-primary"
          style={{ justifyContent: 'center', width: '100%', padding: '14px', fontSize: '0.95rem', opacity: isLoading ? 0.7 : 1 }}
        >
          {isLoading ? (
            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.4)', borderTop: '2px solid white', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
              Creating account...
            </span>
          ) : (
            <>
              <UserPlus size={18} />
              Create Account
            </>
          )}
        </button>
      </form>

      <p style={{ fontSize: '0.75rem', color: '#94A3B8', textAlign: 'center', marginTop: 20 }}>
        By signing up you agree to our{' '}
        <span style={{ color: '#2563EB', cursor: 'pointer' }}>Terms</span> and{' '}
        <span style={{ color: '#2563EB', cursor: 'pointer' }}>Privacy Policy</span>.
      </p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
