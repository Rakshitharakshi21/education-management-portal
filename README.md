<div align="center">

# 🎓 Education Management Portal

### AI-Powered Academic Intelligence for Students, Teachers & Admins

</div>

<div align="center">

<table>
<tr>
<td align="center" style="background-color:#6366F1; color:white; padding:8px 16px;"><b>React</b></td>
<td align="center" style="background-color:#007ACC; color:white; padding:8px 16px;"><b>TypeScript</b></td>
<td align="center" style="background-color:#339933; color:white; padding:8px 16px;"><b>Node.js</b></td>
<td align="center" style="background-color:#8B5CF6; color:white; padding:8px 16px;"><b>Vite</b></td>
<td align="center" style="background-color:#EC4899; color:white; padding:8px 16px;"><b>MongoDB</b></td>
<td align="center" style="background-color:#F59E0B; color:white; padding:8px 16px;"><b>AI Powered</b></td>
</tr>
</table>

</div>

---

<h2 style="color:#6366F1;">✨ What is this?</h2>

**Education Management Portal** is a one-stop web platform that connects **students, teachers, and administrators** — replacing scattered spreadsheets and manual tracking with a single smart system.

It doesn't just store data. It **understands** it — using AI to analyze performance, flag academic risks, and give personalized recommendations to help students improve.

<br/>

<h2 style="color:#EF4444;">🧩 The Problem We're Solving</h2>

> Most schools/colleges juggle attendance registers, gradebooks, and assignment tracking across disconnected tools — with no way to spot a struggling student until it's too late.

**Our solution:** one portal, three roles, and an AI layer that quietly watches the numbers so people don't have to.

<br/>

<h2 style="color:#8B5CF6;">🚀 Key Features</h2>

<table>
<tr>
<th style="background-color:#6366F1; color:white;">🌐 Public Portal</th>
<th style="background-color:#22C55E; color:white;">👨‍🎓 Student Dashboard</th>
<th style="background-color:#F59E0B; color:white;">👩‍🏫 Teacher Dashboard</th>
</tr>
<tr>
<td valign="top">

- Home, Courses & Contact pages
- Course search & filtering
- Detailed course pages with schedules
- Simple enrollment flow

</td>
<td valign="top">

- View enrolled courses & progress
- Submit assignments online
- Check attendance & exam results
- Get AI-powered improvement tips

</td>
<td valign="top">

- Take attendance digitally
- Create & evaluate assignments
- Conduct exams, enter marks
- Monitor class-wide performance

</td>
</tr>
</table>

<table>
<tr>
<th style="background-color:#EC4899; color:white;">🧠 AI-Powered Academic Intelligence</th>
<th style="background-color:#06B6D4; color:white;">📊 Admin Control Center</th>
</tr>
<tr>
<td valign="top">

- Analyzes attendance + scores + exam marks together
- Flags weak subjects and at-risk students early
- Generates personalized recommendations for students
- Surfaces trends teachers/admins would otherwise miss

</td>
<td valign="top">

- Manage students, teachers, courses & classes
- Performance analytics & comparative reports
- Activity monitoring across the platform
- Risk analysis & AI-backed decision support

</td>
</tr>
</table>

<br/>

<h2 style="color:#3B82F6;">🛠️ Tech Stack</h2>

<table>
<tr><th style="background-color:#1E1E2E; color:white;">Layer</th><th style="background-color:#1E1E2E; color:white;">Technology</th></tr>
<tr><td><b>Frontend</b></td><td>React + TypeScript + Vite</td></tr>
<tr><td><b>Backend</b></td><td>Node.js + Express + TypeScript</td></tr>
<tr><td><b>Database</b></td><td>MongoDB</td></tr>
<tr><td><b>AI Layer</b></td><td>OpenRouter API integration</td></tr>
<tr><td><b>Auth</b></td><td>JWT-based role authentication (Admin / Teacher / Student)</td></tr>
</table>

<br/>

<h2 style="color:#10B981;">📐 How It's Organized</h2>

```
EDUCATION-MANAGEMENT-PORTAL/
├── client/          → React + TypeScript frontend
│   └── src/
│       ├── pages/   → admin, teacher, student, public, auth
│       ├── layouts/ → role-based layouts
│       └── context/ → auth state
│
└── server/          → Node.js + TypeScript backend
    └── src/
        ├── controllers/  → business logic
        ├── models/       → database schemas
        ├── routes/       → API endpoints
        └── services/ai/  → AI insight engine
```

<br/>

<h2 style="color:#F59E0B;">⚡ Getting Started</h2>

```bash
# 1. Clone the repo
git clone https://github.com/Rakshitharakshi21/education-management-portal.git
cd education-management-portal

# 2. Install dependencies (client + server)
cd client && npm install
cd ../server && npm install

# 3. Set up environment variables
cp server/.env.example server/.env
# → fill in your DB connection string, JWT secret, and AI API key

# 4. Run the app
cd server && npm run dev      # backend
cd client && npm run dev      # frontend (in a second terminal)
```

<br/>

<h2 style="color:#06B6D4;">✅ How to Run and Verify</h2>

<table>
<tr>
<td width="50%" valign="top">

**1. Backend Status**
- Express server running on: `http://localhost:5000`
- MongoDB connection: **Connected** ✅

</td>
<td width="50%" valign="top">

**2. Frontend Status**
- Vite dev server running on: `http://localhost:5174`
- Open it directly in your browser

</td>
</tr>
</table>

**3. Seeded Test Credentials** — log in instantly with any of these:

<table>
<tr><th style="background-color:#1E1E2E; color:white;">Role</th><th style="background-color:#1E1E2E; color:white;">Email</th><th style="background-color:#1E1E2E; color:white;">Password</th></tr>
<tr><td>🛡️ <b>Admin</b></td><td><code>admin@eduportal.com</code></td><td><code>Admin@123</code></td></tr>
<tr><td>👩‍🏫 <b>Teacher</b></td><td><code>priya.sharma@eduportal.com</code></td><td><code>Teacher@123</code></td></tr>
<tr><td>🧑‍🎓 <b>Student</b></td><td><code>arjun.kumar@student.com</code></td><td><code>Student@123</code></td></tr>
</table>

> ⚠️ These are demo/seed credentials for evaluation purposes only — not real accounts.

<br/>

<h2 style="color:#EC4899;">👥 Who Uses What</h2>

<table>
<tr><th style="background-color:#1E1E2E; color:white;">Role</th><th style="background-color:#1E1E2E; color:white;">Can Do</th></tr>
<tr><td>🧑‍🎓 <b>Student</b></td><td>View courses, submit assignments, check attendance/grades, get AI tips</td></tr>
<tr><td>👩‍🏫 <b>Teacher</b></td><td>Take attendance, grade assignments, conduct exams, view class analytics</td></tr>
<tr><td>🛡️ <b>Admin</b></td><td>Manage everyone, view reports, monitor risk analysis, oversee the platform</td></tr>
</table>

<br/>

<h2 style="color:#A855F7;">🎯 Why It Stands Out</h2>

- 🧠 **AI isn't a gimmick here** — it directly analyzes real academic data (attendance + assignments + exams) to generate actionable insight, not generic chat responses.
- 🔐 **Role-based architecture** — three distinct, secure dashboards from one codebase.
- 📈 **Built to scale** — clean separation between client/server, typed end-to-end with TypeScript.

<br/>

<div align="center">

### Made with ❤️ for smarter education

</div>
