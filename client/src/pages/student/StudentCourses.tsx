import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { BookOpen, Clock, Award, Play, Search } from 'lucide-react';
import { enrollmentAPI } from '../../services/api';
import { format } from 'date-fns';

export default function StudentCourses() {
  const [enrollments, setEnrollments] = useState<Array<Record<string, unknown>>>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    enrollmentAPI.getMyEnrollments().then((res) => {
      setEnrollments(res.data.data.enrollments || []);
    }).finally(() => setLoading(false));
  }, []);

  const filtered = enrollments.filter((e) => {
    const courseName = ((e.course as Record<string, unknown>)?.title as string || '').toLowerCase();
    return courseName.includes(search.toLowerCase());
  });

  if (loading) return <div className="skeleton" style={{ height: 400, borderRadius: 16 }} />;

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ margin: 0, fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.5rem', color: '#0F172A' }}>My Courses</h1>
          <p style={{ margin: '4px 0 0', color: '#64748B', fontSize: '0.875rem' }}>{enrollments.length} enrolled courses</p>
        </div>
        <Link to="/courses" className="btn-secondary" style={{ padding: '10px 18px' }}>
          Browse More
        </Link>
      </div>

      <div style={{ position: 'relative', marginBottom: 24 }}>
        <Search size={16} color="#94A3B8" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
        <input
          type="text"
          className="input-field"
          placeholder="Search courses..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ paddingLeft: 42 }}
        />
      </div>

      {filtered.length === 0 ? (
        <div style={{ padding: '60px 20px', textAlign: 'center' }}>
          <BookOpen size={48} color="#E2E8F0" style={{ marginBottom: 16 }} />
          <h3 style={{ color: '#64748B', margin: '0 0 8px' }}>No courses found</h3>
          <Link to="/courses" className="btn-primary">Browse Courses</Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
          {filtered.map((e, i) => {
            const course = e.course as Record<string, unknown>;
            const progress = e.progress as number || 0;
            const teacher = course.teacher as Record<string, unknown>;
            return (
              <motion.div
                key={String(e._id)}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className="card"
                style={{ overflow: 'hidden' }}
                whileHover={{ y: -3 }}
              >
                <div style={{ position: 'relative', height: 140, overflow: 'hidden' }}>
                  <img
                    src={course.thumbnail as string || 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=600'}
                    alt={course.title as string}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <div style={{ position: 'absolute', bottom: 10, left: 10 }}>
                    <span className="badge" style={{ background: 'rgba(0,0,0,0.6)', color: 'white', backdropFilter: 'blur(4px)' }}>
                      {course.level as string}
                    </span>
                  </div>
                </div>
                <div style={{ padding: '18px' }}>
                  <h3 style={{ margin: '0 0 6px', fontWeight: 700, fontSize: '0.95rem', color: '#1E293B', lineHeight: 1.4 }}>
                    {course.title as string}
                  </h3>
                  {teacher && (
                    <p style={{ margin: '0 0 14px', fontSize: '0.8rem', color: '#64748B' }}>
                      {teacher.name as string}
                    </p>
                  )}
                  
                  {/* Progress bar */}
                  <div style={{ marginBottom: 14 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748B' }}>Progress</span>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#2563EB' }}>{progress}%</span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${progress}%` }} />
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#64748B', fontSize: '0.75rem' }}>
                      <Clock size={13} />
                      {course.totalHours as number}h
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#64748B', fontSize: '0.75rem' }}>
                      <Award size={13} />
                      {(e.enrolledAt as string) && format(new Date(e.enrolledAt as string), 'MMM d')}
                    </div>
                    <button className="btn-primary" style={{ marginLeft: 'auto', padding: '7px 14px', fontSize: '0.8rem' }}>
                      <Play size={14} />
                      Continue
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
