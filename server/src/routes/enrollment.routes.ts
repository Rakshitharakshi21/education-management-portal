import { Router } from 'express';
import { enrollmentController } from '../controllers/enrollment.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.post('/', authorize('student'), enrollmentController.enroll);
router.get('/my', enrollmentController.getMyEnrollments);
router.delete('/:id', authorize('student'), enrollmentController.drop);
router.put('/:id/progress', authorize('student'), enrollmentController.updateProgress);

export default router;
