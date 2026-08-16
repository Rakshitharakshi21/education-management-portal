import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { Enrollment } from '../models/Enrollment.model';
import { Course } from '../models/Course.model';
import { AuditLog } from '../models/AuditLog.model';
import { notificationService } from '../services/notification.service';
import { sendSuccess, sendError } from '../utils/response';

export const enrollmentController = {
  async enroll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { courseId } = req.body;
      const studentId = req.user!._id;

      const course = await Course.findById(courseId).populate('teacher', 'name');
      if (!course) return sendError(res, 'Course not found.', 404);
      if (!course.published) return sendError(res, 'This course is not available for enrollment.', 400);

      const existing = await Enrollment.findOne({ student: studentId, course: courseId });
      if (existing) return sendError(res, 'You are already enrolled in this course.', 400);

      const enrollment = await Enrollment.create({ student: studentId, course: courseId });

      await Course.findByIdAndUpdate(courseId, { $inc: { enrollmentCount: 1 } });

      await AuditLog.create({
        user: studentId,
        action: 'ENROLL',
        entity: 'Course',
        entityId: course._id,
        description: `Student enrolled in "${course.title}"`,
      });

      await notificationService.create({
        userId: String(studentId),
        title: 'Course Enrollment Confirmed',
        message: `You've successfully enrolled in "${course.title}". Start learning today!`,
        type: 'general',
        link: `/courses/${course.slug}`,
      });

      sendSuccess(res, { enrollment }, 201, `Successfully enrolled in "${course.title}"!`);
    } catch (err) { next(err); }
  },

  async getMyEnrollments(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const enrollments = await Enrollment.find({ student: req.user!._id })
        .populate({
          path: 'course',
          populate: [
            { path: 'teacher', select: 'name avatar' },
            { path: 'category', select: 'name color' },
          ],
        })
        .sort({ enrolledAt: -1 })
        .lean();
      sendSuccess(res, { enrollments });
    } catch (err) { next(err); }
  },

  async drop(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const enrollment = await Enrollment.findOne({
        _id: req.params.id,
        student: req.user!._id,
      });
      if (!enrollment) return sendError(res, 'Enrollment not found.', 404);

      await Course.findByIdAndUpdate(enrollment.course, { $inc: { enrollmentCount: -1 } });
      await enrollment.deleteOne();

      sendSuccess(res, {}, 200, 'You have unenrolled from this course.');
    } catch (err) { next(err); }
  },

  async updateProgress(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { progress } = req.body;
      const enrollment = await Enrollment.findOneAndUpdate(
        { _id: req.params.id, student: req.user!._id },
        { progress, lastAccessedAt: new Date() },
        { new: true }
      );
      if (!enrollment) return sendError(res, 'Enrollment not found.', 404);
      sendSuccess(res, { enrollment });
    } catch (err) { next(err); }
  },
};
