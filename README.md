# Jaipur Public School - Full-Stack Management System

A complete, production-ready, full-stack **School Management System web application** designed for **Jaipur Public School** (Shri Dungargarh, Rajasthan, India), architected with multi-school database support.

---

## 🚀 Key Features

* **Multi-Role RBAC Authorization**: Role-based access control for Super Admin, School Admin, Teacher, Student, and Parent.
* **Dashboard Analytics**: Live statistics (Students, Teachers, Attendance %, Pending Fees, Exams) with interactive Recharts visualizations.
* **Student Management**: Full CRUD, admission numbers, roll numbers, class/section filtering, search, and student profiles.
* **Teacher Management**: Faculty directory, qualifications, contact info, and class/subject mapping.
* **Class & Section Management**: Academic year structure (2026-2027), grade levels, and room allocations.
* **Subject Catalog**: Core subjects (Mathematics, English, Hindi, Science, Social Science) and electives (Computer Science).
* **Attendance System**: Daily classroom attendance sheet, instant status toggling (Present, Absent, Late, Leave), student % ratio calculator.
* **Homework Publisher**: Teacher assignment creator, due dates, instructions, student class view.
* **Exams & Results**: Exam scheduling, marks entry matrix, automated percentage & grade calculation (A+, A, B, C, D, F).
* **Printable Report Cards**: High-definition progress report card layout with school branding, subject breakdown, and principal signature lines (`window.print()` / PDF export).
* **Fees & Billing Ledger**: Fee structures, discount/fine adjustments, student ledger status (PAID, PARTIAL, OVERDUE), payment entry modal (Cash, UPI, Card, Bank Transfer) with instant payment receipts.
* **Notices & Announcements**: School circular board with target audience filtering.
* **Reports & CSV Export Center**: Integrated reporting hub with exportable CSV files for student roster, attendance, and fee collection.

---

## 🔑 Demo Credentials

| Role | Email | Password | Access Level |
| :--- | :--- | :--- | :--- |
| **👑 School Admin** | `admin@jaipurpublic.edu.in` | `admin123` | Complete administrative control over Jaipur Public School |
| **👨‍🏫 Teacher** | `teacher@jaipurpublic.edu.in` | `teacher123` | Class attendance, homework creation, exam marks entry |
| **🎓 Student** | `student@jaipurpublic.edu.in` | `student123` | View own profile, attendance %, homework, timetable, report card |
| **👨‍👩‍👦 Parent** | `parent@jaipurpublic.edu.in` | `parent123` | View linked children's attendance, report cards, fee ledger |
| **🌟 Super Admin** | `superadmin@jaipurpublic.edu.in` | `superadmin123` | Multi-school platform owner access |

*Quick 1-Click login buttons are available directly on the login screen.*

---

## 🛠️ Technology Stack

* **Frontend**: React 18, TypeScript, Tailwind CSS, Lucide React Icons, Recharts Analytics
* **Backend**: Node.js, Express.js
* **Database & ORM**: MySQL / MariaDB (or SQLite) with Prisma ORM
* **Authentication**: JWT-based session tokens with `bcryptjs` password hashing

---

## 🐬 MySQL Database Configuration

The application is configured to connect to MySQL via Prisma.

### Connection String (`.env`)
By default, the connection string in `.env` is configured for local MySQL / XAMPP:
```env
DATABASE_URL="mysql://root:@localhost:3306/jaipur_public_school"
```
* If you have set a MySQL root password, update `.env`:
  `DATABASE_URL="mysql://root:YOUR_PASSWORD@localhost:3306/jaipur_public_school"`

### Option 1: Automatic Setup via Prisma (Recommended)
1. Start your MySQL service (e.g., click **Start** next to MySQL in **XAMPP Control Panel**).
2. Create tables & relations automatically:
   ```bash
   npm run prisma:push
   ```
3. Populate demo data (users, students, teachers, classes, fees, exams):
   ```bash
   npm run seed
   ```

### Option 2: Direct Import into phpMyAdmin / MySQL CLI
A ready-to-run SQL schema file has been generated for direct import:
* File: `prisma/mysql_schema.sql`
* In **phpMyAdmin** (`http://localhost/phpmyadmin`):
  1. Click **Import** in the top navigation.
  2. Select `prisma/mysql_schema.sql` and click **Import**.
* Or via MySQL Command Line:
  ```bash
  mysql -u root -p < prisma/mysql_schema.sql
  ```

---

## 📦 Running the Application

1. **Build Client & Start Full-Stack Server**:
   ```bash
   npm run build
   npm start
   ```

2. **Or Run in Development Mode (Live Reload)**:
   ```bash
   npm run dev
   ```

   The application will be running at `http://localhost:5000`.
