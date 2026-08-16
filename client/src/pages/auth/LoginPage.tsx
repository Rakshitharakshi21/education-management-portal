import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, LogIn, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return setError('Please enter your email and password.');
    setError('');
    setIsLoading(true);
    try {
      await login(email, password);
      toast.success('Welcome back! 🎉');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Login failed. Please check your credentials.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const demoLogins = [
    { label: 'Admin', email: 'admin@eduportal.com', password: 'Admin@123', color: '#7C3AED' },
    { label: 'Teacher', email: 'priya.sharma@eduportal.com', password: 'Teacher@123', color: '#059669' },
    { label: 'Student', email: 'arjun.kumar@student.com', password: 'Student@123', color: '#2563EB' },
  ];

  const loginAs = async (email: string, password: string) => {
    setEmail(email);
    setPassword(password);
    setError('');
    setIsLoading(true);
    try {
      await login(email, password);
      toast.success('Welcome back! 🎉');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Login failed.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.8rem', color: '#0F172A', letterSpacing: '-0.02em', margin: '0 0 6px' }}>
        Welcome back
      </h1>
      <p style={{ color: '#64748B', margin: '0 0 32px', fontSize: '0.95rem' }}>
        Sign in to continue your learning journey.{' '}
        <Link to="/register" style={{ color: '#2563EB', fontWeight: 600, textDecoration: 'none' }}>Create account</Link>
      </p>

      {/* Demo login buttons */}
      <div style={{ marginBottom: 28 }}>
        <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 10px' }}>
          Quick Demo Login
        </p>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {demoLogins.map((d) => (
            <button
              key={d.label}
              onClick={() => loginAs(d.email, d.password)}
              disabled={isLoading}
              style={{
                flex: 1, minWidth: 80, padding: '10px 12px', borderRadius: 10,
                border: `1.5px solid ${d.color}20`,
                background: `${d.color}08`,
                color: d.color, fontWeight: 700, fontSize: '0.8rem',
                cursor: 'pointer', transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => { (e.target as HTMLButtonElement).style.background = `${d.color}15`; }}
              onMouseLeave={(e) => { (e.target as HTMLButtonElement).style.background = `${d.color}08`; }}
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
        <div style={{ flex: 1, height: 1, background: '#F1F5F9' }} />
        <span style={{ fontSize: '0.8rem', color: '#94A3B8', fontWeight: 500 }}>or sign in manually</span>
        <div style={{ flex: 1, height: 1, background: '#F1F5F9' }} />
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', background: '#FEE2E2', border: '1px solid #FECACA', borderRadius: 10, marginBottom: 20 }}
        >
          <AlertCircle size={16} color="#EF4444" />
          <p style={{ margin: 0, color: '#991B1B', fontSize: '0.875rem', fontWeight: 500 }}>{error}</p>
        </motion.div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div>
          <label className="input-label">Email address</label>
          <input
            type="email"
            className="input-field"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            disabled={isLoading}
          />
        </div>

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <label className="input-label" style={{ marginBottom: 0 }}>Password</label>
            <Link to="/forgot-password" style={{ fontSize: '0.8rem', color: '#2563EB', fontWeight: 600, textDecoration: 'none' }}>
              Forgot password?
            </Link>
          </div>
          <div style={{ position: 'relative' }}>
            <input
              type={showPassword ? 'text' : 'password'}
              className="input-field"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
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
              Signing in...
            </span>
          ) : (
            <>
              <LogIn size={18} />
              Sign in
            </>
          )}
        </button>
      </form>

      <p style={{ textAlign: 'center', color: '#94A3B8', fontSize: '0.8rem', marginTop: 24 }}>
        Don't have an account?{' '}
        <Link to="/register" style={{ color: '#2563EB', fontWeight: 600, textDecoration: 'none' }}>
          Sign up for free
        </Link>
      </p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
