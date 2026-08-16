import { Router } from 'express';
import { gradeController } from '../controllers/grade.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/student/:studentId', gradeController.getStudentGrades);
router.get('/course/:courseId', authorize('teacher', 'admin'), gradeController.getCourseGrades);
router.get('/my', authorize('student'), (req, res, next) => {
  (req as import('../middleware/auth.middleware').AuthRequest & { params: { studentId: string } }).params.studentId = String((req as import('../middleware/auth.middleware').AuthRequest).user!._id);
  gradeController.getStudentGrades(req as import('../middleware/auth.middleware').AuthRequest, res, next);
});
router.post('/', authorize('teacher', 'admin'), gradeController.upsert);
router.put('/:id', authorize('teacher', 'admin'), gradeController.update);

export default router;
