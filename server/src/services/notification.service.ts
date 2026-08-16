import { Notification } from '../models/Notification.model';
import mongoose from 'mongoose';

export const notificationService = {
  async create(params: {
    userId: string;
    title: string;
    message: string;
    type?: 'assignment' | 'exam' | 'grade' | 'attendance' | 'announcement' | 'ai' | 'general';
    link?: string;
    metadata?: Record<string, unknown>;
  }) {
    return Notification.create({
      user: params.userId,
      title: params.title,
      message: params.message,
      type: params.type || 'general',
      link: params.link,
      metadata: params.metadata,
    });
  },

  async createBulk(userIds: string[], params: {
    title: string;
    message: string;
    type?: 'assignment' | 'exam' | 'grade' | 'attendance' | 'announcement' | 'ai' | 'general';
    link?: string;
  }) {
    const notifications = userIds.map((userId) => ({
      user: new mongoose.Types.ObjectId(userId),
      title: params.title,
      message: params.message,
      type: params.type || 'general',
      link: params.link,
    }));
    return Notification.insertMany(notifications);
  },

  async getForUser(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [notifications, total, unreadCount] = await Promise.all([
      Notification.find({ user: userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Notification.countDocuments({ user: userId }),
      Notification.countDocuments({ user: userId, read: false }),
    ]);
    return { notifications, total, unreadCount };
  },

  async markRead(notificationId: string, userId: string) {
    return Notification.findOneAndUpdate(
      { _id: notificationId, user: userId },
      { read: true },
      { new: true }
    );
  },

  async markAllRead(userId: string) {
    return Notification.updateMany({ user: userId, read: false }, { read: true });
  },
};
