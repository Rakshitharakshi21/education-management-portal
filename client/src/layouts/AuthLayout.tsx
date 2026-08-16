import { Outlet, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GraduationCap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AuthLayout() {
  const { isAuthenticated, user, isLoading } = useAuth();

  if (isLoading) return null;
  if (isAuthenticated && user) return <Navigate to={`/${user.role}/dashboard`} replace />;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: 'var(--color-cream)' }}>
      {/* Left panel — decorative */}
      <div
        className="hidden lg:flex"
        style={{
          width: '45%', flexDirection: 'column', justifyContent: 'space-between',
          background: '#0F172A', padding: '48px', position: 'relative', overflow: 'hidden',
        }}
      >
        {/* Background grid */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'linear-gradient(rgba(37, 99, 235, 0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(37, 99, 235, 0.08) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }} />

        {/* Accent shapes */}
        <div style={{ position: 'absolute', top: -100, right: -100, width: 300, height: 300, borderRadius: '50%', background: 'rgba(37, 99, 235, 0.12)', filter: 'blur(60px)' }} />
        <div style={{ position: 'absolute', bottom: -80, left: -60, width: 250, height: 250, borderRadius: '50%', background: 'rgba(124, 58, 237, 0.12)', filter: 'blur(50px)' }} />

        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', position: 'relative', zIndex: 1 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg, #2563EB, #7C3AED)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <GraduationCap size={24} color="white" />
          </div>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.4rem', color: 'white', letterSpacing: '-0.02em' }}>
            Edu<span style={{ color: '#60A5FA' }}>Portal</span>
          </span>
        </Link>

        <div style={{ position: 'relative', zIndex: 1 }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
              {['10K+ Students', '250+ Courses', '94% Satisfaction'].map((stat) => (
                <span key={stat} style={{
                  padding: '4px 12px', borderRadius: 20,
                  background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)',
                  color: 'rgba(255,255,255,0.7)', fontSize: '0.75rem', fontWeight: 500,
                }}>
                  {stat}
                </span>
              ))}
            </div>

            <h1 style={{
              fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'clamp(2rem, 3vw, 3rem)',
              color: 'white', lineHeight: 1.15, letterSpacing: '-0.03em', margin: '0 0 20px',
            }}>
              Learn Smarter.<br />
              <span style={{ color: '#60A5FA' }}>Grow Further.</span>
            </h1>

            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '1rem', lineHeight: 1.7, maxWidth: 360 }}>
              Join thousands of students using AI-powered insights to unlock their academic potential. Your next breakthrough starts here.
            </p>
          </motion.div>

          {/* Floating stats cards */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            style={{ marginTop: 40, display: 'flex', flexDirection: 'column', gap: 12 }}
          >
            {[
              { label: 'Overall Performance', value: '84%', change: '+11%', color: '#10B981' },
              { label: 'Attendance Rate', value: '92%', change: '+3%', color: '#3B82F6' },
              { label: 'Assignments Done', value: '18/20', change: '2 pending', color: '#F59E0B' },
            ].map((item) => (
              <div key={item.label} style={{
                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 12, padding: '14px 18px',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}>
                <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem' }}>{item.label}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ color: 'white', fontWeight: 700, fontFamily: 'var(--font-display)' }}>{item.value}</span>
                  <span style={{ color: item.color, fontSize: '0.75rem', fontWeight: 600 }}>{item.change}</span>
                </div>
              </div>
            ))}
          </motion.div>
        </div>

        <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.8rem', position: 'relative', zIndex: 1 }}>
          © 2025 EduPortal. All rights reserved.
        </p>
      </div>

      {/* Right panel — form */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
        <div style={{ width: '100%', maxWidth: 440 }}>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Mobile logo */}
            <div className="lg:hidden" style={{ marginBottom: 32, display: 'flex', justifyContent: 'center' }}>
              <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
                <div style={{ width: 36, height: 36, borderRadius: 8, background: 'linear-gradient(135deg, #2563EB, #7C3AED)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <GraduationCap size={20} color="white" />
                </div>
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.2rem', color: '#0F172A' }}>
                  Edu<span style={{ color: '#2563EB' }}>Portal</span>
                </span>
              </Link>
            </div>
            <Outlet />
          </motion.div>
        </div>
      </div>
    </div>
  );
}
