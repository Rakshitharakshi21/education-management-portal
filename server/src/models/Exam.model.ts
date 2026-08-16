import mongoose, { Document, Schema } from 'mongoose';

export interface IExamQuestion {
  questionNumber: number;
  question: string;
  type: 'mcq' | 'short' | 'long';
  options?: string[];
  correctAnswer?: string;
  marks: number;
}

export interface IExam extends Document {
  title: string;
  course: mongoose.Types.ObjectId;
  class: mongoose.Types.ObjectId;
  teacher: mongoose.Types.ObjectId;
  description?: string;
  instructions?: string;
  date: Date;
  duration: number; // minutes
  totalMarks: number;
  passingMarks: number;
  questions: IExamQuestion[];
  status: 'scheduled' | 'ongoing' | 'completed' | 'cancelled';
  type: 'midterm' | 'final' | 'quiz' | 'practical' | 'assignment';
  isOnline: boolean;
  venue?: string;
  createdAt: Date;
  updatedAt: Date;
}

const examSchema = new Schema<IExam>(
  {
    title: { type: String, required: true, trim: true },
    course: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
    class: { type: Schema.Types.ObjectId, ref: 'Class', required: true },
    teacher: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    description: { type: String },
    instructions: { type: String },
    date: { type: Date, required: true },
    duration: { type: Number, required: true, min: 5 }, // minutes
    totalMarks: { type: Number, required: true, min: 1 },
    passingMarks: { type: Number, required: true, min: 0 },
    questions: [
      {
        questionNumber: Number,
        question: { type: String, required: true },
        type: { type: String, enum: ['mcq', 'short', 'long'], default: 'mcq' },
        options: [String],
        correctAnswer: String,
        marks: { type: Number, required: true },
      },
    ],
    status: {
      type: String,
      enum: ['scheduled', 'ongoing', 'completed', 'cancelled'],
      default: 'scheduled',
    },
    type: {
      type: String,
      enum: ['midterm', 'final', 'quiz', 'practical', 'assignment'],
      default: 'quiz',
    },
    isOnline: { type: Boolean, default: false },
    venue: { type: String },
  },
  { timestamps: true }
);

examSchema.index({ course: 1 });
examSchema.index({ class: 1 });
examSchema.index({ teacher: 1 });
examSchema.index({ date: 1 });
examSchema.index({ status: 1 });

export const Exam = mongoose.model<IExam>('Exam', examSchema);
