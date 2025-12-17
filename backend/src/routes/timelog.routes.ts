import express from 'express';
import { protect } from '../middleware/auth.middleware';
import { startTimer, stopTimer, getTimerStatus, getTaskTimeBreakdown } from '../controllers/timelog.controller';

const router = express.Router({ mergeParams: true });

router.post('/start', protect, startTimer);
router.post('/stop', protect, stopTimer);
router.get('/status', protect, getTimerStatus);
router.get('/breakdown', protect, getTaskTimeBreakdown);

export default router;
