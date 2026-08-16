import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Plus, Calendar, Clock, Trash2, Edit3, X, MapPin, Clipboard } from 'lucide-react';
import { classAPI, courseAPI, userAPI } from '../../services/api';
import toast from 'react-hot-toast';

interface ClassGroup {
  _id: string;
  name: string;
  section: string;
  room: string;
  maxStudents: number;
  academicYear: string;
  course: {
    _id: string;
    title: string;
  };
  students: Array<{
    _id: string;
    name: string;
    email: string;
  }>;
  schedule: Array<{
    day: string;
    startTime: string;
    endTime: string;
  }>;
}

interface Course {
  _id: string;
  title: string;
}

export default function TeacherClasses() {
  const [classes, setClasses] = useState<ClassGroup[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [allStudents, setAllStudents] = useState<Array<{ _id: string; name: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState<ClassGroup | null>(null);
  const [rosterOpen, setRosterOpen] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [course, setCourse] = useState('');
  const [section, setSection] = useState('A');
  const [room, setRoom] = useState('');
  const [maxStudents, setMaxStudents] = useState(40);
  const [academicYear, setAcademicYear] = useState('2024-25');
  const [day, setDay] = useState('Monday');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:30');

  // Add student state
  const [newStudentId, setNewStudentId] = useState('');

  const loadData = async () => {
    try {
      const [classRes, courseRes, userRes] = await Promise.all([
        classAPI.getMy(),
        courseAPI.getMyCourses(),
        userAPI.getUsers({ role: 'student', limit: 100 }),
      ]);
      setClasses(classRes.data.data.classes || []);
      setCourses(courseRes.data.data.courses || []);
      setAllStudents(userRes.data.data.results || []);
    } catch {
      toast.error('Failed to load classes.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !course || !section) return toast.error('Name, course and section are required.');

    const payload = {
      name, course, section, room, maxStudents, academicYear,
      schedule: [{ day, startTime, endTime, room }],
    };

    try {
      await classAPI.create(payload);
      toast.success('Class created successfully!');
      setModalOpen(false);
      loadData();
    } catch {
      toast.error('Failed to create class.');
    }
  };

  const handleAddStudent = async (classId: string) => {
    if (!newStudentId) return toast.error('Please select a student.');
    try {
      await classAPI.addStudent(classId, newStudentId);
      toast.success('Student added to class!');
      setNewStudentId('');
      // Reload active modal class
      const updatedRes = await classAPI.getById(classId);
      setSelectedClass(updatedRes.data.data.class);
      loadData();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to add student.';
      toast.error(msg);
    }
  };

  const handleRemoveStudent = async (classId: string, studentId: string) => {
    if (!window.confirm('Remove student from this class?')) return;
    try {
      await classAPI.removeStudent(classId, studentId);
      toast.success('Student removed from class.');
      // Reload active modal class
      const updatedRes = await classAPI.getById(classId);
      setSelectedClass(updatedRes.data.data.class);
      loadData();
    } catch {
      toast.error('Failed to remove student.');
    }
  };

  const openRoster = async (c: ClassGroup) => {
    try {
      const res = await classAPI.getById(c._id);
      setSelectedClass(res.data.data.class);
      setRosterOpen(true);
    } catch {
      toast.error('Failed to load class roster.');
    }
  };

  if (loading) return <div className="skeleton" style={{ height: 400, borderRadius: 16 }} />;

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <h1 style={{ margin: 0, fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.5rem', color: '#0F172A' }}>Taught Cohorts</h1>
          <p style={{ margin: '4px 0 0', color: '#64748B', fontSize: '0.875rem' }}>Organize class rosters, timetables, and sections</p>
        </div>
        <button onClick={() => setModalOpen(true)} className="btn-primary">
          <Plus size={18} /> Add Class Section
        </button>
      </div>

      {classes.length === 0 ? (
        <div style={{ padding: '80px', textAlign: 'center', background: 'white', borderRadius: 16 }} className="card">
          <Users size={48} color="#CBD5E1" style={{ marginBottom: 16 }} />
          <h3>No class sections defined</h3>
          <button onClick={() => setModalOpen(true)} className="btn-primary" style={{ marginTop: 12 }}>Create Class</button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
          {classes.map((c) => (
            <div key={c._id} className="card" style={{ background: 'white', padding: 24, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                  <div>
                    <h3 style={{ margin: 0, fontWeight: 800, fontSize: '1.05rem', color: '#1E293B' }}>{c.name}</h3>
                    <p style={{ margin: '2px 0 0', fontSize: '0.78rem', color: '#64748B' }}>
                      📚 {c.course?.title}
                    </p>
                  </div>
                  <span className="badge badge-blue">Sec {c.section}</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.8rem', color: '#475569' }}>
                    <MapPin size={14} color="#94A3B8" /> Room: {c.room || 'TBD'}
                  </div>
                  {c.schedule && c.schedule.length > 0 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.8rem', color: '#475569' }}>
                      <Calendar size={14} color="#94A3B8" /> {c.schedule[0].day}s ({c.schedule[0].startTime} - {c.schedule[0].endTime})
                    </div>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => openRoster(c)} className="btn-primary" style={{ flex: 1, justifyContent: 'center', padding: '10px' }}>
                  <Users size={14} /> Class Roster ({c.students?.length || 0})
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Roster Modal */}
      <AnimatePresence>
        {rosterOpen && selectedClass && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div onClick={() => setRosterOpen(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(15,23,42,0.4)', backdropFilter: 'blur(4px)' }} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="card" style={{ position: 'relative', width: '100%', maxWidth: 520, background: 'white', padding: 28, zIndex: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                <div>
                  <h3 style={{ margin: 0, fontWeight: 800, fontSize: '1.15rem' }}>{selectedClass.name} — Student Roster</h3>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748B' }}>Manage enrolled students ({selectedClass.students?.length || 0} / {selectedClass.maxStudents})</p>
                </div>
                <button onClick={() => setRosterOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                  <X size={20} color="#94A3B8" />
                </button>
              </div>

              {/* Add Student Form */}
              <div style={{ display: 'flex', gap: 10, marginBottom: 20, paddingBottom: 16, borderBottom: '1px solid #F1F5F9' }}>
                <select className="input-field" value={newStudentId} onChange={(e) => setNewStudentId(e.target.value)} style={{ flex: 1 }}>
                  <option value="">Select student to add...</option>
                  {allStudents.map((s) => (
                    <option key={s._id} value={s._id}>{s.name}</option>
                  ))}
                </select>
                <button onClick={() => handleAddStudent(selectedClass._id)} className="btn-primary" style={{ padding: '10px 16px' }}>
                  <Plus size={16} /> Add
                </button>
              </div>

              {/* Students list */}
              <div style={{ maxHeight: 280, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
                {(!selectedClass.students || selectedClass.students.length === 0) ? (
                  <p style={{ color: '#94A3B8', fontSize: '0.85rem', textAlign: 'center', padding: 20 }}>No students enrolled.</p>
                ) : selectedClass.students.map((student) => (
                  <div key={student._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: '#FAFAFA', borderRadius: 8, border: '1px solid #F1F5F9' }}>
                    <div>
                      <p style={{ margin: 0, fontWeight: 700, fontSize: '0.85rem', color: '#1E293B' }}>{student.name}</p>
                      <p style={{ margin: 0, fontSize: '0.72rem', color: '#64748B' }}>{student.email}</p>
                    </div>
                    <button onClick={() => handleRemoveStudent(selectedClass._id, student._id)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                      <Trash2 size={16} color="#EF4444" />
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Create Modal */}
      <AnimatePresence>
        {modalOpen && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div onClick={() => setModalOpen(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(15,23,42,0.4)', backdropFilter: 'blur(4px)' }} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="card" style={{ position: 'relative', width: '100%', maxWidth: 500, background: 'white', padding: 28, zIndex: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                <h3 style={{ margin: 0, fontWeight: 800, fontSize: '1.2rem', fontFamily: 'var(--font-display)' }}>Create Class Section</h3>
                <button onClick={() => setModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                  <X size={20} color="#94A3B8" />
                </button>
              </div>

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label className="input-label">Class Name *</label>
                  <input type="text" className="input-field" placeholder="CS-A Batch 2024" value={name} onChange={(e) => setName(e.target.value)} required />
                </div>
                <div>
                  <label className="input-label">Associated Course *</label>
                  <select className="input-field" value={course} onChange={(e) => setCourse(e.target.value)} required>
                    <option value="">Select course...</option>
                    {courses.map((crs) => (
                      <option key={crs._id} value={crs._id}>{crs.title}</option>
                    ))}
                  </select>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label className="input-label">Section *</label>
                    <input type="text" className="input-field" placeholder="A" value={section} onChange={(e) => setSection(e.target.value)} required />
                  </div>
                  <div>
                    <label className="input-label">Room / Lab No.</label>
                    <input type="text" className="input-field" placeholder="Lab 101" value={room} onChange={(e) => setRoom(e.target.value)} />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label className="input-label">Max Capacity</label>
                    <input type="number" className="input-field" value={maxStudents} onChange={(e) => setMaxStudents(Number(e.target.value))} />
                  </div>
                  <div>
                    <label className="input-label">Academic Year</label>
                    <input type="text" className="input-field" value={academicYear} onChange={(e) => setAcademicYear(e.target.value)} />
                  </div>
                </div>

                <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: 14 }}>
                  <p className="input-label" style={{ marginBottom: 10 }}>Schedule Slot</p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                    <select className="input-field" value={day} onChange={(e) => setDay(e.target.value)}>
                      {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                    <input type="time" className="input-field" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
                    <input type="time" className="input-field" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 12, marginTop: 10 }}>
                  <button type="submit" className="btn-primary" style={{ flex: 1, justifyContent: 'center' }}>
                    Create Class
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
