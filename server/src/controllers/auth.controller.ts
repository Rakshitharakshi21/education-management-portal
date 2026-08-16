import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service';
import { sendSuccess, sendError } from '../utils/response';
import { AuthRequest } from '../middleware/auth.middleware';

export const authController = {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, email, password, role, phone } = req.body;
      if (!name || !email || !password || !role) {
        return sendError(res, 'Name, email, password and role are required.');
      }
      if (!['student', 'teacher', 'admin'].includes(role)) {
        return sendError(res, 'Role must be student, teacher, or admin.');
      }
      const { user, token } = await authService.register({ name, email, password, role, phone });
      sendSuccess(res, { user, token }, 201, 'Account created successfully. Welcome aboard!');
    } catch (err) {
      next(err);
    }
  },

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;
      if (!email || !password) return sendError(res, 'Email and password are required.');
      const { user, token } = await authService.login(email, password);
      sendSuccess(res, { user, token }, 200, 'Welcome back 👋');
    } catch (err) {
      if ((err as Error).message.includes('Invalid') || (err as Error).message.includes('suspended')) {
        return sendError(res, (err as Error).message, 401);
      }
      next(err);
    }
  },

  async getMe(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const user = req.user!;
      sendSuccess(res, { user });
    } catch (err) {
      next(err);
    }
  },

  async forgotPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { email } = req.body;
      if (!email) return sendError(res, 'Email is required.');
      const token = await authService.forgotPassword(email);
      // In production, send email. For dev, return token in response.
      const data = process.env.NODE_ENV === 'development' ? { resetToken: token } : {};
      sendSuccess(res, data, 200, 'If an account exists with this email, a reset link has been sent.');
    } catch (err) {
      next(err);
    }
  },

  async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { token } = req.params;
      const { password } = req.body;
      if (!password) return sendError(res, 'New password is required.');
      const { user, token: jwtToken } = await authService.resetPassword(token, password);
      sendSuccess(res, { user, token: jwtToken }, 200, 'Password reset successful. Please log in.');
    } catch (err) {
      if ((err as Error).message.includes('invalid') || (err as Error).message.includes('expired')) {
        return sendError(res, (err as Error).message, 400);
      }
      next(err);
    }
  },
};
