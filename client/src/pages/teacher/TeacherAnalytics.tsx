import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { TrendingUp, Users, AlertTriangle, CheckCircle, Brain } from 'lucide-react';
import { reportAPI } from '../../services/api';
import toast from 'react-hot-toast';

interface CoursePerformance {
  courseName: string;
  studentCount: number;
  avgPerformance: number;
  avgAssignment: number;
  avgExam: number;
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

export default function TeacherAnalytics() {
  const [courses, setCourses] = useState<CoursePerformance[]>([]);
  const [atRisk, setAtRisk] = useState<AtRiskStudent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [courseRes, riskRes] = await Promise.all([
          reportAPI.getCoursePerformance(),
          reportAPI.getAtRisk(),
        ]);
        setCourses(courseRes.data.data.courses || []);
        setAtRisk(riskRes.data.data.students || []);
      } catch {
        toast.error('Failed to load analytics data.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const chartData = courses.map((c) => ({
    name: c.courseName.split(' ').slice(0, 2).join(' '),
    Assignment: c.avgAssignment,
    Exam: c.avgExam,
    Overall: c.avgPerformance,
  }));

  const riskColors: Record<string, string> = { CRITICAL: '#EF4444', HIGH: '#F97316', MEDIUM: '#F59E0B', LOW: '#10B981' };

  if (loading) return <div className="skeleton" style={{ height: 400, borderRadius: 16 }} />;

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
      <h1 style={{ margin: '0 0 8px', fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.5rem', color: '#0F172A' }}>Classroom Analytics</h1>
      <p style={{ margin: '0 0 24px', color: '#64748B', fontSize: '0.875rem' }}>Visual insight reports for cohorts, exams, and attendance metrics</p>

      {/* Overview stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 28 }}>
        <div className="card" style={{ padding: '20px 24px', display: 'flex', gap: 16, alignItems: 'center', background: 'white' }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <TrendingUp size={22} color="#2563EB" />
          </div>
          <div>
            <span style={{ display: 'block', fontSize: '0.72rem', color: '#94A3B8', fontWeight: 600, textTransform: 'uppercase' }}>Courses Tracked</span>
            <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1E293B', fontFamily: 'var(--font-display)' }}>{courses.length}</span>
          </div>
        </div>

        <div className="card" style={{ padding: '20px 24px', display: 'flex', gap: 16, alignItems: 'center', background: 'white' }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: '#FEE2E2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <AlertTriangle size={22} color="#EF4444" />
          </div>
          <div>
            <span style={{ display: 'block', fontSize: '0.72rem', color: '#94A3B8', fontWeight: 600, textTransform: 'uppercase' }}>At-Risk Cohorts</span>
            <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#EF4444', fontFamily: 'var(--font-display)' }}>{atRisk.length} Students</span>
          </div>
        </div>

        <div className="card" style={{ padding: '20px 24px', display: 'flex', gap: 16, alignItems: 'center', background: 'white' }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: '#ECFDF5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CheckCircle size={22} color="#10B981" />
          </div>
          <div>
            <span style={{ display: 'block', fontSize: '0.72rem', color: '#94A3B8', fontWeight: 600, textTransform: 'uppercase' }}>Pass Threshold Avg</span>
            <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#10B981', fontFamily: 'var(--font-display)' }}>
              {courses.length > 0 ? `${Math.round(courses.reduce((sum, c) => sum + c.passRate, 0) / courses.length)}%` : '90%'}
            </span>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.2fr', gap: 20, marginBottom: 24 }}>
        {/* Performance metrics breakdown */}
        <div className="card" style={{ padding: 24, background: 'white' }}>
          <h3 style={{ margin: '0 0 20px', fontWeight: 700, fontSize: '0.95rem' }}>Average Performance by Course</h3>
          {chartData.length > 0 ? (
            <div style={{ height: 260 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} barSize={20}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94A3B8' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} unit="%" />
                  <Tooltip contentStyle={{ borderRadius: 8, fontSize: '0.8rem' }} />
                  <Bar dataKey="Assignment" fill="#2563EB" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Exam" fill="#7C3AED" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Overall" fill="#059669" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p style={{ color: '#94A3B8', textAlign: 'center', padding: 40 }}>No course data available.</p>
          )}
        </div>

        {/* At risk list */}
        <div className="card" style={{ padding: 24, background: 'white' }}>
          <h3 style={{ margin: '0 0 16px', fontWeight: 700, fontSize: '0.95rem', color: '#1E293B' }}>Struggling Students</h3>
          {atRisk.length === 0 ? (
            <div style={{ padding: '20px 0', textAlign: 'center', color: '#10B981' }}>
              <CheckCircle size={32} style={{ margin: '0 auto 8px' }} />
              <p style={{ margin: 0, fontSize: '0.85rem' }}>All students have optimal academic standing! 🎉</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {atRisk.slice(0, 5).map((r, idx) => (
                <div key={idx} style={{ padding: 12, background: '#FAFAFA', borderRadius: 8, border: '1px solid #F1F5F9' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <span style={{ fontWeight: 700, fontSize: '0.85rem', color: '#1E293B' }}>{r.student?.name}</span>
                    <span className="badge" style={{ background: `${riskColors[r.riskLevel] || '#94A3B8'}12`, color: riskColors[r.riskLevel] || '#64748B', fontWeight: 800 }}>
                      {r.riskLevel}
                    </span>
                  </div>
                  <p style={{ margin: '0 0 6px', fontSize: '0.72rem', color: '#64748B' }}>
                    Attendance: {r.attendanceAvg}% | Grade: {r.performanceAvg}%
                  </p>
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                    {r.riskFactors?.map((f, fIdx) => (
                      <span key={fIdx} style={{ fontSize: '0.65rem', padding: '1px 5px', borderRadius: 4, background: '#FFF5F5', color: '#EF4444', border: '1px solid #FCA5A5' }}>
                        {f}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
