import { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GraduationCap, LayoutDashboard, BookOpen, ClipboardList, Calendar,
  BarChart3, Brain, Award, Bell, LogOut, User, Menu, X, ChevronDown,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { notificationAPI } from '../services/api';

const navItems = [
  { to: '/student/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/student/courses', icon: BookOpen, label: 'My Courses' },
  { to: '/student/assignments', icon: ClipboardList, label: 'Assignments' },
  { to: '/student/attendance', icon: Calendar, label: 'Attendance' },
  { to: '/student/exams', icon: Award, label: 'Exams' },
  { to: '/student/grades', icon: BarChart3, label: 'Grades' },
  { to: '/student/progress', icon: Brain, label: 'AI Progress', highlight: true },
];

export default function StudentLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<Array<{ _id: string; title: string; message: string; read: boolean }>>([]);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    notificationAPI.getAll({ limit: 8 }).then((res) => {
      const data = res.data.data;
      setUnreadCount(data.unreadCount || 0);
      setNotifications(data.notifications || []);
    }).catch(() => {});
  }, []);

  const markAllRead = async () => {
    await notificationAPI.markAllRead();
    setUnreadCount(0);
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F8FAFC' }}>
      {/* Sidebar */}
      <AnimatePresence>
        {(sidebarOpen || typeof window !== 'undefined' && window.innerWidth >= 1024) && (
          <>
            {/* Mobile overlay */}
            {sidebarOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSidebarOpen(false)}
                style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 40 }}
                className="lg:hidden"
              />
            )}
          </>
        )}
      </AnimatePresence>

      <aside style={{
        width: 256, flexShrink: 0, background: 'white',
        borderRight: '1px solid #F1F5F9', display: 'flex', flexDirection: 'column',
        position: 'fixed', top: 0, left: 0, height: '100vh', zIndex: 50,
        transform: sidebarOpen ? 'translateX(0)' : undefined,
      }}
        className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 transition-transform duration-300`}
      >
        {/* Logo */}
        <div style={{ padding: '24px 20px', borderBottom: '1px solid #F1F5F9' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: 9, background: 'linear-gradient(135deg, #2563EB, #7C3AED)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <GraduationCap size={20} color="white" />
              </div>
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.1rem', color: '#0F172A' }}>
                Edu<span style={{ color: '#2563EB' }}>Portal</span>
              </span>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
              <X size={18} color="#94A3B8" />
            </button>
          </div>
        </div>

        {/* Student info */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #F1F5F9' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {user?.avatar ? (
              <img src={user.avatar} alt={user.name} className="avatar" style={{ width: 40, height: 40 }} />
            ) : (
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg, #2563EB, #7C3AED)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700 }}>
                {user?.name?.charAt(0)}
              </div>
            )}
            <div>
              <p style={{ margin: 0, fontWeight: 700, fontSize: '0.875rem', color: '#1E293B' }}>{user?.name}</p>
              <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748B' }}>Student</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, padding: '12px 12px', overflowY: 'auto' }}>
          <p style={{ padding: '8px 8px 4px', fontSize: '0.7rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Learning
          </p>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}
              style={{ marginBottom: 2 }}
            >
              {({ isActive }) => (
                <>
                  <item.icon size={18} color={isActive ? '#2563EB' : '#94A3B8'} />
                  <span>{item.label}</span>
                  {item.highlight && (
                    <span style={{
                      marginLeft: 'auto', padding: '2px 7px', borderRadius: 20,
                      background: 'linear-gradient(135deg, #7C3AED, #2563EB)',
                      color: 'white', fontSize: '0.65rem', fontWeight: 700,
                    }}>AI</span>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div style={{ padding: '12px 12px', borderTop: '1px solid #F1F5F9' }}>
          <button onClick={logout} className="sidebar-item" style={{ width: '100%', gap: 10, color: '#EF4444' }}>
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh' }} className="ml-0 lg:ml-64">
        {/* Top bar */}
        <header style={{ position: 'sticky', top: 0, zIndex: 30, background: 'rgba(248, 250, 252, 0.95)', backdropFilter: 'blur(8px)', borderBottom: '1px solid #F1F5F9', padding: '12px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 6 }}>
              <Menu size={22} color="#475569" />
            </button>
            <div>
              <p style={{ margin: 0, fontWeight: 700, color: '#1E293B', fontSize: '0.95rem', fontFamily: 'var(--font-display)' }}>
                {greeting}, {user?.name?.split(' ')[0]} 👋
              </p>
              <p style={{ margin: 0, fontSize: '0.75rem', color: '#94A3B8' }}>
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, position: 'relative' }}>
            {/* Notifications */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                style={{ background: 'white', border: '1px solid #E2E8F0', borderRadius: 10, padding: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', position: 'relative' }}
              >
                <Bell size={18} color="#475569" />
                {unreadCount > 0 && (
                  <span style={{ position: 'absolute', top: -4, right: -4, background: '#EF4444', color: 'white', fontSize: '0.6rem', fontWeight: 700, width: 15, height: 15, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              <AnimatePresence>
                {showNotifications && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                    style={{
                      position: 'absolute', right: 0, top: 'calc(100% + 8px)',
                      width: 340, background: 'white',
                      border: '1px solid #F1F5F9', borderRadius: 16,
                      boxShadow: '0 20px 60px rgba(0,0,0,0.12)', zIndex: 100,
                    }}
                  >
                    <div style={{ padding: '16px 20px', borderBottom: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <h3 style={{ margin: 0, fontWeight: 700, fontSize: '0.95rem' }}>Notifications</h3>
                      {unreadCount > 0 && (
                        <button onClick={markAllRead} style={{ background: 'none', border: 'none', color: '#2563EB', fontWeight: 600, fontSize: '0.75rem', cursor: 'pointer' }}>
                          Mark all read
                        </button>
                      )}
                    </div>
                    <div style={{ maxHeight: 320, overflowY: 'auto' }}>
                      {notifications.length === 0 ? (
                        <p style={{ padding: 20, color: '#94A3B8', textAlign: 'center', fontSize: '0.875rem' }}>You're all caught up! 🎉</p>
                      ) : notifications.map((n) => (
                        <div key={n._id} style={{
                          padding: '14px 20px',
                          borderBottom: '1px solid #F8FAFC',
                          background: n.read ? 'transparent' : '#FAFCFF',
                          cursor: 'pointer',
                        }}>
                          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                            {!n.read && <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#2563EB', marginTop: 6, flexShrink: 0 }} />}
                            <div style={{ flex: 1 }}>
                              <p style={{ margin: '0 0 2px', fontWeight: 600, fontSize: '0.8rem', color: '#1E293B' }}>{n.title}</p>
                              <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748B', lineHeight: 1.5 }}>{n.message}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* User menu */}
            <button
              onClick={() => navigate('/student/dashboard')}
              style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'white', border: '1px solid #E2E8F0', borderRadius: 10, padding: '6px 12px', cursor: 'pointer' }}
            >
              {user?.avatar ? (
                <img src={user.avatar} alt={user.name} className="avatar" style={{ width: 28, height: 28 }} />
              ) : (
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '0.75rem', fontWeight: 700 }}>
                  {user?.name?.charAt(0)}
                </div>
              )}
              <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#1E293B' }} className="hidden sm:block">
                {user?.name?.split(' ')[0]}
              </span>
              <ChevronDown size={14} color="#94A3B8" />
            </button>
          </div>
        </header>

        {/* Page content */}
        <main style={{ flex: 1, padding: '28px 24px' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
