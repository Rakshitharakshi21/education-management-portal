import { useState } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import {
  GraduationCap, LayoutDashboard, Users, BookOpen, Building2,
  ClipboardList, Award, BarChart3, Brain, TrendingUp, LogOut, Menu, X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/admin/students', icon: Users, label: 'Students' },
  { to: '/admin/teachers', icon: Users, label: 'Teachers' },
  { to: '/admin/courses', icon: BookOpen, label: 'Courses' },
  { to: '/admin/classes', icon: Building2, label: 'Classes' },
  { to: '/admin/assignments', icon: ClipboardList, label: 'Assignments' },
  { to: '/admin/exams', icon: Award, label: 'Exams' },
  { to: '/admin/grades', icon: TrendingUp, label: 'Grades' },
  { to: '/admin/reports', icon: BarChart3, label: 'Reports' },
  { to: '/admin/ai-insights', icon: Brain, label: 'AI Insights', highlight: true },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F8FAFC' }}>
      {sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 40 }} className="lg:hidden" />
      )}

      <aside style={{
        width: 256, flexShrink: 0, background: '#0F172A',
        display: 'flex', flexDirection: 'column',
        position: 'fixed', top: 0, left: 0, height: '100vh', zIndex: 50,
      }}
        className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 transition-transform duration-300`}
      >
        <div style={{ padding: '24px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 9, background: 'linear-gradient(135deg, #2563EB, #7C3AED)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <GraduationCap size={20} color="white" />
            </div>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.1rem', color: 'white' }}>
              Edu<span style={{ color: '#60A5FA' }}>Portal</span>
            </span>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            <X size={18} color="white" />
          </button>
        </div>

        <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {user?.avatar ? (
              <img src={user.avatar} alt={user.name} className="avatar" style={{ width: 40, height: 40 }} />
            ) : (
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg, #2563EB, #7C3AED)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700 }}>
                {user?.name?.charAt(0)}
              </div>
            )}
            <div>
              <p style={{ margin: 0, fontWeight: 700, fontSize: '0.875rem', color: 'white' }}>{user?.name}</p>
              <p style={{ margin: 0, fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>Administrator</p>
            </div>
          </div>
        </div>

        <nav style={{ flex: 1, padding: '12px 12px', overflowY: 'auto' }}>
          <p style={{ padding: '8px 8px 4px', fontSize: '0.7rem', fontWeight: 700, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Administration</p>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '10px 14px', borderRadius: 10, marginBottom: 2,
                fontWeight: 500, fontSize: '0.875rem', textDecoration: 'none',
                color: isActive ? 'white' : 'rgba(255,255,255,0.5)',
                background: isActive ? 'rgba(37, 99, 235, 0.25)' : 'transparent',
                transition: 'all 0.15s ease',
              })}
            >
              {({ isActive }) => (
                <>
                  <item.icon size={18} color={isActive ? '#60A5FA' : 'rgba(255,255,255,0.4)'} />
                  <span>{item.label}</span>
                  {item.highlight && (
                    <span style={{ marginLeft: 'auto', padding: '2px 7px', borderRadius: 20, background: 'linear-gradient(135deg, #7C3AED, #2563EB)', color: 'white', fontSize: '0.65rem', fontWeight: 700 }}>AI</span>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div style={{ padding: '12px 12px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <button onClick={logout} style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '10px 14px', borderRadius: 10, width: '100%',
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'rgba(255,100,100,0.8)', fontSize: '0.875rem', fontWeight: 500,
          }}>
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }} className="ml-0 lg:ml-64">
        <header style={{ position: 'sticky', top: 0, zIndex: 30, background: 'rgba(248, 250, 252, 0.95)', backdropFilter: 'blur(8px)', borderBottom: '1px solid #F1F5F9', padding: '14px 24px', display: 'flex', alignItems: 'center', gap: 16 }}>
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            <Menu size={22} color="#475569" />
          </button>
          <div>
            <p style={{ margin: 0, fontWeight: 700, color: '#1E293B', fontSize: '0.95rem', fontFamily: 'var(--font-display)' }}>
              Admin Control Center 🛡️
            </p>
            <p style={{ margin: 0, fontSize: '0.75rem', color: '#94A3B8' }}>
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
          </div>
        </header>

        <main style={{ flex: 1, padding: '28px 24px' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
