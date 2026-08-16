import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Plus, Clock, Award, Trash2, Edit3, X, Eye } from 'lucide-react';
import { courseAPI, categoryAPI } from '../../services/api';
import toast from 'react-hot-toast';

interface Course {
  _id: string;
  title: string;
  shortDescription: string;
  description: string;
  level: string;
  duration: string;
  totalHours: number;
  maxStudents: number;
  published: boolean;
  thumbnail?: string;
  enrollmentCount: number;
  category: {
    _id?: string;
    name: string;
  };
}

interface Category {
  _id: string;
  name: string;
}

export default function TeacherCourses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editCourse, setEditCourse] = useState<Course | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [level, setLevel] = useState('beginner');
  const [duration, setDuration] = useState('10 weeks');
  const [totalHours, setTotalHours] = useState(60);
  const [maxStudents, setMaxStudents] = useState(40);
  const [thumbnail, setThumbnail] = useState('');

  const loadData = async () => {
    try {
      const [courseRes, catRes] = await Promise.all([
        courseAPI.getMyCourses(),
        categoryAPI.getAll(),
      ]);
      setCourses(courseRes.data.data.courses || []);
      setCategories(catRes.data.data.categories || []);
    } catch {
      toast.error('Failed to load courses.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openCreateModal = () => {
    setEditCourse(null);
    setTitle('');
    setShortDescription('');
    setDescription('');
    setCategory(categories[0]?._id || '');
    setLevel('beginner');
    setDuration('10 weeks');
    setTotalHours(60);
    setMaxStudents(40);
    setThumbnail('');
    setModalOpen(true);
  };

  const openEditModal = (c: Course) => {
    setEditCourse(c);
    setTitle(c.title);
    setShortDescription(c.shortDescription);
    setDescription(c.description);
    setCategory(typeof c.category === 'object' ? c.category._id || '' : String(c.category));
    setLevel(c.level);
    setDuration(c.duration);
    setTotalHours(c.totalHours);
    setMaxStudents(c.maxStudents || 40);
    setThumbnail(c.thumbnail || '');
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !shortDescription || !description || !category) {
      return toast.error('Please fill in all required fields.');
    }

    const payload = {
      title, shortDescription, description, category,
      level, duration, totalHours, maxStudents, thumbnail,
    };

    try {
      if (editCourse) {
        await courseAPI.update(editCourse._id, payload);
        toast.success('Course updated successfully!');
      } else {
        await courseAPI.create(payload);
        toast.success('Course created successfully!');
      }
      setModalOpen(false);
      loadData();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Action failed.';
      toast.error(msg);
    }
  };

  const togglePublish = async (c: Course) => {
    try {
      await courseAPI.update(c._id, { published: !c.published });
      toast.success(c.published ? 'Course unpublished.' : 'Course published!');
      loadData();
    } catch {
      toast.error('Failed to update publishing status.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this course? This action is permanent.')) return;
    try {
      await courseAPI.delete(id);
      toast.success('Course deleted.');
      loadData();
    } catch {
      toast.error('Failed to delete course.');
    }
  };

  if (loading) return <div className="skeleton" style={{ height: 400, borderRadius: 16 }} />;

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <h1 style={{ margin: 0, fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.5rem', color: '#0F172A' }}>My Courses</h1>
          <p style={{ margin: '4px 0 0', color: '#64748B', fontSize: '0.875rem' }}>Create and manage syllabi and courses</p>
        </div>
        <button onClick={openCreateModal} className="btn-primary">
          <Plus size={18} /> New Course
        </button>
      </div>

      {courses.length === 0 ? (
        <div style={{ padding: '80px', textAlign: 'center', background: 'white', borderRadius: 16 }} className="card">
          <BookOpen size={48} color="#CBD5E1" style={{ marginBottom: 16 }} />
          <h3>No courses created yet</h3>
          <button onClick={openCreateModal} className="btn-primary" style={{ marginTop: 12 }}>Create Course</button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
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
                    {course.published ? 'Published' : 'Draft'}
                  </span>
                </div>
              </div>

              <div style={{ padding: 20, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <h3 style={{ margin: '0 0 6px', fontWeight: 800, fontSize: '1rem', color: '#1E293B', lineHeight: 1.4 }}>
                    {course.title}
                  </h3>
                  <p style={{ margin: '0 0 16px', fontSize: '0.825rem', color: '#64748B', lineHeight: 1.5 }}>
                    {course.shortDescription}
                  </p>
                </div>

                <div>
                  <div style={{ display: 'flex', gap: 16, borderTop: '1px solid #F1F5F9', paddingTop: 12, marginBottom: 16, fontSize: '0.75rem', color: '#64748B' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Clock size={13} /> {course.totalHours} hours
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Plus size={13} /> {course.enrollmentCount} students
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => openEditModal(course)} className="btn-secondary" style={{ padding: '8px 12px', flex: 1, justifyContent: 'center' }}>
                      <Edit3 size={14} /> Edit
                    </button>
                    <button onClick={() => togglePublish(course)} className="btn-secondary" style={{ padding: '8px 12px', flex: 1, justifyContent: 'center', color: course.published ? '#E2E8F0' : '#2563EB' }}>
                      <Eye size={14} /> {course.published ? 'Unpublish' : 'Publish'}
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
      )}

      {/* Create / Edit Modal */}
      <AnimatePresence>
        {modalOpen && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setModalOpen(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(15,23,42,0.4)', backdropFilter: 'blur(4px)' }} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 16 }} className="card" style={{ position: 'relative', width: '100%', maxWidth: 580, maxHeight: '90vh', overflowY: 'auto', background: 'white', padding: 28, zIndex: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                <h3 style={{ margin: 0, fontWeight: 800, fontSize: '1.2rem', fontFamily: 'var(--font-display)' }}>
                  {editCourse ? 'Edit Course Details' : 'Publish New Course'}
                </h3>
                <button onClick={() => setModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                  <X size={20} color="#94A3B8" />
                </button>
              </div>

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label className="input-label">Course Title *</label>
                  <input type="text" className="input-field" value={title} onChange={(e) => setTitle(e.target.value)} required />
                </div>
                <div>
                  <label className="input-label">Short Description *</label>
                  <input type="text" className="input-field" value={shortDescription} onChange={(e) => setShortDescription(e.target.value)} required />
                </div>
                <div>
                  <label className="input-label">Detailed Overview *</label>
                  <textarea className="input-field" value={description} onChange={(e) => setDescription(e.target.value)} rows={4} required />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label className="input-label">Category *</label>
                    <select className="input-field" value={category} onChange={(e) => setCategory(e.target.value)} required>
                      {categories.map((c) => (
                        <option key={c._id} value={c._id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="input-label">Difficulty Level</label>
                    <select className="input-field" value={level} onChange={(e) => setLevel(e.target.value)}>
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                    </select>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label className="input-label">Duration (e.g. 12 weeks)</label>
                    <input type="text" className="input-field" value={duration} onChange={(e) => setDuration(e.target.value)} />
                  </div>
                  <div>
                    <label className="input-label">Total Syllabus Hours</label>
                    <input type="number" className="input-field" value={totalHours} onChange={(e) => setTotalHours(Number(e.target.value))} />
                  </div>
                </div>
                <div>
                  <label className="input-label">Thumbnail URL</label>
                  <input type="text" className="input-field" placeholder="https://images.unsplash.com/..." value={thumbnail} onChange={(e) => setThumbnail(e.target.value)} />
                </div>

                <div style={{ display: 'flex', gap: 12, marginTop: 10 }}>
                  <button type="submit" className="btn-primary" style={{ flex: 1, justifyContent: 'center' }}>
                    {editCourse ? 'Save Changes' : 'Create Course'}
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
