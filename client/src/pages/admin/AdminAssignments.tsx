import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { assignmentAPI } from '../../services/api';
import { ClipboardList, Clock, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';

interface Assignment {
  _id: string;
  title: string;
  dueDate: string;
  maxMarks: number;
  submissionCount: number;
  class: {
    name: string;
  };
  teacher: {
    name: string;
  };
}

export default function AdminAssignments() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    assignmentAPI.getAll({ limit: 100 }).then((res) => {
      setAssignments(res.data.data.results || []);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="skeleton" style={{ height: 400 }} />;

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.5rem', color: '#0F172A' }}>Assignment Track</h1>
        <p style={{ margin: '4px 0 0', color: '#64748B', fontSize: '0.875rem' }}>Track issued problem sets and submission volumes across all classes</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
        {assignments.map((asg) => (
          <div key={asg._id} className="card" style={{ background: 'white', padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
              <div>
                <h3 style={{ margin: 0, fontWeight: 800, fontSize: '1.05rem', color: '#1E293B' }}>{asg.title}</h3>
                <span style={{ fontSize: '0.75rem', color: '#64748B' }}>Batch: {asg.class?.name}</span>
              </div>
              <span className="badge badge-amber">{asg.maxMarks} marks</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: '0.8rem', color: '#475569' }}>
              <div>Instructor: <strong>{asg.teacher?.name || 'Unknown'}</strong></div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Clock size={14} color="#94A3B8" /> Due: {format(new Date(asg.dueDate), 'MMM d, yyyy')}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <CheckCircle size={14} color="#94A3B8" /> {asg.submissionCount || 0} Submissions
              </div>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
