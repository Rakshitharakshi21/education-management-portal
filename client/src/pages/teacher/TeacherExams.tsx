import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Award, Plus, Calendar, Clock, X, Eye, FileText, CheckCircle } from 'lucide-react';
import { classAPI, examAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

interface Exam {
  _id: string;
  title: string;
  date: string;
  duration: number;
  totalMarks: number;
  passingMarks: number;
  type: string;
  status: string;
  class: {
    _id: string;
    name: string;
  };
  course: {
    _id: string;
    title: string;
  };
}

interface ExamSubmission {
  _id: string;
  obtainedMarks: number;
  percentage: number;
  grade: string;
  status: string;
  submittedAt: string;
  student: {
    _id: string;
    name: string;
    email: string;
  };
}

export default function TeacherExams() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [classes, setClasses] = useState<Array<{ _id: string; name: string; course: { _id: string } }>>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [duration, setDuration] = useState(90);
  const [totalMarks, setTotalMarks] = useState(100);
  const [passingMarks, setPassingMarks] = useState(40);
  const [type, setType] = useState('midterm');
  const [selectedClassId, setSelectedClassId] = useState('');

  // Submissions view state
  const [activeExam, setActiveExam] = useState<Exam | null>(null);
  const [submissions, setSubmissions] = useState<ExamSubmission[]>([]);
  const [subsLoading, setSubsLoading] = useState(false);

  const loadData = async () => {
    try {
      const [examRes, classRes] = await Promise.all([
        examAPI.getAll({ limit: 100 }),
        classAPI.getMy(),
      ]);
      setExams(examRes.data.data.results || []);
      setClasses(classRes.data.data.classes || []);
    } catch {
      toast.error('Failed to load exams.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateExam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !date || !selectedClassId) {
      return toast.error('Please fill in all required fields.');
    }

    const cls = classes.find((c) => c._id === selectedClassId);
    if (!cls) return toast.error('Invalid class group.');

    const payload = {
      title, date, duration, totalMarks, passingMarks, type,
      class: selectedClassId,
      course: cls.course?._id || cls.course,
      isOnline: true,
      questions: [
        {
          questionNumber: 1,
          question: 'What is the time complexity of bubble sort in worst case scenario?',
          type: 'mcq',
          options: ['O(n)', 'O(n log n)', 'O(n^2)', 'O(1)'],
          correctAnswer: 'O(n^2)',
          marks: 10,
        },
        {
          questionNumber: 2,
          question: 'Explain the difference between functional and class components in React.',
          type: 'short',
          marks: 15,
        },
      ],
    };

    try {
      await examAPI.create(payload);
      toast.success('Exam scheduled successfully!');
      setModalOpen(false);
      setTitle('');
      loadData();
    } catch {
      toast.error('Failed to schedule exam.');
    }
  };

  const viewSubmissions = async (exam: Exam) => {
    setActiveExam(exam);
    setSubsLoading(true);
    try {
      const res = await examAPI.getSubmissions(exam._id);
      setSubmissions(res.data.data.submissions || []);
    } catch {
      toast.error('Failed to load exam submissions.');
    } finally {
      setSubsLoading(false);
    }
  };

  if (loading) return <div className="skeleton" style={{ height: 400, borderRadius: 16 }} />;

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
      {activeExam ? (
        // Submissions view
        <div>
          <button onClick={() => { setActiveExam(null); setSubmissions([]); }} className="btn-secondary" style={{ marginBottom: 20 }}>
            ← Back to Exams
          </button>
          
          <div className="card" style={{ padding: 24, background: 'white', marginBottom: 24 }}>
            <h2 style={{ margin: '0 0 6px', fontWeight: 800, fontSize: '1.25rem' }}>{activeExam.title} Submissions</h2>
            <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748B' }}>
              Type: {activeExam.type} | Total Marks: {activeExam.totalMarks} | Passing Marks: {activeExam.passingMarks}
            </p>
          </div>

          <h3 style={{ fontWeight: 800, fontSize: '1.05rem', marginBottom: 16 }}>Grades & Results</h3>

          {subsLoading ? (
            <div className="skeleton" style={{ height: 200 }} />
          ) : submissions.length === 0 ? (
            <p style={{ color: '#94A3B8', textAlign: 'center', padding: 20 }}>No submissions received for this exam.</p>
          ) : (
            <div className="card" style={{ background: 'white', overflow: 'hidden' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Student Name</th>
                    <th>Email</th>
                    <th>Marks Obtained</th>
                    <th>Percentage</th>
                    <th>Letter Grade</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {submissions.map((sub) => (
                    <tr key={sub._id}>
                      <td style={{ fontWeight: 700, color: '#1E293B' }}>{sub.student?.name}</td>
                      <td>{sub.student?.email}</td>
                      <td style={{ fontWeight: 700 }}>{sub.obtainedMarks} / {activeExam.totalMarks}</td>
                      <td>{sub.percentage}%</td>
                      <td>
                        <span className="badge badge-blue">{sub.grade}</span>
                      </td>
                      <td>
                        <span className={`badge badge-${sub.obtainedMarks >= activeExam.passingMarks ? 'green' : 'red'}`}>
                          {sub.obtainedMarks >= activeExam.passingMarks ? 'Pass' : 'Fail'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        // Main exams view
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
            <div>
              <h1 style={{ margin: 0, fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.5rem', color: '#0F172A' }}>Exam Center</h1>
              <p style={{ margin: '4px 0 0', color: '#64748B', fontSize: '0.875rem' }}>Schedule online exams, set structures, and monitor performance</p>
            </div>
            <button onClick={() => setModalOpen(true)} className="btn-primary">
              <Plus size={18} /> Schedule Exam
            </button>
          </div>

          {exams.length === 0 ? (
            <div style={{ padding: '80px', textAlign: 'center', background: 'white', borderRadius: 16 }} className="card">
              <Award size={48} color="#CBD5E1" style={{ marginBottom: 16 }} />
              <h3>No exams scheduled</h3>
              <button onClick={() => setModalOpen(true)} className="btn-primary" style={{ marginTop: 12 }}>Schedule Exam</button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
              {exams.map((exam) => (
                <div key={exam._id} className="card" style={{ background: 'white', padding: 24, display: 'flex', flexDirection: 'column', justifySelf: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                      <div>
                        <h3 style={{ margin: 0, fontWeight: 800, fontSize: '1.05rem', color: '#1E293B' }}>{exam.title}</h3>
                        <span style={{ fontSize: '0.75rem', color: '#64748B' }}>Batch: {exam.class?.name}</span>
                      </div>
                      <span className="badge badge-blue" style={{ textTransform: 'capitalize' }}>{exam.type}</span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 20, fontSize: '0.8rem', color: '#475569' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Calendar size={14} color="#94A3B8" /> Date: {format(new Date(exam.date), 'PPP — p')}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Clock size={14} color="#94A3B8" /> Duration: {exam.duration} mins
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Award size={14} color="#94A3B8" /> Marks: {exam.totalMarks} (Pass: {exam.passingMarks})
                      </div>
                    </div>
                  </div>

                  <button onClick={() => viewSubmissions(exam)} className="btn-primary" style={{ justifyContent: 'center', padding: '10px' }}>
                    <Eye size={14} /> View Scores & Submissions
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Create Modal */}
      <AnimatePresence>
        {modalOpen && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div onClick={() => setModalOpen(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(15,23,42,0.4)', backdropFilter: 'blur(4px)' }} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="card" style={{ position: 'relative', width: '100%', maxWidth: 500, background: 'white', padding: 28, zIndex: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                <h3 style={{ margin: 0, fontWeight: 800, fontSize: '1.2rem', fontFamily: 'var(--font-display)' }}>Schedule New Exam</h3>
                <button onClick={() => setModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                  <X size={20} color="#94A3B8" />
                </button>
              </div>

              <form onSubmit={handleCreateExam} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label className="input-label">Exam Title *</label>
                  <input type="text" className="input-field" placeholder="Midterm Examination" value={title} onChange={(e) => setTitle(e.target.value)} required />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label className="input-label">Class Batch *</label>
                    <select className="input-field" value={selectedClassId} onChange={(e) => setSelectedClassId(e.target.value)} required>
                      <option value="">Select class...</option>
                      {classes.map((c) => (
                        <option key={c._id} value={c._id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="input-label">Exam Type</label>
                    <select className="input-field" value={type} onChange={(e) => setType(e.target.value)}>
                      <option value="midterm">Midterm</option>
                      <option value="final">Final Exam</option>
                      <option value="quiz">Quiz</option>
                    </select>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                  <div>
                    <label className="input-label">Duration (m)</label>
                    <input type="number" className="input-field" value={duration} onChange={(e) => setDuration(Number(e.target.value))} required />
                  </div>
                  <div>
                    <label className="input-label">Total Marks</label>
                    <input type="number" className="input-field" value={totalMarks} onChange={(e) => setTotalMarks(Number(e.target.value))} required />
                  </div>
                  <div>
                    <label className="input-label">Passing Marks</label>
                    <input type="number" className="input-field" value={passingMarks} onChange={(e) => setPassingMarks(Number(e.target.value))} required />
                  </div>
                </div>
                <div>
                  <label className="input-label">Exam Date & Time *</label>
                  <input type="datetime-local" className="input-field" value={date} onChange={(e) => setDate(e.target.value)} required />
                </div>

                <div style={{ display: 'flex', gap: 12, marginTop: 10 }}>
                  <button type="submit" className="btn-primary" style={{ flex: 1, justifyContent: 'center' }}>
                    Schedule Exam
                  </button>
                  <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary" style={{ flex: 1, justifyContent: 'center' }}>
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
