import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { gradeAPI } from '../../services/api';
import { TrendingUp, Award, BarChart3 } from 'lucide-react';
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, Tooltip } from 'recharts';

const gradeColors: Record<string, string> = { 'A+': '#10B981', A: '#34D399', 'A-': '#6EE7B7', B: '#2563EB', 'B+': '#3B82F6', C: '#F59E0B', D: '#F97316', F: '#EF4444' };

export default function StudentGrades() {
  const [grades, setGrades] = useState<Array<Record<string, unknown>>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    gradeAPI.getMyGrades().then((res) => {
      setGrades(res.data.data.grades || []);
    }).finally(() => setLoading(false));
  }, []);

  const avgPct = grades.length > 0
    ? Math.round(grades.reduce((sum, g) => sum + (g.percentage as number), 0) / grades.length)
    : 0;

  const radarData = grades.map((g) => ({
    subject: ((g.course as Record<string, unknown>)?.title as string || '').split(' ')[0],
    score: g.percentage,
  }));

  if (loading) return <div className="skeleton" style={{ height: 400, borderRadius: 16 }} />;

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
      <h1 style={{ margin: '0 0 8px', fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.5rem', color: '#0F172A' }}>Grades</h1>
      <p style={{ margin: '0 0 24px', color: '#64748B', fontSize: '0.875rem' }}>Academic performance across all courses</p>

      {/* Overall avg */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'Average Grade', value: `${avgPct}%`, sub: avgPct >= 70 ? 'Good standing' : 'Needs improvement', color: '#2563EB', icon: TrendingUp },
          { label: 'Courses Graded', value: String(grades.length), sub: 'This semester', color: '#10B981', icon: BarChart3 },
          { label: 'Top Grade', value: grades.length > 0 ? `${Math.max(...grades.map((g) => g.percentage as number))}%` : '—', sub: grades.length > 0 ? ((grades.find((g) => g.percentage === Math.max(...grades.map((g2) => g2.percentage as number)))?.course as Record<string, unknown>)?.title as string)?.split(' ')[0] || '' : '', color: '#F59E0B', icon: Award },
        ].map(({ label, value, sub, color, icon: Icon }) => (
          <div key={label} className="card" style={{ padding: '20px 24px', display: 'flex', gap: 16, alignItems: 'flex-start' }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon size={22} color={color} />
            </div>
            <div>
              <p style={{ margin: '0 0 2px', fontSize: '0.7rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</p>
              <p style={{ margin: 0, fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.6rem', color: '#0F172A' }}>{value}</p>
              <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748B' }}>{sub}</p>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 20, marginBottom: 24 }}>
        {/* Radar chart */}
        {radarData.length > 0 && (
          <div className="card" style={{ padding: '24px' }}>
            <h3 style={{ margin: '0 0 20px', fontWeight: 700, fontSize: '0.95rem' }}>Performance Radar</h3>
            <div style={{ height: 220 }}>
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#F1F5F9" />
                  <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: '#64748B' }} />
                  <Radar name="Score" dataKey="score" stroke="#2563EB" fill="#2563EB" fillOpacity={0.15} />
                  <Tooltip formatter={(v) => [`${v}%`, 'Score']} contentStyle={{ borderRadius: 8, fontSize: '0.8rem' }} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Grade table */}
        <div className="card" style={{ padding: '24px', overflow: 'hidden' }}>
          <h3 style={{ margin: '0 0 16px', fontWeight: 700, fontSize: '0.95rem' }}>Course Grades</h3>
          <table className="data-table">
            <thead>
              <tr>
                <th>Course</th>
                <th>Assignment</th>
                <th>Exam</th>
                <th>Overall</th>
                <th>Grade</th>
              </tr>
            </thead>
            <tbody>
              {grades.map((g) => {
                const grade = g.grade as string;
                return (
                  <tr key={String(g._id)}>
                    <td>
                      <p style={{ margin: 0, fontWeight: 600, fontSize: '0.85rem', color: '#1E293B' }}>
                        {((g.course as Record<string, unknown>)?.title as string)?.split(' ').slice(0, 3).join(' ')}
                      </p>
                    </td>
                    <td>
                      <div>
                        <span style={{ fontWeight: 600, color: '#1E293B' }}>{Math.round(g.assignmentAverage as number)}%</span>
                        <div className="progress-bar" style={{ height: 4, marginTop: 4, width: 60 }}>
                          <div style={{ height: '100%', borderRadius: 2, background: '#10B981', width: `${g.assignmentAverage as number}%` }} />
                        </div>
                      </div>
                    </td>
                    <td>
                      <div>
                        <span style={{ fontWeight: 600, color: '#1E293B' }}>{Math.round(g.examAverage as number)}%</span>
                        <div className="progress-bar" style={{ height: 4, marginTop: 4, width: 60 }}>
                          <div style={{ height: '100%', borderRadius: 2, background: '#7C3AED', width: `${g.examAverage as number}%` }} />
                        </div>
                      </div>
                    </td>
                    <td style={{ fontWeight: 700, color: '#1E293B' }}>{Math.round(g.percentage as number)}%</td>
                    <td>
                      <span className="badge" style={{ background: `${gradeColors[grade] || '#94A3B8'}18`, color: gradeColors[grade] || '#64748B', fontWeight: 800, fontSize: '0.8rem' }}>
                        {grade || 'N/A'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}
