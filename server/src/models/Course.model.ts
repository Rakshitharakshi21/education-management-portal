import mongoose, { Document, Schema } from 'mongoose';

export interface ISyllabusItem {
  week: number;
  title: string;
  topics: string[];
}

export interface ICourse extends Document {
  title: string;
  slug: string;
  description: string;
  shortDescription: string;
  category: mongoose.Types.ObjectId;
  teacher: mongoose.Types.ObjectId;
  level: 'beginner' | 'intermediate' | 'advanced';
  duration: string; // e.g. "12 weeks"
  totalHours: number;
  thumbnail: string;
  syllabus: ISyllabusItem[];
  tags: string[];
  prerequisites: string[];
  published: boolean;
  rating: number;
  totalRatings: number;
  enrollmentCount: number;
  maxStudents?: number;
  language: string;
  certificate: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const courseSchema = new Schema<ICourse>(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    slug: { type: String, required: true, unique: true, lowercase: true },
    description: { type: String, required: true },
    shortDescription: { type: String, maxlength: 300, default: '' },
    category: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
    teacher: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    level: { type: String, enum: ['beginner', 'intermediate', 'advanced'], default: 'beginner' },
    duration: { type: String, default: '8 weeks' },
    totalHours: { type: Number, default: 0 },
    thumbnail: { type: String, default: '' },
    syllabus: [
      {
        week: Number,
        title: String,
        topics: [String],
      },
    ],
    tags: [{ type: String }],
    prerequisites: [{ type: String }],
    published: { type: Boolean, default: false },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    totalRatings: { type: Number, default: 0 },
    enrollmentCount: { type: Number, default: 0 },
    maxStudents: { type: Number },
    language: { type: String, default: 'English' },
    certificate: { type: Boolean, default: true },
  },
  { timestamps: true }
);

courseSchema.index({ slug: 1 }, { unique: true });
courseSchema.index({ teacher: 1 });
courseSchema.index({ category: 1 });
courseSchema.index({ published: 1 });
courseSchema.index({ title: 'text', description: 'text', tags: 'text' });

export const Course = mongoose.model<ICourse>('Course', courseSchema);
