import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { courseAPI } from '../../services/api';
import { BookOpen, Clock, Trash2, Eye, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';

interface Course {
  _id: string;
  title: string;
  shortDescription: string;
  level: string;
  published: boolean;
  enrollmentCount: number;
  totalHours: number;
  thumbnail?: string;
  teacher?: {
    name: string;
  };
  category?: {
    name: string;
  };
}

export default function AdminCourses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const res = await courseAPI.getAll({ limit: 100 });
      setCourses(res.data.data.results || []);
    } catch {
      toast.error('Failed to load courses.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const togglePublish = async (c: Course) => {
    try {
      await courseAPI.update(c._id, { published: !c.published });
      toast.success(c.published ? 'Course unpublished.' : 'Course approved and published! 🚀');
      loadData();
    } catch {
      toast.error('Failed to update publishing status.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this course permanently? This cannot be undone.')) return;
    try {
      await courseAPI.delete(id);
      toast.success('Course deleted.');
      loadData();
    } catch {
      toast.error('Failed to delete course.');
    }
  };

  if (loading) return <div className="skeleton" style={{ height: 400 }} />;

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ margin: 0, fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.5rem', color: '#0F172A' }}>Institutional Courses</h1>
          <p style={{ margin: '4px 0 0', color: '#64748B', fontSize: '0.875rem' }}>Monitor, approve, and audit courses across all faculties</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
        {courses.map((course) => (
          <div key={course._id} className="card" style={{ background: 'white', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ position: 'relative', height: 140, overflow: 'hidden' }}>
              <img
                src={course.thumbnail || 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=600'}
                alt={course.title}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <div style={{ position: 'absolute', top: 12, right: 12 }}>
                <span className={`badge badge-${course.published ? 'green' : 'gray'}`}>
                  {course.published ? 'Active / Published' : 'Pending Audit / Draft'}
                </span>
              </div>
            </div>

            <div style={{ padding: 20, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <span style={{ fontSize: '0.7rem', color: '#94A3B8', fontWeight: 600, textTransform: 'uppercase' }}>
                  {course.category?.name || 'Unassigned'}
                </span>
                <h3 style={{ margin: '4px 0 6px', fontWeight: 800, fontSize: '1rem', color: '#1E293B', lineHeight: 1.4 }}>
                  {course.title}
                </h3>
                <p style={{ margin: '0 0 16px', fontSize: '0.825rem', color: '#64748B', lineHeight: 1.5 }}>
                  {course.shortDescription}
                </p>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #F1F5F9', paddingTop: 12, marginBottom: 16, fontSize: '0.75rem', color: '#64748B' }}>
                  <span>Instructor: {course.teacher?.name || 'Unknown'}</span>
                  <span>{course.enrollmentCount} enrolled</span>
                </div>

                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => togglePublish(course)} className="btn-secondary" style={{ padding: '8px 12px', flex: 1, justifyContent: 'center' }}>
                    <ShieldCheck size={14} /> {course.published ? 'Unpublish' : 'Approve & Publish'}
                  </button>
                  <button onClick={() => handleDelete(course._id)} className="btn-danger" style={{ padding: '8px 12px', flexShrink: 0 }}>
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
