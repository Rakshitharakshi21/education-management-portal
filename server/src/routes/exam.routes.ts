import { Router } from 'express';
import { examController } from '../controllers/exam.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/', examController.getAll);
router.get('/student/my', authorize('student'), examController.getStudentExams);
router.get('/:id', examController.getById);
router.get('/:examId/submissions', authorize('teacher', 'admin'), examController.getSubmissions);
router.post('/', authorize('teacher', 'admin'), examController.create);
router.put('/:id', authorize('teacher', 'admin'), examController.update);
router.post('/submit', authorize('student'), examController.submitExam);

export default router;
