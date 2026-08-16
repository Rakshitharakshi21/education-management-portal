import mongoose, { Document, Schema } from 'mongoose';

export interface IAIStructuredResult {
  summary: string;
  strengths: string[];
  weakSubjects: Array<{ subject: string; score: number; reason: string }>;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  riskFactors: string[];
  recommendations: Array<{ title: string; description: string; priority: 'high' | 'medium' | 'low' }>;
  trend: 'IMPROVING' | 'DECLINING' | 'STABLE';
  studyPlan?: Array<{ week: string; focus: string; hours: number }>;
  keyMetrics?: Record<string, number | string>;
}

export interface IAIInsight {
  _id?: mongoose.Types.ObjectId;
  targetId: mongoose.Types.ObjectId;
  targetType: 'student' | 'class' | 'course' | 'institution';
  insightType: 'performance' | 'risk' | 'recommendations' | 'attendance' | 'comprehensive';
  result: string; // raw AI text
  structuredResult?: IAIStructuredResult;
  model: string;
  promptVersion: string;
  generatedAt: Date;
  expiresAt: Date;
  isValid: boolean;
  error?: string;
  createdAt: Date;
  updatedAt: Date;
}

const aiInsightSchema = new Schema<IAIInsight>(
  {
    targetId: { type: Schema.Types.ObjectId, required: true },
    targetType: {
      type: String,
      enum: ['student', 'class', 'course', 'institution'],
      required: true,
    },
    insightType: {
      type: String,
      enum: ['performance', 'risk', 'recommendations', 'attendance', 'comprehensive'],
      default: 'comprehensive',
    },
    result: { type: String, default: '' },
    structuredResult: { type: Schema.Types.Mixed },
    model: { type: String, required: true },
    promptVersion: { type: String, default: '1.0' },
    generatedAt: { type: Date, default: Date.now },
    expiresAt: { type: Date, required: true },
    isValid: { type: Boolean, default: true },
    error: { type: String },
  },
  { timestamps: true }
);

aiInsightSchema.index({ targetId: 1, targetType: 1, insightType: 1 });
aiInsightSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const AIInsight = mongoose.model<IAIInsight>('AIInsight', aiInsightSchema);
