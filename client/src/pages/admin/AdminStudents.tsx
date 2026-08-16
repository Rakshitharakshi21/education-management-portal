import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { adminAPI } from '../../services/api';
import { Users, Search, Plus, Trash2, Edit3, X, Mail, Phone, Book } from 'lucide-react';
import toast from 'react-hot-toast';

interface Student {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  status: string;
  profile?: {
    studentId?: string;
    department?: string;
    semester?: number;
  };
}

export default function AdminStudents() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editStudent, setEditStudent] = useState<Student | null>(null);

  // Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState('active');
  const [department, setDepartment] = useState('Computer Science');
  const [semester, setSemester] = useState(1);

  const loadData = async () => {
    try {
      const res = await adminAPI.getStudents({ limit: 100 });
      setStudents(res.data.data.results || []);
    } catch {
      toast.error('Failed to load students roster.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openCreateModal = () => {
    setEditStudent(null);
    setName('');
    setEmail('');
    setPhone('');
    setPassword('');
    setStatus('active');
    setDepartment('Computer Science');
    setSemester(1);
    setModalOpen(true);
  };

  const openEditModal = (s: Student) => {
    setEditStudent(s);
    setName(s.name);
    setEmail(s.email);
    setPhone(s.phone || '');
    setPassword('');
    setStatus(s.status);
    setDepartment(s.profile?.department || 'Computer Science');
    setSemester(s.profile?.semester || 1);
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return toast.error('Name and email are required.');

    const payload = {
      name, email, phone, status, department, semester,
      ...(password && { password }),
    };

    try {
      if (editStudent) {
        await adminAPI.updateStudent(editStudent._id, payload);
        toast.success('Student record updated!');
      } else {
        await adminAPI.createStudent(payload);
        toast.success('Student registered successfully!');
      }
      setModalOpen(false);
      loadData();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Action failed.';
      toast.error(msg);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this student permanently? This clears all submissions, grades, and enrollments.')) return;
    try {
      await adminAPI.deleteStudent(id);
      toast.success('Student account deleted.');
      loadData();
    } catch {
      toast.error('Failed to delete student.');
    }
  };

  const filtered = students.filter((s) => {
    return s.name.toLowerCase().includes(search.toLowerCase()) ||
           s.email.toLowerCase().includes(search.toLowerCase()) ||
           (s.profile?.studentId || '').toLowerCase().includes(search.toLowerCase());
  });

  if (loading) return <div className="skeleton" style={{ height: 400, borderRadius: 16 }} />;

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ margin: 0, fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.5rem', color: '#0F172A' }}>Student Directory</h1>
          <p style={{ margin: '4px 0 0', color: '#64748B', fontSize: '0.875rem' }}>Add new students, track registration statuses, and review fields</p>
        </div>
        <button onClick={openCreateModal} className="btn-primary">
          <Plus size={18} /> Register Student
        </button>
      </div>

      <div style={{ position: 'relative', marginBottom: 24 }}>
        <Search size={16} color="#94A3B8" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
        <input
          type="text"
          className="input-field"
          placeholder="Search by student name, email, or Student ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ paddingLeft: 42 }}
        />
      </div>

      <div className="card" style={{ background: 'white', overflow: 'hidden' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Student ID</th>
              <th>Student Details</th>
              <th>Dept / Branch</th>
              <th>Semester</th>
              <th>Account Status</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((s) => (
              <tr key={s._id}>
                <td style={{ fontWeight: 700, color: '#1E293B' }}>{s.profile?.studentId || '—'}</td>
                <td>
                  <div>
                    <p style={{ margin: 0, fontWeight: 700, fontSize: '0.875rem', color: '#1E293B' }}>{s.name}</p>
                    <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748B' }}>{s.email}</p>
                  </div>
                </td>
                <td>{s.profile?.department || 'General'}</td>
                <td>Sem {s.profile?.semester || 1}</td>
                <td>
                  <span className={`badge badge-${s.status === 'active' ? 'green' : 'red'}`}>
                    {s.status}
                  </span>
                </td>
                <td style={{ textAlign: 'right' }}>
                  <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                    <button onClick={() => openEditModal(s)} className="btn-secondary" style={{ padding: 8 }}>
                      <Edit3 size={14} />
                    </button>
                    <button onClick={() => handleDelete(s._id)} className="btn-danger" style={{ padding: 8, background: '#EF4444' }}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Register / Edit Modal */}
      <AnimatePresence>
        {modalOpen && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div onClick={() => setModalOpen(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(15,23,42,0.4)', backdropFilter: 'blur(4px)' }} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="card" style={{ position: 'relative', width: '100%', maxWidth: 500, background: 'white', padding: 28, zIndex: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                <h3 style={{ margin: 0, fontWeight: 800, fontSize: '1.2rem', fontFamily: 'var(--font-display)' }}>
                  {editStudent ? 'Edit Student Details' : 'Register New Student'}
                </h3>
                <button onClick={() => setModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                  <X size={20} color="#94A3B8" />
                </button>
              </div>

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label className="input-label">Full Name *</label>
                  <input type="text" className="input-field" value={name} onChange={(e) => setName(e.target.value)} required />
                </div>
                <div>
                  <label className="input-label">Email Address *</label>
                  <input type="email" className="input-field" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                {!editStudent && (
                  <div>
                    <label className="input-label">Account Password</label>
                    <input type="password" className="input-field" placeholder="Student@123 (Default)" value={password} onChange={(e) => setPassword(e.target.value)} />
                  </div>
                )}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label className="input-label">Phone Number</label>
                    <input type="text" className="input-field" value={phone} onChange={(e) => setPhone(e.target.value)} />
                  </div>
                  <div>
                    <label className="input-label">Status</label>
                    <select className="input-field" value={status} onChange={(e) => setStatus(e.target.value)}>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="suspended">Suspended</option>
                    </select>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12 }}>
                  <div>
                    <label className="input-label">Department</label>
                    <input type="text" className="input-field" value={department} onChange={(e) => setDepartment(e.target.value)} />
                  </div>
                  <div>
                    <label className="input-label">Semester</label>
                    <input type="number" className="input-field" value={semester} onChange={(e) => setSemester(Number(e.target.value))} />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 12, marginTop: 10 }}>
                  <button type="submit" className="btn-primary" style={{ flex: 1, justifyContent: 'center' }}>
                    Save Record
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
