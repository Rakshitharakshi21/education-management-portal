import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { Exam } from '../models/Exam.model';
import { ExamSubmission } from '../models/ExamSubmission.model';
import { Class } from '../models/Class.model';
import { notificationService } from '../services/notification.service';
import { AuditLog } from '../models/AuditLog.model';
import { calculateGrade } from '../utils/response';
import { sendSuccess, sendError, getPaginationParams, sendPaginated } from '../utils/response';

export const examController = {
  async getAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { page, limit, skip } = getPaginationParams(req.query as Record<string, unknown>);
      const { course, class: classId, status } = req.query as Record<string, string>;

      const filter: Record<string, unknown> = {};
      if (course) filter.course = course;
      if (classId) filter.class = classId;
      if (status) filter.status = status;
      if (req.user!.role === 'teacher') filter.teacher = req.user!._id;

      const [exams, total] = await Promise.all([
        Exam.find(filter)
          .populate('course', 'title')
          .populate('class', 'name section')
          .populate('teacher', 'name avatar')
          .skip(skip).limit(limit)
          .sort({ date: 1 })
          .lean(),
        Exam.countDocuments(filter),
      ]);
      sendPaginated(res, exams, total, page, limit);
    } catch (err) { next(err); }
  },

  async getById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const exam = await Exam.findById(req.params.id)
        .populate('course', 'title')
        .populate('class', 'name section')
        .populate('teacher', 'name avatar')
        .lean();
      if (!exam) return sendError(res, 'Exam not found.', 404);

      // Students don't see correct answers
      if (req.user!.role === 'student') {
        (exam as Record<string, unknown>).questions = (exam.questions || []).map((q) => ({
          ...q, correctAnswer: undefined,
        }));
      }

      sendSuccess(res, { exam });
    } catch (err) { next(err); }
  },

  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { title, course, class: classId, description, instructions, date, duration, totalMarks, passingMarks, questions, type, isOnline, venue } = req.body;

      const exam = await Exam.create({
        title, course, class: classId, teacher: req.user!._id,
        description, instructions, date: new Date(date), duration,
        totalMarks, passingMarks, questions: questions || [],
        type, isOnline, venue, status: 'scheduled',
      });

      // Notify students
      const cls = await Class.findById(classId).lean();
      if (cls && cls.students.length > 0) {
        await notificationService.createBulk(cls.students.map(String), {
          title: 'Exam Scheduled',
          message: `"${title}" has been scheduled for ${new Date(date).toLocaleDateString()}.`,
          type: 'exam',
          link: '/student/exams',
        });
      }

      await AuditLog.create({
        user: req.user!._id,
        action: 'CREATE',
        entity: 'Exam',
        entityId: exam._id,
        description: `Exam scheduled: "${title}" on ${new Date(date).toLocaleDateString()}`,
      });

      sendSuccess(res, { exam }, 201, 'Exam created and students notified.');
    } catch (err) { next(err); }
  },

  async submitExam(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { examId, answers } = req.body;
      const exam = await Exam.findById(examId);
      if (!exam) return sendError(res, 'Exam not found.', 404);

      const existing = await ExamSubmission.findOne({ exam: examId, student: req.user!._id });
      if (existing) return sendError(res, 'You have already submitted this exam.', 400);

      // Auto-grade MCQ questions
      let autoMarks = 0;
      const gradedAnswers = (answers || []).map((a: { questionNumber: number; answer: string }) => {
        const question = exam.questions.find((q) => q.questionNumber === a.questionNumber);
        let marksAwarded = 0;
        if (question?.type === 'mcq' && question.correctAnswer === a.answer) {
          marksAwarded = question.marks;
          autoMarks += marksAwarded;
        }
        return { ...a, marksAwarded };
      });

      const percentage = Math.round((autoMarks / exam.totalMarks) * 100);
      const grade = calculateGrade(percentage);

      const submission = await ExamSubmission.create({
        exam: examId,
        student: req.user!._id,
        course: exam.course,
        answers: gradedAnswers,
        totalMarks: exam.totalMarks,
        obtainedMarks: autoMarks,
        percentage,
        grade,
        status: 'submitted',
        startedAt: req.body.startedAt ? new Date(req.body.startedAt) : new Date(),
        submittedAt: new Date(),
      });

      sendSuccess(res, { submission }, 201, 'Exam submitted successfully!');
    } catch (err) { next(err); }
  },

  async getStudentExams(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const studentId = req.user!._id;
      const classes = await Class.find({ students: studentId }).lean();
      const classIds = classes.map((c) => c._id);

      const exams = await Exam.find({ class: { $in: classIds } })
        .populate('course', 'title')
        .populate('teacher', 'name')
        .sort({ date: 1 })
        .lean();

      const submissions = await ExamSubmission.find({ student: studentId }).lean();
      const submissionMap: Record<string, unknown> = {};
      for (const s of submissions) submissionMap[String(s.exam)] = s;

      const enriched = exams.map((e) => ({
        ...e,
        submission: submissionMap[String(e._id)] || null,
        isSubmitted: !!submissionMap[String(e._id)],
      }));

      sendSuccess(res, { exams: enriched });
    } catch (err) { next(err); }
  },

  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const exam = await Exam.findById(req.params.id);
      if (!exam) return sendError(res, 'Exam not found.', 404);
      if (String(exam.teacher) !== String(req.user!._id) && req.user!.role !== 'admin') {
        return sendError(res, 'Unauthorized.', 403);
      }
      const updated = await Exam.findByIdAndUpdate(req.params.id, req.body, { new: true });
      sendSuccess(res, { exam: updated }, 200, 'Exam updated.');
    } catch (err) { next(err); }
  },

  async getSubmissions(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const submissions = await ExamSubmission.find({ exam: req.params.examId })
        .populate('student', 'name email avatar')
        .sort({ obtainedMarks: -1 })
        .lean();
      sendSuccess(res, { submissions });
    } catch (err) { next(err); }
  },
};
