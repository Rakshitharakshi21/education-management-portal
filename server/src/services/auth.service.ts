import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { User } from '../models/User.model';
import { StudentProfile } from '../models/StudentProfile.model';
import { TeacherProfile } from '../models/TeacherProfile.model';
import { config } from '../config/constants';
import { AuditLog } from '../models/AuditLog.model';

const generateToken = (id: string): string => {
  return jwt.sign({ id }, config.jwtSecret, { expiresIn: config.jwtExpiresIn } as jwt.SignOptions);
};

export const authService = {
  async register(data: {
    name: string;
    email: string;
    password: string;
    role: 'student' | 'teacher' | 'admin';
    phone?: string;
  }) {
    const existing = await User.findOne({ email: data.email });
    if (existing) throw new Error('An account with this email already exists.');

    const user = await User.create({
      name: data.name,
      email: data.email,
      password: data.password,
      role: data.role,
      phone: data.phone,
    });

    // Create role profile
    if (data.role === 'student') {
      await StudentProfile.create({ user: user._id, studentId: `STU${Date.now()}` });
    } else if (data.role === 'teacher') {
      await TeacherProfile.create({ user: user._id, employeeId: `EMP${Date.now()}` });
    }

    await AuditLog.create({
      user: user._id,
      action: 'REGISTER',
      entity: 'User',
      entityId: user._id,
      description: `New ${data.role} account created: ${data.name}`,
    });

    const token = generateToken(String(user._id));
    return { user, token };
  },

  async login(email: string, password: string) {
    const user = await User.findOne({ email }).select('+password');
    if (!user) throw new Error('Invalid email or password.');
    if (user.status !== 'active') throw new Error('Your account has been suspended. Please contact support.');

    const isMatch = await user.comparePassword(password);
    if (!isMatch) throw new Error('Invalid email or password.');

    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    const token = generateToken(String(user._id));
    return { user, token };
  },

  async forgotPassword(email: string) {
    const user = await User.findOne({ email });
    if (!user) return null; // Don't reveal if email exists

    const token = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = crypto.createHash('sha256').update(token).digest('hex');
    user.resetPasswordExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 min
    await user.save({ validateBeforeSave: false });

    return token; // In production, email this
  },

  async resetPassword(token: string, newPassword: string) {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    }).select('+resetPasswordToken +resetPasswordExpires');

    if (!user) throw new Error('Password reset token is invalid or has expired.');

    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    const jwtToken = generateToken(String(user._id));
    return { user, token: jwtToken };
  },
};
