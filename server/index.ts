import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

import authRoutes from './routes/auth.js';
import schoolRoutes from './routes/school.js';
import dashboardRoutes from './routes/dashboard.js';
import studentsRoutes from './routes/students.js';
import teachersRoutes from './routes/teachers.js';
import classesRoutes from './routes/classes.js';
import subjectsRoutes from './routes/subjects.js';
import attendanceRoutes from './routes/attendance.js';
import homeworkRoutes from './routes/homework.js';
import examsRoutes from './routes/exams.js';
import resultsRoutes from './routes/results.js';
import timetableRoutes from './routes/timetable.js';
import feesRoutes from './routes/fees.js';
import noticesRoutes from './routes/notices.js';
import reportsRoutes from './routes/reports.js';
import { errorHandler } from './middleware/errorHandler.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Register API Routes
app.use('/api/auth', authRoutes);
app.use('/api/school', schoolRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/students', studentsRoutes);
app.use('/api/teachers', teachersRoutes);
app.use('/api/classes', classesRoutes);
app.use('/api/subjects', subjectsRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/homework', homeworkRoutes);
app.use('/api/exams', examsRoutes);
app.use('/api/results', resultsRoutes);
app.use('/api/timetable', timetableRoutes);
app.use('/api/fees', feesRoutes);
app.use('/api/notices', noticesRoutes);
app.use('/api/reports', reportsRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', school: 'Jaipur Public School', timestamp: new Date() });
});

// Serve client if built or in production
const clientDist = path.join(__dirname, '../dist/client');
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

// Central Error Handler
app.use(errorHandler);

process.on('uncaughtException', (err) => {
  console.error('⚠️ Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason) => {
  console.error('⚠️ Unhandled Rejection:', reason);
});

app.listen(PORT, () => {
  console.log(`🚀 Jaipur Public School Management Server running on port ${PORT}`);
});
