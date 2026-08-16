import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { notificationService } from '../services/notification.service';
import { sendSuccess } from '../utils/response';
import { AuthRequest } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/', async (req: AuthRequest, res, next) => {
  try {
    const page = parseInt(String(req.query.page || '1'));
    const limit = parseInt(String(req.query.limit || '20'));
    const data = await notificationService.getForUser(String(req.user!._id), page, limit);
    sendSuccess(res, data);
  } catch (err) { next(err); }
});

router.put('/:id/read', async (req: AuthRequest, res, next) => {
  try {
    await notificationService.markRead(String(req.params.id), String(req.user!._id));
    sendSuccess(res, {}, 200, 'Marked as read.');
  } catch (err) { next(err); }
});

router.put('/mark-all-read', async (req: AuthRequest, res, next) => {
  try {
    await notificationService.markAllRead(String(req.user!._id));
    sendSuccess(res, {}, 200, 'All notifications marked as read.');
  } catch (err) { next(err); }
});

export default router;
