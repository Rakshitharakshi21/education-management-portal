import mongoose, { Document, Schema } from 'mongoose';

export interface IAcademicRecord extends Document {
  student: mongoose.Types.ObjectId;
  course: mongoose.Types.ObjectId;
  class: mongoose.Types.ObjectId;
  semester: string;
  academicYear: string;
  attendancePercentage: number;
  totalClasses: number;
  attendedClasses: number;
  assignmentAverage: number;
  examAverage: number;
  finalPercentage: number;
  grade: string;
  status: 'pass' | 'fail' | 'incomplete' | 'distinction';
  updatedAt: Date;
  createdAt: Date;
}

const academicRecordSchema = new Schema<IAcademicRecord>(
  {
    student: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    course: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
    class: { type: Schema.Types.ObjectId, ref: 'Class', required: true },
    semester: { type: String, required: true },
    academicYear: { type: String, required: true },
    attendancePercentage: { type: Number, default: 0, min: 0, max: 100 },
    totalClasses: { type: Number, default: 0 },
    attendedClasses: { type: Number, default: 0 },
    assignmentAverage: { type: Number, default: 0 },
    examAverage: { type: Number, default: 0 },
    finalPercentage: { type: Number, default: 0 },
    grade: { type: String, default: '' },
    status: {
      type: String,
      enum: ['pass', 'fail', 'incomplete', 'distinction'],
      default: 'incomplete',
    },
  },
  { timestamps: true }
);

academicRecordSchema.index({ student: 1, course: 1, semester: 1 }, { unique: true });

export const AcademicRecord = mongoose.model<IAcademicRecord>('AcademicRecord', academicRecordSchema);
