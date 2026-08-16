import { Router } from 'express';
import { courseController } from '../controllers/course.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

// Public routes
router.get('/', courseController.getAll);
router.get('/:id', courseController.getById);

// Protected routes
router.use(authenticate);
router.get('/my/courses', courseController.getMyCourses);
router.post('/', authorize('teacher', 'admin'), courseController.create);
router.put('/:id', authorize('teacher', 'admin'), courseController.update);
router.delete('/:id', authorize('teacher', 'admin'), courseController.delete);

export default router;
