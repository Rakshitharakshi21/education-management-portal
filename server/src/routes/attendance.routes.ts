import { Router } from 'express';
import { attendanceController } from '../controllers/attendance.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.post('/', authorize('teacher', 'admin'), attendanceController.mark);
router.get('/course/:courseId', attendanceController.getForCourse);
router.get('/summary/:studentId', attendanceController.getStudentSummary);
router.get('/my/summary', authorize('student'), (req, res, next) => {
  (req as import('../middleware/auth.middleware').AuthRequest & { params: { studentId: string } }).params.studentId = String((req as import('../middleware/auth.middleware').AuthRequest).user!._id);
  attendanceController.getStudentSummary(req as import('../middleware/auth.middleware').AuthRequest, res, next);
});
router.put('/:id', authorize('teacher', 'admin'), attendanceController.update);

export default router;
