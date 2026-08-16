import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { examAPI } from '../../services/api';
import { Award, Calendar, Clock } from 'lucide-react';
import { format } from 'date-fns';

interface Exam {
  _id: string;
  title: string;
  date: string;
  duration: number;
  totalMarks: number;
  passingMarks: number;
  type: string;
  class: {
    name: string;
  };
  teacher: {
    name: string;
  };
}

export default function AdminExams() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    examAPI.getAll({ limit: 100 }).then((res) => {
      setExams(res.data.data.results || []);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="skeleton" style={{ height: 400 }} />;

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.5rem', color: '#0F172A' }}>Examinations</h1>
        <p style={{ margin: '4px 0 0', color: '#64748B', fontSize: '0.875rem' }}>Overview of active, scheduled and completed examinations portal-wide</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
        {exams.map((exam) => (
          <div key={exam._id} className="card" style={{ background: 'white', padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
              <div>
                <h3 style={{ margin: 0, fontWeight: 800, fontSize: '1.05rem', color: '#1E293B' }}>{exam.title}</h3>
                <span style={{ fontSize: '0.75rem', color: '#64748B' }}>Batch: {exam.class?.name}</span>
              </div>
              <span className="badge badge-blue" style={{ textTransform: 'capitalize' }}>{exam.type}</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: '0.8rem', color: '#475569' }}>
              <div>Examiner: <strong>{exam.teacher?.name || 'Unknown'}</strong></div>
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
        ))}
      </div>
    </motion.div>
  );
}
