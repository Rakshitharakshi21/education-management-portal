import mongoose from 'mongoose';
import { AIInsight, IAIInsight, IAIStructuredResult } from '../../models/AIInsight.model';
import { User } from '../../models/User.model';
import { Enrollment } from '../../models/Enrollment.model';
import { Attendance } from '../../models/Attendance.model';
import { AssignmentSubmission } from '../../models/AssignmentSubmission.model';
import { ExamSubmission } from '../../models/ExamSubmission.model';
import { Assignment } from '../../models/Assignment.model';
import { Grade } from '../../models/Grade.model';
import { Course } from '../../models/Course.model';
import { Class } from '../../models/Class.model';
import { openRouterService } from './openrouter.service';
import { promptService } from './prompt.service';
import { parseAIResponse } from './responseParser';
import { config } from '../../config/constants';

export class AIService {
  private async getCachedInsight(
    targetId: mongoose.Types.ObjectId,
    targetType: string,
    insightType: string
  ): Promise<IAIInsight | null> {
    return AIInsight.findOne({
      targetId,
      targetType,
      insightType,
      isValid: true,
      expiresAt: { $gt: new Date() },
    });
  }

  private async saveInsight(params: {
    targetId: mongoose.Types.ObjectId;
    targetType: IAIInsight['targetType'];
    insightType: IAIInsight['insightType'];
    result: string;
    structuredResult?: IAIStructuredResult;
    error?: string;
  }): Promise<IAIInsight> {
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + config.ai.insightTTLHours);

    await AIInsight.findOneAndDelete({
      targetId: params.targetId,
      targetType: params.targetType,
      insightType: params.insightType,
    });

    return AIInsight.create({
      ...params,
      model: config.openrouter.model,
      promptVersion: '2.0',
      generatedAt: new Date(),
      expiresAt,
      isValid: true,
    });
  }

  async generateStudentInsight(studentId: string, forceRefresh = false): Promise<IAIInsight> {
    const sid = new mongoose.Types.ObjectId(studentId);

    if (!forceRefresh) {
      const cached = await this.getCachedInsight(sid, 'student', 'comprehensive');
      if (cached) return cached;
    }

    // Gather student data
    const student = await User.findById(sid).lean();
    if (!student) throw new Error('Student not found');

    const enrollments = await Enrollment.find({ student: sid, status: 'active' })
      .populate('course', 'title')
      .lean();

    const courseIds = enrollments.map((e) => (e.course as { _id: mongoose.Types.ObjectId })._id);

    // Attendance
    const attendanceRecords = await Attendance.find({ student: sid }).lean();
    const totalAttendance = attendanceRecords.length;
    const presentCount = attendanceRecords.filter((a) => a.status === 'present' || a.status === 'late').length;
    const overallAttendance = totalAttendance > 0 ? Math.round((presentCount / totalAttendance) * 100) : 0;

    // Assignments
    const allAssignments = await Assignment.find({ course: { $in: courseIds } }).lean();
    const submissions = await AssignmentSubmission.find({ student: sid }).lean();
    const submittedIds = new Set(submissions.map((s) => String(s.assignment)));
    const submittedCount = allAssignments.filter((a) => submittedIds.has(String(a._id))).length;
    const lateCount = submissions.filter((s) => s.isLate).length;
    const missedCount = allAssignments.length - submittedCount;
    
    const gradedSubmissions = submissions.filter((s) => s.marks !== undefined);
    const assignmentAvg = gradedSubmissions.length > 0
      ? Math.round(gradedSubmissions.reduce((sum, s) => sum + ((s.marks || 0) / 100 * 100), 0) / gradedSubmissions.length)
      : 0;

    // Exam results
    const examResults = await ExamSubmission.find({ student: sid, status: 'graded' }).lean();
    const examAvg = examResults.length > 0
      ? Math.round(examResults.reduce((sum, e) => sum + (e.percentage || 0), 0) / examResults.length)
      : 0;

    // Per-course breakdown
    const grades = await Grade.find({ student: sid }).populate('course', 'title').lean();
    const courseBreakdown = grades.map((g) => {
      const courseAttendance = attendanceRecords.filter(
        (a) => String(a.course) === String(g.course._id || g.course)
      );
      const coursePresent = courseAttendance.filter((a) => a.status === 'present' || a.status === 'late').length;
      const courseAttPct = courseAttendance.length > 0
        ? Math.round((coursePresent / courseAttendance.length) * 100)
        : 0;

      return {
        courseName: (g.course as { title?: string }).title || 'Unknown',
        attendancePercentage: courseAttPct,
        assignmentAverage: Math.round(g.assignmentAverage || 0),
        examAverage: Math.round(g.examAverage || 0),
        finalPercentage: Math.round(g.percentage || 0),
        trend: [Math.round(g.percentage || 0)], // simplified
      };
    });

    const overallPerformance = grades.length > 0
      ? Math.round(grades.reduce((sum, g) => sum + g.percentage, 0) / grades.length)
      : Math.round((assignmentAvg + examAvg) / 2);

    const prompt = promptService.buildStudentAnalysisPrompt({
      name: student.name,
      courses: courseBreakdown,
      overallAttendance,
      overallPerformance,
      totalAssignments: allAssignments.length,
      submittedAssignments: submittedCount,
      lateSubmissions: lateCount,
      missedAssignments: missedCount,
    });

    try {
      const rawResponse = await openRouterService.complete(
        [
          { role: 'system', content: 'You are an expert academic counselor. Always respond with valid JSON only.' },
          { role: 'user', content: prompt },
        ],
        { responseFormat: 'json', maxTokens: 2000, temperature: 0.6 }
      );

      const structuredResult = parseAIResponse(rawResponse);

      return this.saveInsight({
        targetId: sid,
        targetType: 'student',
        insightType: 'comprehensive',
        result: rawResponse,
        structuredResult: structuredResult || undefined,
      });
    } catch (error) {
      const errorMsg = (error as Error).message;
      const submissionRate = allAssignments.length > 0 ? Math.round((submittedCount / allAssignments.length) * 100) : 0;
      // Return a fallback insight with rule-based analysis
      const fallback = this.buildFallbackStudentInsight({
        overallAttendance,
        overallPerformance,
        submissionRate,
        missedCount,
        lateCount,
        courseBreakdown,
        studentName: student.name,
      });

      return this.saveInsight({
        targetId: sid,
        targetType: 'student',
        insightType: 'comprehensive',
        result: JSON.stringify(fallback),
        structuredResult: fallback,
        error: errorMsg,
      });
    }
  }

  private buildFallbackStudentInsight(data: {
    overallAttendance: number;
    overallPerformance: number;
    submissionRate: number;
    missedCount: number;
    lateCount: number;
    courseBreakdown: Array<{ courseName: string; finalPercentage: number; attendancePercentage: number }>;
    studentName: string;
  }): IAIStructuredResult {
    const { overallAttendance, overallPerformance, submissionRate, missedCount, courseBreakdown } = data;

    let riskLevel: IAIStructuredResult['riskLevel'] = 'LOW';
    const riskFactors: string[] = [];
    let trend: IAIStructuredResult['trend'] = 'STABLE';

    if (overallAttendance < 60) { riskLevel = 'CRITICAL'; riskFactors.push('Attendance critically low (<60%)'); }
    else if (overallAttendance < 75) { riskLevel = 'HIGH'; riskFactors.push('Attendance below required threshold (75%)'); }
    
    if (overallPerformance < 40) { riskLevel = 'CRITICAL'; riskFactors.push('Academic performance critically low (<40%)'); }
    else if (overallPerformance < 60 && riskLevel !== 'CRITICAL') { riskLevel = 'MEDIUM'; riskFactors.push('Academic performance below passing threshold'); }
    
    if (missedCount > 3) riskFactors.push(`${missedCount} missing assignment submissions`);

    if (overallPerformance >= 75) trend = 'IMPROVING';
    else if (overallPerformance < 50) trend = 'DECLINING';

    const weakSubjects = courseBreakdown
      .filter((c) => c.finalPercentage < 65)
      .map((c) => ({
        subject: c.courseName,
        score: c.finalPercentage,
        reason: c.attendancePercentage < 75
          ? `Low attendance (${c.attendancePercentage}%) likely impacting performance`
          : 'Below-average assessment scores indicate need for additional practice',
      }));

    return {
      summary: `${data.studentName} has an overall performance of ${overallPerformance}% with ${overallAttendance}% attendance. ${overallPerformance >= 75 ? 'Performance is on track.' : 'Academic attention is recommended in several areas.'}`,
      strengths: courseBreakdown
        .filter((c) => c.finalPercentage >= 75)
        .map((c) => `Strong performance in ${c.courseName} (${c.finalPercentage}%)`),
      weakSubjects,
      riskLevel,
      riskFactors: riskFactors.length > 0 ? riskFactors : ['No significant risk factors identified'],
      recommendations: [
        overallAttendance < 75 && {
          title: 'Improve Attendance',
          description: `Current attendance is ${overallAttendance}%. Aim for at least 80% by attending all scheduled classes.`,
          priority: 'high' as const,
        },
        missedCount > 0 && {
          title: 'Complete Pending Assignments',
          description: `${missedCount} assignment(s) are missing. Contact instructors to discuss submission options.`,
          priority: 'high' as const,
        },
        weakSubjects.length > 0 && {
          title: `Focus on ${weakSubjects[0]?.subject}`,
          description: `Dedicate additional study time to ${weakSubjects[0]?.subject}. Consider forming study groups or seeking tutoring.`,
          priority: 'medium' as const,
        },
        {
          title: 'Regular Study Schedule',
          description: 'Maintain a consistent daily study routine of at least 2-3 hours to build academic momentum.',
          priority: 'medium' as const,
        },
      ].filter(Boolean) as IAIStructuredResult['recommendations'],
      trend,
      studyPlan: [
        { week: 'Week 1', focus: weakSubjects.length > 0 ? `Fundamentals of ${weakSubjects[0].subject}` : 'Core Topics Review', hours: 4 },
        { week: 'Week 2', focus: weakSubjects.length > 0 ? `Advanced practice in ${weakSubjects[0].subject}` : 'Mock Test Preparation', hours: 6 },
        { week: 'Week 3', focus: 'Active Recall & Comprehensive Revision', hours: 5 },
      ],
      keyMetrics: {
        attendancePercentage: overallAttendance,
        overallPerformance,
        submissionRate,
      }
    };
  }

  async generateInstitutionInsight(forceRefresh = false): Promise<IAIInsight> {
    const targetId = new mongoose.Types.ObjectId();

    if (!forceRefresh) {
      const cached = await AIInsight.findOne({
        targetType: 'institution',
        insightType: 'comprehensive',
        isValid: true,
        expiresAt: { $gt: new Date() },
      });
      if (cached) return cached;
    }

    // Aggregate institution data
    const [totalStudents, totalTeachers, totalCourses] = await Promise.all([
      User.countDocuments({ role: 'student' }),
      User.countDocuments({ role: 'teacher' }),
      Course.countDocuments({ published: true }),
    ]);

    const attendanceAgg = await Attendance.aggregate([
      { $group: { _id: null, total: { $sum: 1 }, present: { $sum: { $cond: [{ $in: ['$status', ['present', 'late']] }, 1, 0] } } } },
    ]);
    const avgAttendance = attendanceAgg[0] ? Math.round((attendanceAgg[0].present / attendanceAgg[0].total) * 100) : 0;

    const performanceAgg = await Grade.aggregate([
      { $group: { _id: null, avgPerf: { $avg: '$percentage' } } },
    ]);
    const avgPerformance = Math.round(performanceAgg[0]?.avgPerf || 0);

    // At-risk students (attendance < 75% OR performance < 50%)
    const studentAttendance = await Attendance.aggregate([
      { $group: { _id: '$student', total: { $sum: 1 }, present: { $sum: { $cond: [{ $in: ['$status', ['present', 'late']] }, 1, 0] } } } },
      { $addFields: { pct: { $multiply: [{ $divide: ['$present', '$total'] }, 100] } } },
      { $match: { pct: { $lt: 75 } } },
    ]);
    const atRiskCount = studentAttendance.length;

    const coursePerf = await Grade.aggregate([
      { $lookup: { from: 'courses', localField: 'course', foreignField: '_id', as: 'courseData' } },
      { $unwind: '$courseData' },
      { $group: { _id: '$course', course: { $first: '$courseData.title' }, average: { $avg: '$percentage' } } },
      { $project: { course: 1, average: { $round: ['$average', 0] } } },
      { $sort: { average: 1 } },
      { $limit: 10 },
    ]);

    const prompt = promptService.buildInstitutionInsightsPrompt({
      totalStudents,
      totalTeachers,
      totalCourses,
      averageAttendance: avgAttendance,
      averagePerformance: avgPerformance,
      atRiskCount,
      coursePerformance: coursePerf.map((c) => ({ course: c.course, average: c.average })),
    });

    try {
      const rawResponse = await openRouterService.complete(
        [
          { role: 'system', content: 'You are an expert academic strategic advisor. Always respond with valid JSON only.' },
          { role: 'user', content: prompt },
        ],
        { responseFormat: 'json', maxTokens: 2000, temperature: 0.6 }
      );

      const structuredResult = parseAIResponse(rawResponse);

      return this.saveInsight({
        targetId,
        targetType: 'institution',
        insightType: 'comprehensive',
        result: rawResponse,
        structuredResult: structuredResult || undefined,
      });
    } catch (error) {
      const fallback: IAIStructuredResult = {
        summary: `The institution currently has ${totalStudents} students across ${totalCourses} courses with ${avgAttendance}% average attendance and ${avgPerformance}% average performance.`,
        strengths: avgPerformance >= 70 ? ['Above-average academic performance institution-wide'] : [],
        weakSubjects: coursePerf.slice(0, 3).map((c) => ({ subject: c.course, score: c.average, reason: 'Below institution average' })),
        riskLevel: atRiskCount > totalStudents * 0.3 ? 'HIGH' : atRiskCount > totalStudents * 0.15 ? 'MEDIUM' : 'LOW',
        riskFactors: [`${atRiskCount} students at risk due to low attendance or performance`],
        recommendations: [
          { title: 'Early Intervention Program', description: 'Implement systematic check-ins for at-risk students', priority: 'high' },
          { title: 'Attendance Monitoring', description: 'Send automated alerts to students with attendance below 75%', priority: 'high' },
        ],
        trend: avgPerformance >= 70 ? 'STABLE' : 'DECLINING',
        keyMetrics: {
          totalStudents,
          averageAttendance: avgAttendance,
          averagePerformance: avgPerformance,
          atRiskCount,
        }
      };

      return this.saveInsight({
        targetId,
        targetType: 'institution',
        insightType: 'comprehensive',
        result: JSON.stringify(fallback),
        structuredResult: fallback,
        error: (error as Error).message,
      });
    }
  }
}

export const aiService = new AIService();
