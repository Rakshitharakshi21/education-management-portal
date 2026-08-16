import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Send, MessageSquare, Shield } from 'lucide-react';
import { contactAPI } from '../../services/api';
import toast from 'react-hot-toast';

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.subject || !form.message) {
      return toast.error('Please fill in all fields.');
    }
    setLoading(true);
    try {
      await contactAPI.send(form);
      toast.success("Message sent! We'll reply within 24 hours.");
      setForm({ name: '', email: '', subject: '', message: '' });
    } catch {
      toast.error('Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ background: 'var(--color-cream)', minHeight: '100vh', padding: '60px 0' }}>
      <div className="container-xl" style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: 48, alignItems: 'start' }}>
        
        {/* Contact Information */}
        <div>
          <div style={{ marginBottom: 32 }}>
            <h1 className="text-editorial text-gradient-primary" style={{ fontSize: '2.5rem', margin: '0 0 12px' }}>
              Get in Touch
            </h1>
            <p style={{ color: '#64748B', fontSize: '1rem', lineHeight: 1.6, margin: 0 }}>
              Have questions about registration, course criteria, or institutional partnerships? Reach out to our academic team.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 24, marginBottom: 40 }}>
            {[
              { icon: Mail, label: 'Email Academic Support', val: 'support@eduportal.edu' },
              { icon: Phone, label: 'Call General Office', val: '+1 (555) 234-5678' },
              { icon: MapPin, label: 'Main Campus Address', val: '100 University Ave, Tech District, NY 10001' },
            ].map((item, idx) => (
              <div key={idx} style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 10px rgba(0,0,0,0.02)', border: '1px solid #E2E8F0', flexShrink: 0 }}>
                  <item.icon size={20} color="#2563EB" />
                </div>
                <div>
                  <span style={{ display: 'block', fontSize: '0.72rem', color: '#94A3B8', textTransform: 'uppercase', fontWeight: 700 }}>{item.label}</span>
                  <span style={{ fontSize: '0.9rem', color: '#1E293B', fontWeight: 600 }}>{item.val}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Privacy statement */}
          <div className="card" style={{ padding: 20, background: 'white', border: '1px solid #F1F5F9', display: 'flex', gap: 12 }}>
            <Shield size={20} color="#059669" style={{ flexShrink: 0, marginTop: 2 }} />
            <div>
              <p style={{ margin: '0 0 4px', fontWeight: 700, fontSize: '0.8rem', color: '#1E293B' }}>Strict Confidentiality</p>
              <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748B', lineHeight: 1.5 }}>
                Your correspondence is securely routed to relevant support desks. We never sell contact information.
              </p>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="card"
          style={{ padding: 36, background: 'white' }}
        >
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 28 }}>
            <MessageSquare size={20} color="#2563EB" />
            <h3 style={{ margin: 0, fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.2rem', color: '#0F172A' }}>Send a Message</h3>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <label className="input-label">Full Name</label>
                <input
                  type="text" className="input-field" placeholder="John Doe"
                  value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                  disabled={loading}
                />
              </div>
              <div>
                <label className="input-label">Email Address</label>
                <input
                  type="email" className="input-field" placeholder="john@example.com"
                  value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <label className="input-label">Subject</label>
              <input
                type="text" className="input-field" placeholder="How can we help you?"
                value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })}
                disabled={loading}
              />
            </div>

            <div>
              <label className="input-label">Message</label>
              <textarea
                className="input-field" placeholder="Type your message details..."
                value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })}
                rows={5} disabled={loading}
                style={{ resize: 'vertical' }}
              />
            </div>

            <button
              type="submit" disabled={loading}
              className="btn-primary"
              style={{ justifyContent: 'center', padding: '14px', width: '100%', fontSize: '0.95rem' }}
            >
              {loading ? 'Sending Message...' : (
                <>
                  <Send size={16} /> Send Message
                </>
              )}
            </button>
          </form>
        </motion.div>

      </div>
    </div>
  );
}
