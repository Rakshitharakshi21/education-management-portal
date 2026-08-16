import { Router } from 'express';
import { assignmentController } from '../controllers/assignment.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/', assignmentController.getAll);
router.get('/student/my', authorize('student'), assignmentController.getStudentAssignments);
router.get('/:id', assignmentController.getById);
router.post('/', authorize('teacher', 'admin'), assignmentController.create);
router.put('/:id', authorize('teacher', 'admin'), assignmentController.update);
router.delete('/:id', authorize('teacher', 'admin'), assignmentController.delete);

export default router;
