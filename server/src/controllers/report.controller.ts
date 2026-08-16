import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { reportService } from '../services/report.service';
import { sendSuccess } from '../utils/response';

export const reportController = {
  async getOverview(_req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = await reportService.getInstitutionOverview();
      sendSuccess(res, data);
    } catch (err) { next(err); }
  },

  async getStudentPerformance(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { courseId } = req.query as Record<string, string>;
      const data = await reportService.getStudentPerformanceReport(courseId);
      sendSuccess(res, { students: data });
    } catch (err) { next(err); }
  },

  async getAtRisk(_req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = await reportService.getAtRiskStudents();
      sendSuccess(res, { students: data });
    } catch (err) { next(err); }
  },

  async getAttendanceTrends(_req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = await reportService.getAttendanceTrends();
      sendSuccess(res, { trends: data });
    } catch (err) { next(err); }
  },

  async getCoursePerformance(_req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = await reportService.getCoursePerformance();
      sendSuccess(res, { courses: data });
    } catch (err) { next(err); }
  },
};
