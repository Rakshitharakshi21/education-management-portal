import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { Class } from '../models/Class.model';
import { sendSuccess, sendError, getPaginationParams, sendPaginated } from '../utils/response';

export const classController = {
  async getAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { page, limit, skip } = getPaginationParams(req.query as Record<string, unknown>);
      const { course, teacher, status } = req.query as Record<string, string>;

      const filter: Record<string, unknown> = {};
      if (course) filter.course = course;
      if (status) filter.status = status;

      // Teachers see only their classes
      if (req.user!.role === 'teacher') filter.teacher = req.user!._id;
      else if (teacher) filter.teacher = teacher;

      const [classes, total] = await Promise.all([
        Class.find(filter)
          .populate('course', 'title slug thumbnail')
          .populate('teacher', 'name avatar')
          .skip(skip).limit(limit)
          .sort({ createdAt: -1 })
          .lean(),
        Class.countDocuments(filter),
      ]);
      sendPaginated(res, classes, total, page, limit);
    } catch (err) { next(err); }
  },

  async getById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const cls = await Class.findById(req.params.id)
        .populate('course', 'title slug')
        .populate('teacher', 'name avatar email')
        .populate('students', 'name email avatar')
        .lean();
      if (!cls) return sendError(res, 'Class not found.', 404);
      sendSuccess(res, { class: cls });
    } catch (err) { next(err); }
  },

  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { name, course, semester, section, room, schedule, maxStudents, academicYear } = req.body;
      const teacherId = req.user!.role === 'admin' ? req.body.teacher || req.user!._id : req.user!._id;

      const cls = await Class.create({
        name, course, teacher: teacherId, semester, section, room,
        schedule: schedule || [], maxStudents: maxStudents || 40,
        academicYear: academicYear || '2024-25',
      });

      sendSuccess(res, { class: cls }, 201, 'Class created successfully.');
    } catch (err) { next(err); }
  },

  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const cls = await Class.findById(req.params.id);
      if (!cls) return sendError(res, 'Class not found.', 404);
      if (req.user!.role === 'teacher' && String(cls.teacher) !== String(req.user!._id)) {
        return sendError(res, 'Unauthorized.', 403);
      }

      const updates = req.body;
      const updated = await Class.findByIdAndUpdate(req.params.id, updates, { new: true });
      sendSuccess(res, { class: updated }, 200, 'Class updated.');
    } catch (err) { next(err); }
  },

  async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const cls = await Class.findById(req.params.id);
      if (!cls) return sendError(res, 'Class not found.', 404);
      await cls.deleteOne();
      sendSuccess(res, {}, 200, 'Class deleted.');
    } catch (err) { next(err); }
  },

  async addStudent(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { studentId } = req.body;
      const cls = await Class.findById(req.params.id);
      if (!cls) return sendError(res, 'Class not found.', 404);

      if (cls.students.some((s) => String(s) === studentId)) {
        return sendError(res, 'Student already in this class.');
      }
      if (cls.students.length >= cls.maxStudents) {
        return sendError(res, 'Class is at maximum capacity.');
      }

      cls.students.push(studentId);
      await cls.save();
      sendSuccess(res, { class: cls }, 200, 'Student added to class.');
    } catch (err) { next(err); }
  },

  async removeStudent(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const cls = await Class.findById(req.params.id);
      if (!cls) return sendError(res, 'Class not found.', 404);

      cls.students = cls.students.filter((s) => String(s) !== req.params.studentId);
      await cls.save();
      sendSuccess(res, { class: cls }, 200, 'Student removed from class.');
    } catch (err) { next(err); }
  },

  async getStudents(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const cls = await Class.findById(req.params.id)
        .populate('students', 'name email avatar phone status')
        .lean();
      if (!cls) return sendError(res, 'Class not found.', 404);
      sendSuccess(res, { students: cls.students });
    } catch (err) { next(err); }
  },

  async getMyClasses(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const user = req.user!;
      let classes;
      if (user.role === 'student') {
        classes = await Class.find({ students: user._id })
          .populate('course', 'title slug thumbnail')
          .populate('teacher', 'name avatar')
          .lean();
      } else {
        classes = await Class.find({ teacher: user._id })
          .populate('course', 'title slug thumbnail')
          .lean();
      }
      sendSuccess(res, { classes });
    } catch (err) { next(err); }
  },
};
