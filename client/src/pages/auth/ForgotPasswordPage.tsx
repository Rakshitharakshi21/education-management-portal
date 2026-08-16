import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, AlertCircle, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { authAPI } from '../../services/api';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return setError('Please enter your email.');
    setError('');
    setIsLoading(true);
    try {
      await authAPI.forgotPassword(email);
      setSent(true);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#64748B', fontSize: '0.875rem', fontWeight: 500, textDecoration: 'none', marginBottom: 28 }}>
        <ArrowLeft size={16} />
        Back to login
      </Link>

      <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.8rem', color: '#0F172A', letterSpacing: '-0.02em', margin: '0 0 8px' }}>
        Reset password
      </h1>
      <p style={{ color: '#64748B', margin: '0 0 32px', fontSize: '0.95rem' }}>
        Enter your email and we'll send you a reset link.
      </p>

      {sent ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{ padding: '24px', background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 14, textAlign: 'center' }}
        >
          <CheckCircle size={40} color="#10B981" style={{ marginBottom: 12 }} />
          <h3 style={{ margin: '0 0 8px', color: '#065F46', fontWeight: 700 }}>Check your email!</h3>
          <p style={{ margin: 0, color: '#047857', fontSize: '0.9rem' }}>
            If an account with <strong>{email}</strong> exists, you'll receive a reset link shortly.
          </p>
        </motion.div>
      ) : (
        <>
          {error && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', background: '#FEE2E2', borderRadius: 10, marginBottom: 20 }}>
              <AlertCircle size={16} color="#EF4444" />
              <p style={{ margin: 0, color: '#991B1B', fontSize: '0.875rem' }}>{error}</p>
            </div>
          )}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div>
              <label className="input-label">Email address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} color="#94A3B8" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="email" className="input-field"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ paddingLeft: 42 }}
                />
              </div>
            </div>
            <button type="submit" disabled={isLoading} className="btn-primary" style={{ justifyContent: 'center', padding: '14px', opacity: isLoading ? 0.7 : 1 }}>
              {isLoading ? 'Sending...' : 'Send reset link'}
            </button>
          </form>
        </>
      )}
    </div>
  );
}
