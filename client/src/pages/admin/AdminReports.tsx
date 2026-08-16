import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { reportAPI } from '../../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { TrendingUp, Users, AlertTriangle, BookOpen, Calendar, HelpCircle } from 'lucide-react';
import toast from 'react-hot-toast';

interface Overview {
  totalStudents: number;
  totalTeachers: number;
  totalCourses: number;
  avgAttendance: number;
  avgPerformance: number;
  totalSubmissions: number;
}

interface AttendanceTrend {
  _id: {
    year: number;
    month: number;
  };
  pct: number;
}

interface CoursePerf {
  courseName: string;
  studentCount: number;
  avgPerformance: number;
  passRate: number;
}

interface AtRiskStudent {
  student: {
    name: string;
    email: string;
  };
  courses: string[];
  attendanceAvg: number;
  performanceAvg: number;
  riskLevel: string;
  riskFactors: string[];
}

export default function AdminReports() {
  const [overview, setOverview] = useState<Overview | null>(null);
  const [trends, setTrends] = useState<AttendanceTrend[]>([]);
  const [courses, setCourses] = useState<CoursePerf[]>([]);
  const [atRisk, setAtRisk] = useState<AtRiskStudent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [ovRes, trendRes, courseRes, riskRes] = await Promise.all([
          reportAPI.getOverview(),
          reportAPI.getAttendanceTrends(),
          reportAPI.getCoursePerformance(),
          reportAPI.getAtRisk(),
        ]);
        setOverview(ovRes.data.data || null);
        setTrends(trendRes.data.data.trends || []);
        setCourses(courseRes.data.data.courses || []);
        setAtRisk(riskRes.data.data.students || []);
      } catch {
        toast.error('Failed to load system reports.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const chartDataCourses = courses.map((c) => ({
    name: c.courseName.split(' ').slice(0, 2).join(' '),
    Overall: c.avgPerformance,
    PassRate: c.passRate,
  }));

  const chartDataAttendance = trends.map((t) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return {
      name: `${months[t._id.month - 1]} ${t._id.year}`,
      Rate: Math.round(t.pct),
    };
  });

  const riskColors: Record<string, string> = { CRITICAL: '#EF4444', HIGH: '#F97316', MEDIUM: '#F59E0B', LOW: '#10B981' };

  if (loading) return <div className="skeleton" style={{ height: 400 }} />;

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
      <h1 style={{ margin: '0 0 8px', fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.5rem', color: '#0F172A' }}>Institutional Analytics</h1>
      <p style={{ margin: '0 0 24px', color: '#64748B', fontSize: '0.875rem' }}>Overview metrics, attendance logs, and risk markers portal-wide</p>

      {overview && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 28 }}>
          {[
            { label: 'Total Students', val: overview.totalStudents, icon: Users, color: '#2563EB' },
            { label: 'Total Faculty', val: overview.totalTeachers, icon: Users, color: '#059669' },
            { label: 'Active Courses', val: overview.totalCourses, icon: BookOpen, color: '#7C3AED' },
            { label: 'Average Attendance', val: `${overview.avgAttendance}%`, icon: Calendar, color: '#F97316' },
            { label: 'GPA Average Score', val: `${overview.avgPerformance}%`, icon: TrendingUp, color: '#0891B2' },
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={idx} className="card" style={{ padding: 20, background: 'white', display: 'flex', gap: 16, alignItems: 'center' }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: `${item.color}10`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon size={20} color={item.color} />
                </div>
                <div>
                  <span style={{ display: 'block', fontSize: '0.7rem', color: '#94A3B8', fontWeight: 600, textTransform: 'uppercase' }}>{item.label}</span>
                  <span style={{ fontSize: '1.3rem', fontWeight: 800, color: '#1E293B', fontFamily: 'var(--font-display)' }}>{item.val}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
        {/* Attendance trends */}
        <div className="card" style={{ padding: 24, background: 'white' }}>
          <h3 style={{ margin: '0 0 20px', fontWeight: 700, fontSize: '0.95rem' }}>Attendance Trends over Time</h3>
          {chartDataAttendance.length > 0 ? (
            <div style={{ height: 220 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartDataAttendance}>
                  <defs>
                    <linearGradient id="attGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#F97316" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#F97316" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94A3B8' }} />
                  <YAxis domain={[50, 100]} tick={{ fontSize: 11, fill: '#94A3B8' }} unit="%" />
                  <Tooltip contentStyle={{ borderRadius: 8, fontSize: '0.8rem' }} />
                  <Area type="monotone" dataKey="Rate" stroke="#F97316" strokeWidth={2.5} fill="url(#attGrad)" dot={{ fill: '#F97316', r: 4 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p style={{ color: '#94A3B8', textAlign: 'center', padding: 40 }}>No attendance trend data.</p>
          )}
        </div>

        {/* Course averages */}
        <div className="card" style={{ padding: 24, background: 'white' }}>
          <h3 style={{ margin: '0 0 20px', fontWeight: 700, fontSize: '0.95rem' }}>Course Performance metrics</h3>
          {chartDataCourses.length > 0 ? (
            <div style={{ height: 220 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartDataCourses} barSize={18}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94A3B8' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} unit="%" />
                  <Tooltip contentStyle={{ borderRadius: 8, fontSize: '0.8rem' }} />
                  <Bar dataKey="Overall" fill="#2563EB" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="PassRate" fill="#10B981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p style={{ color: '#94A3B8', textAlign: 'center', padding: 40 }}>No course stats data.</p>
          )}
        </div>
      </div>

      {/* At risk roster */}
      <div className="card" style={{ padding: 24, background: 'white' }}>
        <h3 style={{ margin: '0 0 16px', fontWeight: 800, fontSize: '1rem', fontFamily: 'var(--font-display)' }}>Struggling Students Overview</h3>
        {atRisk.length === 0 ? (
          <p style={{ color: '#10B981', fontSize: '0.85rem' }}>No students fall under academic risk flags currently.</p>
        ) : (
          <div className="card" style={{ background: 'white', overflow: 'hidden' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Student Name</th>
                  <th>Email</th>
                  <th>Attendance Avg</th>
                  <th>GPA Score Avg</th>
                  <th>Risk Standing</th>
                  <th>Risk Factors</th>
                </tr>
              </thead>
              <tbody>
                {atRisk.map((r, idx) => (
                  <tr key={idx}>
                    <td style={{ fontWeight: 700, color: '#1E293B' }}>{r.student?.name}</td>
                    <td>{r.student?.email}</td>
                    <td>{r.attendanceAvg}%</td>
                    <td>{r.performanceAvg}%</td>
                    <td>
                      <span className="badge" style={{ background: `${riskColors[r.riskLevel] || '#94A3B8'}12`, color: riskColors[r.riskLevel] || '#64748B', fontWeight: 800 }}>
                        {r.riskLevel}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                        {r.riskFactors?.map((f, fIdx) => (
                          <span key={fIdx} style={{ fontSize: '0.65rem', padding: '1px 5px', borderRadius: 4, background: '#FFF5F5', color: '#EF4444', border: '1px solid #FCA5A5' }}>
                            {f}
                          </span>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </motion.div>
  );
}
