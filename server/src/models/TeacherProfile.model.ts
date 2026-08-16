import mongoose, { Document, Schema } from 'mongoose';

export interface ITeacherProfile extends Document {
  user: mongoose.Types.ObjectId;
  employeeId: string;
  specialization: string;
  department: string;
  qualification: string;
  bio?: string;
  rating: number;
  totalRatings: number;
  experience: number; // years
  createdAt: Date;
  updatedAt: Date;
}

const teacherProfileSchema = new Schema<ITeacherProfile>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    employeeId: { type: String, unique: true, sparse: true },
    specialization: { type: String, default: 'General' },
    department: { type: String, default: 'General' },
    qualification: { type: String, default: 'B.Ed' },
    bio: { type: String, maxlength: 800 },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    totalRatings: { type: Number, default: 0 },
    experience: { type: Number, default: 0 },
  },
  { timestamps: true }
);

teacherProfileSchema.index({ user: 1 }, { unique: true });

export const TeacherProfile = mongoose.model<ITeacherProfile>('TeacherProfile', teacherProfileSchema);
