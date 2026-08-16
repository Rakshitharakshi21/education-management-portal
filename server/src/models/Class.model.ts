import mongoose, { Document, Schema } from 'mongoose';

export interface IScheduleSlot {
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
  startTime: string;
  endTime: string;
  room?: string;
}

export interface IClass extends Document {
  name: string;
  course: mongoose.Types.ObjectId;
  teacher: mongoose.Types.ObjectId;
  students: mongoose.Types.ObjectId[];
  semester: string;
  section: string;
  room?: string;
  schedule: IScheduleSlot[];
  academicYear: string;
  status: 'active' | 'completed' | 'cancelled';
  maxStudents: number;
  createdAt: Date;
  updatedAt: Date;
}

const classSchema = new Schema<IClass>(
  {
    name: { type: String, required: true, trim: true },
    course: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
    teacher: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    students: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    semester: { type: String, default: 'Semester 1' },
    section: { type: String, default: 'A' },
    room: { type: String },
    schedule: [
      {
        day: {
          type: String,
          enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        },
        startTime: String,
        endTime: String,
        room: String,
      },
    ],
    academicYear: { type: String, default: '2024-25' },
    status: { type: String, enum: ['active', 'completed', 'cancelled'], default: 'active' },
    maxStudents: { type: Number, default: 40 },
  },
  { timestamps: true }
);

classSchema.index({ course: 1 });
classSchema.index({ teacher: 1 });
classSchema.index({ status: 1 });

export const Class = mongoose.model<IClass>('Class', classSchema);
