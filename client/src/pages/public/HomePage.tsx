import { motion } from 'framer-motion';
import { ArrowRight, BookOpen, GraduationCap, Brain, Users, Award, ShieldCheck, Sparkles, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';

const features = [
  {
    icon: Brain,
    title: 'AI Academic Intelligence',
    description: 'Get deep insights into your learning styles, performance predictions, and personalized revision plans compiled by AI.',
    color: '#7C3AED',
  },
  {
    icon: BookOpen,
    title: 'Curated Courseware',
    description: 'Explore expert-led syllabi designed to build true mastery, from core sciences to high-demand technical specializations.',
    color: '#2563EB',
  },
  {
    icon: Users,
    title: 'Collaborative Classrooms',
    description: 'Connect with peers and instructors in dedicated virtual sections with structured scheduling and progress tracking.',
    color: '#059669',
  },
];

export default function HomePage() {
  return (
    <div style={{ background: 'var(--color-cream)', minHeight: '100vh', overflow: 'hidden' }}>
      {/* Hero Section */}
      <section style={{ position: 'relative', padding: '80px 0 100px' }} className="hero-grid">
        {/* Floating background blobs */}
        <div style={{ position: 'absolute', top: '10%', left: '5%', width: 350, height: 350, borderRadius: '50%', background: 'rgba(37, 99, 235, 0.08)', filter: 'blur(80px)' }} />
        <div style={{ position: 'absolute', bottom: '15%', right: '5%', width: 400, height: 400, borderRadius: '50%', background: 'rgba(124, 58, 237, 0.08)', filter: 'blur(90px)' }} />

        <div className="container-xl" style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: 48, alignItems: 'center' }}>
          <div>
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 14px', borderRadius: 20, background: '#EFF6FF', border: '1.5px solid #DBEAFE', color: '#2563EB', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 20 }}>
                <Sparkles size={14} /> AI-Powered Education Portal
              </div>

              <h1 className="text-editorial text-gradient-primary" style={{ fontSize: 'clamp(2.5rem, 5vw, 4.2rem)', marginBottom: 24 }}>
                Learn Smarter.<br />
                Grow Faster.
              </h1>

              <p style={{ color: '#475569', fontSize: '1.125rem', lineHeight: 1.7, marginBottom: 36, maxWidth: 540 }}>
                The next-generation education portal that marries academic rigor with artificial intelligence. Get personalized learning trajectories, real-time analytics, and expert-led curriculum.
              </p>

              <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                <Link to="/register" className="btn-primary" style={{ padding: '14px 28px', fontSize: '0.95rem' }}>
                  Get Started for Free <ArrowRight size={18} />
                </Link>
                <Link to="/courses" className="btn-secondary" style={{ padding: '14px 28px', fontSize: '0.95rem' }}>
                  Explore Courses
                </Link>
              </div>
            </motion.div>

            {/* Micro stats banner */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              style={{ display: 'flex', gap: 40, marginTop: 56, borderTop: '1px solid #E2E8F0', paddingTop: 28 }}
            >
              {[
                { label: 'Active Students', value: '12K+' },
                { label: 'Courses Published', value: '250+' },
                { label: 'AI Study Paths Generated', value: '85K+' },
              ].map((stat) => (
                <div key={stat.label}>
                  <p style={{ margin: 0, fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.5rem', color: '#0F172A' }}>{stat.value}</p>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748B', fontWeight: 500 }}>{stat.label}</p>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Graphical/Interactive Right Side */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            style={{ position: 'relative' }}
          >
            {/* Visual design mock representing the premium portal dashboard */}
            <div className="card float-slow" style={{ padding: 24, background: '#0F172A', color: 'white', borderRadius: 24, border: '1px solid rgba(255, 255, 255, 0.08)', boxShadow: '0 30px 60px rgba(15, 23, 42, 0.25)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#EF4444' }} />
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#F59E0B' }} />
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#10B981' }} />
                </div>
                <span className="badge" style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.06)' }}>AI Active</span>
              </div>

              {/* Fake AI feedback */}
              <div style={{ padding: '16px 20px', background: 'rgba(255,255,255,0.04)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.06)', marginBottom: 20 }}>
                <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg, #7C3AED, #2563EB)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Brain size={16} color="white" />
                  </div>
                  <div>
                    <p style={{ margin: '0 0 4px', fontSize: '0.8rem', fontWeight: 700, color: 'white' }}>Personalized Learning Path</p>
                    <p style={{ margin: 0, fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.6)', lineHeight: 1.5 }}>
                      "You have excelled in data structural logic, but multi-variable calculus is showing a 12% downward trend. Focus on double integration this week."
                    </p>
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div style={{ padding: 16, background: 'rgba(255,255,255,0.02)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.04)' }}>
                  <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>Attendance Rate</span>
                  <p style={{ margin: '4px 0 0', fontWeight: 800, fontSize: '1.25rem', fontFamily: 'var(--font-display)', color: '#10B981' }}>94.2%</p>
                </div>
                <div style={{ padding: 16, background: 'rgba(255,255,255,0.02)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.04)' }}>
                  <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>Academic Score</span>
                  <p style={{ margin: '4px 0 0', fontWeight: 800, fontSize: '1.25rem', fontFamily: 'var(--font-display)', color: '#60A5FA' }}>A- (86.4%)</p>
                </div>
              </div>
            </div>

            {/* Decorative smaller cards floating around */}
            <div className="card float-medium" style={{ position: 'absolute', top: -30, right: -20, padding: '10px 16px', background: 'white', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 10, boxShadow: '0 10px 30px rgba(0,0,0,0.05)', border: '1px solid #F1F5F9' }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#10B981' }} />
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#1E293B' }}>Class starts in 10 mins</span>
            </div>

            <div className="card float-fast" style={{ position: 'absolute', bottom: -20, left: -20, padding: '12px 18px', background: 'white', borderRadius: 16, display: 'flex', alignItems: 'center', gap: 12, boxShadow: '0 15px 35px rgba(0,0,0,0.08)', border: '1px solid #F1F5F9' }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: '#FEF3C7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Award size={16} color="#D97706" />
              </div>
              <div>
                <span style={{ fontSize: '0.7rem', color: '#64748B', display: 'block' }}>Recent Badge</span>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#1E293B' }}>Calculus Master</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Feature Section */}
      <section style={{ padding: '100px 0', background: 'white' }}>
        <div className="container-xl">
          <div style={{ textAlign: 'center', maxWidth: 640, margin: '0 auto 64px' }}>
            <h2 className="text-editorial text-gradient-primary" style={{ fontSize: '2.5rem', marginBottom: 16 }}>
              Unlock Your Potential with Intelligent Learning
            </h2>
            <p style={{ color: '#64748B', fontSize: '1rem', lineHeight: 1.6 }}>
              Traditional management software tells you what happened. EduPortal tells you what to do next to succeed.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 32 }}>
            {features.map((feat) => (
              <div key={feat.title} className="card" style={{ padding: 36, display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div style={{ width: 56, height: 56, borderRadius: 16, background: `${feat.color}10`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <feat.icon size={26} color={feat.color} />
                </div>
                <h3 style={{ margin: 0, fontWeight: 800, fontSize: '1.2rem', color: '#0F172A', fontFamily: 'var(--font-display)' }}>
                  {feat.title}
                </h3>
                <p style={{ margin: 0, color: '#475569', fontSize: '0.9rem', lineHeight: 1.65 }}>
                  {feat.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section style={{ padding: '80px 0', background: '#0F172A', color: 'white', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        <div className="container-xl" style={{ position: 'relative', zIndex: 1, textAlign: 'center', maxWidth: 720 }}>
          <h2 className="text-editorial" style={{ fontSize: '2.8rem', color: 'white', marginBottom: 20 }}>
            Ready to Revolutionize Your Classroom?
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '1.125rem', lineHeight: 1.7, marginBottom: 40 }}>
            Whether you are a student striving for academic excellence, a teacher managing multiple cohorts, or an administrator steering the institution, EduPortal has tailor-made environments for you.
          </p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
            <Link to="/register" className="btn-primary" style={{ padding: '14px 28px' }}>
              Sign Up Now
            </Link>
            <Link to="/login" className="btn-secondary" style={{ padding: '14px 28px', color: 'white', borderColor: 'rgba(255,255,255,0.2)' }}>
              Demo Login
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
