import { Router } from 'express';
import { submissionController } from '../controllers/submission.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.post('/', authorize('student'), submissionController.submit);
router.get('/my', authorize('student'), submissionController.getMySubmissions);
router.get('/assignment/:assignmentId', authorize('teacher', 'admin'), submissionController.getForAssignment);
router.put('/:id/grade', authorize('teacher', 'admin'), submissionController.grade);

export default router;
