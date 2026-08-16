import mongoose, { Document, Schema } from 'mongoose';

export interface IExamAnswer {
  questionNumber: number;
  answer: string;
  marksAwarded?: number;
}

export interface IExamSubmission extends Document {
  exam: mongoose.Types.ObjectId;
  student: mongoose.Types.ObjectId;
  course: mongoose.Types.ObjectId;
  answers: IExamAnswer[];
  totalMarks: number;
  obtainedMarks?: number;
  percentage?: number;
  grade?: string;
  status: 'in-progress' | 'submitted' | 'graded' | 'absent';
  startedAt?: Date;
  submittedAt?: Date;
  gradedAt?: Date;
  gradedBy?: mongoose.Types.ObjectId;
  feedback?: string;
  createdAt: Date;
  updatedAt: Date;
}

const examSubmissionSchema = new Schema<IExamSubmission>(
  {
    exam: { type: Schema.Types.ObjectId, ref: 'Exam', required: true },
    student: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    course: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
    answers: [
      {
        questionNumber: Number,
        answer: String,
        marksAwarded: Number,
      },
    ],
    totalMarks: { type: Number, required: true },
    obtainedMarks: { type: Number },
    percentage: { type: Number },
    grade: { type: String },
    status: {
      type: String,
      enum: ['in-progress', 'submitted', 'graded', 'absent'],
      default: 'submitted',
    },
    startedAt: { type: Date },
    submittedAt: { type: Date },
    gradedAt: { type: Date },
    gradedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    feedback: { type: String },
  },
  { timestamps: true }
);

examSubmissionSchema.index({ exam: 1, student: 1 }, { unique: true });
examSubmissionSchema.index({ student: 1, course: 1 });

export const ExamSubmission = mongoose.model<IExamSubmission>('ExamSubmission', examSubmissionSchema);
