import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor — attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('edu_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — handle 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('edu_token');
      localStorage.removeItem('edu_user');
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;

// ── API Service Methods ─────────────────────────────

export const authAPI = {
  register: (data: Record<string, unknown>) => api.post('/auth/register', data),
  login: (data: { email: string; password: string }) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  forgotPassword: (email: string) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token: string, password: string) => api.post(`/auth/reset-password/${token}`, { password }),
};

export const userAPI = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data: Record<string, unknown>) => api.put('/users/profile', data),
  changePassword: (data: Record<string, unknown>) => api.put('/users/change-password', data),
  getUsers: (params?: Record<string, unknown>) => api.get('/users', { params }),
};

export const courseAPI = {
  getAll: (params?: Record<string, unknown>) => api.get('/courses', { params }),
  getById: (id: string) => api.get(`/courses/${id}`),
  getMyCourses: () => api.get('/courses/my/courses'),
  create: (data: Record<string, unknown>) => api.post('/courses', data),
  update: (id: string, data: Record<string, unknown>) => api.put(`/courses/${id}`, data),
  delete: (id: string) => api.delete(`/courses/${id}`),
};

export const categoryAPI = {
  getAll: () => api.get('/categories'),
};

export const enrollmentAPI = {
  enroll: (courseId: string) => api.post('/enrollments', { courseId }),
  getMyEnrollments: () => api.get('/enrollments/my'),
  drop: (id: string) => api.delete(`/enrollments/${id}`),
  updateProgress: (id: string, progress: number) => api.put(`/enrollments/${id}/progress`, { progress }),
};

export const classAPI = {
  getAll: (params?: Record<string, unknown>) => api.get('/classes', { params }),
  getById: (id: string) => api.get(`/classes/${id}`),
  getMy: () => api.get('/classes/my'),
  create: (data: Record<string, unknown>) => api.post('/classes', data),
  update: (id: string, data: Record<string, unknown>) => api.put(`/classes/${id}`, data),
  delete: (id: string) => api.delete(`/classes/${id}`),
  getStudents: (id: string) => api.get(`/classes/${id}/students`),
  addStudent: (id: string, studentId: string) => api.post(`/classes/${id}/students`, { studentId }),
  removeStudent: (id: string, studentId: string) => api.delete(`/classes/${id}/students/${studentId}`),
};

export const assignmentAPI = {
  getAll: (params?: Record<string, unknown>) => api.get('/assignments', { params }),
  getById: (id: string) => api.get(`/assignments/${id}`),
  getMyAssignments: () => api.get('/assignments/student/my'),
  create: (data: Record<string, unknown>) => api.post('/assignments', data),
  update: (id: string, data: Record<string, unknown>) => api.put(`/assignments/${id}`, data),
  delete: (id: string) => api.delete(`/assignments/${id}`),
};

export const submissionAPI = {
  submit: (data: Record<string, unknown>) => api.post('/submissions', data),
  getMySubmissions: () => api.get('/submissions/my'),
  getForAssignment: (assignmentId: string, params?: Record<string, unknown>) =>
    api.get(`/submissions/assignment/${assignmentId}`, { params }),
  grade: (id: string, data: Record<string, unknown>) => api.put(`/submissions/${id}/grade`, data),
};

export const attendanceAPI = {
  mark: (data: Record<string, unknown>) => api.post('/attendance', data),
  getForCourse: (courseId: string, params?: Record<string, unknown>) =>
    api.get(`/attendance/course/${courseId}`, { params }),
  getMySummary: () => api.get('/attendance/my/summary'),
  getStudentSummary: (studentId: string, courseId?: string) =>
    api.get(`/attendance/summary/${studentId}`, { params: courseId ? { courseId } : undefined }),
  update: (id: string, data: Record<string, unknown>) => api.put(`/attendance/${id}`, data),
};

export const examAPI = {
  getAll: (params?: Record<string, unknown>) => api.get('/exams', { params }),
  getById: (id: string) => api.get(`/exams/${id}`),
  getMyExams: () => api.get('/exams/student/my'),
  create: (data: Record<string, unknown>) => api.post('/exams', data),
  update: (id: string, data: Record<string, unknown>) => api.put(`/exams/${id}`, data),
  submit: (data: Record<string, unknown>) => api.post('/exams/submit', data),
  getSubmissions: (examId: string) => api.get(`/exams/${examId}/submissions`),
};

export const gradeAPI = {
  getMyGrades: () => api.get('/grades/my'),
  getStudentGrades: (studentId: string) => api.get(`/grades/student/${studentId}`),
  getCourseGrades: (courseId: string) => api.get(`/grades/course/${courseId}`),
  upsert: (data: Record<string, unknown>) => api.post('/grades', data),
  update: (id: string, data: Record<string, unknown>) => api.put(`/grades/${id}`, data),
};

export const notificationAPI = {
  getAll: (params?: Record<string, unknown>) => api.get('/notifications', { params }),
  markRead: (id: string) => api.put(`/notifications/${id}/read`),
  markAllRead: () => api.put('/notifications/mark-all-read'),
};

export const reportAPI = {
  getOverview: () => api.get('/reports/overview'),
  getStudents: (params?: Record<string, unknown>) => api.get('/reports/students', { params }),
  getAtRisk: () => api.get('/reports/at-risk'),
  getAttendanceTrends: () => api.get('/reports/attendance'),
  getCoursePerformance: () => api.get('/reports/courses'),
};

export const aiAPI = {
  generateStudentInsight: (studentId: string, refresh = false) =>
    api.post(`/ai/student/${studentId}`, {}, { params: refresh ? { refresh: 'true' } : {} }),
  generateMyInsight: (refresh = false) =>
    api.post('/ai/student/my/insight', {}, { params: refresh ? { refresh: 'true' } : {} }),
  generateInstitutionInsight: (refresh = false) =>
    api.post('/ai/institution', {}, { params: refresh ? { refresh: 'true' } : {} }),
  getInsights: (targetId: string) => api.get(`/ai/insights/${targetId}`),
};

export const adminAPI = {
  getDashboardStats: () => api.get('/admin/dashboard/stats'),
  getActivityFeed: (params?: Record<string, unknown>) => api.get('/admin/activity', { params }),
  // Students
  getStudents: (params?: Record<string, unknown>) => api.get('/admin/students', { params }),
  createStudent: (data: Record<string, unknown>) => api.post('/admin/students', data),
  updateStudent: (id: string, data: Record<string, unknown>) => api.put(`/admin/students/${id}`, data),
  deleteStudent: (id: string) => api.delete(`/admin/students/${id}`),
  // Teachers
  getTeachers: (params?: Record<string, unknown>) => api.get('/admin/teachers', { params }),
  createTeacher: (data: Record<string, unknown>) => api.post('/admin/teachers', data),
  updateTeacher: (id: string, data: Record<string, unknown>) => api.put(`/admin/teachers/${id}`, data),
  deleteTeacher: (id: string) => api.delete(`/admin/teachers/${id}`),
};

export const contactAPI = {
  send: (data: Record<string, unknown>) => api.post('/contact', data),
};

export const announcementAPI = {
  getAll: () => api.get('/announcements'),
  create: (data: Record<string, unknown>) => api.post('/announcements', data),
};
