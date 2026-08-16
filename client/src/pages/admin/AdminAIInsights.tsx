import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Brain, RefreshCw, Loader2, CheckCircle, AlertTriangle, BookOpen, Calendar, HelpCircle, Target } from 'lucide-react';
import { aiAPI } from '../../services/api';
import toast from 'react-hot-toast';

interface AIInstitutionInsight {
  overallPerformanceSummary: string;
  lowPerformingCourses: string[];
  attendanceConcerns: string[];
  strengths: string[];
  strategicRecommendations: string[];
}

export default function AdminAIInsights() {
  const [insight, setInsight] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState(false);

  const generate = async (refresh = false) => {
    setLoading(true);
    try {
      const res = await aiAPI.generateInstitutionInsight(refresh);
      setInsight(res.data.data.insight || null);
      setGenerated(true);
      if (refresh) toast.success('Macro-academic analysis refreshed!');
    } catch {
      toast.error('AI Service currently unavailable. Reverting to cache.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    generate();
  }, []);

  const result = insight?.result as any;

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, #7C3AED, #2563EB)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Brain size={20} color="white" />
            </div>
            <h1 style={{ margin: 0, fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.5rem', color: '#0F172A' }}>
              Macro Academic Intelligence
            </h1>
          </div>
          <p style={{ margin: 0, color: '#64748B', fontSize: '0.875rem' }}>
            System-wide strategic analysis powered by AI — auditing courses, attendance anomalies, and pass ratios
          </p>
        </div>
        <button
          onClick={() => generate(true)}
          disabled={loading}
          className="btn-secondary"
          style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px' }}
        >
          <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          Refresh Analysis
        </button>
      </div>

      {loading && !generated ? (
        <div style={{ padding: '80px 20px', textAlign: 'center' }}>
          <div style={{
            width: 80, height: 80, borderRadius: '50%',
            background: 'linear-gradient(135deg, #7C3AED, #2563EB)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 20px', animation: 'pulse 2s infinite',
          }}>
            <Brain size={36} color="white" />
          </div>
          <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, color: '#1E293B', margin: '0 0 8px' }}>
            Compiling macro educational insights...
          </h3>
          <p style={{ color: '#64748B', fontSize: '0.875rem' }}>
            Running aggregation matrices across enrollments, class averages, and grading profiles.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 20 }}>
            <Loader2 size={18} color="#7C3AED" style={{ animation: 'spin 1s linear infinite' }} />
            <span style={{ color: '#7C3AED', fontWeight: 600, fontSize: '0.875rem' }}>Processing...</span>
          </div>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } } @keyframes pulse { 0%,100%{transform:scale(1);opacity:1} 50%{transform:scale(1.05);opacity:0.8} }`}</style>
        </div>
      ) : result ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Executive Summary */}
          {result.summary && (
            <div style={{ padding: '24px', background: 'linear-gradient(135deg, #0F172A, #1E293B)', color: 'white', borderRadius: 16, border: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: 'linear-gradient(135deg, #7C3AED, #2563EB)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Brain size={20} color="white" />
                </div>
                <div>
                  <h3 style={{ margin: '0 0 6px', fontWeight: 800, fontSize: '1.05rem', color: 'white', fontFamily: 'var(--font-display)' }}>Executive Summary</h3>
                  <p style={{ margin: 0, fontSize: '0.875rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.7 }}>{result.summary}</p>
                </div>
              </div>
            </div>
          )}

          {/* Strengths & Anomalies Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 20 }}>
            {/* Strengths */}
            <div className="card" style={{ padding: 24, background: 'white' }}>
              <h3 style={{ margin: '0 0 16px', fontWeight: 700, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                <CheckCircle size={18} color="#10B981" /> Institutional Strengths
              </h3>
              {result.strengths?.length > 0 ? (
                <ul style={{ margin: 0, paddingLeft: 18, color: '#475569', fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {result.strengths.map((s, i) => (
                    <li key={i} style={{ lineHeight: 1.5 }}>{s}</li>
                  ))}
                </ul>
              ) : (
                <p style={{ color: '#94A3B8', fontSize: '0.85rem', margin: 0 }}>No strengths recorded yet.</p>
              )}
            </div>

            {/* Attendance Concerns */}
            <div className="card" style={{ padding: 24, background: 'white' }}>
              <h3 style={{ margin: '0 0 16px', fontWeight: 700, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                <AlertTriangle size={18} color="#EF4444" /> System Risk Factors
              </h3>
              {result.riskFactors?.length > 0 ? (
                <ul style={{ margin: 0, paddingLeft: 18, color: '#475569', fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {result.riskFactors.map((a, i) => (
                    <li key={i} style={{ lineHeight: 1.5 }}>{a}</li>
                  ))}
                </ul>
              ) : (
                <p style={{ color: '#10B981', fontSize: '0.85rem', margin: 0 }}>No systemic risks flagged.</p>
              )}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '0.8fr 1.2fr', gap: 20 }}>
            {/* Low Performing Courses */}
            <div className="card" style={{ padding: 24, background: 'white' }}>
              <h3 style={{ margin: '0 0 16px', fontWeight: 700, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                <BookOpen size={18} color="#F97316" /> Low Performing Courses
              </h3>
              {result.weakSubjects?.length > 0 ? (
                <ul style={{ margin: 0, padding: 0, listStyle: 'none', color: '#475569', fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {result.weakSubjects.map((c, i) => (
                    <li key={i} style={{ display: 'flex', flexDirection: 'column', padding: '10px 12px', background: '#FFF7ED', borderRadius: 8, border: '1px solid #FFEDD5' }}>
                      <span style={{ fontWeight: 700, color: '#C2410C', fontSize: '0.8rem' }}>{c.subject} (Avg: {c.score}%)</span>
                      <span style={{ fontSize: '0.75rem', color: '#9A3412', marginTop: 2 }}>{c.reason}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p style={{ color: '#10B981', fontSize: '0.85rem', margin: 0 }}>All courses are performing optimally.</p>
              )}
            </div>

            {/* Strategic Recommendations */}
            <div className="card" style={{ padding: 24, background: 'white' }}>
              <h3 style={{ margin: '0 0 16px', fontWeight: 700, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Target size={18} color="#7C3AED" /> Strategic Recommendations
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {result.recommendations?.length > 0 ? (
                  result.recommendations.map((rec: any, i: number) => (
                    <div key={i} style={{ padding: '12px 14px', background: '#F5F3FF', border: '1px solid #DDD6FE', borderRadius: 8, fontSize: '0.825rem', color: '#5B21B6', lineHeight: 1.5 }}>
                      <span style={{ fontWeight: 700, display: 'block', marginBottom: 2 }}>{rec.title} ({rec.priority} priority)</span>
                      <span>{rec.description}</span>
                    </div>
                  ))
                ) : (
                  <p style={{ color: '#94A3B8', fontSize: '0.85rem', margin: 0 }}>No recommendations generated.</p>
                )}
              </div>
            </div>
          </div>

          {insight?.generatedAt && (
            <p style={{ textAlign: 'center', color: '#94A3B8', fontSize: '0.75rem', marginTop: 10 }}>
              Last analyzed: {new Date(insight.generatedAt as string).toLocaleString()}
            </p>
          )}
        </div>
      ) : (
        <div style={{ padding: '60px', textAlign: 'center', color: '#94A3B8' }}>
          <Brain size={48} style={{ marginBottom: 16, opacity: 0.3 }} />
          <p>No central institutional AI insight compiled yet.</p>
          <button onClick={() => generate()} className="btn-primary" style={{ marginTop: 16 }}>
            Run Strategic Analysis
          </button>
        </div>
      )}
    </motion.div>
  );
}
