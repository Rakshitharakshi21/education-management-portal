import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, BookOpen, Clock, Tag, ChevronRight, Filter } from 'lucide-react';
import { courseAPI, categoryAPI } from '../../services/api';
import { Link } from 'react-router-dom';

interface Course {
  _id: string;
  title: string;
  slug: string;
  shortDescription: string;
  thumbnail?: string;
  level: string;
  duration: string;
  totalHours: number;
  enrollmentCount: number;
  category: {
    _id?: string;
    name: string;
    color: string;
  };
  teacher: {
    name: string;
    avatar?: string;
  };
}

interface Category {
  _id: string;
  name: string;
  slug: string;
}

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [courseRes, catRes] = await Promise.all([
          courseAPI.getAll({ limit: 100 }),
          categoryAPI.getAll(),
        ]);
        setCourses(courseRes.data.data.results || []);
        setCategories(catRes.data.data.categories || []);
      } catch (err) {
        console.error('Error fetching courses:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filtered = courses.filter((c) => {
    const matchesSearch = c.title.toLowerCase().includes(search.toLowerCase()) || 
                          c.shortDescription.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory ? String(c.category?._id || c.category) === selectedCategory : true;
    const matchesLevel = selectedLevel ? c.level === selectedLevel : true;
    return matchesSearch && matchesCategory && matchesLevel;
  });

  return (
    <div style={{ background: 'var(--color-cream)', minHeight: '100vh', padding: '40px 0' }}>
      <div className="container-xl">
        {/* Header */}
        <div style={{ marginBottom: 40, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <h1 className="text-editorial text-gradient-primary" style={{ fontSize: '2.5rem', margin: 0 }}>
            Explore Our Courseware
          </h1>
          <p style={{ color: '#64748B', fontSize: '1rem', margin: 0, maxWidth: 600 }}>
            Unlock state-of-the-art curricula taught by seasoned practitioners and backed by automated learning support.
          </p>
        </div>

        {/* Filters Panel */}
        <div className="card" style={{ padding: 20, marginBottom: 32, display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center', background: 'white' }}>
          {/* Search */}
          <div style={{ position: 'relative', flex: 1, minWidth: 260 }}>
            <Search size={16} color="#94A3B8" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              className="input-field"
              placeholder="Search by title, description or tag..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: 42 }}
            />
          </div>

          {/* Category Filter */}
          <div style={{ minWidth: 180 }}>
            <select
              className="input-field"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              style={{ cursor: 'pointer' }}
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>{cat.name}</option>
              ))}
            </select>
          </div>

          {/* Level Filter */}
          <div style={{ minWidth: 150 }}>
            <select
              className="input-field"
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              style={{ cursor: 'pointer' }}
            >
              <option value="">All Levels</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
        </div>

        {/* Courses Grid */}
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 24 }}>
            {[...Array(6)].map((_, i) => (
              <div key={i} className="skeleton" style={{ height: 350, borderRadius: 16 }} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 20px', background: 'white', borderRadius: 16 }} className="card">
            <BookOpen size={48} color="#CBD5E1" style={{ marginBottom: 16 }} />
            <h3 style={{ margin: '0 0 8px', color: '#1E293B' }}>No courses match your filter</h3>
            <p style={{ color: '#64748B', margin: 0 }}>Try clearing your filters or search keywords.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 24 }}>
            {filtered.map((course, idx) => (
              <motion.div
                key={course._id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: idx * 0.05 }}
                className="card"
                style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column', background: 'white' }}
                whileHover={{ y: -4 }}
              >
                {/* Thumbnail */}
                <div style={{ position: 'relative', height: 160, overflow: 'hidden' }}>
                  <img
                    src={course.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600'}
                    alt={course.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <div style={{ position: 'absolute', top: 12, left: 12, display: 'flex', gap: 8 }}>
                    <span className="badge" style={{ background: 'rgba(0, 0, 0, 0.65)', color: 'white', backdropFilter: 'blur(4px)', textTransform: 'capitalize' }}>
                      {course.level}
                    </span>
                  </div>
                </div>

                {/* Details */}
                <div style={{ padding: 20, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    {course.category?.name && (
                      <span className="badge" style={{ background: `${course.category.color || '#3B82F6'}15`, color: course.category.color || '#3B82F6', marginBottom: 10 }}>
                        {course.category.name}
                      </span>
                    )}

                    <h3 style={{ margin: '0 0 8px', fontSize: '1.05rem', fontWeight: 800, color: '#0F172A', lineHeight: 1.45 }}>
                      {course.title}
                    </h3>

                    <p style={{ margin: '0 0 16px', fontSize: '0.85rem', color: '#64748B', lineHeight: 1.6 }}>
                      {course.shortDescription}
                    </p>
                  </div>

                  <div>
                    {/* Meta info */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16, borderTop: '1px solid #F1F5F9', paddingTop: 14, marginBottom: 14 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.75rem', color: '#64748B' }}>
                        <Clock size={14} color="#94A3B8" />
                        {course.duration || `${course.totalHours} hours`}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.75rem', color: '#64748B' }}>
                        <BookOpen size={14} color="#94A3B8" />
                        {course.enrollmentCount} enrolled
                      </div>
                    </div>

                    {/* Footer Actions */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      {course.teacher && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          {course.teacher.avatar ? (
                            <img src={course.teacher.avatar} alt={course.teacher.name} className="avatar" style={{ width: 28, height: 28 }} />
                          ) : (
                            <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '0.75rem', fontWeight: 700 }}>
                              {course.teacher.name.charAt(0)}
                            </div>
                          )}
                          <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#334155' }}>{course.teacher.name}</span>
                        </div>
                      )}

                      <Link
                        to={`/courses/${course.slug || course._id}`}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontWeight: 700, fontSize: '0.8rem', color: '#2563EB', textDecoration: 'none' }}
                      >
                        Explore <ChevronRight size={14} />
                      </Link>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
