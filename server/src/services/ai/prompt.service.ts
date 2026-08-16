interface StudentData {
  name: string;
  courses: Array<{
    courseName: string;
    attendancePercentage: number;
    assignmentAverage: number;
    examAverage: number;
    finalPercentage: number;
    trend: number[]; // last N scores
  }>;
  overallAttendance: number;
  overallPerformance: number;
  totalAssignments: number;
  submittedAssignments: number;
  lateSubmissions: number;
  missedAssignments: number;
}

interface ClassData {
  className: string;
  courseName: string;
  totalStudents: number;
  averageAttendance: number;
  averagePerformance: number;
  studentDetails: Array<{
    name: string;
    attendance: number;
    performance: number;
    trend: string;
  }>;
}

interface InstitutionData {
  totalStudents: number;
  totalTeachers: number;
  totalCourses: number;
  averageAttendance: number;
  averagePerformance: number;
  atRiskCount: number;
  coursePerformance: Array<{ course: string; average: number }>;
}

export class PromptService {
  buildStudentAnalysisPrompt(data: StudentData): string {
    return `You are an expert academic counselor analyzing a student's performance data. 
Respond ONLY with valid JSON matching this exact schema:

{
  "summary": "2-3 sentence academic summary",
  "strengths": ["strength 1", "strength 2"],
  "weakSubjects": [
    {
      "subject": "Subject Name",
      "score": 65,
      "reason": "Explanation of weakness"
    }
  ],
  "riskLevel": "LOW|MEDIUM|HIGH|CRITICAL",
  "riskFactors": ["factor 1", "factor 2"],
  "recommendations": [
    {
      "title": "Short action title",
      "description": "Specific, actionable recommendation with concrete steps",
      "priority": "high|medium|low"
    }
  ],
  "trend": "IMPROVING|DECLINING|STABLE",
  "studyPlan": [
    {
      "week": "Week 1",
      "focus": "Topic to focus on",
      "hours": 3
    }
  ],
  "keyMetrics": {
    "attendancePercentage": ${data.overallAttendance},
    "overallPerformance": ${data.overallPerformance},
    "submissionRate": ${Math.round((data.submittedAssignments / Math.max(data.totalAssignments, 1)) * 100)}
  }
}

STUDENT DATA:
- Name: ${data.name}
- Overall Attendance: ${data.overallAttendance}%
- Overall Performance: ${data.overallPerformance}%
- Total Assignments: ${data.totalAssignments}
- Submitted: ${data.submittedAssignments}, Late: ${data.lateSubmissions}, Missed: ${data.missedAssignments}

COURSE BREAKDOWN:
${data.courses.map((c) => `
  Course: ${c.courseName}
  - Attendance: ${c.attendancePercentage}%
  - Assignment Average: ${c.assignmentAverage}%
  - Exam Average: ${c.examAverage}%
  - Final Score: ${c.finalPercentage}%
  - Recent trend: ${c.trend.join(' → ')}%
`).join('\n')}

IMPORTANT RULES:
1. Recommendations must be SPECIFIC and ACTIONABLE - mention actual subjects and concrete activities
2. Never say "This student will fail" - frame as "may benefit from additional support"
3. Risk factors must be based on the actual data provided
4. Study plan should target the weakest subjects
5. Return ONLY valid JSON, no markdown, no extra text`;
  }

  buildClassInsightsPrompt(data: ClassData): string {
    return `You are an expert educational analyst reviewing class performance data.
Respond ONLY with valid JSON matching this exact schema:

{
  "summary": "Class performance overview in 2-3 sentences",
  "strengths": ["class strength 1", "class strength 2"],
  "weakSubjects": [
    { "subject": "Topic/Area", "score": 60, "reason": "Why students struggle here" }
  ],
  "riskLevel": "LOW|MEDIUM|HIGH|CRITICAL",
  "riskFactors": ["risk factor 1"],
  "recommendations": [
    {
      "title": "Pedagogical recommendation",
      "description": "Specific teaching intervention with implementation details",
      "priority": "high|medium|low"
    }
  ],
  "trend": "IMPROVING|DECLINING|STABLE",
  "keyMetrics": {
    "averageAttendance": ${data.averageAttendance},
    "averagePerformance": ${data.averagePerformance},
    "totalStudents": ${data.totalStudents}
  }
}

CLASS DATA:
- Class: ${data.className} — Course: ${data.courseName}
- Students: ${data.totalStudents}
- Average Attendance: ${data.averageAttendance}%
- Average Performance: ${data.averagePerformance}%

STUDENT BREAKDOWN:
${data.studentDetails.map((s) => `  ${s.name}: Attendance ${s.attendance}%, Performance ${s.performance}%, Trend: ${s.trend}`).join('\n')}

Return ONLY valid JSON.`;
  }

  buildInstitutionInsightsPrompt(data: InstitutionData): string {
    return `You are a strategic academic advisor analyzing institution-wide data.
Respond ONLY with valid JSON matching this exact schema:

{
  "summary": "Institution-wide academic health summary in 2-3 sentences",
  "strengths": ["institutional strength 1", "institutional strength 2"],
  "weakSubjects": [
    { "subject": "Course/Department", "score": 60, "reason": "Why performance is low" }
  ],
  "riskLevel": "LOW|MEDIUM|HIGH|CRITICAL",
  "riskFactors": ["systemic risk 1", "systemic risk 2"],
  "recommendations": [
    {
      "title": "Strategic recommendation",
      "description": "Institution-level intervention with measurable outcomes",
      "priority": "high|medium|low"
    }
  ],
  "trend": "IMPROVING|DECLINING|STABLE",
  "keyMetrics": {
    "totalStudents": ${data.totalStudents},
    "averageAttendance": ${data.averageAttendance},
    "averagePerformance": ${data.averagePerformance},
    "atRiskCount": ${data.atRiskCount}
  }
}

INSTITUTION DATA:
- Students: ${data.totalStudents}, Teachers: ${data.totalTeachers}, Courses: ${data.totalCourses}
- Average Attendance: ${data.averageAttendance}%
- Average Performance: ${data.averagePerformance}%
- At-Risk Students: ${data.atRiskCount}

COURSE PERFORMANCE:
${data.coursePerformance.map((c) => `  ${c.course}: ${c.average}%`).join('\n')}

Return ONLY valid JSON.`;
  }
}

export const promptService = new PromptService();
