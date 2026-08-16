import mongoose, { Document, Schema } from 'mongoose';

export interface IAnnouncement extends Document {
  title: string;
  content: string;
  target: 'all' | 'students' | 'teachers';
  createdBy: mongoose.Types.ObjectId;
  course?: mongoose.Types.ObjectId;
  class?: mongoose.Types.ObjectId;
  priority: 'low' | 'medium' | 'high';
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const announcementSchema = new Schema<IAnnouncement>(
  {
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true },
    target: { type: String, enum: ['all', 'students', 'teachers'], default: 'all' },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    course: { type: Schema.Types.ObjectId, ref: 'Course' },
    class: { type: Schema.Types.ObjectId, ref: 'Class' },
    priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
    expiresAt: { type: Date },
  },
  { timestamps: true }
);

announcementSchema.index({ target: 1, createdAt: -1 });
announcementSchema.index({ course: 1 });

export const Announcement = mongoose.model<IAnnouncement>('Announcement', announcementSchema);
