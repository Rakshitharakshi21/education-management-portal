import { Router } from 'express';
import { aiController } from '../controllers/ai.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.post('/student/:studentId', aiController.generateStudentInsight);
router.post('/student/my/insight', authorize('student'), aiController.generateStudentInsight);
router.post('/institution', authorize('admin'), aiController.generateInstitutionInsight);
router.get('/insights/:targetId', aiController.getInsightsByTarget);

export default router;
