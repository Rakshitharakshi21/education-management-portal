import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Brain, Loader2, RefreshCw, TrendingUp, AlertTriangle, CheckCircle, Target, Star, BookOpen } from 'lucide-react';
import { aiAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

interface AIInsightData {
  overallScore: number;
  grade: string;
  academicStanding: string;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  riskLevel: string;
  prediction: string;
  studyPlan?: Array<{ day: string; subject: string; hours: number }>;
  summary?: string;
}

export default function StudentProgress() {
  const { user } = useAuth();
  const [insight, setInsight] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState(false);

  const generate = async (refresh = false) => {
    setLoading(true);
    try {
      const res = await aiAPI.generateMyInsight(refresh);
      setInsight(res.data.data.insight || null);
      setGenerated(true);
      if (refresh) toast.success('AI analysis refreshed!');
    } catch {
      toast.error('AI analysis unavailable. Using cached data if available.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    generate();
  }, []);

  const result = insight?.result as any;
  const riskColors: Record<string, string> = { LOW: '#10B981', MEDIUM: '#F59E0B', HIGH: '#F97316', CRITICAL: '#EF4444' };
  const riskBadge: Record<string, string> = { LOW: 'badge-green', MEDIUM: 'badge-amber', HIGH: 'badge-red', CRITICAL: 'badge-red' };

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
              AI Academic Analysis
            </h1>
          </div>
          <p style={{ margin: 0, color: '#64748B', fontSize: '0.875rem' }}>
            Personalized insights powered by AI — based on your grades, attendance, and activity
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
            Analyzing your academic data...
          </h3>
          <p style={{ color: '#64748B', fontSize: '0.875rem' }}>
            The AI is reviewing your grades, attendance, submissions, and performance patterns.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 20 }}>
            <Loader2 size={18} color="#7C3AED" style={{ animation: 'spin 1s linear infinite' }} />
            <span style={{ color: '#7C3AED', fontWeight: 600, fontSize: '0.875rem' }}>Processing...</span>
          </div>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } } @keyframes pulse { 0%,100%{transform:scale(1);opacity:1} 50%{transform:scale(1.05);opacity:0.8} }`}</style>
        </div>
      ) : result ? (
        <div>
          {/* Score overview */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
            {[
              { label: 'Overall Score', value: `${result.keyMetrics?.overallPerformance || result.overallScore || '—'}%`, sub: result.trend || 'Status OK', color: '#2563EB', icon: TrendingUp },
              { label: 'Submission Rate', value: `${result.keyMetrics?.submissionRate || '—'}%`, sub: 'Assignments turned in', color: '#10B981', icon: Star },
              { label: 'Risk Level', value: result.riskLevel, sub: 'Academic risk', color: riskColors[result.riskLevel] || '#94A3B8', icon: AlertTriangle },
              { label: 'Trend Prediction', value: result.trend || 'STABLE', sub: 'Projected outcome', color: '#7C3AED', icon: Target },
            ].map(({ label, value, sub, color, icon: Icon }) => (
              <div key={label} className="card" style={{ padding: '20px 24px' }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                  <Icon size={18} color={color} />
                </div>
                <p style={{ margin: '0 0 2px', fontSize: '0.7rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</p>
                <p style={{ margin: '0 0 2px', fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.4rem', color, letterSpacing: '-0.01em' }}>{value}</p>
                <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748B', textTransform: 'capitalize' }}>{sub}</p>
              </div>
            ))}
          </div>

          {/* Summary */}
          {result.summary && (
            <div style={{ padding: '20px 24px', background: 'linear-gradient(135deg, #EFF6FF, #F5F3FF)', borderRadius: 16, border: '1px solid #DBEAFE', marginBottom: 20 }}>
              <div style={{ display: 'flex', gap: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, #7C3AED, #2563EB)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Brain size={18} color="white" />
                </div>
                <div>
                  <p style={{ margin: '0 0 6px', fontWeight: 700, color: '#1E293B', fontSize: '0.9rem' }}>AI Summary</p>
                  <p style={{ margin: 0, color: '#475569', fontSize: '0.875rem', lineHeight: 1.7 }}>{result.summary}</p>
                </div>
              </div>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
            {/* Strengths */}
            <div className="card" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                <CheckCircle size={18} color="#10B981" />
                <h3 style={{ margin: 0, fontWeight: 700, fontSize: '0.95rem' }}>Strengths</h3>
              </div>
              {result.strengths?.length > 0 ? (
                <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {result.strengths.map((s, i) => (
                    <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '8px 12px', background: '#F0FDF4', borderRadius: 8 }}>
                      <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#10B981', marginTop: 6, flexShrink: 0 }} />
                      <span style={{ fontSize: '0.8rem', color: '#065F46', lineHeight: 1.5 }}>{s}</span>
                    </li>
                  ))}
                </ul>
              ) : <p style={{ color: '#94A3B8', fontSize: '0.875rem' }}>No data available yet.</p>}
            </div>

            {/* Weaknesses */}
            <div className="card" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                <AlertTriangle size={18} color="#F97316" />
                <h3 style={{ margin: 0, fontWeight: 700, fontSize: '0.95rem' }}>Weak Subjects</h3>
              </div>
              {result.weakSubjects?.length > 0 ? (
                <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {result.weakSubjects.map((w, i) => (
                    <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '8px 12px', background: '#FFF7ED', borderRadius: 8 }}>
                      <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#F97316', marginTop: 6, flexShrink: 0 }} />
                      <div>
                        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#9A3412', display: 'block' }}>{w.subject} ({w.score}%)</span>
                        <span style={{ fontSize: '0.75rem', color: '#C2410C' }}>{w.reason}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : <p style={{ color: '#94A3B8', fontSize: '0.875rem' }}>No specific weak subjects identified.</p>}
            </div>
          </div>

          {/* Recommendations */}
          {result.recommendations?.length > 0 && (
            <div className="card" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                <BookOpen size={18} color="#2563EB" />
                <h3 style={{ margin: 0, fontWeight: 700, fontSize: '0.95rem' }}>AI Recommendations</h3>
                <span style={{ padding: '3px 10px', borderRadius: 20, background: 'linear-gradient(135deg, #7C3AED, #2563EB)', color: 'white', fontSize: '0.65rem', fontWeight: 700, marginLeft: 'auto' }}>AI Generated</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
                {result.recommendations.map((rec, i) => (
                  <div key={i} style={{ padding: '14px', background: '#F8FAFF', borderRadius: 10, border: '1px solid #DBEAFE', display: 'flex', gap: 10 }}>
                    <div style={{ width: 24, height: 24, borderRadius: 8, background: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <span style={{ color: 'white', fontSize: '0.7rem', fontWeight: 800 }}>{i + 1}</span>
                    </div>
                    <div>
                      <h4 style={{ margin: '0 0 4px', fontSize: '0.8rem', fontWeight: 700, color: '#1E40AF' }}>{rec.title}</h4>
                      <p style={{ margin: 0, fontSize: '0.75rem', color: '#1E40AF', lineHeight: 1.5 }}>{rec.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Study plan */}
          {result.studyPlan && result.studyPlan.length > 0 && (
            <div className="card" style={{ padding: '24px', marginTop: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                <Target size={18} color="#7C3AED" />
                <h3 style={{ margin: 0, fontWeight: 700, fontSize: '0.95rem' }}>Recommended Study Plan</h3>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 10 }}>
                {result.studyPlan.map((weekData, i) => (
                  <div key={i} style={{ padding: '14px', background: '#F5F3FF', borderRadius: 10, border: '1px solid #DDD6FE', textAlign: 'center' }}>
                    <p style={{ margin: '0 0 4px', fontWeight: 800, fontSize: '0.8rem', color: '#7C3AED' }}>{weekData.week}</p>
                    <p style={{ margin: '0 0 4px', fontSize: '0.75rem', color: '#475569' }}>{weekData.focus}</p>
                    <p style={{ margin: 0, fontWeight: 700, color: '#5B21B6', fontSize: '0.9rem' }}>{weekData.hours}h</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {insight?.generatedAt && (
            <p style={{ textAlign: 'center', color: '#94A3B8', fontSize: '0.75rem', marginTop: 20 }}>
              Last analyzed: {new Date(insight.generatedAt as string).toLocaleString()}
              {(insight.fromCache as boolean) && <span style={{ marginLeft: 8 }}>(cached)</span>}
            </p>
          )}
        </div>
      ) : (
        <div style={{ padding: '60px', textAlign: 'center', color: '#94A3B8' }}>
          <Brain size={48} style={{ marginBottom: 16, opacity: 0.3 }} />
          <p>Click "Refresh Analysis" to generate your AI insight</p>
          <button onClick={() => generate()} className="btn-primary" style={{ marginTop: 16 }}>
            Generate Analysis
          </button>
        </div>
      )}
    </motion.div>
  );
}
