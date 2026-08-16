import mongoose from 'mongoose';
import { Grade } from '../models/Grade.model';
import { AcademicRecord } from '../models/AcademicRecord.model';
import { AssignmentSubmission } from '../models/AssignmentSubmission.model';
import { ExamSubmission } from '../models/ExamSubmission.model';
import { Attendance } from '../models/Attendance.model';
import { calculateGrade } from '../utils/response';

export const reportService = {
  async getInstitutionOverview() {
    const [
      totalStudents,
      totalTeachers,
      totalCourses,
      attendanceAgg,
      performanceAgg,
      submissionAgg,
    ] = await Promise.all([
      mongoose.model('User').countDocuments({ role: 'student' }),
      mongoose.model('User').countDocuments({ role: 'teacher' }),
      mongoose.model('Course').countDocuments({ published: true }),
      Attendance.aggregate([
        { $group: { _id: null, total: { $sum: 1 }, present: { $sum: { $cond: [{ $in: ['$status', ['present', 'late']] }, 1, 0] } } } },
      ]),
      Grade.aggregate([{ $group: { _id: null, avg: { $avg: '$percentage' } } }]),
      AssignmentSubmission.aggregate([{ $group: { _id: null, total: { $sum: 1 } } }]),
    ]);

    const avgAttendance = attendanceAgg[0]
      ? Math.round((attendanceAgg[0].present / attendanceAgg[0].total) * 100)
      : 0;
    const avgPerformance = Math.round(performanceAgg[0]?.avg || 0);

    return {
      totalStudents,
      totalTeachers,
      totalCourses,
      avgAttendance,
      avgPerformance,
      totalSubmissions: submissionAgg[0]?.total || 0,
    };
  },

  async getStudentPerformanceReport(courseId?: string) {
    const match: Record<string, unknown> = {};
    if (courseId) match.course = new mongoose.Types.ObjectId(courseId);

    const records = await Grade.find(match)
      .populate('student', 'name email avatar')
      .populate('course', 'title')
      .lean();

    return records.map((r) => ({
      student: r.student,
      course: r.course,
      assignmentAverage: Math.round(r.assignmentAverage),
      examAverage: Math.round(r.examAverage),
      percentage: Math.round(r.percentage),
      grade: r.grade || calculateGrade(r.percentage),
      status: r.percentage >= 40 ? 'pass' : 'fail',
    }));
  },

  async getAtRiskStudents() {
    const studentAttendance = await Attendance.aggregate([
      { $group: { _id: '$student', total: { $sum: 1 }, present: { $sum: { $cond: [{ $in: ['$status', ['present', 'late']] }, 1, 0] } } } },
      { $addFields: { pct: { $multiply: [{ $divide: ['$present', '$total'] }, 100] } } },
    ]);

    const attMap: Record<string, number> = {};
    for (const s of studentAttendance) attMap[String(s._id)] = Math.round(s.pct);

    const grades = await Grade.find()
      .populate('student', 'name email avatar')
      .populate('course', 'title')
      .lean();

    const studentMap: Record<string, {
      student: unknown;
      courses: string[];
      attendanceAvg: number;
      performanceAvg: number;
      riskLevel: string;
      riskFactors: string[];
    }> = {};

    for (const g of grades) {
      const sid = String((g.student as { _id: mongoose.Types.ObjectId })._id);
      if (!studentMap[sid]) {
        studentMap[sid] = {
          student: g.student,
          courses: [],
          attendanceAvg: attMap[sid] || 0,
          performanceAvg: 0,
          riskLevel: 'LOW',
          riskFactors: [],
        };
      }
      studentMap[sid].courses.push((g.course as { title?: string }).title || '');
    }

    // Calculate averages and risk
    for (const sid of Object.keys(studentMap)) {
      const studentGrades = grades.filter(
        (g) => String((g.student as { _id: mongoose.Types.ObjectId })._id) === sid
      );
      const perfAvg = studentGrades.length > 0
        ? studentGrades.reduce((sum, g) => sum + g.percentage, 0) / studentGrades.length
        : 0;
      studentMap[sid].performanceAvg = Math.round(perfAvg);

      const att = studentMap[sid].attendanceAvg;
      const perf = studentMap[sid].performanceAvg;
      const factors: string[] = [];

      if (att < 60) { studentMap[sid].riskLevel = 'CRITICAL'; factors.push('Attendance < 60%'); }
      else if (att < 75) { studentMap[sid].riskLevel = 'HIGH'; factors.push('Attendance < 75%'); }
      if (perf < 40) { studentMap[sid].riskLevel = 'CRITICAL'; factors.push('Performance < 40%'); }
      else if (perf < 55 && studentMap[sid].riskLevel !== 'CRITICAL') { studentMap[sid].riskLevel = 'MEDIUM'; factors.push('Performance < 55%'); }

      studentMap[sid].riskFactors = factors;
    }

    return Object.values(studentMap)
      .filter((s) => s.riskLevel !== 'LOW')
      .sort((a, b) => {
        const order = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
        return order[a.riskLevel as keyof typeof order] - order[b.riskLevel as keyof typeof order];
      });
  },

  async getAttendanceTrends() {
    return Attendance.aggregate([
      {
        $group: {
          _id: { year: { $year: '$date' }, month: { $month: '$date' } },
          total: { $sum: 1 },
          present: { $sum: { $cond: [{ $in: ['$status', ['present', 'late']] }, 1, 0] } },
        },
      },
      { $addFields: { pct: { $multiply: [{ $divide: ['$present', '$total'] }, 100] } } },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);
  },

  async getCoursePerformance() {
    return Grade.aggregate([
      { $lookup: { from: 'courses', localField: 'course', foreignField: '_id', as: 'courseData' } },
      { $unwind: '$courseData' },
      {
        $group: {
          _id: '$course',
          courseName: { $first: '$courseData.title' },
          studentCount: { $sum: 1 },
          avgPerformance: { $avg: '$percentage' },
          avgAssignment: { $avg: '$assignmentAverage' },
          avgExam: { $avg: '$examAverage' },
          passCount: { $sum: { $cond: [{ $gte: ['$percentage', 40] }, 1, 0] } },
        },
      },
      {
        $addFields: {
          avgPerformance: { $round: ['$avgPerformance', 1] },
          avgAssignment: { $round: ['$avgAssignment', 1] },
          avgExam: { $round: ['$avgExam', 1] },
          passRate: { $multiply: [{ $divide: ['$passCount', '$studentCount'] }, 100] },
        },
      },
      { $sort: { avgPerformance: -1 } },
    ]);
  },
};
