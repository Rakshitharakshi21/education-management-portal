import mongoose, { Document, Schema } from 'mongoose';

export interface IStudentProfile extends Document {
  user: mongoose.Types.ObjectId;
  studentId: string;
  department: string;
  semester: number;
  academicYear: string;
  bio?: string;
  dateOfBirth?: Date;
  address?: string;
  guardianName?: string;
  guardianPhone?: string;
  createdAt: Date;
  updatedAt: Date;
}

const studentProfileSchema = new Schema<IStudentProfile>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    studentId: { type: String, unique: true, sparse: true },
    department: { type: String, default: 'General' },
    semester: { type: Number, default: 1, min: 1, max: 12 },
    academicYear: { type: String, default: '2024-25' },
    bio: { type: String, maxlength: 500 },
    dateOfBirth: { type: Date },
    address: { type: String },
    guardianName: { type: String },
    guardianPhone: { type: String },
  },
  { timestamps: true }
);

studentProfileSchema.index({ user: 1 }, { unique: true });

export const StudentProfile = mongoose.model<IStudentProfile>('StudentProfile', studentProfileSchema);
