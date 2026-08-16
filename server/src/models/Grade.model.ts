import mongoose, { Document, Schema } from 'mongoose';

export interface ISubjectGrade {
  assignment: mongoose.Types.ObjectId;
  marks: number;
  maxMarks: number;
}

export interface IGrade extends Document {
  student: mongoose.Types.ObjectId;
  course: mongoose.Types.ObjectId;
  class: mongoose.Types.ObjectId;
  assignmentGrades: ISubjectGrade[];
  examGrades: { exam: mongoose.Types.ObjectId; marks: number; maxMarks: number }[];
  assignmentAverage: number;
  examAverage: number;
  totalMarks: number;
  totalMaxMarks: number;
  percentage: number;
  grade: string;
  teacherFeedback?: string;
  updatedAt: Date;
  createdAt: Date;
}

const gradeSchema = new Schema<IGrade>(
  {
    student: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    course: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
    class: { type: Schema.Types.ObjectId, ref: 'Class', required: true },
    assignmentGrades: [
      {
        assignment: { type: Schema.Types.ObjectId, ref: 'Assignment' },
        marks: Number,
        maxMarks: Number,
      },
    ],
    examGrades: [
      {
        exam: { type: Schema.Types.ObjectId, ref: 'Exam' },
        marks: Number,
        maxMarks: Number,
      },
    ],
    assignmentAverage: { type: Number, default: 0 },
    examAverage: { type: Number, default: 0 },
    totalMarks: { type: Number, default: 0 },
    totalMaxMarks: { type: Number, default: 0 },
    percentage: { type: Number, default: 0 },
    grade: { type: String, default: '' },
    teacherFeedback: { type: String },
  },
  { timestamps: true }
);

gradeSchema.index({ student: 1, course: 1 }, { unique: true });
gradeSchema.index({ student: 1 });
gradeSchema.index({ course: 1 });

export const Grade = mongoose.model<IGrade>('Grade', gradeSchema);
