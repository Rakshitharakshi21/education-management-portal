import dotenv from 'dotenv';
dotenv.config({ path: '../../.env' });

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { User } from '../models/User.model';
import { StudentProfile } from '../models/StudentProfile.model';
import { TeacherProfile } from '../models/TeacherProfile.model';
import { Category } from '../models/Category.model';
import { Course } from '../models/Course.model';
import { Class } from '../models/Class.model';
import { Enrollment } from '../models/Enrollment.model';
import { Assignment } from '../models/Assignment.model';
import { AssignmentSubmission } from '../models/AssignmentSubmission.model';
import { Attendance } from '../models/Attendance.model';
import { Exam } from '../models/Exam.model';
import { ExamSubmission } from '../models/ExamSubmission.model';
import { Grade } from '../models/Grade.model';
import { AcademicRecord } from '../models/AcademicRecord.model';
import { Notification } from '../models/Notification.model';
import { Announcement } from '../models/Announcement.model';
import { AuditLog } from '../models/AuditLog.model';
import { calculateGrade } from '../utils/response';

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/eduportal';

const CATEGORIES = [
  { name: 'Computer Science', slug: 'computer-science', icon: 'Monitor', color: '#2563EB', description: 'Programming, algorithms, and software development' },
  { name: 'Mathematics', slug: 'mathematics', icon: 'Calculator', color: '#7C3AED', description: 'Pure and applied mathematics' },
  { name: 'Physics', slug: 'physics', icon: 'Atom', color: '#0891B2', description: 'Classical and modern physics' },
  { name: 'Chemistry', slug: 'chemistry', icon: 'FlaskConical', color: '#059669', description: 'Organic, inorganic, and physical chemistry' },
  { name: 'English Literature', slug: 'english', icon: 'BookOpen', color: '#D97706', description: 'Literature, writing, and communication' },
  { name: 'Data Science', slug: 'data-science', icon: 'BarChart3', color: '#DC2626', description: 'Machine learning, statistics, and data analysis' },
];

const TEACHERS = [
  {
    name: 'Dr. Priya Sharma', email: 'priya.sharma@eduportal.com',
    specialization: 'Computer Science', department: 'CS',
    qualification: 'Ph.D. in Computer Science', experience: 12,
    bio: 'Dr. Priya Sharma brings 12 years of industry and academic experience in software engineering and AI. Known for making complex concepts accessible and engaging.',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150',
    rating: 4.8,
  },
  {
    name: 'Prof. Arjun Mehta', email: 'arjun.mehta@eduportal.com',
    specialization: 'Mathematics', department: 'Mathematics',
    qualification: 'M.Sc. Mathematics, Ph.D. Applied Mathematics', experience: 9,
    bio: 'Professor Mehta specializes in abstract algebra and calculus. His teaching style combines rigorous theory with real-world application.',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
    rating: 4.6,
  },
  {
    name: 'Ms. Kavita Nair', email: 'kavita.nair@eduportal.com',
    specialization: 'Data Science & Physics', department: 'Sciences',
    qualification: 'M.Tech Data Science, B.Sc. Physics', experience: 6,
    bio: 'Kavita brings industry experience from top tech companies. She bridges the gap between theoretical foundations and practical data science applications.',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150',
    rating: 4.9,
  },
];

const STUDENTS = [
  { name: 'Arjun Kumar', email: 'arjun.kumar@student.com', department: 'Computer Science', semester: 3, avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150' },
  { name: 'Diya Patel', email: 'diya.patel@student.com', department: 'Computer Science', semester: 3, avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150' },
  { name: 'Rohan Singh', email: 'rohan.singh@student.com', department: 'Mathematics', semester: 2, avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150' },
  { name: 'Ananya Krishnan', email: 'ananya.k@student.com', department: 'Data Science', semester: 4, avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150' },
  { name: 'Vikram Bose', email: 'vikram.bose@student.com', department: 'Computer Science', semester: 3, avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150' },
  { name: 'Sneha Reddy', email: 'sneha.reddy@student.com', department: 'Mathematics', semester: 2, avatar: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=150' },
  { name: 'Karan Malhotra', email: 'karan.m@student.com', department: 'Data Science', semester: 4, avatar: 'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=150' },
  { name: 'Pooja Iyer', email: 'pooja.iyer@student.com', department: 'Computer Science', semester: 1, avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150' },
  { name: 'Aditya Gupta', email: 'aditya.gupta@student.com', department: 'Sciences', semester: 3, avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150' },
  { name: 'Meera Joshi', email: 'meera.joshi@student.com', department: 'Data Science', semester: 2, avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150' },
  { name: 'Rahul Verma', email: 'rahul.verma@student.com', department: 'Computer Science', semester: 4, avatar: 'https://images.unsplash.com/photo-1521119989659-a83eee488004?w=150' },
  { name: 'Ishaan Chaudhary', email: 'ishaan.c@student.com', department: 'Mathematics', semester: 1, avatar: 'https://images.unsplash.com/photo-1502767882814-6e4ca2f3a69d?w=150' },
];

function randomBetween(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function daysAgo(days: number) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d;
}

function daysFuture(days: number) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d;
}

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    console.log('🧹 Clearing existing data...');
    await Promise.all([
      User.deleteMany({}), StudentProfile.deleteMany({}), TeacherProfile.deleteMany({}),
      Category.deleteMany({}), Course.deleteMany({}), Class.deleteMany({}),
      Enrollment.deleteMany({}), Assignment.deleteMany({}), AssignmentSubmission.deleteMany({}),
      Attendance.deleteMany({}), Exam.deleteMany({}), ExamSubmission.deleteMany({}),
      Grade.deleteMany({}), AcademicRecord.deleteMany({}),
      Notification.deleteMany({}), Announcement.deleteMany({}), AuditLog.deleteMany({}),
    ]);
    console.log('✅ Cleared');

    // Create Admin
    console.log('👤 Creating admin...');
    const adminUser = await User.create({
      name: 'Admin EduPortal',
      email: 'admin@eduportal.com',
      password: 'Admin@123',
      role: 'admin',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
      status: 'active',
    });

    // Create Categories
    console.log('📚 Creating categories...');
    const categories = await Category.insertMany(CATEGORIES);
    const categoryMap: Record<string, mongoose.Types.ObjectId> = {};
    for (const c of categories) categoryMap[c.slug] = c._id as mongoose.Types.ObjectId;

    // Create Teachers
    console.log('👩‍🏫 Creating teachers...');
    const teacherUsers = [];
    for (const t of TEACHERS) {
      const user = await User.create({
        name: t.name, email: t.email,
        password: 'Teacher@123',
        role: 'teacher', avatar: t.avatar, status: 'active',
      });
      await TeacherProfile.create({
        user: user._id, employeeId: `EMP${Date.now()}`,
        specialization: t.specialization, department: t.department,
        qualification: t.qualification, experience: t.experience,
        bio: t.bio, rating: t.rating, totalRatings: randomBetween(20, 80),
      });
      teacherUsers.push(user);
    }

    // Create Courses
    console.log('📖 Creating courses...');
    const COURSES = [
      {
        title: 'Full Stack Web Development', teacherIdx: 0, categorySlug: 'computer-science',
        level: 'intermediate' as const, duration: '16 weeks', totalHours: 120,
        thumbnail: 'https://images.unsplash.com/photo-1547658719-da2b51169166?w=600',
        shortDescription: 'Master modern web development from HTML to React and Node.js',
        description: 'A comprehensive journey through modern web development. You\'ll learn HTML, CSS, JavaScript, React, Node.js, Express, and MongoDB — everything you need to build production-ready web applications.',
        rating: 4.8, enrollmentCount: 89, published: true,
        syllabus: [
          { week: 1, title: 'HTML & CSS Foundations', topics: ['Semantic HTML', 'CSS Grid', 'Flexbox', 'Responsive Design'] },
          { week: 2, title: 'JavaScript Essentials', topics: ['ES6+', 'DOM Manipulation', 'Async/Await', 'Promises'] },
          { week: 3, title: 'React Fundamentals', topics: ['Components', 'Props', 'State', 'Hooks'] },
          { week: 4, title: 'Node.js & Express', topics: ['REST APIs', 'Middleware', 'Authentication', 'JWT'] },
          { week: 5, title: 'MongoDB & Mongoose', topics: ['Schema Design', 'CRUD', 'Aggregation', 'Indexes'] },
          { week: 6, title: 'Deployment & DevOps', topics: ['CI/CD', 'Docker Basics', 'Cloud Deploy', 'Performance'] },
        ],
        tags: ['web', 'javascript', 'react', 'nodejs', 'mongodb'],
        prerequisites: ['Basic computer knowledge', 'High school math'],
      },
      {
        title: 'Data Structures & Algorithms', teacherIdx: 0, categorySlug: 'computer-science',
        level: 'intermediate' as const, duration: '12 weeks', totalHours: 96,
        thumbnail: 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=600',
        shortDescription: 'Master DSA concepts for competitive programming and interviews',
        description: 'Deep-dive into data structures and algorithms. Cover arrays, linked lists, trees, graphs, sorting, searching, and dynamic programming with hands-on problem solving.',
        rating: 4.7, enrollmentCount: 124, published: true,
        syllabus: [
          { week: 1, title: 'Arrays & Strings', topics: ['Two Pointers', 'Sliding Window', 'Prefix Sum'] },
          { week: 2, title: 'Linked Lists & Stacks', topics: ['Singly Linked List', 'Doubly Linked List', 'Stack Operations'] },
          { week: 3, title: 'Trees & Heaps', topics: ['Binary Trees', 'BST', 'AVL Trees', 'Priority Queue'] },
          { week: 4, title: 'Graphs', topics: ['BFS', 'DFS', 'Shortest Path', 'Topological Sort'] },
          { week: 5, title: 'Dynamic Programming', topics: ['Memoization', 'Tabulation', 'Classic DP Problems'] },
        ],
        tags: ['algorithms', 'data structures', 'competitive programming'],
        prerequisites: ['Basic programming', 'Introduction to Programming'],
      },
      {
        title: 'Advanced Calculus', teacherIdx: 1, categorySlug: 'mathematics',
        level: 'advanced' as const, duration: '14 weeks', totalHours: 84,
        thumbnail: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=600',
        shortDescription: 'Rigorous treatment of multivariable calculus and analysis',
        description: 'A rigorous course in multivariable calculus covering limits, continuity, differentiation, integration, vector calculus, and applications in physics and engineering.',
        rating: 4.5, enrollmentCount: 67, published: true,
        syllabus: [
          { week: 1, title: 'Limits and Continuity', topics: ['Epsilon-delta definition', 'Continuity in Rⁿ', 'Uniform continuity'] },
          { week: 2, title: 'Partial Derivatives', topics: ['Directional derivatives', 'Gradient', 'Chain rule'] },
          { week: 3, title: 'Multiple Integration', topics: ['Double integrals', 'Triple integrals', 'Change of variables'] },
          { week: 4, title: 'Vector Calculus', topics: ["Green's theorem", "Stokes' theorem", "Divergence theorem"] },
        ],
        tags: ['calculus', 'mathematics', 'analysis'],
        prerequisites: ['Single-variable Calculus', 'Linear Algebra'],
      },
      {
        title: 'Linear Algebra & Applications', teacherIdx: 1, categorySlug: 'mathematics',
        level: 'intermediate' as const, duration: '10 weeks', totalHours: 60,
        thumbnail: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=600',
        shortDescription: 'Vectors, matrices, and their applications in data science',
        description: 'Master linear algebra fundamentals: vectors, matrices, eigenvalues, and their powerful applications in machine learning, data science, and engineering.',
        rating: 4.6, enrollmentCount: 78, published: true,
        syllabus: [
          { week: 1, title: 'Vectors and Matrices', topics: ['Matrix operations', 'Determinants', 'Matrix inverse'] },
          { week: 2, title: 'Linear Transformations', topics: ['Kernel and range', 'Eigenvectors', 'Eigenvalues'] },
          { week: 3, title: 'Applications', topics: ['PCA', 'Least Squares', 'PageRank Algorithm'] },
        ],
        tags: ['linear algebra', 'matrices', 'machine learning'],
        prerequisites: ['Basic Algebra', 'Introductory Calculus'],
      },
      {
        title: 'Machine Learning Fundamentals', teacherIdx: 2, categorySlug: 'data-science',
        level: 'intermediate' as const, duration: '14 weeks', totalHours: 112,
        thumbnail: 'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=600',
        shortDescription: 'From linear regression to neural networks — hands-on ML',
        description: 'A practical introduction to machine learning. Build regression, classification, clustering models, and your first neural network using Python, Scikit-learn, and TensorFlow.',
        rating: 4.9, enrollmentCount: 156, published: true,
        syllabus: [
          { week: 1, title: 'Introduction to ML', topics: ['Types of ML', 'Bias-Variance tradeoff', 'Model evaluation'] },
          { week: 2, title: 'Supervised Learning', topics: ['Linear Regression', 'Logistic Regression', 'Decision Trees'] },
          { week: 3, title: 'Ensemble Methods', topics: ['Random Forest', 'Gradient Boosting', 'XGBoost'] },
          { week: 4, title: 'Neural Networks', topics: ['Perceptron', 'Backpropagation', 'Deep Learning intro'] },
          { week: 5, title: 'Unsupervised Learning', topics: ['K-Means', 'DBSCAN', 'PCA'] },
        ],
        tags: ['machine learning', 'AI', 'python', 'data science'],
        prerequisites: ['Linear Algebra', 'Basic Statistics', 'Python Basics'],
      },
      {
        title: 'Python for Data Analysis', teacherIdx: 2, categorySlug: 'data-science',
        level: 'beginner' as const, duration: '8 weeks', totalHours: 48,
        thumbnail: 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=600',
        shortDescription: 'Pandas, NumPy, Matplotlib — everything for data analysis',
        description: 'Learn to analyze and visualize data using Python. Master Pandas for data manipulation, NumPy for numerical computing, and Matplotlib/Seaborn for beautiful visualizations.',
        rating: 4.7, enrollmentCount: 203, published: true,
        syllabus: [
          { week: 1, title: 'Python Fundamentals', topics: ['Data types', 'Functions', 'List comprehensions'] },
          { week: 2, title: 'NumPy & Pandas', topics: ['Arrays', 'DataFrames', 'Data cleaning', 'Aggregation'] },
          { week: 3, title: 'Data Visualization', topics: ['Matplotlib', 'Seaborn', 'Plotly', 'Dashboard basics'] },
          { week: 4, title: 'EDA Project', topics: ['Real dataset analysis', 'Insight extraction', 'Reporting'] },
        ],
        tags: ['python', 'pandas', 'numpy', 'visualization'],
        prerequisites: ['Basic Python knowledge'],
      },
      {
        title: 'Modern Physics', teacherIdx: 2, categorySlug: 'physics',
        level: 'advanced' as const, duration: '12 weeks', totalHours: 72,
        thumbnail: 'https://images.unsplash.com/photo-1446776899648-aa78eefe8ed0?w=600',
        shortDescription: 'Quantum mechanics, relativity, and particle physics',
        description: 'Explore the fascinating world of modern physics: special relativity, quantum mechanics, wave-particle duality, the uncertainty principle, and an introduction to particle physics.',
        rating: 4.4, enrollmentCount: 52, published: true,
        syllabus: [
          { week: 1, title: 'Special Relativity', topics: ["Einstein's postulates", 'Time dilation', 'Length contraction', 'E=mc²'] },
          { week: 2, title: 'Quantum Mechanics', topics: ['Wave-particle duality', 'Schrödinger equation', 'Uncertainty principle'] },
          { week: 3, title: 'Atomic Physics', topics: ['Bohr model', 'Quantum numbers', 'Atomic spectra'] },
          { week: 4, title: 'Particle Physics', topics: ['Standard model', 'Quarks', 'Fundamental forces'] },
        ],
        tags: ['physics', 'quantum', 'relativity'],
        prerequisites: ['Classical Mechanics', 'Calculus', 'Electromagnetism'],
      },
      {
        title: 'Database Design & SQL', teacherIdx: 0, categorySlug: 'computer-science',
        level: 'beginner' as const, duration: '8 weeks', totalHours: 56,
        thumbnail: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=600',
        shortDescription: 'Relational databases, SQL, and database optimization',
        description: 'Master database design from ER diagrams to normalized schemas. Write complex SQL queries, optimize performance, and learn indexing strategies for production databases.',
        rating: 4.6, enrollmentCount: 115, published: true,
        syllabus: [
          { week: 1, title: 'Database Fundamentals', topics: ['RDBMS concepts', 'ER Diagrams', 'Normalization'] },
          { week: 2, title: 'SQL Mastery', topics: ['SELECT', 'JOINs', 'Subqueries', 'Window functions'] },
          { week: 3, title: 'Indexing & Optimization', topics: ['B-Tree indexes', 'Query plans', 'Performance tuning'] },
          { week: 4, title: 'Transactions & Security', topics: ['ACID', 'Isolation levels', 'SQL injection prevention'] },
        ],
        tags: ['sql', 'database', 'postgresql', 'mysql'],
        prerequisites: ['Basic computer literacy'],
      },
    ];

    const createdCourses = [];
    for (const c of COURSES) {
      const course = await Course.create({
        title: c.title,
        slug: c.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') + '-' + Date.now(),
        description: c.description,
        shortDescription: c.shortDescription,
        category: categoryMap[c.categorySlug],
        teacher: teacherUsers[c.teacherIdx]._id,
        level: c.level,
        duration: c.duration,
        totalHours: c.totalHours,
        thumbnail: c.thumbnail,
        syllabus: c.syllabus,
        tags: c.tags,
        prerequisites: c.prerequisites,
        published: c.published,
        rating: c.rating,
        totalRatings: randomBetween(10, 50),
        enrollmentCount: c.enrollmentCount,
        certificate: true,
      });
      createdCourses.push(course);
    }

    // Update category course counts
    for (const cat of categories) {
      const count = await Course.countDocuments({ category: cat._id, published: true });
      await Category.findByIdAndUpdate(cat._id, { courseCount: count });
    }

    // Create Students
    console.log('👨‍🎓 Creating students...');
    const studentUsers = [];
    for (const s of STUDENTS) {
      const user = await User.create({
        name: s.name, email: s.email,
        password: 'Student@123',
        role: 'student', avatar: s.avatar, status: 'active',
      });
      await StudentProfile.create({
        user: user._id, studentId: `STU${Date.now()}`,
        department: s.department, semester: s.semester,
        academicYear: '2024-25',
      });
      studentUsers.push(user);
    }

    // Create Classes
    console.log('🏫 Creating classes...');
    const classes = [];
    // CS Class A (Web Dev + DSA)
    const classCSA = await Class.create({
      name: 'CS-A Batch 2024', course: createdCourses[0]._id,
      teacher: teacherUsers[0]._id,
      students: studentUsers.slice(0, 5).map((s) => s._id),
      semester: 'Semester 3', section: 'A', room: 'Lab 101',
      schedule: [
        { day: 'Monday', startTime: '10:00', endTime: '11:30', room: 'Lab 101' },
        { day: 'Wednesday', startTime: '10:00', endTime: '11:30', room: 'Lab 101' },
        { day: 'Friday', startTime: '14:00', endTime: '15:30', room: 'Lab 102' },
      ],
      academicYear: '2024-25', status: 'active', maxStudents: 40,
    });
    classes.push(classCSA);

    const classDSA = await Class.create({
      name: 'CS-B DSA Batch', course: createdCourses[1]._id,
      teacher: teacherUsers[0]._id,
      students: studentUsers.slice(0, 6).map((s) => s._id),
      semester: 'Semester 3', section: 'B', room: 'Lecture Hall 3',
      schedule: [
        { day: 'Tuesday', startTime: '09:00', endTime: '10:30' },
        { day: 'Thursday', startTime: '09:00', endTime: '10:30' },
      ],
      academicYear: '2024-25', status: 'active',
    });
    classes.push(classDSA);

    const classMath = await Class.create({
      name: 'Math-A Calculus Batch', course: createdCourses[2]._id,
      teacher: teacherUsers[1]._id,
      students: [studentUsers[2], studentUsers[5], studentUsers[11], studentUsers[3], studentUsers[6]].map((s) => s._id),
      semester: 'Semester 3', section: 'A', room: 'Room 205',
      schedule: [
        { day: 'Monday', startTime: '09:00', endTime: '10:30' },
        { day: 'Wednesday', startTime: '14:00', endTime: '15:30' },
        { day: 'Friday', startTime: '09:00', endTime: '10:30' },
      ],
      academicYear: '2024-25', status: 'active',
    });
    classes.push(classMath);

    const classML = await Class.create({
      name: 'DS-A Machine Learning Batch', course: createdCourses[4]._id,
      teacher: teacherUsers[2]._id,
      students: [studentUsers[3], studentUsers[6], studentUsers[9], studentUsers[4], studentUsers[8]].map((s) => s._id),
      semester: 'Semester 4', section: 'A', room: 'Lab 303',
      schedule: [
        { day: 'Tuesday', startTime: '11:00', endTime: '12:30' },
        { day: 'Thursday', startTime: '11:00', endTime: '12:30' },
        { day: 'Saturday', startTime: '10:00', endTime: '12:00' },
      ],
      academicYear: '2024-25', status: 'active',
    });
    classes.push(classML);

    // Enrollments
    console.log('📝 Creating enrollments...');
    const enrollmentPairs = [
      { student: 0, course: 0 }, { student: 1, course: 0 }, { student: 2, course: 0 },
      { student: 3, course: 0 }, { student: 4, course: 0 }, { student: 0, course: 1 },
      { student: 1, course: 1 }, { student: 4, course: 1 }, { student: 2, course: 2 },
      { student: 5, course: 2 }, { student: 11, course: 2 }, { student: 3, course: 4 },
      { student: 6, course: 4 }, { student: 9, course: 4 }, { student: 3, course: 5 },
      { student: 6, course: 5 }, { student: 8, course: 6 }, { student: 10, course: 7 },
    ];

    const enrollmentDocs = [];
    for (const ep of enrollmentPairs) {
      try {
        const e = await Enrollment.create({
          student: studentUsers[ep.student]._id,
          course: createdCourses[ep.course]._id,
          progress: randomBetween(20, 95),
          status: 'active',
        });
        enrollmentDocs.push(e);
      } catch { /* skip duplicates */ }
    }

    // Assignments
    console.log('📋 Creating assignments...');
    const assignments = [];
    const assignmentData = [
      { classIdx: 0, courseIdx: 0, title: 'Build a Responsive Landing Page', description: 'Create a fully responsive landing page using HTML and CSS. Implement grid layout, flexbox, and media queries.', dueDate: daysAgo(7), maxMarks: 100 },
      { classIdx: 0, courseIdx: 0, title: 'JavaScript DOM Project', description: 'Build an interactive to-do list application using vanilla JavaScript with local storage persistence.', dueDate: daysAgo(3), maxMarks: 100 },
      { classIdx: 0, courseIdx: 0, title: 'React Component Library', description: 'Design and implement a set of reusable React components with proper prop types and documentation.', dueDate: daysFuture(7), maxMarks: 100 },
      { classIdx: 1, courseIdx: 1, title: 'Implement Binary Search Tree', description: 'Implement a full BST with insert, delete, search, and traversal operations. Include time complexity analysis.', dueDate: daysAgo(10), maxMarks: 100 },
      { classIdx: 1, courseIdx: 1, title: 'Graph Algorithms Implementation', description: 'Implement BFS, DFS, Dijkstra\'s algorithm. Test on a sample social network graph.', dueDate: daysAgo(2), maxMarks: 100 },
      { classIdx: 2, courseIdx: 2, title: 'Calculus Problem Set 1', description: 'Solve 20 problems covering limits, partial derivatives, and the chain rule. Show all working.', dueDate: daysAgo(14), maxMarks: 50 },
      { classIdx: 2, courseIdx: 2, title: 'Multiple Integration Assignment', description: 'Evaluate 15 double and triple integrals. Include the sketch of the region for each.', dueDate: daysAgo(4), maxMarks: 50 },
      { classIdx: 3, courseIdx: 4, title: 'Linear Regression from Scratch', description: 'Implement linear regression using gradient descent without using Scikit-learn. Visualize the cost function.', dueDate: daysAgo(5), maxMarks: 100 },
      { classIdx: 3, courseIdx: 4, title: 'Classification Model Comparison', description: 'Compare Random Forest, SVM, and Logistic Regression on the Iris dataset. Report accuracy, precision, and recall.', dueDate: daysFuture(4), maxMarks: 100 },
    ];

    for (const ad of assignmentData) {
      const a = await Assignment.create({
        course: createdCourses[ad.courseIdx]._id,
        class: classes[ad.classIdx]._id,
        teacher: teacherUsers[ad.classIdx === 3 ? 2 : ad.classIdx === 2 ? 1 : 0]._id,
        title: ad.title,
        description: ad.description,
        dueDate: ad.dueDate,
        maxMarks: ad.maxMarks,
        status: 'published',
        allowLateSubmission: true,
        latePenaltyPercent: 10,
      });
      assignments.push(a);
    }

    // Assignment Submissions (realistic scores)
    console.log('📤 Creating submissions...');
    const submissionData = [
      // Web Dev students
      { aIdx: 0, sIdx: 0, marks: 88, content: 'Completed landing page with full responsiveness. Used CSS Grid for layout.', isLate: false },
      { aIdx: 0, sIdx: 1, marks: 92, content: 'Implemented all required features plus dark mode toggle.', isLate: false },
      { aIdx: 0, sIdx: 2, marks: 75, content: 'Basic responsive layout implemented.', isLate: true },
      { aIdx: 0, sIdx: 3, marks: 68, content: 'Completed the landing page but missed some responsive breakpoints.', isLate: false },
      { aIdx: 1, sIdx: 0, marks: 95, content: 'To-do app with categories, drag-and-drop, and local storage.', isLate: false },
      { aIdx: 1, sIdx: 1, marks: 88, content: 'Feature-complete to-do app with edit functionality.', isLate: false },
      { aIdx: 1, sIdx: 4, marks: 72, content: 'Basic to-do list without persistence.', isLate: true },
      // DSA
      { aIdx: 3, sIdx: 0, marks: 90, content: 'Full BST implementation with all operations and O(log n) analysis.', isLate: false },
      { aIdx: 3, sIdx: 1, marks: 85, content: 'BST with insert, delete, search. Missing balance documentation.', isLate: false },
      { aIdx: 4, sIdx: 0, marks: 88, content: 'All three algorithms implemented with test cases.', isLate: false },
      // Calculus
      { aIdx: 5, sIdx: 2, marks: 44, content: 'Solved 18/20 problems. Two limit problems incorrect.', isLate: false },
      { aIdx: 5, sIdx: 5, marks: 38, content: 'Solved 14/20 problems with clear working.', isLate: false },
      { aIdx: 5, sIdx: 11, marks: 42, content: 'Solved 16/20 problems.', isLate: false },
      { aIdx: 6, sIdx: 2, marks: 40, content: 'All 15 integrals evaluated with sketches.', isLate: false },
      // ML
      { aIdx: 7, sIdx: 3, marks: 94, content: 'Clean implementation with convergence plots and MSE tracking.', isLate: false },
      { aIdx: 7, sIdx: 6, marks: 78, content: 'Working gradient descent but learning rate tuning needed.', isLate: false },
      { aIdx: 7, sIdx: 9, marks: 85, content: 'Good implementation with visualization.', isLate: false },
    ];

    for (const sd of submissionData) {
      try {
        await AssignmentSubmission.create({
          assignment: assignments[sd.aIdx]._id,
          student: studentUsers[sd.sIdx]._id,
          course: assignments[sd.aIdx].course,
          content: sd.content,
          marks: sd.marks,
          feedback: sd.marks >= 85 ? 'Excellent work! Great attention to detail.' : sd.marks >= 70 ? 'Good effort. Review the areas marked for improvement.' : 'Needs improvement. Please revisit the core concepts.',
          status: 'graded',
          isLate: sd.isLate,
          submittedAt: daysAgo(randomBetween(1, 5)),
          gradedAt: daysAgo(randomBetween(0, 2)),
          gradedBy: teacherUsers[0]._id,
        });
      } catch { /* skip */ }
    }

    // Attendance records (60 days back)
    console.log('📅 Creating attendance records...');
    const classPairs = [
      { cls: classCSA, students: studentUsers.slice(0, 5), teacherIdx: 0, courseIdx: 0 },
      { cls: classDSA, students: studentUsers.slice(0, 6), teacherIdx: 0, courseIdx: 1 },
      { cls: classMath, students: [studentUsers[2], studentUsers[5], studentUsers[11], studentUsers[3], studentUsers[6]], teacherIdx: 1, courseIdx: 2 },
      { cls: classML, students: [studentUsers[3], studentUsers[6], studentUsers[9], studentUsers[4], studentUsers[8]], teacherIdx: 2, courseIdx: 4 },
    ];

    // Student attendance patterns (some students at risk)
    const attendancePatterns: Record<string, number> = {
      '0': 90, '1': 95, '2': 72, '3': 85, '4': 60, // Student 4 at risk
      '5': 78, '6': 88, '8': 92, '9': 82, '11': 75,
    };

    for (const cp of classPairs) {
      // Create 2 sessions per week for 8 weeks = 16 sessions
      for (let week = 0; week < 8; week++) {
        for (let session = 0; session < 2; session++) {
          const sessionDate = daysAgo(56 - (week * 7) - (session * 3));
          const sessionTopic = createdCourses[cp.courseIdx].syllabus[Math.min(week, createdCourses[cp.courseIdx].syllabus.length - 1)]?.title || 'Class Session';

          for (const student of cp.students) {
            const sIdx = studentUsers.findIndex((u) => String(u._id) === String(student._id));
            const pattern = attendancePatterns[String(sIdx)] || 80;
            const rand = Math.random() * 100;
            let status: 'present' | 'absent' | 'late';
            if (rand < pattern - 10) status = 'present';
            else if (rand < pattern) status = 'late';
            else status = 'absent';

            try {
              await Attendance.create({
                student: student._id,
                course: createdCourses[cp.courseIdx]._id,
                class: cp.cls._id,
                date: sessionDate,
                status,
                markedBy: teacherUsers[cp.teacherIdx]._id,
                sessionTopic,
              });
            } catch { /* skip duplicates */ }
          }
        }
      }
    }

    // Exams
    console.log('📝 Creating exams...');
    const exams = [];
    const examData = [
      {
        title: 'Web Dev Midterm', courseIdx: 0, classIdx: 0, teacherIdx: 0,
        date: daysAgo(20), duration: 90, totalMarks: 100, passingMarks: 40,
        type: 'midterm' as const, status: 'completed' as const,
        questions: [
          { questionNumber: 1, question: 'What is the difference between display: flex and display: grid?', type: 'short' as const, marks: 10 },
          { questionNumber: 2, question: 'Which CSS property is used to make a website responsive?', type: 'mcq' as const, options: ['media-query', 'flex-wrap', 'grid-template', 'responsive'], correctAnswer: 'media-query', marks: 5 },
          { questionNumber: 3, question: 'Explain the JavaScript event loop with a diagram.', type: 'long' as const, marks: 20 },
          { questionNumber: 4, question: 'What does React\'s useState hook return?', type: 'mcq' as const, options: ['An array with value and setter', 'A single value', 'An object', 'A function'], correctAnswer: 'An array with value and setter', marks: 5 },
          { questionNumber: 5, question: 'What is the purpose of useEffect in React?', type: 'short' as const, marks: 10 },
        ],
      },
      {
        title: 'DSA Quiz 1 — Arrays & Linked Lists', courseIdx: 1, classIdx: 1, teacherIdx: 0,
        date: daysAgo(15), duration: 45, totalMarks: 50, passingMarks: 20,
        type: 'quiz' as const, status: 'completed' as const,
        questions: [
          { questionNumber: 1, question: 'What is the time complexity of binary search?', type: 'mcq' as const, options: ['O(n)', 'O(log n)', 'O(n log n)', 'O(1)'], correctAnswer: 'O(log n)', marks: 5 },
          { questionNumber: 2, question: 'Reverse a linked list in O(n) time without extra space.', type: 'short' as const, marks: 15 },
          { questionNumber: 3, question: 'Explain the two-pointer technique with an example.', type: 'short' as const, marks: 15 },
          { questionNumber: 4, question: 'Which data structure uses LIFO?', type: 'mcq' as const, options: ['Queue', 'Stack', 'Heap', 'Tree'], correctAnswer: 'Stack', marks: 5 },
          { questionNumber: 5, question: 'Find the time complexity of bubble sort.', type: 'mcq' as const, options: ['O(n)', 'O(n log n)', 'O(n²)', 'O(log n)'], correctAnswer: 'O(n²)', marks: 10 },
        ],
      },
      {
        title: 'Calculus Midterm Examination', courseIdx: 2, classIdx: 2, teacherIdx: 1,
        date: daysAgo(18), duration: 120, totalMarks: 100, passingMarks: 40,
        type: 'midterm' as const, status: 'completed' as const,
        questions: [
          { questionNumber: 1, question: 'Evaluate: lim(x→0) sin(x)/x', type: 'short' as const, marks: 10 },
          { questionNumber: 2, question: 'Find all partial derivatives of f(x,y) = x³y + 2xy²', type: 'long' as const, marks: 25 },
          { questionNumber: 3, question: 'Evaluate the double integral ∫∫ x²y dA over the region 0≤x≤2, 0≤y≤1', type: 'long' as const, marks: 25 },
          { questionNumber: 4, question: 'Which theorem relates a line integral to a surface integral?', type: 'mcq' as const, options: ["Green's theorem", "Stokes' theorem", "Divergence theorem", "Cauchy's theorem"], correctAnswer: "Stokes' theorem", marks: 10 },
        ],
      },
      {
        title: 'ML Final Exam', courseIdx: 4, classIdx: 3, teacherIdx: 2,
        date: daysFuture(14), duration: 120, totalMarks: 100, passingMarks: 40,
        type: 'final' as const, status: 'scheduled' as const,
        questions: [],
      },
      {
        title: 'Web Dev Final Project Defense', courseIdx: 0, classIdx: 0, teacherIdx: 0,
        date: daysFuture(21), duration: 60, totalMarks: 100, passingMarks: 50,
        type: 'final' as const, status: 'scheduled' as const,
        questions: [],
      },
    ];

    for (const ed of examData) {
      const exam = await Exam.create({
        title: ed.title, course: createdCourses[ed.courseIdx]._id,
        class: classes[ed.classIdx]._id, teacher: teacherUsers[ed.teacherIdx]._id,
        date: ed.date, duration: ed.duration,
        totalMarks: ed.totalMarks, passingMarks: ed.passingMarks,
        questions: ed.questions, type: ed.type, status: ed.status,
        isOnline: false, venue: 'Examination Hall A',
      });
      exams.push(exam);
    }

    // Exam submissions for completed exams
    console.log('📊 Creating exam submissions...');
    const examResults: Record<string, Record<number, number>> = {
      '0': { 0: 78, 1: 88, 2: 55, 3: 72, 4: 45 }, // Web Dev midterm: student idx -> marks
      '1': { 0: 42, 1: 46, 2: 35, 3: 40, 4: 28, 5: 38 }, // DSA Quiz
      '2': { 2: 75, 3: 62, 5: 55, 11: 68 }, // Calculus midterm
    };

    for (const [examIdx, studentScores] of Object.entries(examResults)) {
      const exam = exams[parseInt(examIdx)];
      for (const [studentIdxStr, obtainedMarks] of Object.entries(studentScores)) {
        const sIdx = parseInt(studentIdxStr);
        const percentage = Math.round((obtainedMarks / exam.totalMarks) * 100);
        try {
          await ExamSubmission.create({
            exam: exam._id,
            student: studentUsers[sIdx]._id,
            course: exam.course,
            answers: [],
            totalMarks: exam.totalMarks,
            obtainedMarks,
            percentage,
            grade: calculateGrade(percentage),
            status: 'graded',
            submittedAt: daysAgo(randomBetween(15, 25)),
            gradedAt: daysAgo(randomBetween(10, 14)),
          });
        } catch { /* skip */ }
      }
    }

    // Grades
    console.log('📊 Creating grade records...');
    const gradeData = [
      { sIdx: 0, cIdx: 0, clsIdx: 0, asgAvg: 91, examAvg: 78 },
      { sIdx: 1, cIdx: 0, clsIdx: 0, asgAvg: 90, examAvg: 88 },
      { sIdx: 2, cIdx: 0, clsIdx: 0, asgAvg: 75, examAvg: 55 },
      { sIdx: 3, cIdx: 0, clsIdx: 0, asgAvg: 68, examAvg: 72 },
      { sIdx: 4, cIdx: 0, clsIdx: 0, asgAvg: 72, examAvg: 45 },
      { sIdx: 0, cIdx: 1, clsIdx: 1, asgAvg: 89, examAvg: 84 },
      { sIdx: 1, cIdx: 1, clsIdx: 1, asgAvg: 85, examAvg: 92 },
      { sIdx: 4, cIdx: 1, clsIdx: 1, asgAvg: 72, examAvg: 56 },
      { sIdx: 2, cIdx: 2, clsIdx: 2, asgAvg: 88, examAvg: 75 },
      { sIdx: 5, cIdx: 2, clsIdx: 2, asgAvg: 76, examAvg: 55 },
      { sIdx: 11, cIdx: 2, clsIdx: 2, asgAvg: 84, examAvg: 68 },
      { sIdx: 3, cIdx: 4, clsIdx: 3, asgAvg: 87, examAvg: 0 },
      { sIdx: 6, cIdx: 4, clsIdx: 3, asgAvg: 78, examAvg: 0 },
      { sIdx: 9, cIdx: 4, clsIdx: 3, asgAvg: 82, examAvg: 0 },
    ];

    for (const gd of gradeData) {
      const finalPct = Math.round((gd.asgAvg * 0.4) + (gd.examAvg * 0.6));
      try {
        await Grade.create({
          student: studentUsers[gd.sIdx]._id,
          course: createdCourses[gd.cIdx]._id,
          class: classes[gd.clsIdx]._id,
          assignmentAverage: gd.asgAvg,
          examAverage: gd.examAvg,
          percentage: finalPct,
          grade: calculateGrade(finalPct),
          totalMarks: finalPct,
          totalMaxMarks: 100,
        });
      } catch { /* skip */ }
    }

    // Announcements
    console.log('📢 Creating announcements...');
    await Announcement.insertMany([
      {
        title: '🎓 Semester Registration Opens Tomorrow',
        content: 'Semester 4 course registration begins tomorrow at 9 AM. Log in to the portal to select your courses. Limited seats available for advanced courses.',
        target: 'all', createdBy: adminUser._id, priority: 'high',
      },
      {
        title: 'AI Study Tools Now Available',
        content: 'We\'ve integrated AI-powered academic analysis into the student dashboard. Visit your Progress page to get personalized study recommendations.',
        target: 'students', createdBy: adminUser._id, priority: 'medium',
      },
      {
        title: 'Faculty Development Workshop — Aug 20',
        content: 'All teaching faculty are invited to the annual pedagogical workshop on August 20th. Attendance is mandatory.',
        target: 'teachers', createdBy: adminUser._id, priority: 'high',
      },
      {
        title: 'Library Extended Hours',
        content: 'The campus library will be open until 11 PM from Monday to Friday during exam week. Digital resources are available 24/7 through the portal.',
        target: 'students', createdBy: adminUser._id, priority: 'low',
      },
    ]);

    // Notifications
    console.log('🔔 Creating notifications...');
    for (const student of studentUsers.slice(0, 6)) {
      await Notification.insertMany([
        {
          user: student._id, title: 'Assignment Due Tomorrow',
          message: '"React Component Library" is due in 24 hours. Don\'t forget to submit!',
          type: 'assignment', read: false,
        },
        {
          user: student._id, title: 'Grade Posted — Web Dev Midterm',
          message: 'Your Web Development Midterm grade has been published. Check your Grades section.',
          type: 'grade', read: false,
        },
        {
          user: student._id, title: 'AI Study Insights Ready',
          message: 'Your personalized academic analysis is ready. Visit the Progress page to view recommendations.',
          type: 'ai', read: true,
        },
      ]);
    }

    // Audit logs
    console.log('📋 Creating audit logs...');
    await AuditLog.insertMany([
      { user: teacherUsers[0]._id, action: 'GRADE', entity: 'Assignment', description: 'Dr. Priya Sharma graded 17 assignment submissions', createdAt: daysAgo(1) },
      { user: teacherUsers[1]._id, action: 'CREATE', entity: 'Exam', description: 'Prof. Arjun Mehta scheduled Calculus Midterm Examination', createdAt: daysAgo(20) },
      { user: adminUser._id, action: 'CREATE', entity: 'Announcement', description: 'Admin posted semester registration announcement', createdAt: daysAgo(2) },
      { user: teacherUsers[0]._id, action: 'ATTENDANCE', entity: 'Class', description: 'Attendance marked for CS-A Batch — 5 students', createdAt: daysAgo(0) },
      { user: teacherUsers[2]._id, action: 'CREATE', entity: 'Course', description: 'Ms. Kavita Nair published Machine Learning Fundamentals course', createdAt: daysAgo(30) },
      { user: adminUser._id, action: 'UPDATE', entity: 'User', description: 'Admin updated student profiles for new semester', createdAt: daysAgo(5) },
    ]);

    console.log('\n✅ ═══════════════════════════════════════════');
    console.log('🎉 Seed completed successfully!');
    console.log('═══════════════════════════════════════════');
    console.log('\n📧 Demo Credentials:');
    console.log('  Admin:   admin@eduportal.com     / Admin@123');
    console.log('  Teacher: priya.sharma@eduportal.com  / Teacher@123');
    console.log('  Teacher: arjun.mehta@eduportal.com   / Teacher@123');
    console.log('  Teacher: kavita.nair@eduportal.com   / Teacher@123');
    console.log('  Student: arjun.kumar@student.com / Student@123');
    console.log('  Student: diya.patel@student.com  / Student@123');
    console.log('\n📊 Data Created:');
    console.log(`  👤 ${1 + TEACHERS.length + STUDENTS.length} users`);
    console.log(`  📚 ${COURSES.length} courses`);
    console.log(`  🏫 ${classes.length} classes`);
    console.log('  📝 Assignments, submissions, attendance, exams, grades, notifications');
    console.log('═══════════════════════════════════════════\n');

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed failed:', err);
    await mongoose.disconnect();
    process.exit(1);
  }
}

seed();
