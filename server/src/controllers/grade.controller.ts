import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { Grade } from '../models/Grade.model';
import { calculateGrade } from '../utils/response';
import { sendSuccess, sendError } from '../utils/response';

export const gradeController = {
  async getStudentGrades(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const studentId = req.params.studentId || String(req.user!._id);
      if (req.user!.role === 'student' && studentId !== String(req.user!._id)) {
        return sendError(res, 'Access denied.', 403);
      }

      const grades = await Grade.find({ student: studentId })
        .populate('course', 'title slug thumbnail')
        .populate('class', 'name section')
        .populate('assignmentGrades.assignment', 'title maxMarks dueDate')
        .populate('examGrades.exam', 'title totalMarks date type')
        .lean();

      const enriched = grades.map((g) => ({
        ...g,
        grade: g.grade || calculateGrade(g.percentage),
      }));

      sendSuccess(res, { grades: enriched });
    } catch (err) { next(err); }
  },

  async getCourseGrades(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const grades = await Grade.find({ course: req.params.courseId })
        .populate('student', 'name email avatar')
        .populate('course', 'title')
        .lean();
      sendSuccess(res, { grades });
    } catch (err) { next(err); }
  },

  async upsert(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { student, course, class: classId, assignmentAverage, examAverage } = req.body;

      const totalMarks = (assignmentAverage * 0.4) + (examAverage * 0.6);
      const percentage = Math.min(100, Math.round(totalMarks));
      const grade = calculateGrade(percentage);

      const doc = await Grade.findOneAndUpdate(
        { student, course },
        {
          student, course,
          class: classId,
          assignmentAverage, examAverage,
          percentage, grade,
          totalMarks: percentage,
          totalMaxMarks: 100,
        },
        { upsert: true, new: true }
      );

      sendSuccess(res, { grade: doc }, 200, 'Grade saved.');
    } catch (err) { next(err); }
  },

  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { teacherFeedback, marks } = req.body;
      const grade = await Grade.findByIdAndUpdate(
        req.params.id,
        { ...(teacherFeedback !== undefined && { teacherFeedback }), ...(marks !== undefined && { totalMarks: marks }) },
        { new: true }
      );
      if (!grade) return sendError(res, 'Grade not found.', 404);
      sendSuccess(res, { grade }, 200, 'Grade updated.');
    } catch (err) { next(err); }
  },
};
