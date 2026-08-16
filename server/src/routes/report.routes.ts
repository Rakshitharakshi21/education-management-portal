import { Router } from 'express';
import { reportController } from '../controllers/report.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate, authorize('admin', 'teacher'));

router.get('/overview', reportController.getOverview);
router.get('/students', reportController.getStudentPerformance);
router.get('/at-risk', reportController.getAtRisk);
router.get('/attendance', reportController.getAttendanceTrends);
router.get('/courses', reportController.getCoursePerformance);

export default router;
