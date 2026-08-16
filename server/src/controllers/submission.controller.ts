import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { AssignmentSubmission } from '../models/AssignmentSubmission.model';
import { Assignment } from '../models/Assignment.model';
import { Grade } from '../models/Grade.model';
import { notificationService } from '../services/notification.service';
import { calculateGrade } from '../utils/response';
import { sendSuccess, sendError, getPaginationParams, sendPaginated } from '../utils/response';

export const submissionController = {
  async submit(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { assignmentId, content } = req.body;
      const studentId = req.user!._id;

      const assignment = await Assignment.findById(assignmentId);
      if (!assignment) return sendError(res, 'Assignment not found.', 404);
      if (assignment.status === 'closed') return sendError(res, 'Submissions are closed for this assignment.', 400);

      const isLate = new Date() > new Date(assignment.dueDate);
      if (isLate && !assignment.allowLateSubmission) {
        return sendError(res, 'Late submissions are not allowed for this assignment.', 400);
      }

      const existing = await AssignmentSubmission.findOne({ assignment: assignmentId, student: studentId });
      if (existing) {
        // Allow resubmission
        const updated = await AssignmentSubmission.findByIdAndUpdate(
          existing._id,
          { content, submittedAt: new Date(), status: 'resubmitted', isLate },
          { new: true }
        );
        return sendSuccess(res, { submission: updated }, 200, 'Assignment resubmitted successfully.');
      }

      const submission = await AssignmentSubmission.create({
        assignment: assignmentId,
        student: studentId,
        course: assignment.course,
        content,
        isLate,
        status: isLate ? 'late' : 'submitted',
      });

      await Assignment.findByIdAndUpdate(assignmentId, { $inc: { submissionCount: 1 } });

      sendSuccess(res, { submission }, 201, isLate ? 'Assignment submitted (late).' : 'Assignment submitted successfully!');
    } catch (err) { next(err); }
  },

  async grade(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { marks, feedback } = req.body;
      const submission = await AssignmentSubmission.findById(req.params.id)
        .populate('assignment', 'maxMarks latePenaltyPercent');
      if (!submission) return sendError(res, 'Submission not found.', 404);

      let finalMarks = marks;
      const assignment = submission.assignment as any;
      if (submission.isLate && assignment.latePenaltyPercent) {
        finalMarks = Math.max(0, marks - (marks * assignment.latePenaltyPercent / 100));
      }

      const updated = await AssignmentSubmission.findByIdAndUpdate(
        req.params.id,
        { marks: finalMarks, feedback, status: 'graded', gradedAt: new Date(), gradedBy: req.user!._id },
        { new: true }
      ).populate('student', 'name email');

      // Update grade record
      await Grade.findOneAndUpdate(
        { student: submission.student, course: submission.course },
        {
          $push: {
            assignmentGrades: { assignment: submission.assignment, marks: finalMarks, maxMarks: assignment.maxMarks },
          },
        },
        { upsert: true }
      );

      // Notify student
      await notificationService.create({
        userId: String(submission.student),
        title: 'Assignment Graded',
        message: `Your submission received ${finalMarks}/${assignment.maxMarks} marks. ${feedback ? 'Check the feedback.' : ''}`,
        type: 'grade',
        link: '/student/assignments',
      });

      sendSuccess(res, { submission: updated }, 200, 'Assignment graded successfully.');
    } catch (err) { next(err); }
  },

  async getForAssignment(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { page, limit, skip } = getPaginationParams(req.query as Record<string, unknown>);
      const [submissions, total] = await Promise.all([
        AssignmentSubmission.find({ assignment: req.params.assignmentId })
          .populate('student', 'name email avatar')
          .skip(skip).limit(limit)
          .sort({ submittedAt: -1 })
          .lean(),
        AssignmentSubmission.countDocuments({ assignment: req.params.assignmentId }),
      ]);
      sendPaginated(res, submissions, total, page, limit);
    } catch (err) { next(err); }
  },

  async getMySubmissions(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const submissions = await AssignmentSubmission.find({ student: req.user!._id })
        .populate({ path: 'assignment', populate: { path: 'course', select: 'title' } })
        .sort({ submittedAt: -1 })
        .lean();
      sendSuccess(res, { submissions });
    } catch (err) { next(err); }
  },
};
