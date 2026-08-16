import { Router } from 'express';
import { Announcement } from '../models/Announcement.model';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { sendSuccess, sendError } from '../utils/response';
import { AuthRequest } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/', async (req: AuthRequest, res, next) => {
  try {
    const userRole = req.user!.role;
    const targetFilter = userRole === 'admin'
      ? {}
      : { $or: [{ target: 'all' }, { target: `${userRole}s` }] };
    const announcements = await Announcement.find(targetFilter)
      .populate('createdBy', 'name role avatar')
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();
    sendSuccess(res, { announcements });
  } catch (err) { next(err); }
});

router.post('/', authorize('admin', 'teacher'), async (req: AuthRequest, res, next) => {
  try {
    const { title, content, target, priority, course, expiresAt } = req.body;
    const announcement = await Announcement.create({
      title, content, target: target || 'all',
      createdBy: req.user!._id, priority: priority || 'medium',
      course, expiresAt,
    });
    sendSuccess(res, { announcement }, 201, 'Announcement posted.');
  } catch (err) { next(err); }
});

router.delete('/:id', authorize('admin'), async (req, res, next) => {
  try {
    await Announcement.findByIdAndDelete(req.params.id);
    sendSuccess(res, {}, 200, 'Announcement deleted.');
  } catch (err) { next(err); }
});

export default router;
