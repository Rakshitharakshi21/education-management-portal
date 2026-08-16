import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { examAPI } from '../../services/api';
import { format, isPast } from 'date-fns';
import { Award, Clock, CheckCircle, Calendar } from 'lucide-react';

export default function StudentExams() {
  const [exams, setExams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'upcoming' | 'past'>('upcoming');

  useEffect(() => {
    examAPI.getMyExams().then((res) => {
      setExams(res.data.data.exams || []);
    }).finally(() => setLoading(false));
  }, []);

  const upcoming = exams.filter((e) => !isPast(new Date(e.date as string)));
  const past = exams.filter((e) => isPast(new Date(e.date as string)));
  const display = tab === 'upcoming' ? upcoming : past;

  if (loading) return <div className="skeleton" style={{ height: 400, borderRadius: 16 }} />;

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
      <h1 style={{ margin: '0 0 8px', fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.5rem', color: '#0F172A' }}>Exams</h1>
      <p style={{ margin: '0 0 24px', color: '#64748B', fontSize: '0.875rem' }}>{exams.length} total exams</p>

      <div style={{ display: 'flex', gap: 4, background: '#F1F5F9', borderRadius: 12, padding: 4, marginBottom: 24, width: 'fit-content' }}>
        {(['upcoming', 'past'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              padding: '8px 20px', borderRadius: 9, border: 'none', cursor: 'pointer',
              fontWeight: 600, fontSize: '0.8rem', textTransform: 'capitalize',
              background: tab === t ? 'white' : 'transparent',
              color: tab === t ? '#1E293B' : '#94A3B8',
              boxShadow: tab === t ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
              transition: 'all 0.15s ease',
            }}
          >
            {t} ({t === 'upcoming' ? upcoming.length : past.length})
          </button>
        ))}
      </div>

      {display.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#94A3B8' }}>
          <Award size={48} style={{ marginBottom: 16, opacity: 0.3 }} />
          <p>No {tab} exams</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
          {display.map((exam, i) => {
            const submission = exam.submission as any;
            const typeColors: Record<string, string> = { midterm: '#7C3AED', final: '#EF4444', quiz: '#10B981', assignment: '#F59E0B' };
            const type = exam.type as string;
            return (
              <motion.div
                key={String(exam._id)}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="card"
                style={{ padding: '20px 24px' }}
                whileHover={{ y: -2 }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <span className="badge" style={{ background: `${typeColors[type] || '#94A3B8'}15`, color: typeColors[type] || '#64748B', textTransform: 'capitalize' }}>
                    {type}
                  </span>
                  {submission ? (
                    <span className="badge badge-green"><CheckCircle size={10} /> Submitted</span>
                  ) : isPast(new Date(exam.date as string)) ? (
                    <span className="badge badge-gray">Missed</span>
                  ) : (
                    <span className="badge badge-blue">Upcoming</span>
                  )}
                </div>

                <h3 style={{ margin: '0 0 6px', fontWeight: 700, fontSize: '0.95rem', color: '#1E293B' }}>{String(exam.title)}</h3>
                <p style={{ margin: '0 0 16px', fontSize: '0.8rem', color: '#64748B' }}>
                  {((exam.course as Record<string, unknown>)?.title as string)?.split(' ').slice(0, 3).join(' ')}
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.8rem', color: '#475569' }}>
                    <Calendar size={14} color="#94A3B8" />
                    {format(new Date(exam.date as string), 'EEEE, MMM d, yyyy — h:mm a')}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.8rem', color: '#475569' }}>
                    <Clock size={14} color="#94A3B8" />
                    {exam.duration as number} minutes
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.8rem', color: '#475569' }}>
                    <Award size={14} color="#94A3B8" />
                    {exam.totalMarks as number} marks | Pass: {exam.passingMarks as number}
                  </div>
                </div>

                {submission && (
                  <div style={{ padding: '10px 14px', background: '#F0FDF4', borderRadius: 10, border: '1px solid #BBF7D0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.8rem', color: '#065F46', fontWeight: 600 }}>Your Score</span>
                      <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, color: '#059669' }}>
                        {submission.obtainedMarks as number}/{exam.totalMarks as number} ({submission.percentage as number}%)
                      </span>
                    </div>
                    {submission.grade && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                        <span style={{ fontSize: '0.75rem', color: '#047857' }}>Grade</span>
                        <span style={{ fontWeight: 800, fontSize: '0.875rem', color: '#059669' }}>{String(submission.grade)}</span>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
