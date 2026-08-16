import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { User } from '../models/User.model';
import { StudentProfile } from '../models/StudentProfile.model';
import { TeacherProfile } from '../models/TeacherProfile.model';
import { Course } from '../models/Course.model';
import { Class } from '../models/Class.model';
import { Assignment } from '../models/Assignment.model';
import { Exam } from '../models/Exam.model';
import { Grade } from '../models/Grade.model';
import { AuditLog } from '../models/AuditLog.model';
import { sendSuccess, sendError, sendPaginated, getPaginationParams } from '../utils/response';

export const adminController = {
  // Students CRUD
  async getStudents(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { page, limit, skip } = getPaginationParams(req.query as Record<string, unknown>);
      const { search, status } = req.query as Record<string, string>;

      const filter: Record<string, unknown> = { role: 'student' };
      if (status) filter.status = status;
      if (search) filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];

      const [users, total] = await Promise.all([
        User.find(filter).skip(skip).limit(limit).sort({ createdAt: -1 }).lean(),
        User.countDocuments(filter),
      ]);

      const userIds = users.map((u) => u._id);
      const profiles = await StudentProfile.find({ user: { $in: userIds } }).lean();
      const profileMap: Record<string, unknown> = {};
      for (const p of profiles) profileMap[String(p.user)] = p;

      const enriched = users.map((u) => ({ ...u, profile: profileMap[String(u._id)] || null }));
      sendPaginated(res, enriched, total, page, limit);
    } catch (err) { next(err); }
  },

  async createStudent(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { name, email, password, phone, department, semester } = req.body;
      const existing = await User.findOne({ email });
      if (existing) return sendError(res, 'Email already in use.');

      const user = await User.create({ name, email, password: password || 'Student@123', role: 'student', phone });
      await StudentProfile.create({
        user: user._id,
        studentId: `STU${Date.now()}`,
        department: department || 'General',
        semester: semester || 1,
      });

      await AuditLog.create({
        user: req.user!._id, action: 'CREATE', entity: 'User', entityId: user._id,
        description: `Admin created student: ${name}`,
      });

      sendSuccess(res, { user }, 201, 'Student account created.');
    } catch (err) { next(err); }
  },

  async updateStudent(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { name, email, phone, status, department, semester } = req.body;
      const user = await User.findByIdAndUpdate(
        req.params.id,
        { ...(name && { name }), ...(email && { email }), ...(phone !== undefined && { phone }), ...(status && { status }) },
        { new: true }
      );
      if (!user) return sendError(res, 'Student not found.', 404);

      await StudentProfile.findOneAndUpdate(
        { user: req.params.id },
        { ...(department && { department }), ...(semester && { semester }) }
      );

      await AuditLog.create({
        user: req.user!._id, action: 'UPDATE', entity: 'User', entityId: user._id,
        description: `Admin updated student: ${user.name}`,
      });

      sendSuccess(res, { user }, 200, 'Student updated.');
    } catch (err) { next(err); }
  },

  async deleteStudent(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const user = await User.findById(req.params.id);
      if (!user || user.role !== 'student') return sendError(res, 'Student not found.', 404);

      await user.deleteOne();
      await AuditLog.create({
        user: req.user!._id, action: 'DELETE', entity: 'User', entityId: user._id,
        description: `Admin deleted student: ${user.name}`,
      });

      sendSuccess(res, {}, 200, 'Student deleted.');
    } catch (err) { next(err); }
  },

  // Teachers CRUD
  async getTeachers(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { page, limit, skip } = getPaginationParams(req.query as Record<string, unknown>);
      const { search } = req.query as Record<string, string>;

      const filter: Record<string, unknown> = { role: 'teacher' };
      if (search) filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];

      const [users, total] = await Promise.all([
        User.find(filter).skip(skip).limit(limit).sort({ name: 1 }).lean(),
        User.countDocuments(filter),
      ]);

      const profiles = await TeacherProfile.find({ user: { $in: users.map((u) => u._id) } }).lean();
      const profileMap: Record<string, unknown> = {};
      for (const p of profiles) profileMap[String(p.user)] = p;

      const enriched = users.map((u) => ({ ...u, profile: profileMap[String(u._id)] || null }));
      sendPaginated(res, enriched, total, page, limit);
    } catch (err) { next(err); }
  },

  async createTeacher(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { name, email, password, phone, specialization, department, qualification, experience } = req.body;
      const existing = await User.findOne({ email });
      if (existing) return sendError(res, 'Email already in use.');

      const user = await User.create({ name, email, password: password || 'Teacher@123', role: 'teacher', phone });
      await TeacherProfile.create({
        user: user._id,
        employeeId: `EMP${Date.now()}`,
        specialization: specialization || 'General',
        department: department || 'General',
        qualification: qualification || 'B.Ed',
        experience: experience || 0,
      });

      await AuditLog.create({
        user: req.user!._id, action: 'CREATE', entity: 'User', entityId: user._id,
        description: `Admin created teacher: ${name}`,
      });

      sendSuccess(res, { user }, 201, 'Teacher account created.');
    } catch (err) { next(err); }
  },

  async updateTeacher(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { name, email, phone, status, specialization, department } = req.body;
      const user = await User.findByIdAndUpdate(
        req.params.id,
        { ...(name && { name }), ...(email && { email }), ...(phone !== undefined && { phone }), ...(status && { status }) },
        { new: true }
      );
      if (!user) return sendError(res, 'Teacher not found.', 404);

      await TeacherProfile.findOneAndUpdate(
        { user: req.params.id },
        { ...(specialization && { specialization }), ...(department && { department }) }
      );

      sendSuccess(res, { user }, 200, 'Teacher updated.');
    } catch (err) { next(err); }
  },

  async deleteTeacher(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const user = await User.findById(req.params.id);
      if (!user || user.role !== 'teacher') return sendError(res, 'Teacher not found.', 404);
      await user.deleteOne();
      sendSuccess(res, {}, 200, 'Teacher deleted.');
    } catch (err) { next(err); }
  },

  // Activity feed
  async getActivityFeed(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { page, limit, skip } = getPaginationParams(req.query as Record<string, unknown>);
      const [logs, total] = await Promise.all([
        AuditLog.find()
          .populate('user', 'name avatar role')
          .skip(skip).limit(limit)
          .sort({ createdAt: -1 })
          .lean(),
        AuditLog.countDocuments(),
      ]);
      sendPaginated(res, logs, total, page, limit);
    } catch (err) { next(err); }
  },

  async getDashboardStats(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (req.user!.role === 'teacher') {
        const teacherId = req.user!._id;
        const [coursesCount, classesCount] = await Promise.all([
          Course.countDocuments({ teacher: teacherId, published: true }),
          Class.countDocuments({ teacher: teacherId, status: 'active' }),
        ]);

        const teacherCourses = await Course.find({ teacher: teacherId }).select('_id');
        const courseIds = teacherCourses.map((c) => c._id);

        const performanceAgg = await Grade.aggregate([
          { $match: { course: { $in: courseIds } } },
          { $group: { _id: null, avg: { $avg: '$percentage' } } }
        ]);
        const avgPerformance = Math.round(performanceAgg[0]?.avg || 0);

        return sendSuccess(res, { courses: coursesCount, classes: classesCount, avgPerformance });
      }

      const [students, teachers, courses, classes, assignments, exams] = await Promise.all([
        User.countDocuments({ role: 'student' }),
        User.countDocuments({ role: 'teacher' }),
        Course.countDocuments({ published: true }),
        Class.countDocuments({ status: 'active' }),
        Assignment.countDocuments({ status: 'published' }),
        Exam.countDocuments({ status: { $in: ['scheduled', 'ongoing'] } }),
      ]);

      const performanceAgg = await Grade.aggregate([{ $group: { _id: null, avg: { $avg: '$percentage' } } }]);
      const avgPerformance = Math.round(performanceAgg[0]?.avg || 0);

      sendSuccess(res, { students, teachers, courses, classes, assignments, exams, avgPerformance });
    } catch (err) { next(err); }
  },
};
