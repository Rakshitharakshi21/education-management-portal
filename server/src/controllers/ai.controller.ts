import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { aiService } from '../services/ai/ai.service';
import { AIInsight } from '../models/AIInsight.model';
import { sendSuccess, sendError } from '../utils/response';

export const aiController = {
  async generateStudentInsight(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const studentId = req.params.studentId || String(req.user!._id);
      
      // Students can only see their own insights
      if (req.user!.role === 'student' && studentId !== String(req.user!._id)) {
        return sendError(res, 'Access denied.', 403);
      }

      const forceRefresh = req.query.refresh === 'true';
      const insight = await aiService.generateStudentInsight(studentId, forceRefresh);
      sendSuccess(res, { insight });
    } catch (err) {
      if ((err as Error).message.includes('not configured') || (err as Error).message.includes('API key')) {
        return sendError(res, 'AI service is not configured. Please set OPENROUTER_API_KEY.', 503);
      }
      next(err);
    }
  },

  async generateInstitutionInsight(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const forceRefresh = req.query.refresh === 'true';
      const insight = await aiService.generateInstitutionInsight(forceRefresh);
      sendSuccess(res, { insight });
    } catch (err) { next(err); }
  },

  async getInsightsByTarget(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { targetId } = req.params;
      const insights = await AIInsight.find({ targetId }).sort({ generatedAt: -1 }).lean();
      sendSuccess(res, { insights });
    } catch (err) { next(err); }
  },
};
