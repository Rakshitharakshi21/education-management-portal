import { Attendance } from '../models/Attendance.model';
import { AcademicRecord } from '../models/AcademicRecord.model';
import mongoose from 'mongoose';

export const attendanceService = {
  async markBulk(records: Array<{
    student: string;
    course: string;
    class: string;
    date: Date;
    status: 'present' | 'absent' | 'late';
    markedBy: string;
    sessionTopic?: string;
  }>) {
    const results = [];
    for (const rec of records) {
      try {
        const doc = await Attendance.findOneAndUpdate(
          { student: rec.student, course: rec.course, date: new Date(rec.date).toISOString().split('T')[0] },
          { ...rec, date: rec.date },
          { upsert: true, new: true }
        );
        results.push({ success: true, id: doc._id });
      } catch {
        results.push({ success: false, student: rec.student });
      }
    }
    return results;
  },

  async getStudentSummary(studentId: string, courseId?: string) {
    const match: Record<string, unknown> = { student: new mongoose.Types.ObjectId(studentId) };
    if (courseId) match.course = new mongoose.Types.ObjectId(courseId);

    const records = await Attendance.find(match)
      .populate('course', 'title')
      .sort({ date: -1 })
      .lean();

    const totalClasses = records.length;
    const present = records.filter((r) => r.status === 'present').length;
    const late = records.filter((r) => r.status === 'late').length;
    const absent = records.filter((r) => r.status === 'absent').length;
    const attended = present + late;
    const percentage = totalClasses > 0 ? Math.round((attended / totalClasses) * 100) : 0;

    // Group by course
    const byCourse: Record<string, { courseName: string; total: number; present: number; late: number; absent: number; percentage: number }> = {};
    for (const r of records) {
      const cid = String(r.course._id || r.course);
      const cname = (r.course as { title?: string }).title || 'Unknown';
      if (!byCourse[cid]) byCourse[cid] = { courseName: cname, total: 0, present: 0, late: 0, absent: 0, percentage: 0 };
      byCourse[cid].total++;
      if (r.status === 'present') byCourse[cid].present++;
      else if (r.status === 'late') byCourse[cid].late++;
      else byCourse[cid].absent++;
    }

    for (const cid of Object.keys(byCourse)) {
      const c = byCourse[cid];
      c.percentage = Math.round(((c.present + c.late) / c.total) * 100);
    }

    return { totalClasses, present, late, absent, attended, percentage, byCourse, records };
  },

  async updateAcademicRecord(studentId: string, courseId: string, classId: string) {
    const summary = await this.getStudentSummary(studentId, courseId);
    
    await AcademicRecord.findOneAndUpdate(
      { student: studentId, course: courseId },
      {
        class: classId,
        attendancePercentage: summary.percentage,
        totalClasses: summary.totalClasses,
        attendedClasses: summary.attended,
        semester: 'Semester 1',
        academicYear: '2024-25',
      },
      { upsert: true }
    );
  },
};
