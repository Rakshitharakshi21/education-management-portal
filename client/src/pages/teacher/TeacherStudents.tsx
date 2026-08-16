import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Search, Brain, Award, Calendar, CheckCircle, RefreshCw, X, AlertTriangle } from 'lucide-react';
import { classAPI, aiAPI, gradeAPI } from '../../services/api';
import toast from 'react-hot-toast';

interface Student {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  phone?: string;
  classId: string;
  className: string;
}

interface AIInsightResult {
  overallScore: number;
  grade: string;
  academicStanding: string;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  riskLevel: string;
  prediction: string;
  summary: string;
}

export default function TeacherStudents() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // AI Modal states
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<AIInsightResult | null>(null);

  // Grades cache
  const [studentGrades, setStudentGrades] = useState<Record<string, { percentage: number; grade: string }>>({});

  const loadData = async () => {
    try {
      const res = await classAPI.getMy();
      const list = res.data.data.classes || [];
      
      const aggregated: Student[] = [];
      const gradesPromises: Array<Promise<void>> = [];

      for (const c of list) {
        if (c.students) {
          for (const s of c.students) {
            aggregated.push({
              _id: s._id,
              name: s.name,
              email: s.email,
              avatar: s.avatar,
              phone: s.phone,
              classId: c._id,
              className: c.name,
            });
            // Fetch grade average for student
            const fetchGrade = async () => {
              try {
                const gr = await gradeAPI.getStudentGrades(s._id);
                const gList = gr.data.data.grades || [];
                if (gList.length > 0) {
                  const avg = Math.round(gList.reduce((sum: number, x: { percentage: number }) => sum + x.percentage, 0) / gList.length);
                  const letter = gList[0].grade || 'B';
                  setStudentGrades((prev) => ({ ...prev, [s._id]: { percentage: avg, grade: letter } }));
                }
              } catch { /* ignore individual failures */ }
            };
            gradesPromises.push(fetchGrade());
          }
        }
      }
      setStudents(aggregated);
      await Promise.all(gradesPromises);
    } catch {
      toast.error('Failed to load students list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const runAIAnalysis = async (student: Student) => {
    setSelectedStudent(student);
    setAiResult(null);
    setAiModalOpen(true);
    setAiLoading(true);
    try {
      const res = await aiAPI.generateStudentInsight(student._id, true);
      setAiResult(res.data.data.insight?.result || null);
      toast.success(`AI analysis completed for ${student.name}!`);
    } catch {
      toast.error('AI model analysis offline. Reverted to local rule engines.');
    } finally {
      setAiLoading(false);
    }
  };

  const filtered = students.filter((s) => {
    return s.name.toLowerCase().includes(search.toLowerCase()) ||
           s.email.toLowerCase().includes(search.toLowerCase()) ||
           s.className.toLowerCase().includes(search.toLowerCase());
  });

  const riskColors: Record<string, string> = { LOW: '#10B981', MEDIUM: '#F59E0B', HIGH: '#F97316', CRITICAL: '#EF4444' };

  if (loading) return <div className="skeleton" style={{ height: 400, borderRadius: 16 }} />;

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ margin: 0, fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.5rem', color: '#0F172A' }}>Unified Student Roster</h1>
          <p style={{ margin: '4px 0 0', color: '#64748B', fontSize: '0.875rem' }}>{students.length} students under your guidance</p>
        </div>
      </div>

      <div style={{ position: 'relative', marginBottom: 24 }}>
        <Search size={16} color="#94A3B8" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
        <input
          type="text"
          className="input-field"
          placeholder="Search by student name, email, or class name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ paddingLeft: 42 }}
        />
      </div>

      <div className="card" style={{ background: 'white', overflow: 'hidden' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Student Details</th>
              <th>Class Batch</th>
              <th>Average Score</th>
              <th>Standing</th>
              <th style={{ textAlign: 'right' }}>Academic Assistant</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((s) => {
              const gradeInfo = studentGrades[s._id] || { percentage: 0, grade: '—' };
              return (
                <tr key={s._id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      {s.avatar ? (
                        <img src={s.avatar} alt={s.name} className="avatar" style={{ width: 32, height: 32 }} />
                      ) : (
                        <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '0.8rem', fontWeight: 700 }}>
                          {s.name.charAt(0)}
                        </div>
                      )}
                      <div>
                        <p style={{ margin: 0, fontWeight: 700, fontSize: '0.875rem', color: '#1E293B' }}>{s.name}</p>
                        <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748B' }}>{s.email}</p>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span style={{ fontSize: '0.85rem', color: '#475569', fontWeight: 500 }}>{s.className}</span>
                  </td>
                  <td>
                    <span style={{ fontWeight: 700, color: '#1E293B' }}>{gradeInfo.percentage ? `${gradeInfo.percentage}%` : 'N/A'}</span>
                  </td>
                  <td>
                    {gradeInfo.percentage ? (
                      <span className="badge badge-blue">{gradeInfo.grade}</span>
                    ) : '—'}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button onClick={() => runAIAnalysis(s)} className="btn-primary" style={{ padding: '8px 14px', fontSize: '0.8rem', background: 'linear-gradient(135deg, #7C3AED, #2563EB)' }}>
                      <Brain size={14} /> AI Insight
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* AI Analysis Modal */}
      <AnimatePresence>
        {aiModalOpen && selectedStudent && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div onClick={() => setAiModalOpen(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(15,23,42,0.4)', backdropFilter: 'blur(4px)' }} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="card" style={{ position: 'relative', width: '100%', maxWidth: 580, background: 'white', padding: 28, zIndex: 10, maxHeight: '85vh', overflowY: 'auto' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Brain size={22} color="#7C3AED" />
                  <h3 style={{ margin: 0, fontWeight: 800, fontSize: '1.2rem', fontFamily: 'var(--font-display)' }}>
                    AI Insight Report: {selectedStudent.name}
                  </h3>
                </div>
                <button onClick={() => setAiModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                  <X size={20} color="#94A3B8" />
                </button>
              </div>

              {aiLoading ? (
                <div style={{ padding: '40px 0', textAlign: 'center' }}>
                  <RefreshCw size={32} className="animate-spin" color="#7C3AED" style={{ margin: '0 auto 16px' }} />
                  <p style={{ color: '#64748B', fontSize: '0.9rem' }}>Analyzing course work, attendance averages, and risk indicators...</p>
                  <style>{`@keyframes spin { to { transform: rotate(360deg); } } .animate-spin { animation: spin 1s linear infinite; }`}</style>
                </div>
              ) : aiResult ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  {/* Grid metrics */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
                    {[
                      { label: 'Overall Score', val: `${aiResult.overallScore}%`, color: '#2563EB' },
                      { label: 'Grade Standing', val: aiResult.grade, color: '#10B981' },
                      { label: 'Risk Level', val: aiResult.riskLevel, color: riskColors[aiResult.riskLevel] || '#94A3B8' },
                      { label: 'Prediction', val: aiResult.prediction, color: '#7C3AED' },
                    ].map((item) => (
                      <div key={item.label} style={{ padding: 12, background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 10, textAlign: 'center' }}>
                        <span style={{ display: 'block', fontSize: '0.65rem', color: '#94A3B8', fontWeight: 600, textTransform: 'uppercase' }}>{item.label}</span>
                        <span style={{ fontSize: '1.1rem', fontWeight: 800, color: item.color }}>{item.val}</span>
                      </div>
                    ))}
                  </div>

                  {/* Summary */}
                  <div style={{ padding: '16px 20px', background: '#F5F3FF', border: '1px solid #DDD6FE', borderRadius: 12 }}>
                    <p style={{ margin: '0 0 6px', fontSize: '0.85rem', fontWeight: 700, color: '#7C3AED' }}>Academic standing summary</p>
                    <p style={{ margin: 0, fontSize: '0.825rem', color: '#4C1D95', lineHeight: 1.6 }}>{aiResult.summary}</p>
                  </div>

                  {/* Strengths & Weaknesses */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <div>
                      <h4 style={{ margin: '0 0 8px', fontSize: '0.85rem', fontWeight: 700, color: '#1E293B', display: 'flex', alignItems: 'center', gap: 6 }}>
                        <CheckCircle size={14} color="#10B981" /> Strengths
                      </h4>
                      <ul style={{ margin: 0, paddingLeft: 16, color: '#475569', fontSize: '0.8rem', display: 'flex', flexDirection: 'column', gap: 4 }}>
                        {aiResult.strengths?.map((s, idx) => <li key={idx}>{s}</li>)}
                      </ul>
                    </div>
                    <div>
                      <h4 style={{ margin: '0 0 8px', fontSize: '0.85rem', fontWeight: 700, color: '#1E293B', display: 'flex', alignItems: 'center', gap: 6 }}>
                        <AlertTriangle size={14} color="#F97316" /> Areas to Improve
                      </h4>
                      <ul style={{ margin: 0, paddingLeft: 16, color: '#475569', fontSize: '0.8rem', display: 'flex', flexDirection: 'column', gap: 4 }}>
                        {aiResult.weaknesses?.map((w, idx) => <li key={idx}>{w}</li>)}
                      </ul>
                    </div>
                  </div>

                  {/* Recommendations */}
                  <div>
                    <h4 style={{ margin: '0 0 8px', fontSize: '0.85rem', fontWeight: 700, color: '#1E293B' }}>Recommended Teacher Interventions</h4>
                    <ul style={{ margin: 0, paddingLeft: 16, color: '#475569', fontSize: '0.8rem', display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {aiResult.recommendations?.map((r, idx) => <li key={idx} style={{ lineHeight: 1.5 }}>{r}</li>)}
                    </ul>
                  </div>
                </div>
              ) : (
                <p style={{ color: '#94A3B8', textAlign: 'center' }}>No insight details available.</p>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
