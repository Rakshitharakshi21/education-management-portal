import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { assignmentAPI, submissionAPI } from '../../services/api';
import { format, isPast } from 'date-fns';
import { ClipboardList, Upload, CheckCircle, AlertTriangle, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

export default function StudentAssignments() {
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'pending' | 'submitted' | 'graded'>('pending');
  const [submitting, setSubmitting] = useState<string | null>(null);
  const [content, setContent] = useState('');
  const [submittingId, setSubmittingId] = useState<string | null>(null);

  useEffect(() => {
    assignmentAPI.getMyAssignments().then((res) => {
      setAssignments(res.data.data.assignments || []);
    }).finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (assignmentId: string) => {
    if (!content.trim()) return toast.error('Please enter your submission content.');
    try {
      setSubmittingId(assignmentId);
      await submissionAPI.submit({ assignmentId, content });
      toast.success('Assignment submitted successfully!');
      // Update local state
      setAssignments((prev) => prev.map((a) =>
        String(a._id) === assignmentId
          ? { ...a, isSubmitted: true, submission: { status: 'submitted' } }
          : a
      ));
      setSubmitting(null);
      setContent('');
    } catch (err: unknown) {
      toast.error((err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Submission failed.');
    } finally {
      setSubmittingId(null);
    }
  };

  const filtered = assignments.filter((a) => {
    if (activeTab === 'pending') return !a.isSubmitted;
    if (activeTab === 'submitted') return a.isSubmitted && (a.submission as Record<string, unknown>)?.status !== 'graded';
    return (a.submission as Record<string, unknown>)?.status === 'graded';
  });

  if (loading) return <div className="skeleton" style={{ height: 400, borderRadius: 16 }} />;

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
      <h1 style={{ margin: '0 0 8px', fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.5rem', color: '#0F172A' }}>Assignments</h1>
      <p style={{ margin: '0 0 24px', color: '#64748B', fontSize: '0.875rem' }}>{assignments.length} total assignments</p>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, background: '#F1F5F9', borderRadius: 12, padding: 4, marginBottom: 24, width: 'fit-content' }}>
        {(['pending', 'submitted', 'graded'] as const).map((tab) => {
          const count = assignments.filter((a) => {
            if (tab === 'pending') return !a.isSubmitted;
            if (tab === 'submitted') return a.isSubmitted && (a.submission as Record<string, unknown>)?.status !== 'graded';
            return (a.submission as Record<string, unknown>)?.status === 'graded';
          }).length;
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '8px 18px', borderRadius: 9, border: 'none', cursor: 'pointer',
                fontWeight: 600, fontSize: '0.8rem', textTransform: 'capitalize',
                background: activeTab === tab ? 'white' : 'transparent',
                color: activeTab === tab ? '#1E293B' : '#94A3B8',
                boxShadow: activeTab === tab ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                transition: 'all 0.15s ease',
              }}
            >
              {tab} {count > 0 && <span style={{ background: '#EFF6FF', color: '#2563EB', borderRadius: 10, padding: '1px 6px', marginLeft: 4 }}>{count}</span>}
            </button>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <div style={{ padding: '60px', textAlign: 'center', color: '#94A3B8' }}>
          <CheckCircle size={48} style={{ marginBottom: 16, opacity: 0.4 }} />
          <p>No {activeTab} assignments</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {filtered.map((a, i) => {
            const dueDate = new Date(a.dueDate as string);
            const isOverdue = isPast(dueDate) && !a.isSubmitted;
            const submission = a.submission as any;
            return (
              <motion.div
                key={String(a._id)}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="card"
                style={{ padding: '20px 24px', borderLeft: `4px solid ${isOverdue ? '#EF4444' : a.isSubmitted ? '#10B981' : '#F97316'}` }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                      <h3 style={{ margin: 0, fontWeight: 700, fontSize: '1rem', color: '#1E293B' }}>{String(a.title)}</h3>
                      {isOverdue && <span className="badge badge-red"><AlertTriangle size={10} /> Overdue</span>}
                      {a.isSubmitted && <span className="badge badge-green"><CheckCircle size={10} /> Submitted</span>}
                    </div>
                    <p style={{ margin: '0 0 12px', fontSize: '0.85rem', color: '#64748B', lineHeight: 1.6 }}>
                      {String(a.description)?.slice(0, 160)}{String(a.description)?.length > 160 ? '...' : ''}
                    </p>
                    <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.75rem', color: isOverdue ? '#EF4444' : '#64748B' }}>
                        <Clock size={13} />
                        Due: {format(dueDate, 'MMM d, yyyy — h:mm a')}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: '#64748B' }}>
                        <ClipboardList size={13} style={{ display: 'inline', marginRight: 4 }} />
                        {a.maxMarks as number} marks
                      </span>
                      {(a.course as any)?.title && (
                        <span style={{ fontSize: '0.75rem', color: '#64748B' }}>
                          📚 {(a.course as any).title as string}
                        </span>
                      )}
                    </div>

                    {/* Show grade if graded */}
                    {submission?.status === 'graded' && (
                      <div style={{ marginTop: 14, padding: '12px 16px', background: '#F0FDF4', borderRadius: 10, border: '1px solid #BBF7D0' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                          <p style={{ margin: 0, fontWeight: 700, color: '#065F46', fontSize: '0.875rem' }}>
                            Grade: {submission.marks as number}/{a.maxMarks as number} ({Math.round((submission.marks as number / (a.maxMarks as number)) * 100)}%)
                          </p>
                        </div>
                        {submission.feedback && (
                          <p style={{ margin: 0, fontSize: '0.8rem', color: '#047857' }}>
                            Feedback: {String(submission.feedback)}
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Submit button / form */}
                  {!a.isSubmitted && (
                    <div>
                      {submitting === String(a._id) ? (
                        <div style={{ width: 300 }}>
                          <textarea
                            className="input-field"
                            placeholder="Type your answer or paste your submission link..."
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            rows={4}
                            style={{ resize: 'vertical', marginBottom: 10 }}
                          />
                          <div style={{ display: 'flex', gap: 8 }}>
                            <button
                              onClick={() => handleSubmit(String(a._id))}
                              disabled={submittingId === String(a._id)}
                              className="btn-primary"
                              style={{ flex: 1, justifyContent: 'center', padding: '10px' }}
                            >
                              <Upload size={14} />
                              {submittingId === String(a._id) ? 'Submitting...' : 'Submit'}
                            </button>
                            <button onClick={() => setSubmitting(null)} className="btn-secondary" style={{ padding: '10px' }}>
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => { setSubmitting(String(a._id)); setContent(''); }}
                          className="btn-primary"
                          style={{ padding: '10px 18px' }}
                        >
                          <Upload size={15} />
                          Submit
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
