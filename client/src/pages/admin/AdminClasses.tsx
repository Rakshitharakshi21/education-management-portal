import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { classAPI } from '../../services/api';
import { Users, Calendar, MapPin, Award } from 'lucide-react';
import toast from 'react-hot-toast';

interface ClassGroup {
  _id: string;
  name: string;
  section: string;
  room: string;
  academicYear: string;
  course: {
    title: string;
  };
  teacher: {
    name: string;
  };
  students: string[];
}

export default function AdminClasses() {
  const [classes, setClasses] = useState<ClassGroup[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    classAPI.getAll({ limit: 100 }).then((res) => {
      setClasses(res.data.data.results || []);
    }).catch(() => {
      toast.error('Failed to load classes.');
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="skeleton" style={{ height: 400 }} />;

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.5rem', color: '#0F172A' }}>Class Groups</h1>
        <p style={{ margin: '4px 0 0', color: '#64748B', fontSize: '0.875rem' }}>Overview of active sections, slots and timetables across faculties</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
        {classes.map((c) => (
          <div key={c._id} className="card" style={{ background: 'white', padding: 24, display: 'flex', flexDirection: 'column', justifySelf: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                <div>
                  <h3 style={{ margin: 0, fontWeight: 800, fontSize: '1.05rem', color: '#1E293B' }}>{c.name}</h3>
                  <span style={{ fontSize: '0.78rem', color: '#64748B' }}>📚 {c.course?.title}</span>
                </div>
                <span className="badge badge-blue">Sec {c.section}</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20, fontSize: '0.8rem', color: '#475569' }}>
                <div>Instructor: <strong>{c.teacher?.name || 'Unknown'}</strong></div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <MapPin size={14} color="#94A3B8" /> Room: {c.room || 'TBD'}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Users size={14} color="#94A3B8" /> {c.students?.length || 0} enrolled students
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
