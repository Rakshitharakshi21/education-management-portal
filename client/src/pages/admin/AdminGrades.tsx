import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { reportAPI } from '../../services/api';
import toast from 'react-hot-toast';

interface GradeReport {
  student: {
    name: string;
    email: string;
  };
  course: {
    title: string;
  };
  assignmentAverage: number;
  examAverage: number;
  percentage: number;
  grade: string;
  status: string;
}

export default function AdminGrades() {
  const [reports, setReports] = useState<GradeReport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    reportAPI.getStudents().then((res) => {
      setReports(res.data.data.students || []);
    }).catch(() => {
      toast.error('Failed to load grade reports.');
    }).finally(() => setLoading(false));
  }, []);

  const gradeColors: Record<string, string> = { 'A+': '#10B981', A: '#34D399', 'A-': '#6EE7B7', B: '#2563EB', 'B+': '#3B82F6', C: '#F59E0B', D: '#F97316', F: '#EF4444' };

  if (loading) return <div className="skeleton" style={{ height: 400 }} />;

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.5rem', color: '#0F172A' }}>Academic Grades Desk</h1>
        <p style={{ margin: '4px 0 0', color: '#64748B', fontSize: '0.875rem' }}>Centralized view of grades, test results, and passing ratios across courses</p>
      </div>

      <div className="card" style={{ background: 'white', overflow: 'hidden' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Student Name</th>
              <th>Course / Program</th>
              <th>Assignments Avg</th>
              <th>Exams Avg</th>
              <th>Weighted Score</th>
              <th>Letter Grade</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {reports.map((r, idx) => (
              <tr key={idx}>
                <td style={{ fontWeight: 700, color: '#1E293B' }}>{r.student?.name}</td>
                <td>{r.course?.title}</td>
                <td>{r.assignmentAverage}%</td>
                <td>{r.examAverage}%</td>
                <td style={{ fontWeight: 700 }}>{r.percentage}%</td>
                <td>
                  <span className="badge" style={{ background: `${gradeColors[r.grade] || '#94A3B8'}18`, color: gradeColors[r.grade] || '#64748B', fontWeight: 800 }}>
                    {r.grade}
                  </span>
                </td>
                <td>
                  <span className={`badge badge-${r.status === 'pass' ? 'green' : 'red'}`}>
                    {r.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
