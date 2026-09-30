import express from 'express';
import { 
  createStudent, 
  getStudents, 
  getStudentCount, 
  getStudent, 
  getStudentByStudentId, 
  updateStudent, 
  deleteStudent, 
  getStudentStats,
  getProfile,
  updateProfile
} from '../controllers/student.controller.js';
import { requireAuth, requireRole } from '../middleware/auth.middleware.js';

const router = express.Router();

// Profile routes (student's own profile — any authenticated user)
// Must be placed BEFORE dynamic /:id routes to avoid route conflict
router.get('/profile', requireAuth, getProfile);
router.put('/profile', requireAuth, updateProfile);

// Stats routes (student's own stats, or college viewing a student by id)
router.get('/stats', requireAuth, getStudentStats);
router.get('/stats/:id', requireAuth, requireRole('COLLEGE'), getStudentStats);

// College-portal student management (COLLEGE only)
router.get('/', requireAuth, requireRole('COLLEGE'), getStudents);
router.post('/', requireAuth, requireRole('COLLEGE'), createStudent);
router.get('/count', requireAuth, requireRole('COLLEGE'), getStudentCount);
router.get('/sid/:studentId', requireAuth, requireRole('COLLEGE'), getStudentByStudentId);
router.get('/:id', requireAuth, requireRole('COLLEGE'), getStudent);
router.put('/:id', requireAuth, requireRole('COLLEGE'), updateStudent);
router.delete('/:id', requireAuth, requireRole('COLLEGE'), deleteStudent);

export default router;
