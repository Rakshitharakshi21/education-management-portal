import { Router, Request, Response, NextFunction } from 'express';
import { ContactMessage } from '../models/ContactMessage.model';
import { sendSuccess, sendError } from '../utils/response';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email, subject, message } = req.body;
    if (!name || !email || !subject || !message) {
      return sendError(res, 'All fields are required.');
    }
    await ContactMessage.create({ name, email, subject, message });
    sendSuccess(res, {}, 201, "Thanks for reaching out! We'll get back to you within 24 hours.");
  } catch (err) { next(err); }
});

router.get('/', authenticate, authorize('admin'), async (_req, res, next) => {
  try {
    const messages = await ContactMessage.find().sort({ createdAt: -1 }).lean();
    sendSuccess(res, { messages });
  } catch (err) { next(err); }
});

export default router;
