import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { adminAPI } from '../../services/api';
import { BookOpen, Users, ClipboardList, Award, ShieldAlert, Activity, Calendar, HelpCircle } from 'lucide-react';
import { format } from 'date-fns';

const StatCard = ({ icon: Icon, label, value, color }: {
  icon: React.ElementType; label: string; value: string; color: string;
}) => (
  <div className="card" style={{ padding: '20px 24px', display: 'flex', gap: 16, alignItems: 'center', background: 'white' }}>
    <div style={{ width: 44, height: 44, borderRadius: 12, background: `${color}10`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <Icon size={22} color={color} />
    </div>
    <div>
      <span style={{ display: 'block', fontSize: '0.72rem', color: '#94A3B8', fontWeight: 600, textTransform: 'uppercase' }}>{label}</span>
      <span style={{ fontSize: '1.4rem', fontWeight: 800, color: '#1E293B', fontFamily: 'var(--font-display)' }}>{value}</span>
    </div>
  </div>
);

interface AuditLog {
  _id: string;
  action: string;
  description: string;
  createdAt: string;
  user?: {
    name: string;
    role: string;
  };
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Record<string, number>>({});
  const [activity, setActivity] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [statsRes, actRes] = await Promise.all([
          adminAPI.getDashboardStats(),
          adminAPI.getActivityFeed({ limit: 6 }),
        ]);
        setStats(statsRes.data.data || {});
        setActivity(actRes.data.data.results || []);
      } catch {
        console.error('Error loading admin dashboard stats');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <div className="skeleton" style={{ height: 400, borderRadius: 16 }} />;

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 28 }}>
        <StatCard icon={Users} label="Total Students" value={String(stats.students || 0)} color="#2563EB" />
        <StatCard icon={Users} label="Instructors" value={String(stats.teachers || 0)} color="#059669" />
        <StatCard icon={BookOpen} label="Published Courses" value={String(stats.courses || 0)} color="#7C3AED" />
        <StatCard icon={Calendar} label="Active Classes" value={String(stats.classes || 0)} color="#F97316" />
        <StatCard icon={ClipboardList} label="Assignments" value={String(stats.assignments || 0)} color="#0891B2" />
        <StatCard icon={Award} label="Online Exams" value={String(stats.exams || 0)} color="#DC2626" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1.2fr', gap: 24 }}>
        {/* Activity feed */}
        <div className="card" style={{ padding: 24, background: 'white' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <Activity size={20} color="#2563EB" />
            <h3 style={{ margin: 0, fontWeight: 800, fontSize: '1.05rem', fontFamily: 'var(--font-display)' }}>System Audit Trails</h3>
          </div>
          
          {activity.length === 0 ? (
            <p style={{ color: '#94A3B8', fontSize: '0.85rem' }}>No activity records.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {activity.map((log) => (
                <div key={log._id} style={{ display: 'flex', gap: 14, alignItems: 'flex-start', paddingBottom: 12, borderBottom: '1px solid #F8FAFC' }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: 8,
                    background: log.action === 'CREATE' ? '#ECFDF5' : log.action === 'DELETE' ? '#FEF2F2' : '#EFF6FF',
                    color: log.action === 'CREATE' ? '#10B981' : log.action === 'DELETE' ? '#EF4444' : '#2563EB',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 800, flexShrink: 0
                  }}>
                    {log.action.charAt(0)}
                  </div>
                  <div>
                    <p style={{ margin: '0 0 2px', fontSize: '0.825rem', fontWeight: 700, color: '#1E293B' }}>{log.description}</p>
                    <p style={{ margin: 0, fontSize: '0.72rem', color: '#94A3B8', display: 'flex', gap: 8 }}>
                      <span>Performed by: {log.user?.name || 'System'} ({log.user?.role || 'admin'})</span>
                      <span>•</span>
                      <span>{format(new Date(log.createdAt), 'PPp')}</span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Security Overview */}
        <div className="card" style={{ padding: 24, background: 'white', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <ShieldAlert size={20} color="#DC2626" />
              <h3 style={{ margin: 0, fontWeight: 800, fontSize: '1.05rem', fontFamily: 'var(--font-display)' }}>Security Standing</h3>
            </div>
            <p style={{ color: '#475569', fontSize: '0.85rem', lineHeight: 1.6, marginBottom: 20 }}>
              All nodes are running optimally. JWT token keys are active with a 7-day expiration cycle. Rate limits are set to 500 requests per 15 minutes window.
            </p>
          </div>

          <div style={{ padding: '16px 20px', background: '#F8FAFC', borderRadius: 12, border: '1px solid #E2E8F0' }}>
            <span style={{ display: 'block', fontSize: '0.72rem', color: '#94A3B8', textTransform: 'uppercase', fontWeight: 700 }}>Host Database</span>
            <span style={{ fontSize: '1rem', fontWeight: 800, color: '#1E293B' }}>MongoDB Cluster (Local)</span>
            <span className="badge badge-green" style={{ marginLeft: 8 }}>Online</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
