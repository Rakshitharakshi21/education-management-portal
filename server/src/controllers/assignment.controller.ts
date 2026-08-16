import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { Assignment } from '../models/Assignment.model';
import { AssignmentSubmission } from '../models/AssignmentSubmission.model';
import { Class } from '../models/Class.model';
import { notificationService } from '../services/notification.service';
import { AuditLog } from '../models/AuditLog.model';
import { sendSuccess, sendError, getPaginationParams, sendPaginated } from '../utils/response';

export const assignmentController = {
  async getAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { page, limit, skip } = getPaginationParams(req.query as Record<string, unknown>);
      const { course, class: classId, status } = req.query as Record<string, string>;

      const filter: Record<string, unknown> = {};
      if (course) filter.course = course;
      if (classId) filter.class = classId;
      if (status) filter.status = status;
      if (req.user!.role === 'teacher') filter.teacher = req.user!._id;

      const [assignments, total] = await Promise.all([
        Assignment.find(filter)
          .populate('course', 'title')
          .populate('class', 'name section')
          .populate('teacher', 'name avatar')
          .skip(skip).limit(limit)
          .sort({ dueDate: 1 })
          .lean(),
        Assignment.countDocuments(filter),
      ]);
      sendPaginated(res, assignments, total, page, limit);
    } catch (err) { next(err); }
  },

  async getById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const assignment = await Assignment.findById(req.params.id)
        .populate('course', 'title')
        .populate('class', 'name section students')
        .populate('teacher', 'name avatar')
        .lean();
      if (!assignment) return sendError(res, 'Assignment not found.', 404);
      sendSuccess(res, { assignment });
    } catch (err) { next(err); }
  },

  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { course, class: classId, title, description, instructions, dueDate, maxMarks, allowLateSubmission, latePenaltyPercent } = req.body;

      const assignment = await Assignment.create({
        course, class: classId, teacher: req.user!._id,
        title, description, instructions,
        dueDate: new Date(dueDate), maxMarks,
        allowLateSubmission: allowLateSubmission ?? true,
        latePenaltyPercent: latePenaltyPercent || 10,
        status: 'published',
      });

      // Notify students in the class
      const cls = await Class.findById(classId).lean();
      if (cls && cls.students.length > 0) {
        await notificationService.createBulk(cls.students.map(String), {
          title: 'New Assignment Posted',
          message: `"${title}" has been posted. Due: ${new Date(dueDate).toLocaleDateString()}`,
          type: 'assignment',
          link: `/student/assignments`,
        });
      }

      await AuditLog.create({
        user: req.user!._id,
        action: 'CREATE',
        entity: 'Assignment',
        entityId: assignment._id,
        description: `Assignment created: "${title}"`,
      });

      sendSuccess(res, { assignment }, 201, 'Assignment created and students notified.');
    } catch (err) { next(err); }
  },

  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const assignment = await Assignment.findById(req.params.id);
      if (!assignment) return sendError(res, 'Assignment not found.', 404);
      if (String(assignment.teacher) !== String(req.user!._id) && req.user!.role !== 'admin') {
        return sendError(res, 'Unauthorized.', 403);
      }

      const updated = await Assignment.findByIdAndUpdate(req.params.id, req.body, { new: true });
      sendSuccess(res, { assignment: updated }, 200, 'Assignment updated.');
    } catch (err) { next(err); }
  },

  async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const assignment = await Assignment.findById(req.params.id);
      if (!assignment) return sendError(res, 'Assignment not found.', 404);
      await assignment.deleteOne();
      sendSuccess(res, {}, 200, 'Assignment deleted.');
    } catch (err) { next(err); }
  },

  async getStudentAssignments(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const studentId = req.user!._id;
      // Find classes student is in
      const classes = await Class.find({ students: studentId }).lean();
      const classIds = classes.map((c) => c._id);

      const assignments = await Assignment.find({
        class: { $in: classIds },
        status: 'published',
      })
        .populate('course', 'title')
        .populate('teacher', 'name avatar')
        .sort({ dueDate: 1 })
        .lean();

      // Attach submission status
      const submissionMap: Record<string, unknown> = {};
      const submissions = await AssignmentSubmission.find({ student: studentId }).lean();
      for (const s of submissions) submissionMap[String(s.assignment)] = s;

      const enriched = assignments.map((a) => ({
        ...a,
        submission: submissionMap[String(a._id)] || null,
        isSubmitted: !!submissionMap[String(a._id)],
        isOverdue: new Date(a.dueDate) < new Date() && !submissionMap[String(a._id)],
      }));

      sendSuccess(res, { assignments: enriched });
    } catch (err) { next(err); }
  },
};
