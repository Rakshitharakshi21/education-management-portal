import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ClipboardList, Plus, FileText, CheckCircle, Clock, X, AlertTriangle, Eye, ChevronRight } from 'lucide-react';
import { classAPI, assignmentAPI, submissionAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

interface Assignment {
  _id: string;
  title: string;
  dueDate: string;
  maxMarks: number;
  submissionCount: number;
  class: {
    _id: string;
    name: string;
  };
  course: {
    _id: string;
    title: string;
  };
}

interface Submission {
  _id: string;
  content: string;
  submittedAt: string;
  status: string;
  marks?: number;
  feedback?: string;
  isLate: boolean;
  student: {
    _id: string;
    name: string;
    email: string;
  };
}

export default function TeacherAssignments() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [classes, setClasses] = useState<Array<{ _id: string; name: string; course: { _id: string } }>>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [maxMarks, setMaxMarks] = useState(100);
  const [selectedClassId, setSelectedClassId] = useState('');

  // Submissions view state
  const [activeAssignment, setActiveAssignment] = useState<Assignment | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [subsLoading, setSubsLoading] = useState(false);

  // Grade state
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [marks, setMarks] = useState(0);
  const [feedback, setFeedback] = useState('');

  const loadData = async () => {
    try {
      const [asgRes, classRes] = await Promise.all([
        assignmentAPI.getAll({ limit: 100 }),
        classAPI.getMy(),
      ]);
      setAssignments(asgRes.data.data.results || []);
      setClasses(classRes.data.data.classes || []);
    } catch {
      toast.error('Failed to load assignments.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !dueDate || !selectedClassId) {
      return toast.error('Please fill in all required fields.');
    }

    const cls = classes.find((c) => c._id === selectedClassId);
    if (!cls) return toast.error('Invalid class group.');

    const payload = {
      title, description, dueDate, maxMarks,
      class: selectedClassId,
      course: cls.course?._id || cls.course,
    };

    try {
      await assignmentAPI.create(payload);
      toast.success('Assignment posted and students notified! 🔔');
      setModalOpen(false);
      setTitle('');
      setDescription('');
      loadData();
    } catch {
      toast.error('Failed to create assignment.');
    }
  };

  const viewSubmissions = async (asg: Assignment) => {
    setActiveAssignment(asg);
    setSubsLoading(true);
    try {
      const res = await submissionAPI.getForAssignment(asg._id);
      setSubmissions(res.data.data.results || []);
    } catch {
      toast.error('Failed to load submissions.');
    } finally {
      setSubsLoading(false);
    }
  };

  const openGradeModal = (sub: Submission) => {
    setSelectedSubmission(sub);
    setMarks(sub.marks || 0);
    setFeedback(sub.feedback || '');
  };

  const handleSaveGrade = async (e: React.FormEvent) => {
    e.preventDefault();
    if (marks < 0 || marks > (activeAssignment?.maxMarks || 100)) {
      return toast.error(`Marks must be between 0 and ${activeAssignment?.maxMarks || 100}.`);
    }

    try {
      await submissionAPI.grade(selectedSubmission!._id, { marks, feedback });
      toast.success('Submission graded successfully!');
      setSelectedSubmission(null);
      // Reload submissions list
      viewSubmissions(activeAssignment!);
    } catch {
      toast.error('Failed to save grade.');
    }
  };

  if (loading) return <div className="skeleton" style={{ height: 400, borderRadius: 16 }} />;

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
      {activeAssignment ? (
        // Submissions grading view
        <div>
          <button onClick={() => { setActiveAssignment(null); setSubmissions([]); }} className="btn-secondary" style={{ marginBottom: 20 }}>
            ← Back to Assignments
          </button>
          
          <div className="card" style={{ padding: 24, background: 'white', marginBottom: 24 }}>
            <h2 style={{ margin: '0 0 6px', fontWeight: 800, fontSize: '1.25rem' }}>{activeAssignment.title}</h2>
            <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748B' }}>
              Due: {format(new Date(activeAssignment.dueDate), 'PPP')} | Max Marks: {activeAssignment.maxMarks}
            </p>
          </div>

          <h3 style={{ fontWeight: 800, fontSize: '1.05rem', marginBottom: 16 }}>Submissions Received</h3>

          {subsLoading ? (
            <div className="skeleton" style={{ height: 200 }} />
          ) : submissions.length === 0 ? (
            <p style={{ color: '#94A3B8', textAlign: 'center', padding: 20 }}>No submissions received yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {submissions.map((sub) => (
                <div key={sub._id} className="card" style={{ padding: 20, background: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                      <p style={{ margin: 0, fontWeight: 700, fontSize: '0.9rem', color: '#1E293B' }}>{sub.student?.name}</p>
                      {sub.isLate && <span className="badge badge-red"><AlertTriangle size={10} /> Late</span>}
                      <span className={`badge badge-${sub.status === 'graded' ? 'green' : 'amber'}`}>
                        {sub.status}
                      </span>
                    </div>
                    <p style={{ margin: '0 0 8px', fontSize: '0.8rem', color: '#64748B' }}>
                      Submitted: {format(new Date(sub.submittedAt), 'PPp')}
                    </p>
                    <div style={{ padding: '10px 14px', background: '#F8FAFC', borderRadius: 8, fontSize: '0.825rem', color: '#334155', border: '1px solid #F1F5F9' }}>
                      {sub.content}
                    </div>
                  </div>

                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    {sub.status === 'graded' ? (
                      <div>
                        <span style={{ fontWeight: 800, fontSize: '1.1rem', color: '#10B981', display: 'block' }}>{sub.marks} / {activeAssignment.maxMarks}</span>
                        <button onClick={() => openGradeModal(sub)} className="btn-secondary" style={{ padding: '6px 10px', fontSize: '0.75rem', marginTop: 4 }}>
                          Change Grade
                        </button>
                      </div>
                    ) : (
                      <button onClick={() => openGradeModal(sub)} className="btn-primary" style={{ padding: '8px 14px', fontSize: '0.8rem' }}>
                        Grade Submission
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        // Main assignments overview
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
            <div>
              <h1 style={{ margin: 0, fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.5rem', color: '#0F172A' }}>Assignment Desk</h1>
              <p style={{ margin: '4px 0 0', color: '#64748B', fontSize: '0.875rem' }}>Post problem sets and grade deliverables</p>
            </div>
            <button onClick={() => setModalOpen(true)} className="btn-primary">
              <Plus size={18} /> Post Assignment
            </button>
          </div>

          {assignments.length === 0 ? (
            <div style={{ padding: '80px', textAlign: 'center', background: 'white', borderRadius: 16 }} className="card">
              <ClipboardList size={48} color="#CBD5E1" style={{ marginBottom: 16 }} />
              <h3>No assignments posted</h3>
              <button onClick={() => setModalOpen(true)} className="btn-primary" style={{ marginTop: 12 }}>Create Assignment</button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
              {assignments.map((asg) => (
                <div key={asg._id} className="card" style={{ background: 'white', padding: 24, display: 'flex', flexDirection: 'column', justifySelf: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                      <div>
                        <h3 style={{ margin: 0, fontWeight: 800, fontSize: '1.05rem', color: '#1E293B' }}>{asg.title}</h3>
                        <span style={{ fontSize: '0.75rem', color: '#64748B' }}>Batch: {asg.class?.name}</span>
                      </div>
                      <span className="badge badge-amber">{asg.maxMarks} marks</span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 20, fontSize: '0.8rem', color: '#475569' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Clock size={14} color="#94A3B8" /> Due: {format(new Date(asg.dueDate), 'MMM d, yyyy')}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <CheckCircle size={14} color="#94A3B8" /> {asg.submissionCount || 0} Submissions
                      </div>
                    </div>
                  </div>

                  <button onClick={() => viewSubmissions(asg)} className="btn-primary" style={{ justifyContent: 'center', padding: '10px' }}>
                    <Eye size={14} /> Review & Grade
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Grade modal */}
      <AnimatePresence>
        {selectedSubmission && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div onClick={() => setSelectedSubmission(null)} style={{ position: 'absolute', inset: 0, background: 'rgba(15,23,42,0.4)', backdropFilter: 'blur(4px)' }} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="card" style={{ position: 'relative', width: '100%', maxWidth: 440, background: 'white', padding: 28, zIndex: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                <h3 style={{ margin: 0, fontWeight: 800, fontSize: '1.1rem' }}>Grade Submission: {selectedSubmission.student?.name}</h3>
                <button onClick={() => setSelectedSubmission(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                  <X size={20} color="#94A3B8" />
                </button>
              </div>

              <form onSubmit={handleSaveGrade} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label className="input-label">Score (Max: {activeAssignment?.maxMarks || 100}) *</label>
                  <input
                    type="number" className="input-field"
                    value={marks} onChange={(e) => setMarks(Number(e.target.value))}
                    max={activeAssignment?.maxMarks || 100} min={0} required
                  />
                </div>
                <div>
                  <label className="input-label">Feedback / Recommendation</label>
                  <textarea
                    className="input-field" placeholder="Excellent focus, check margin calculations next time."
                    value={feedback} onChange={(e) => setFeedback(e.target.value)} rows={3}
                  />
                </div>

                <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                  <button type="submit" className="btn-primary" style={{ flex: 1, justifyContent: 'center' }}>
                    Save Grade
                  </button>
                  <button type="button" onClick={() => setSelectedSubmission(null)} className="btn-secondary" style={{ flex: 1, justifyContent: 'center' }}>
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Create Modal */}
      <AnimatePresence>
        {modalOpen && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div onClick={() => setModalOpen(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(15,23,42,0.4)', backdropFilter: 'blur(4px)' }} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="card" style={{ position: 'relative', width: '100%', maxWidth: 500, background: 'white', padding: 28, zIndex: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                <h3 style={{ margin: 0, fontWeight: 800, fontSize: '1.2rem', fontFamily: 'var(--font-display)' }}>Post Class Assignment</h3>
                <button onClick={() => setModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                  <X size={20} color="#94A3B8" />
                </button>
              </div>

              <form onSubmit={handleCreateAssignment} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label className="input-label">Assignment Title *</label>
                  <input type="text" className="input-field" placeholder="Problem Set 1: React Components" value={title} onChange={(e) => setTitle(e.target.value)} required />
                </div>
                <div>
                  <label className="input-label">Description / Instructions</label>
                  <textarea className="input-field" placeholder="Instructions, references, and expected formats..." value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
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
                    <label className="input-label">Max Marks</label>
                    <input type="number" className="input-field" value={maxMarks} onChange={(e) => setMaxMarks(Number(e.target.value))} required />
                  </div>
                </div>
                <div>
                  <label className="input-label">Due Date *</label>
                  <input type="datetime-local" className="input-field" value={dueDate} onChange={(e) => setDueDate(e.target.value)} required />
                </div>

                <div style={{ display: 'flex', gap: 12, marginTop: 10 }}>
                  <button type="submit" className="btn-primary" style={{ flex: 1, justifyContent: 'center' }}>
                    Post Assignment
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
