import { Request, Response, NextFunction } from 'express';
import { Course } from '../models/Course.model';
import { Category } from '../models/Category.model';
import { Enrollment } from '../models/Enrollment.model';
import { AuthRequest } from '../middleware/auth.middleware';
import { sendSuccess, sendError, sendPaginated, getPaginationParams, slugify } from '../utils/response';
import { AuditLog } from '../models/AuditLog.model';

export const courseController = {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const { page, limit, skip } = getPaginationParams(req.query as Record<string, unknown>);
      const { category, level, search, teacher, published } = req.query as Record<string, string>;

      const filter: Record<string, unknown> = {};
      // Public endpoint shows only published; admin can see all
      const authReq = req as AuthRequest;
      if (!authReq.user || authReq.user.role === 'student') filter.published = true;
      else if (published !== undefined) filter.published = published === 'true';

      if (category) filter.category = category;
      if (level) filter.level = level;
      if (teacher) filter.teacher = teacher;
      if (search) filter.$text = { $search: search };

      const [courses, total] = await Promise.all([
        Course.find(filter)
          .populate('category', 'name slug color icon')
          .populate('teacher', 'name avatar')
          .skip(skip)
          .limit(limit)
          .sort({ enrollmentCount: -1, createdAt: -1 })
          .lean(),
        Course.countDocuments(filter),
      ]);

      sendPaginated(res, courses, total, page, limit);
    } catch (err) { next(err); }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const course = await Course.findOne({
        $or: [{ _id: req.params.id }, { slug: req.params.id }],
      })
        .populate('category', 'name slug color icon')
        .populate('teacher', 'name avatar email')
        .lean();

      if (!course) return sendError(res, 'Course not found.', 404);
      sendSuccess(res, { course });
    } catch (err) { next(err); }
  },

  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { title, description, shortDescription, category, level, duration, thumbnail, syllabus, tags, prerequisites, maxStudents, totalHours } = req.body;
      if (!title || !description || !category) return sendError(res, 'Title, description, and category are required.');

      const teacherId = req.user!.role === 'admin' ? req.body.teacher || req.user!._id : req.user!._id;
      const slug = slugify(title) + '-' + Date.now();

      const course = await Course.create({
        title, description, shortDescription, category,
        teacher: teacherId, level, duration, thumbnail,
        syllabus: syllabus || [], tags: tags || [],
        prerequisites: prerequisites || [], maxStudents, totalHours,
        slug, published: false,
      });

      await AuditLog.create({
        user: req.user!._id,
        action: 'CREATE',
        entity: 'Course',
        entityId: course._id,
        description: `Course created: "${title}"`,
      });

      sendSuccess(res, { course }, 201, 'Course created successfully.');
    } catch (err) { next(err); }
  },

  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const course = await Course.findById(req.params.id);
      if (!course) return sendError(res, 'Course not found.', 404);

      // Authorization: only teacher who owns it or admin can update
      if (req.user!.role === 'teacher' && String(course.teacher) !== String(req.user!._id)) {
        return sendError(res, 'You can only update your own courses.', 403);
      }

      const allowedFields = ['title', 'description', 'shortDescription', 'level', 'duration', 'thumbnail', 'syllabus', 'tags', 'prerequisites', 'published', 'maxStudents', 'totalHours', 'category'];
      const updates: Record<string, unknown> = {};
      for (const field of allowedFields) {
        if (req.body[field] !== undefined) updates[field] = req.body[field];
      }

      const updated = await Course.findByIdAndUpdate(req.params.id, updates, { new: true })
        .populate('category', 'name slug color')
        .populate('teacher', 'name avatar');

      await AuditLog.create({
        user: req.user!._id,
        action: 'UPDATE',
        entity: 'Course',
        entityId: course._id,
        description: `Course updated: "${course.title}"`,
      });

      sendSuccess(res, { course: updated }, 200, 'Course updated successfully.');
    } catch (err) { next(err); }
  },

  async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const course = await Course.findById(req.params.id);
      if (!course) return sendError(res, 'Course not found.', 404);

      if (req.user!.role === 'teacher' && String(course.teacher) !== String(req.user!._id)) {
        return sendError(res, 'You can only delete your own courses.', 403);
      }

      await course.deleteOne();
      await AuditLog.create({
        user: req.user!._id,
        action: 'DELETE',
        entity: 'Course',
        entityId: course._id,
        description: `Course deleted: "${course.title}"`,
      });

      sendSuccess(res, {}, 200, 'Course deleted successfully.');
    } catch (err) { next(err); }
  },

  async getMyCourses(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const user = req.user!;
      let courses;
      if (user.role === 'teacher') {
        courses = await Course.find({ teacher: user._id })
          .populate('category', 'name color')
          .sort({ createdAt: -1 })
          .lean();
      } else {
        const enrollments = await Enrollment.find({ student: user._id, status: 'active' })
          .populate({
            path: 'course',
            populate: [{ path: 'teacher', select: 'name avatar' }, { path: 'category', select: 'name color' }],
          })
          .lean();
        courses = enrollments.map((e) => ({ ...e.course as object, progress: e.progress, enrolledAt: e.enrolledAt }));
      }
      sendSuccess(res, { courses });
    } catch (err) { next(err); }
  },
};
