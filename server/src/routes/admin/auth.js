import express from 'express';
import { register, login, getProfile } from '../../controllers/adminController.js';
import authAdmin from '../../middleware/authAdmin.js';

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.get('/me', authAdmin, getProfile);

export default router;
