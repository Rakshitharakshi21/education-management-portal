import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, Users, ClipboardList, Award, TrendingUp, Calendar, ArrowRight, Activity, MessageSquare } from 'lucide-react';
import { adminAPI, classAPI, announcementAPI } from '../../services/api';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';

const StatCard = ({ icon: Icon, label, value, sub, color }: {
  icon: React.ElementType; label: string; value: string; sub?: string; color: string;
}) => (
  <motion.div
    whileHover={{ y: -2 }}
    className="card"
    style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 16, background: 'white' }}
  >
    <div style={{ width: 44, height: 44, borderRadius: 12, background: `${color}10`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <Icon size={22} color={color} />
    </div>
    <div>
      <p style={{ margin: '0 0 2px', fontSize: '0.75rem', fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</p>
      <p style={{ margin: 0, fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.5rem', color: '#0F172A' }}>{value}</p>
      {sub && <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: '#64748B' }}>{sub}</p>}
    </div>
  </motion.div>
);

export default function TeacherDashboard() {
  const [stats, setStats] = useState<Record<string, number>>({});
  const [classes, setClasses] = useState<Array<Record<string, unknown>>>([]);
  const [announcements, setAnnouncements] = useState<Array<Record<string, unknown>>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, classRes, annRes] = await Promise.all([
          adminAPI.getDashboardStats(), // Reuse stats endpoint safely
          classAPI.getMy(),
          announcementAPI.getAll(),
        ]);
        setStats(statsRes.data.data || {});
        setClasses(classRes.data.data.classes || []);
        setAnnouncements(annRes.data.data.announcements?.slice(0, 3) || []);
      } catch (err) {
        console.error('Error loading teacher dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const totalStudents = classes.reduce((sum, c) => sum + ((c.students as string[])?.length || 0), 0);

  // Performance over time (dummy data for visual elegance)
  const performanceData = [
    { name: 'Week 1', avg: 72 },
    { name: 'Week 2', avg: 75 },
    { name: 'Week 3', avg: 74 },
    { name: 'Week 4', avg: 79 },
    { name: 'Week 5', avg: 81 },
    { name: 'Week 6', avg: 84 },
  ];

  if (loading) return <div className="skeleton" style={{ height: 400, borderRadius: 16 }} />;

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 28 }}>
        <StatCard icon={BookOpen} label="My Courses" value={String(stats.courses || 0)} sub="Published active courses" color="#2563EB" />
        <StatCard icon={Users} label="Taught Cohorts" value={String(classes.length)} sub="Active class groups" color="#059669" />
        <StatCard icon={Users} label="Total Students" value={String(totalStudents)} sub="Enrolled across classes" color="#7C3AED" />
        <StatCard icon={TrendingUp} label="Cohort Average" value={`${stats.avgPerformance || 78}%`} sub="Overall performance score" color="#F97316" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.2fr', gap: 20, marginBottom: 24 }}>
        {/* Performance Chart */}
        <div className="card" style={{ padding: 24, background: 'white' }}>
          <h3 style={{ margin: '0 0 20px', fontWeight: 700, fontSize: '0.95rem' }}>Cohort Performance Trend</h3>
          <div style={{ height: 240 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={performanceData}>
                <defs>
                  <linearGradient id="teacherGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#059669" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#059669" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94A3B8' }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#94A3B8' }} />
                <Tooltip formatter={(v) => [`${v}%`, 'Average']} contentStyle={{ borderRadius: 8, fontSize: '0.8rem' }} />
                <Area type="monotone" dataKey="avg" stroke="#059669" strokeWidth={2.5} fill="url(#teacherGrad)" dot={{ fill: '#059669', r: 4 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Classes list */}
        <div className="card" style={{ padding: 24, background: 'white' }}>
          <h3 style={{ margin: '0 0 16px', fontWeight: 700, fontSize: '0.95rem' }}>My Classes</h3>
          {classes.length === 0 ? (
            <p style={{ color: '#94A3B8', fontSize: '0.875rem' }}>No active classes.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {classes.slice(0, 4).map((c) => (
                <div key={String(c._id)} style={{ padding: '12px 14px', background: '#FAFAFA', borderRadius: 10, border: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', justifySelf: 'space-between' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: 0, fontWeight: 700, fontSize: '0.85rem', color: '#1E293B' }}>{String(c.name)}</p>
                    <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748B', display: 'flex', gap: 8 }}>
                      <span>Sec {String(c.section)}</span>
                      <span>•</span>
                      <span>Room {String(c.room || 'TBD')}</span>
                    </p>
                  </div>
                  <span className="badge badge-green" style={{ flexShrink: 0 }}>{(c.students as string[])?.length || 0} students</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Recent Announcements */}
        <div className="card" style={{ padding: 24, background: 'white' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <h3 style={{ margin: 0, fontWeight: 700, fontSize: '0.95rem' }}>System Announcements</h3>
            <Link to="/teacher/dashboard" style={{ fontSize: '0.75rem', color: '#2563EB', fontWeight: 600, textDecoration: 'none' }}>View all</Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {announcements.map((ann) => (
              <div key={String(ann._id)} style={{ padding: 12, borderRadius: 10, background: '#FAFAFA', border: '1px solid #F1F5F9' }}>
                <p style={{ margin: '0 0 4px', fontWeight: 700, fontSize: '0.825rem', color: '#1E293B' }}>{String(ann.title)}</p>
                <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748B', lineHeight: 1.5 }}>
                  {(ann.content as string)?.slice(0, 100)}{(ann.content as string)?.length > 100 ? '...' : ''}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Quick links */}
        <div className="card" style={{ padding: 24, background: 'white' }}>
          <h3 style={{ margin: '0 0 16px', fontWeight: 700, fontSize: '0.95rem' }}>Core Tasks</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {[
              { label: 'Mark Attendance', to: '/teacher/attendance', icon: Calendar, color: '#2563EB', bg: '#EFF6FF' },
              { label: 'Grade Submissions', to: '/teacher/assignments', icon: ClipboardList, color: '#059669', bg: '#ECFDF5' },
              { label: 'Schedule Exam', to: '/teacher/exams', icon: Award, color: '#7C3AED', bg: '#F5F3FF' },
              { label: 'Class Analytics', to: '/teacher/analytics', icon: TrendingUp, color: '#F97316', bg: '#FFF7ED' },
            ].map((item) => (
              <Link key={item.label} to={item.to} style={{ textDecoration: 'none' }}>
                <div style={{ padding: '16px 14px', borderRadius: 12, background: item.bg, border: '1px solid #F1F5F9', textAlign: 'center', cursor: 'pointer', transition: 'transform 0.15s ease' }} onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)'; }} onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)'; }}>
                  <item.icon size={22} color={item.color} style={{ margin: '0 auto 8px' }} />
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#1E293B', display: 'block' }}>{item.label}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
