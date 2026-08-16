import mongoose, { Document, Schema } from 'mongoose';

export interface IAssignment extends Document {
  course: mongoose.Types.ObjectId;
  class: mongoose.Types.ObjectId;
  teacher: mongoose.Types.ObjectId;
  title: string;
  description: string;
  instructions?: string;
  dueDate: Date;
  maxMarks: number;
  attachments: string[];
  allowLateSubmission: boolean;
  latePenaltyPercent: number;
  status: 'draft' | 'published' | 'closed';
  submissionCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const assignmentSchema = new Schema<IAssignment>(
  {
    course: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
    class: { type: Schema.Types.ObjectId, ref: 'Class', required: true },
    teacher: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, required: true },
    instructions: { type: String },
    dueDate: { type: Date, required: true },
    maxMarks: { type: Number, required: true, min: 1 },
    attachments: [{ type: String }],
    allowLateSubmission: { type: Boolean, default: true },
    latePenaltyPercent: { type: Number, default: 10 },
    status: { type: String, enum: ['draft', 'published', 'closed'], default: 'published' },
    submissionCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

assignmentSchema.index({ course: 1 });
assignmentSchema.index({ class: 1 });
assignmentSchema.index({ teacher: 1 });
assignmentSchema.index({ dueDate: 1 });
assignmentSchema.index({ status: 1 });

export const Assignment = mongoose.model<IAssignment>('Assignment', assignmentSchema);
