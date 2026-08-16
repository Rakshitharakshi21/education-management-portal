import { Router } from 'express';
import { classController } from '../controllers/class.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/', classController.getAll);
router.get('/my', classController.getMyClasses);
router.get('/:id', classController.getById);
router.get('/:id/students', classController.getStudents);
router.post('/', authorize('teacher', 'admin'), classController.create);
router.put('/:id', authorize('teacher', 'admin'), classController.update);
router.delete('/:id', authorize('admin'), classController.delete);
router.post('/:id/students', authorize('teacher', 'admin'), classController.addStudent);
router.delete('/:id/students/:studentId', authorize('teacher', 'admin'), classController.removeStudent);

export default router;
