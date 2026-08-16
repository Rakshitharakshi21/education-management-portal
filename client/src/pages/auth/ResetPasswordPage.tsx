import { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { authAPI } from '../../services/api';
import toast from 'react-hot-toast';

export default function ResetPasswordPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) return toast.error('Passwords do not match.');
    if (password.length < 8) return toast.error('Password must be at least 8 characters.');
    setIsLoading(true);
    try {
      await authAPI.resetPassword(token!, password);
      toast.success('Password reset! Please log in.');
      navigate('/login');
    } catch {
      toast.error('Invalid or expired reset link.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.8rem', color: '#0F172A', margin: '0 0 8px' }}>Set new password</h1>
      <p style={{ color: '#64748B', margin: '0 0 32px' }}>Choose a strong password for your account.</p>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div>
          <label className="input-label">New password</label>
          <input type="password" className="input-field" placeholder="At least 8 characters" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        <div>
          <label className="input-label">Confirm password</label>
          <input type="password" className="input-field" placeholder="Repeat new password" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
        </div>
        <button type="submit" disabled={isLoading} className="btn-primary" style={{ justifyContent: 'center', padding: '14px', opacity: isLoading ? 0.7 : 1 }}>
          {isLoading ? 'Resetting...' : 'Reset password'}
        </button>
      </form>
      <p style={{ textAlign: 'center', marginTop: 20 }}>
        <Link to="/login" style={{ color: '#2563EB', fontSize: '0.875rem' }}>Back to login</Link>
      </p>
    </div>
  );
}
