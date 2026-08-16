import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { attendanceAPI } from '../../services/api';
import { Calendar, AlertTriangle, CheckCircle, Clock, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function StudentAttendance() {
  const [summary, setSummary] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    attendanceAPI.getMySummary().then((res) => {
      setSummary(res.data.data || {});
    }).finally(() => setLoading(false));
  }, []);

  const pct = (summary.percentage as number) || 0;
  const byCourse = summary.byCourse as Record<string, { courseName: string; total: number; present: number; late: number; absent: number; percentage: number }> || {};
  const records = summary.records as any[] || [];

  const courseData = Object.values(byCourse).map((c) => ({
    name: c.courseName.split(' ').slice(0, 2).join(' '),
    present: c.present,
    late: c.late,
    absent: c.absent,
    percentage: c.percentage,
  }));

  if (loading) return <div className="skeleton" style={{ height: 400, borderRadius: 16 }} />;

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
      <h1 style={{ margin: '0 0 24px', fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.5rem', color: '#0F172A' }}>Attendance</h1>

      {/* Status banner */}
      <div style={{
        padding: '20px 24px', borderRadius: 16, marginBottom: 24,
        background: pct >= 75 ? 'linear-gradient(135deg, #ECFDF5, #F0FDF4)' : 'linear-gradient(135deg, #FFF5F5, #FEF2F2)',
        border: `1px solid ${pct >= 75 ? '#BBF7D0' : '#FECACA'}`,
        display: 'flex', alignItems: 'center', gap: 20,
      }}>
        <div style={{
          width: 64, height: 64, borderRadius: '50%',
          background: pct >= 75 ? '#10B981' : '#EF4444',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          {pct >= 75
            ? <CheckCircle size={28} color="white" />
            : <AlertTriangle size={28} color="white" />}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 4 }}>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '2rem', color: pct >= 75 ? '#065F46' : '#991B1B' }}>
              {pct}%
            </span>
            <span style={{ color: pct >= 75 ? '#047857' : '#B91C1C', fontWeight: 600, fontSize: '0.9rem' }}>
              Overall Attendance
            </span>
          </div>
          <p style={{ margin: 0, color: pct >= 75 ? '#059669' : '#DC2626', fontSize: '0.85rem' }}>
            {pct >= 75
              ? '✅ You are meeting attendance requirements. Keep it up!'
              : `⚠️ Your attendance is ${75 - pct}% below the required 75% threshold. Attend classes regularly.`}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 20, textAlign: 'center', flexShrink: 0 }}>
          {[
            { label: 'Present', val: summary.present, color: '#10B981' },
            { label: 'Late', val: summary.late, color: '#F59E0B' },
            { label: 'Absent', val: summary.absent, color: '#EF4444' },
          ].map((item) => (
            <div key={item.label}>
              <p style={{ margin: 0, fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.4rem', color: item.color }}>{String(item.val || 0)}</p>
              <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748B' }}>{item.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Course breakdown chart */}
      {courseData.length > 0 && (
        <div className="card" style={{ padding: '24px', marginBottom: 24 }}>
          <h3 style={{ margin: '0 0 20px', fontWeight: 700, fontSize: '0.95rem' }}>Attendance by Course</h3>
          <div style={{ height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={courseData} barSize={24}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94A3B8' }} />
                <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} unit="%" />
                <Tooltip formatter={(v) => [`${v}%`, 'Attendance']} contentStyle={{ borderRadius: 8, fontSize: '0.8rem' }} />
                <Bar dataKey="percentage" radius={[6, 6, 0, 0]}>
                  {courseData.map((entry) => (
                    <Cell key={entry.name} fill={entry.percentage >= 75 ? '#10B981' : entry.percentage >= 60 ? '#F59E0B' : '#EF4444'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12, marginTop: 20 }}>
            {Object.values(byCourse).map((c) => (
              <div key={c.courseName} style={{ padding: '12px 16px', background: '#FAFAFA', borderRadius: 10, border: '1px solid #F1F5F9' }}>
                <p style={{ margin: '0 0 6px', fontWeight: 700, fontSize: '0.8rem', color: '#1E293B' }}>{c.courseName}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div className="progress-bar" style={{ flex: 1, height: 6 }}>
                    <div style={{ height: '100%', borderRadius: 3, background: c.percentage >= 75 ? '#10B981' : '#EF4444', width: `${c.percentage}%` }} />
                  </div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: c.percentage >= 75 ? '#059669' : '#DC2626' }}>{c.percentage}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent records */}
      {records.length > 0 && (
        <div className="card" style={{ padding: '24px' }}>
          <h3 style={{ margin: '0 0 16px', fontWeight: 700, fontSize: '0.95rem' }}>Recent Records</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {records.slice(0, 20).map((r) => {
              const statusColors = { present: '#10B981', late: '#F59E0B', absent: '#EF4444' };
              const status = r.status as keyof typeof statusColors;
              return (
                <div key={String(r._id)} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '10px 14px', borderRadius: 10, background: '#FAFAFA', border: '1px solid #F1F5F9' }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: statusColors[status] || '#94A3B8', flexShrink: 0 }} />
                  <Calendar size={14} color="#94A3B8" />
                  <span style={{ flex: 1, fontSize: '0.8rem', color: '#475569' }}>
                    {format(new Date(r.date as string), 'EEEE, MMMM d, yyyy')}
                  </span>
                  {r.sessionTopic && (
                    <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>{String(r.sessionTopic)}</span>
                  )}
                  <span className={`badge badge-${status === 'present' ? 'green' : status === 'late' ? 'amber' : 'red'}`} style={{ textTransform: 'capitalize' }}>
                    {r.status === 'present' && <CheckCircle size={10} />}
                    {r.status === 'late' && <Clock size={10} />}
                    {r.status === 'absent' && <AlertTriangle size={10} />}
                    {String(r.status)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </motion.div>
  );
}
