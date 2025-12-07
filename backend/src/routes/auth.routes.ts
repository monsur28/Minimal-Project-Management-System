import express from 'express';
import { loginUser, registerUser } from '../controllers/auth.controller';
import { protect } from '../middleware/auth.middleware'; // Will create this next

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);

export default router;
