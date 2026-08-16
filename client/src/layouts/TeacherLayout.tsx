import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import {
  GraduationCap, LayoutDashboard, BookOpen, Users,
  ClipboardList, Calendar, BarChart3, Award, LogOut, Menu, X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { to: '/teacher/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/teacher/courses', icon: BookOpen, label: 'My Courses' },
  { to: '/teacher/classes', icon: Users, label: 'Classes' },
  { to: '/teacher/students', icon: Users, label: 'Students' },
  { to: '/teacher/attendance', icon: Calendar, label: 'Attendance' },
  { to: '/teacher/assignments', icon: ClipboardList, label: 'Assignments' },
  { to: '/teacher/exams', icon: Award, label: 'Exams' },
  { to: '/teacher/analytics', icon: BarChart3, label: 'Analytics' },
];

export default function TeacherLayout() {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F8FAFC' }}>
      {sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 40 }} className="lg:hidden" />
      )}

      <aside style={{
        width: 256, flexShrink: 0, background: 'white',
        borderRight: '1px solid #F1F5F9', display: 'flex', flexDirection: 'column',
        position: 'fixed', top: 0, left: 0, height: '100vh', zIndex: 50,
      }}
        className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 transition-transform duration-300`}
      >
        <div style={{ padding: '24px 20px', borderBottom: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 9, background: 'linear-gradient(135deg, #059669, #2563EB)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <GraduationCap size={20} color="white" />
            </div>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.1rem', color: '#0F172A' }}>
              Edu<span style={{ color: '#059669' }}>Portal</span>
            </span>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            <X size={18} />
          </button>
        </div>

        <div style={{ padding: '16px 20px', borderBottom: '1px solid #F1F5F9' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {user?.avatar ? (
              <img src={user.avatar} alt={user.name} className="avatar" style={{ width: 40, height: 40 }} />
            ) : (
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg, #059669, #2563EB)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700 }}>
                {user?.name?.charAt(0)}
              </div>
            )}
            <div>
              <p style={{ margin: 0, fontWeight: 700, fontSize: '0.875rem', color: '#1E293B' }}>{user?.name}</p>
              <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748B' }}>Teacher</p>
            </div>
          </div>
        </div>

        <nav style={{ flex: 1, padding: '12px 12px', overflowY: 'auto' }}>
          <p style={{ padding: '8px 8px 4px', fontSize: '0.7rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Teaching</p>
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
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div style={{ padding: '12px 12px', borderTop: '1px solid #F1F5F9' }}>
          <button onClick={logout} className="sidebar-item" style={{ width: '100%', color: '#EF4444' }}>
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
              Welcome back, {user?.name?.split(' ')[0]} 👩‍🏫
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
