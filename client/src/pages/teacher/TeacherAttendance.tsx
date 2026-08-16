import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, CheckCircle, Clock, XCircle, Clipboard } from 'lucide-react';
import { classAPI, attendanceAPI } from '../../services/api';
import toast from 'react-hot-toast';

interface ClassGroup {
  _id: string;
  name: string;
  course: {
    _id: string;
    title: string;
  };
}

interface Student {
  _id: string;
  name: string;
  email: string;
}

export default function TeacherAttendance() {
  const [classes, setClasses] = useState<ClassGroup[]>([]);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [studentsLoading, setStudentsLoading] = useState(false);

  // Mark attendance fields
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [sessionTopic, setSessionTopic] = useState('');
  const [attendanceStates, setAttendanceStates] = useState<Record<string, 'present' | 'absent' | 'late'>>({});

  useEffect(() => {
    classAPI.getMy().then((res) => {
      const list = res.data.data.classes || [];
      setClasses(list);
      if (list.length > 0) {
        setSelectedClassId(list[0]._id);
      }
    }).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedClassId) return;
    setStudentsLoading(true);
    classAPI.getStudents(selectedClassId).then((res) => {
      const list = res.data.data.students || [];
      setStudents(list);
      // Initialize all to present
      const initial: Record<string, 'present' | 'absent' | 'late'> = {};
      for (const s of list) {
        initial[s._id] = 'present';
      }
      setAttendanceStates(initial);
    }).catch(() => {
      toast.error('Failed to load students roster.');
    }).finally(() => setStudentsLoading(false));
  }, [selectedClassId]);

  const handleStatusChange = (studentId: string, status: 'present' | 'absent' | 'late') => {
    setAttendanceStates((prev) => ({ ...prev, [studentId]: status }));
  };

  const handleMarkAll = (status: 'present' | 'absent' | 'late') => {
    const updated: Record<string, 'present' | 'absent' | 'late'> = {};
    for (const s of students) {
      updated[s._id] = status;
    }
    setAttendanceStates(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClassId) return toast.error('Please select a class.');
    if (!sessionTopic.trim()) return toast.error('Please enter a session topic.');

    // Find courseId associated with selected class
    const cls = classes.find((c) => c._id === selectedClassId);
    if (!cls) return toast.error('Class group invalid.');

    const records = Object.entries(attendanceStates).map(([studentId, status]) => ({
      student: studentId,
      status,
    }));

    const payload = {
      records,
      classId: selectedClassId,
      courseId: cls.course?._id || cls.course,
      date,
      sessionTopic,
    };

    try {
      await attendanceAPI.mark(payload);
      toast.success('Attendance recorded successfully!');
      setSessionTopic('');
    } catch {
      toast.error('Failed to save attendance.');
    }
  };

  if (loading) return <div className="skeleton" style={{ height: 400, borderRadius: 16 }} />;

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
      <h1 style={{ margin: '0 0 8px', fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.5rem', color: '#0F172A' }}>Mark Daily Attendance</h1>
      <p style={{ margin: '0 0 24px', color: '#64748B', fontSize: '0.875rem' }}>Mark bulk attendance for your taught batches</p>

      <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1.2fr 2fr', gap: 24, alignItems: 'start' }}>
        
        {/* Setup card */}
        <div className="card" style={{ padding: 24, background: 'white', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label className="input-label">Select Class Group *</label>
            <select
              className="input-field"
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              required
            >
              <option value="">Choose a class...</option>
              {classes.map((c) => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="input-label">Session Date *</label>
            <input
              type="date"
              className="input-field"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="input-label">Session Topic / Lesson Title *</label>
            <input
              type="text"
              className="input-field"
              placeholder="e.g. Introduction to React Hooks"
              value={sessionTopic}
              onChange={(e) => setSessionTopic(e.target.value)}
              required
            />
          </div>

          {/* Quick Mark actions */}
          <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: 16 }}>
            <p className="input-label" style={{ marginBottom: 10 }}>Quick Bulk Mark</p>
            <div style={{ display: 'flex', gap: 8 }}>
              <button type="button" onClick={() => handleMarkAll('present')} className="btn-secondary" style={{ padding: '8px 12px', flex: 1, justifyContent: 'center' }}>
                All Present
              </button>
              <button type="button" onClick={() => handleMarkAll('absent')} className="btn-secondary" style={{ padding: '8px 12px', flex: 1, justifyContent: 'center', color: '#EF4444' }}>
                All Absent
              </button>
            </div>
          </div>

          <button type="submit" className="btn-primary" style={{ justifyContent: 'center', padding: '14px', marginTop: 8 }}>
            Save Attendance
          </button>
        </div>

        {/* Student list card */}
        <div className="card" style={{ padding: 24, background: 'white' }}>
          <h3 style={{ margin: '0 0 16px', fontWeight: 800, fontSize: '1rem', fontFamily: 'var(--font-display)' }}>Roster Checklist</h3>
          
          {studentsLoading ? (
            <div className="skeleton" style={{ height: 200 }} />
          ) : students.length === 0 ? (
            <p style={{ color: '#94A3B8', textAlign: 'center', padding: 20 }}>Select a class group above to populate the checklist.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {students.map((student) => {
                const currentStatus = attendanceStates[student._id] || 'present';
                return (
                  <div key={student._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: '#FAFAFA', borderRadius: 10, border: '1px solid #F1F5F9' }}>
                    <div>
                      <p style={{ margin: 0, fontWeight: 700, fontSize: '0.85rem', color: '#1E293B' }}>{student.name}</p>
                      <p style={{ margin: 0, fontSize: '0.72rem', color: '#64748B' }}>{student.email}</p>
                    </div>

                    {/* Radio actions */}
                    <div style={{ display: 'flex', gap: 6 }}>
                      {[
                        { status: 'present' as const, color: '#10B981', label: 'Present', icon: CheckCircle },
                        { status: 'late' as const, color: '#F59E0B', label: 'Late', icon: Clock },
                        { status: 'absent' as const, color: '#EF4444', label: 'Absent', icon: XCircle },
                      ].map((item) => {
                        const Icon = item.icon;
                        const isSelected = currentStatus === item.status;
                        return (
                          <button
                            key={item.status}
                            type="button"
                            onClick={() => handleStatusChange(student._id, item.status)}
                            style={{
                              display: 'flex', alignItems: 'center', gap: 4,
                              padding: '6px 12px', borderRadius: 8, border: '1.5px solid',
                              borderColor: isSelected ? item.color : '#E2E8F0',
                              background: isSelected ? `${item.color}08` : 'white',
                              color: isSelected ? item.color : '#64748B',
                              fontWeight: 700, fontSize: '0.75rem',
                              cursor: 'pointer', transition: 'all 0.15s ease',
                            }}
                          >
                            <Icon size={12} />
                            {item.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </form>
    </motion.div>
  );
}
