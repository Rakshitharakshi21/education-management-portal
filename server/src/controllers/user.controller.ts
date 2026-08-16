import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { User } from '../models/User.model';
import { StudentProfile } from '../models/StudentProfile.model';
import { TeacherProfile } from '../models/TeacherProfile.model';
import { sendSuccess, sendError, sendPaginated, getPaginationParams } from '../utils/response';

export const userController = {
  async getProfile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const user = req.user!;
      let profile = null;
      if (user.role === 'student') {
        profile = await StudentProfile.findOne({ user: user._id }).lean();
      } else if (user.role === 'teacher') {
        profile = await TeacherProfile.findOne({ user: user._id }).lean();
      }
      sendSuccess(res, { user, profile });
    } catch (err) { next(err); }
  },

  async updateProfile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const user = req.user!;
      const { name, phone, avatar, bio, specialization, department, semester } = req.body;

      const updatedUser = await User.findByIdAndUpdate(
        user._id,
        { ...(name && { name }), ...(phone !== undefined && { phone }), ...(avatar && { avatar }) },
        { new: true }
      );

      if (user.role === 'student') {
        await StudentProfile.findOneAndUpdate(
          { user: user._id },
          { ...(bio !== undefined && { bio }), ...(semester && { semester }), ...(department && { department }) }
        );
      } else if (user.role === 'teacher') {
        await TeacherProfile.findOneAndUpdate(
          { user: user._id },
          { ...(bio !== undefined && { bio }), ...(specialization && { specialization }), ...(department && { department }) }
        );
      }

      sendSuccess(res, { user: updatedUser }, 200, 'Profile updated successfully.');
    } catch (err) { next(err); }
  },

  async changePassword(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { currentPassword, newPassword } = req.body;
      if (!currentPassword || !newPassword) return sendError(res, 'Both current and new passwords are required.');

      const user = await User.findById(req.user!._id).select('+password');
      if (!user) return sendError(res, 'User not found.', 404);

      const isMatch = await user.comparePassword(currentPassword);
      if (!isMatch) return sendError(res, 'Current password is incorrect.', 401);

      user.password = newPassword;
      await user.save();
      sendSuccess(res, {}, 200, 'Password changed successfully.');
    } catch (err) { next(err); }
  },

  async getUsers(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { page, limit, skip } = getPaginationParams(req.query as Record<string, unknown>);
      const { role, status, search } = req.query as Record<string, string>;

      const filter: Record<string, unknown> = {};
      if (role) filter.role = role;
      if (status) filter.status = status;
      if (search) filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];

      const [users, total] = await Promise.all([
        User.find(filter).skip(skip).limit(limit).sort({ createdAt: -1 }).lean(),
        User.countDocuments(filter),
      ]);

      sendPaginated(res, users, total, page, limit);
    } catch (err) { next(err); }
  },
};
