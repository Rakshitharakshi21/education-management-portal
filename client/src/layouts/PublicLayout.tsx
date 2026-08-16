import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { GraduationCap, Menu, X, Bell, ChevronDown, BookOpen, Users, Phone, LogIn } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { notificationAPI } from '../services/api';

export default function PublicLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      notificationAPI.getAll({ limit: 1 }).then((res) => {
        setUnreadCount(res.data.data.unreadCount || 0);
      }).catch(() => {});
    }
  }, [isAuthenticated]);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/courses', label: 'Courses', icon: BookOpen },
    { href: '/contact', label: 'Contact', icon: Phone },
  ];

  const isActive = (href: string) => href === '/' ? location.pathname === '/' : location.pathname.startsWith(href);

  const getDashboardLink = () => {
    if (!user) return '/login';
    return `/${user.role}/dashboard`;
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-cream)' }}>
      {/* Navbar */}
      <header style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        transition: 'all 0.3s ease',
        background: scrolled ? 'rgba(250, 250, 247, 0.95)' : 'transparent',
        backdropFilter: scrolled ? 'blur(12px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(226, 232, 240, 0.8)' : '1px solid transparent',
      }}>
        <div className="container-2xl" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 72 }}>
          {/* Logo */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <div style={{
              width: 40, height: 40, borderRadius: 10,
              background: 'linear-gradient(135deg, #2563EB, #7C3AED)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <GraduationCap size={22} color="white" />
            </div>
            <div>
              <span style={{
                fontFamily: 'var(--font-display)', fontWeight: 800,
                fontSize: '1.2rem', color: '#0F172A', letterSpacing: '-0.02em',
              }}>Edu<span style={{ color: '#2563EB' }}>Portal</span></span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: 4 }} className="hidden md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                style={{
                  padding: '8px 16px',
                  borderRadius: 8,
                  fontWeight: 500,
                  fontSize: '0.9rem',
                  textDecoration: 'none',
                  transition: 'all 0.15s ease',
                  color: isActive(link.href) ? '#2563EB' : '#475569',
                  background: isActive(link.href) ? '#EFF6FF' : 'transparent',
                }}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }} className="hidden md:flex">
            {isAuthenticated && user ? (
              <>
                {unreadCount > 0 && (
                  <div style={{ position: 'relative', cursor: 'pointer' }}
                    onClick={() => navigate(getDashboardLink())}>
                    <Bell size={20} color="#475569" />
                    <span style={{
                      position: 'absolute', top: -6, right: -6,
                      background: '#EF4444', color: 'white',
                      fontSize: '0.65rem', fontWeight: 700,
                      width: 16, height: 16, borderRadius: '50%',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>{unreadCount > 9 ? '9+' : unreadCount}</span>
                  </div>
                )}
                <div
                  style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', padding: '6px 12px', borderRadius: 8, border: '1px solid #E2E8F0' }}
                  onClick={() => navigate(getDashboardLink())}
                >
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.name} className="avatar" style={{ width: 28, height: 28 }} />
                  ) : (
                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '0.75rem', fontWeight: 700 }}>
                      {user.name.charAt(0)}
                    </div>
                  )}
                  <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#1E293B' }}>{user.name.split(' ')[0]}</span>
                  <ChevronDown size={14} color="#64748B" />
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="btn-ghost" style={{ color: '#475569' }}>
                  <LogIn size={16} />
                  Log in
                </Link>
                <Link to="/register" className="btn-primary" style={{ padding: '10px 20px' }}>
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 8, display: 'flex', alignItems: 'center' }}
            className="md:hidden"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              style={{ background: 'white', borderTop: '1px solid #F1F5F9', padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: 8 }}
            >
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  style={{
                    padding: '12px 16px', borderRadius: 8, fontWeight: 500,
                    textDecoration: 'none', color: isActive(link.href) ? '#2563EB' : '#475569',
                    background: isActive(link.href) ? '#EFF6FF' : 'transparent',
                  }}
                >
                  {link.label}
                </Link>
              ))}
              <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: 12, marginTop: 4, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {isAuthenticated ? (
                  <Link to={getDashboardLink()} className="btn-primary" style={{ textAlign: 'center', justifyContent: 'center' }}>
                    Go to Dashboard
                  </Link>
                ) : (
                  <>
                    <Link to="/login" style={{ padding: '12px 16px', textAlign: 'center', borderRadius: 8, border: '1px solid #E2E8F0', color: '#475569', textDecoration: 'none', fontWeight: 600 }}>
                      Log in
                    </Link>
                    <Link to="/register" className="btn-primary" style={{ textAlign: 'center', justifyContent: 'center' }}>
                      Get Started
                    </Link>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Main content */}
      <main style={{ paddingTop: 72 }}>
        <Outlet />
      </main>
    </div>
  );
}
