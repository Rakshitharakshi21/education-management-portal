import mongoose, { Document, Schema } from 'mongoose';

export interface IAssignmentSubmission extends Document {
  assignment: mongoose.Types.ObjectId;
  student: mongoose.Types.ObjectId;
  course: mongoose.Types.ObjectId;
  submittedAt: Date;
  content: string;
  attachments: string[];
  marks?: number;
  feedback?: string;
  status: 'submitted' | 'graded' | 'late' | 'resubmitted';
  isLate: boolean;
  gradedAt?: Date;
  gradedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const assignmentSubmissionSchema = new Schema<IAssignmentSubmission>(
  {
    assignment: { type: Schema.Types.ObjectId, ref: 'Assignment', required: true },
    student: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    course: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
    submittedAt: { type: Date, default: Date.now },
    content: { type: String, default: '' },
    attachments: [{ type: String }],
    marks: { type: Number, min: 0 },
    feedback: { type: String },
    status: {
      type: String,
      enum: ['submitted', 'graded', 'late', 'resubmitted'],
      default: 'submitted',
    },
    isLate: { type: Boolean, default: false },
    gradedAt: { type: Date },
    gradedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

// Prevent duplicate submissions
assignmentSubmissionSchema.index({ assignment: 1, student: 1 }, { unique: true });
assignmentSubmissionSchema.index({ student: 1, course: 1 });
assignmentSubmissionSchema.index({ assignment: 1 });
assignmentSubmissionSchema.index({ status: 1 });

export const AssignmentSubmission = mongoose.model<IAssignmentSubmission>(
  'AssignmentSubmission',
  assignmentSubmissionSchema
);
