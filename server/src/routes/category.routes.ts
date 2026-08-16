import { Router } from 'express';
import { categoryController } from '../controllers/category.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

router.get('/', categoryController.getAll);
router.post('/', authenticate, authorize('admin'), categoryController.create);

export default router;
