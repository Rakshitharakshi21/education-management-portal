import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { Attendance } from '../models/Attendance.model';
import { attendanceService } from '../services/attendance.service';
import { sendSuccess, sendError } from '../utils/response';

export const attendanceController = {
  async mark(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { records, classId, courseId, date, sessionTopic } = req.body;
      if (!records || !Array.isArray(records) || records.length === 0) {
        return sendError(res, 'Attendance records array is required.');
      }

      const markedBy = String(req.user!._id);
      const attendanceDate = new Date(date || Date.now());

      const toMark = records.map((r: { student: string; status: string }) => ({
        student: r.student,
        course: courseId,
        class: classId,
        date: attendanceDate,
        status: r.status as 'present' | 'absent' | 'late',
        markedBy,
        sessionTopic,
      }));

      const results = await attendanceService.markBulk(toMark);

      // Update academic records
      for (const r of records) {
        await attendanceService.updateAcademicRecord(r.student, courseId, classId);
      }

      sendSuccess(res, { results }, 200, `Attendance marked for ${results.length} students.`);
    } catch (err) { next(err); }
  },

  async getForCourse(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { courseId } = req.params;
      const { date, classId } = req.query as Record<string, string>;

      const filter: Record<string, unknown> = { course: courseId };
      if (date) filter.date = new Date(date);
      if (classId) filter.class = classId;

      const records = await Attendance.find(filter)
        .populate('student', 'name email avatar')
        .sort({ date: -1, 'student.name': 1 })
        .lean();
      sendSuccess(res, { records });
    } catch (err) { next(err); }
  },

  async getStudentSummary(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const studentId = req.params.studentId || String(req.user!._id);

      // Authorization: students can only see their own
      if (req.user!.role === 'student' && studentId !== String(req.user!._id)) {
        return sendError(res, 'Access denied.', 403);
      }

      const courseId = req.query.courseId as string | undefined;
      const summary = await attendanceService.getStudentSummary(studentId, courseId);
      sendSuccess(res, summary);
    } catch (err) { next(err); }
  },

  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { status } = req.body;
      const record = await Attendance.findByIdAndUpdate(
        req.params.id,
        { status, markedBy: req.user!._id },
        { new: true }
      );
      if (!record) return sendError(res, 'Attendance record not found.', 404);
      sendSuccess(res, { record }, 200, 'Attendance updated.');
    } catch (err) { next(err); }
  },
};
