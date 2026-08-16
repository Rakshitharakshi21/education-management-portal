import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, Clock, Award, Star, CheckCircle, ArrowLeft, ArrowRight, Sparkles } from 'lucide-react';
import { courseAPI, enrollmentAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

interface Course {
  _id: string;
  title: string;
  slug: string;
  shortDescription: string;
  description: string;
  thumbnail?: string;
  level: string;
  duration: string;
  totalHours: number;
  maxStudents: number;
  enrollmentCount: number;
  syllabus: Array<{
    week: number;
    title: string;
    topics: string[];
  }>;
  prerequisites: string[];
  tags: string[];
  category?: {
    name: string;
    color: string;
  };
  teacher?: {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
    bio?: string;
  };
}

export default function CourseDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [enrollLoading, setEnrollLoading] = useState(false);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const res = await courseAPI.getById(id!);
        setCourse(res.data.data.course);
        
        // If logged in, check if student is already enrolled in this course
        if (isAuthenticated && user?.role === 'student') {
          const enrollmentsRes = await enrollmentAPI.getMyEnrollments();
          const list = enrollmentsRes.data.data.enrollments || [];
          const matched = list.some((e: { course: { _id?: string } | string }) => {
            const courseId = typeof e.course === 'object' ? e.course?._id : e.course;
            return String(courseId) === String(res.data.data.course?._id);
          });
          setIsEnrolled(matched);
        }
      } catch (err) {
        console.error('Error fetching course:', err);
        toast.error('Failed to load course details.');
      } finally {
        setLoading(false);
      }
    };
    fetchCourse();
  }, [id, isAuthenticated, user]);

  const handleEnroll = async () => {
    if (!isAuthenticated) {
      toast('Please sign in to enroll in this course.');
      navigate('/login');
      return;
    }

    if (user?.role !== 'student') {
      toast.error('Only students can enroll in courses.');
      return;
    }

    setEnrollLoading(true);
    try {
      await enrollmentAPI.enroll(course!._id);
      setIsEnrolled(true);
      toast.success(`Welcome to ${course!.title}! 🎉`);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Enrollment failed.';
      toast.error(msg);
    } finally {
      setEnrollLoading(false);
    }
  };

  if (loading) return <div className="skeleton" style={{ minHeight: '60vh', margin: '40px 24px', borderRadius: 24 }} />;
  if (!course) return (
    <div style={{ padding: '80px 20px', textAlign: 'center' }}>
      <h3 style={{ color: '#64748B' }}>Course not found.</h3>
      <Link to="/courses" className="btn-primary" style={{ marginTop: 16 }}>Back to Catalog</Link>
    </div>
  );

  return (
    <div style={{ background: 'var(--color-cream)', minHeight: '100vh', padding: '40px 0' }}>
      <div className="container-xl">
        {/* Back Link */}
        <Link to="/courses" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#64748B', fontWeight: 600, fontSize: '0.85rem', textDecoration: 'none', marginBottom: 24 }}>
          <ArrowLeft size={16} /> Back to Catalog
        </Link>

        {/* Hero Section */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 40, marginBottom: 48, alignItems: 'start' }}>
          <div>
            {course.category?.name && (
              <span className="badge" style={{ background: `${course.category.color || '#3B82F6'}15`, color: course.category.color || '#3B82F6', marginBottom: 14 }}>
                {course.category.name}
              </span>
            )}
            <h1 className="text-editorial" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', color: '#0F172A', lineHeight: 1.15, marginBottom: 18 }}>
              {course.title}
            </h1>
            <p style={{ color: '#475569', fontSize: '1.05rem', lineHeight: 1.65, marginBottom: 24 }}>
              {course.shortDescription}
            </p>

            <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', marginBottom: 32 }}>
              <div>
                <span style={{ display: 'block', fontSize: '0.7rem', color: '#94A3B8', textTransform: 'uppercase', fontWeight: 600 }}>Level</span>
                <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1E293B', textTransform: 'capitalize' }}>{course.level}</span>
              </div>
              <div>
                <span style={{ display: 'block', fontSize: '0.7rem', color: '#94A3B8', textTransform: 'uppercase', fontWeight: 600 }}>Duration</span>
                <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1E293B' }}>{course.duration}</span>
              </div>
              <div>
                <span style={{ display: 'block', fontSize: '0.7rem', color: '#94A3B8', textTransform: 'uppercase', fontWeight: 600 }}>Total Effort</span>
                <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1E293B' }}>{course.totalHours} Hours</span>
              </div>
              <div>
                <span style={{ display: 'block', fontSize: '0.7rem', color: '#94A3B8', textTransform: 'uppercase', fontWeight: 600 }}>Class Size</span>
                <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1E293B' }}>Max {course.maxStudents || 40} Students</span>
              </div>
            </div>

            {/* Main description */}
            <div className="card" style={{ padding: 28, background: 'white', marginBottom: 32 }}>
              <h3 style={{ margin: '0 0 14px', fontWeight: 800, fontSize: '1.1rem', fontFamily: 'var(--font-display)' }}>Course Overview</h3>
              <p style={{ margin: 0, color: '#475569', fontSize: '0.92rem', lineHeight: 1.7, whiteSpace: 'pre-line' }}>
                {course.description}
              </p>
            </div>
          </div>

          {/* Sticky Enrollment card */}
          <div className="card" style={{ padding: 24, background: 'white', border: '1.5px solid #F1F5F9', position: 'sticky', top: 96 }}>
            <div style={{ height: 180, borderRadius: 12, overflow: 'hidden', marginBottom: 20 }}>
              <img
                src={course.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600'}
                alt={course.title}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>

            <div style={{ marginBottom: 24 }}>
              <p style={{ margin: 0, fontSize: '0.75rem', color: '#94A3B8', textTransform: 'uppercase' }}>Student Enrollment</p>
              <p style={{ margin: '2px 0 0', fontWeight: 800, fontSize: '1.4rem', fontFamily: 'var(--font-display)', color: '#0F172A' }}>
                {course.enrollmentCount} Active Learners
              </p>
            </div>

            {isEnrolled ? (
              <Link to="/student/courses" className="btn-primary" style={{ width: '100%', justifyContent: 'center', background: '#10B981' }}>
                <CheckCircle size={18} /> Already Enrolled — Go to Class
              </Link>
            ) : (
              <button
                onClick={handleEnroll}
                disabled={enrollLoading}
                className="btn-primary"
                style={{ width: '100%', justifyContent: 'center', padding: '14px', fontSize: '0.95rem' }}
              >
                {enrollLoading ? 'Enrolling...' : (
                  <>
                    Enroll Now <ArrowRight size={18} />
                  </>
                )}
              </button>
            )}

            <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginTop: 20, borderTop: '1px solid #F1F5F9', paddingTop: 16 }}>
              <Sparkles size={16} color="#7C3AED" />
              <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 500 }}>AI Performance Prediction included</span>
            </div>
          </div>
        </div>

        {/* Detailed sections */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 40, alignItems: 'start' }}>
          {/* Syllabus */}
          <div>
            <h2 className="text-editorial" style={{ fontSize: '1.75rem', marginBottom: 24 }}>Syllabus & Timeline</h2>
            {course.syllabus && course.syllabus.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {course.syllabus.map((week, idx) => (
                  <div key={idx} className="card" style={{ padding: 24, background: 'white' }}>
                    <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                      <div style={{ width: 44, height: 44, borderRadius: 10, background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <span style={{ fontWeight: 800, color: '#2563EB', fontSize: '0.95rem' }}>W{week.week}</span>
                      </div>
                      <div>
                        <h4 style={{ margin: '0 0 8px', fontWeight: 800, fontSize: '0.95rem', color: '#0F172A' }}>{week.title}</h4>
                        <ul style={{ margin: 0, paddingLeft: 20, color: '#475569', fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: 4 }}>
                          {week.topics.map((topic, tIdx) => (
                            <li key={tIdx}>{topic}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: '#94A3B8' }}>No curriculum syllabus defined yet.</p>
            )}
          </div>

          {/* Instructor & Prerequisites */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
            {/* Instructor */}
            {course.teacher && (
              <div className="card" style={{ padding: 24, background: 'white' }}>
                <h3 style={{ margin: '0 0 16px', fontWeight: 800, fontSize: '1rem', fontFamily: 'var(--font-display)' }}>Instructor</h3>
                <div style={{ display: 'flex', gap: 14, alignItems: 'center', marginBottom: 16 }}>
                  {course.teacher.avatar ? (
                    <img src={course.teacher.avatar} alt={course.teacher.name} className="avatar" style={{ width: 52, height: 52 }} />
                  ) : (
                    <div style={{ width: 52, height: 52, borderRadius: '50%', background: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '1.2rem', fontWeight: 700 }}>
                      {course.teacher.name.charAt(0)}
                    </div>
                  )}
                  <div>
                    <h4 style={{ margin: 0, fontWeight: 700, fontSize: '0.95rem', color: '#0F172A' }}>{course.teacher.name}</h4>
                    <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748B' }}>{course.teacher.email}</p>
                  </div>
                </div>
                {course.teacher.bio && (
                  <p style={{ margin: 0, fontSize: '0.85rem', color: '#475569', lineHeight: 1.6 }}>
                    {course.teacher.bio}
                  </p>
                )}
              </div>
            )}

            {/* Prerequisites */}
            {course.prerequisites && course.prerequisites.length > 0 && (
              <div className="card" style={{ padding: 24, background: 'white' }}>
                <h3 style={{ margin: '0 0 14px', fontWeight: 800, fontSize: '1rem', fontFamily: 'var(--font-display)' }}>Prerequisites</h3>
                <ul style={{ margin: 0, paddingLeft: 18, color: '#475569', fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {course.prerequisites.map((p, idx) => (
                    <li key={idx} style={{ lineHeight: 1.5 }}>{p}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
