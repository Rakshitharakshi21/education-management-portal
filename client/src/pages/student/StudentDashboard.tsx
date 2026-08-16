import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { BookOpen, ClipboardList, Calendar, TrendingUp, Bell, Award, Brain, ChevronRight, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { courseAPI, assignmentAPI, attendanceAPI, gradeAPI, announcementAPI } from '../../services/api';
import { RadialBarChart, RadialBar, ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { format } from 'date-fns';

const StatCard = ({ icon: Icon, label, value, sub, color, trend }: {
  icon: React.ElementType; label: string; value: string; sub?: string; color: string; trend?: string;
}) => (
  <motion.div
    whileHover={{ y: -2 }}
    className="card"
    style={{ padding: '20px 24px', display: 'flex', alignItems: 'flex-start', gap: 16 }}
  >
    <div style={{ width: 44, height: 44, borderRadius: 12, background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <Icon size={22} color={color} />
    </div>
    <div style={{ flex: 1 }}>
      <p style={{ margin: '0 0 2px', fontSize: '0.75rem', fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</p>
      <p style={{ margin: 0, fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.6rem', color: '#0F172A', letterSpacing: '-0.02em' }}>{value}</p>
      {(sub || trend) && (
        <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: trend?.startsWith('+') ? '#10B981' : '#64748B' }}>
          {trend && <span style={{ color: '#10B981', fontWeight: 600 }}>{trend} </span>}
          {sub}
        </p>
      )}
    </div>
  </motion.div>
);

export default function StudentDashboard() {
  const { user } = useAuth();
  const [enrollments, setEnrollments] = useState<Array<Record<string, unknown>>>([]);
  const [assignments, setAssignments] = useState<Array<Record<string, unknown>>>([]);
  const [attendance, setAttendance] = useState<Record<string, unknown>>({});
  const [grades, setGrades] = useState<Array<Record<string, unknown>>>([]);
  const [announcements, setAnnouncements] = useState<Array<Record<string, unknown>>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [enrRes, asgRes, attRes, gradeRes, annRes] = await Promise.all([
          courseAPI.getMyCourses(),
          assignmentAPI.getMyAssignments(),
          attendanceAPI.getMySummary(),
          gradeAPI.getMyGrades(),
          announcementAPI.getAll(),
        ]);
        setEnrollments(enrRes.data.data.courses || []);
        setAssignments(asgRes.data.data.assignments || []);
        setAttendance(attRes.data.data || {});
        setGrades(gradeRes.data.data.grades || []);
        setAnnouncements(annRes.data.data.announcements?.slice(0, 3) || []);
      } catch (err) {
        console.error('Dashboard load error:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const pendingAssignments = assignments.filter((a) => !a.isSubmitted);
  const overdueAssignments = assignments.filter((a) => a.isOverdue);
  const avgGrade = grades.length > 0
    ? Math.round(grades.reduce((sum, g) => sum + (g.percentage as number), 0) / grades.length)
    : 0;
  const attPct = (attendance.percentage as number) || 0;

  const gradeChartData = grades.map((g) => ({
    name: (g.course as { title?: string })?.title?.split(' ').slice(0, 2).join(' ') || 'Course',
    grade: g.percentage,
  }));

  if (loading) {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        {[...Array(4)].map((_, i) => (
          <div key={i} className="skeleton" style={{ height: 100, borderRadius: 16 }} />
        ))}
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Alert for at-risk */}
      {attPct < 75 && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          style={{ background: '#FFF7ED', border: '1px solid #FED7AA', borderRadius: 12, padding: '14px 20px', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 12 }}
        >
          <AlertTriangle size={18} color="#F97316" />
          <div>
            <p style={{ margin: 0, fontWeight: 700, color: '#9A3412', fontSize: '0.875rem' }}>
              Attendance Alert — {attPct}%
            </p>
            <p style={{ margin: 0, color: '#C2410C', fontSize: '0.8rem' }}>
              Your attendance is below 75%. Please attend classes regularly to avoid academic penalty.
            </p>
          </div>
          <Link to="/student/attendance" className="btn-ghost" style={{ marginLeft: 'auto', flexShrink: 0 }}>
            View Details
          </Link>
        </motion.div>
      )}

      {overdueAssignments.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 12, padding: '12px 20px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12 }}
        >
          <Bell size={16} color="#EF4444" />
          <p style={{ margin: 0, color: '#991B1B', fontSize: '0.875rem' }}>
            You have <strong>{overdueAssignments.length}</strong> overdue assignment{overdueAssignments.length > 1 ? 's' : ''}.
          </p>
          <Link to="/student/assignments" style={{ marginLeft: 'auto', color: '#EF4444', fontWeight: 600, fontSize: '0.8rem', textDecoration: 'none' }}>
            View →
          </Link>
        </motion.div>
      )}

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 28 }}>
        <StatCard icon={BookOpen} label="Enrolled Courses" value={String(enrollments.length)} sub="Active this semester" color="#2563EB" />
        <StatCard icon={ClipboardList} label="Pending Tasks" value={String(pendingAssignments.length)} sub={overdueAssignments.length > 0 ? `${overdueAssignments.length} overdue` : 'All on track'} color="#F97316" />
        <StatCard icon={Calendar} label="Attendance" value={`${attPct}%`} sub={attPct >= 75 ? 'Above threshold' : '⚠️ Below 75%'} color={attPct >= 75 ? '#10B981' : '#EF4444'} />
        <StatCard icon={TrendingUp} label="Avg. Grade" value={`${avgGrade}%`} sub={`Across ${grades.length} courses`} color="#7C3AED" trend={avgGrade >= 70 ? '+' : ''} />
      </div>

      {/* AI Progress CTA */}
      <Link to="/student/progress" style={{ textDecoration: 'none' }}>
        <motion.div
          whileHover={{ y: -2 }}
          className="ai-pulse"
          style={{
            background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
            borderRadius: 16, padding: '24px 28px', marginBottom: 28,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20,
            cursor: 'pointer',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 48, height: 48, borderRadius: 14, background: 'linear-gradient(135deg, #7C3AED, #2563EB)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Brain size={24} color="white" />
            </div>
            <div>
              <p style={{ margin: '0 0 4px', fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1rem', color: 'white' }}>
                AI Academic Analysis
              </p>
              <p style={{ margin: 0, color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem' }}>
                Get personalized insights on your strengths and areas for improvement.
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#60A5FA', fontWeight: 700, fontSize: '0.875rem', flexShrink: 0 }}>
            View Insights <ChevronRight size={16} />
          </div>
        </motion.div>
      </Link>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
        {/* Grade Performance */}
        <div className="card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <h3 style={{ margin: 0, fontWeight: 700, fontSize: '0.95rem' }}>Course Performance</h3>
            <Link to="/student/grades" style={{ fontSize: '0.75rem', color: '#2563EB', fontWeight: 600, textDecoration: 'none' }}>View all</Link>
          </div>
          {gradeChartData.length > 0 ? (
            <div style={{ height: 200 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={gradeChartData}>
                  <defs>
                    <linearGradient id="gradeGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563EB" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94A3B8' }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#94A3B8' }} />
                  <Tooltip formatter={(v) => [`${v}%`, 'Grade']} contentStyle={{ borderRadius: 8, border: '1px solid #F1F5F9', fontSize: '0.8rem' }} />
                  <Area type="monotone" dataKey="grade" stroke="#2563EB" strokeWidth={2.5} fill="url(#gradeGrad)" dot={{ fill: '#2563EB', r: 4 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94A3B8', fontSize: '0.875rem' }}>
              No grade data yet
            </div>
          )}
        </div>

        {/* Attendance Gauge */}
        <div className="card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <h3 style={{ margin: 0, fontWeight: 700, fontSize: '0.95rem' }}>Attendance Overview</h3>
            <Link to="/student/attendance" style={{ fontSize: '0.75rem', color: '#2563EB', fontWeight: 600, textDecoration: 'none' }}>Details</Link>
          </div>
          <div style={{ height: 200, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart cx="50%" cy="50%" innerRadius="60%" outerRadius="80%" data={[
                { name: 'Present', value: attendance.present as number || 0, fill: '#10B981' },
                { name: 'Late', value: attendance.late as number || 0, fill: '#F59E0B' },
                { name: 'Absent', value: attendance.absent as number || 0, fill: '#EF4444' },
              ]}>
                <RadialBar dataKey="value" background />
                <Tooltip contentStyle={{ borderRadius: 8, fontSize: '0.8rem' }} />
              </RadialBarChart>
            </ResponsiveContainer>
            <div style={{ position: 'absolute', textAlign: 'center' }}>
              <p style={{ margin: 0, fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.8rem', color: attPct >= 75 ? '#10B981' : '#EF4444' }}>{attPct}%</p>
              <p style={{ margin: 0, fontSize: '0.7rem', color: '#94A3B8' }}>Attendance</p>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginTop: 8 }}>
            {[
              { label: 'Present', val: attendance.present, color: '#10B981' },
              { label: 'Late', val: attendance.late, color: '#F59E0B' },
              { label: 'Absent', val: attendance.absent, color: '#EF4444' },
            ].map((item) => (
              <div key={item.label} style={{ textAlign: 'center' }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: item.color, margin: '0 auto 4px' }} />
                <p style={{ margin: 0, fontSize: '0.7rem', color: '#64748B' }}>{item.label}</p>
                <p style={{ margin: 0, fontWeight: 700, fontSize: '0.875rem', color: '#1E293B' }}>{String(item.val || 0)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Upcoming assignments */}
        <div className="card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <h3 style={{ margin: 0, fontWeight: 700, fontSize: '0.95rem' }}>Pending Assignments</h3>
            <Link to="/student/assignments" style={{ fontSize: '0.75rem', color: '#2563EB', fontWeight: 600, textDecoration: 'none' }}>View all</Link>
          </div>
          {pendingAssignments.length === 0 ? (
            <div style={{ padding: '24px 0', textAlign: 'center', color: '#94A3B8', fontSize: '0.875rem' }}>
              🎉 All assignments complete!
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {pendingAssignments.slice(0, 4).map((a) => {
                const dueDate = new Date(a.dueDate as string);
                const isOverdue = dueDate < new Date();
                return (
                  <div key={String(a._id)} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 10, background: isOverdue ? '#FFF5F5' : '#FAFAFA', border: `1px solid ${isOverdue ? '#FECACA' : '#F1F5F9'}` }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: isOverdue ? '#EF4444' : '#F97316', flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ margin: 0, fontWeight: 600, fontSize: '0.8rem', color: '#1E293B', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{String(a.title)}</p>
                      <p style={{ margin: 0, fontSize: '0.7rem', color: isOverdue ? '#EF4444' : '#64748B' }}>
                        {isOverdue ? '⚠️ Overdue — ' : 'Due: '}{format(dueDate, 'MMM d, yyyy')}
                      </p>
                    </div>
                    <span className={`badge badge-${isOverdue ? 'red' : 'amber'}`}>{a.maxMarks as number} pts</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Announcements */}
        <div className="card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <h3 style={{ margin: 0, fontWeight: 700, fontSize: '0.95rem' }}>Announcements</h3>
            <span className="badge badge-blue">{announcements.length} new</span>
          </div>
          {announcements.length === 0 ? (
            <p style={{ color: '#94A3B8', fontSize: '0.875rem' }}>No announcements</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {announcements.map((ann) => (
                <div key={String(ann._id)} style={{ padding: '12px', borderRadius: 10, background: '#FAFAFA', border: '1px solid #F1F5F9' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 4 }}>
                    <Bell size={14} color="#2563EB" style={{ marginTop: 2, flexShrink: 0 }} />
                    <p style={{ margin: 0, fontWeight: 700, fontSize: '0.8rem', color: '#1E293B' }}>{String(ann.title)}</p>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748B', lineHeight: 1.5, paddingLeft: 22 }}>
                    {(ann.content as string)?.slice(0, 100)}{(ann.content as string)?.length > 100 ? '...' : ''}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
