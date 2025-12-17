import express from 'express';
import {
    getTasks,
    createTask,
    updateTask,
    deleteTask,
    getTaskById,
    getMyTasks,
} from '../controllers/task.controller';
import { getTaskActivities } from '../controllers/activity.controller';
import { protect } from '../middleware/auth.middleware';

import commentRoutes from './comment.routes';
import timeLogRoutes from './timelog.routes';

const router = express.Router({ mergeParams: true });

router.use('/:taskId/comments', commentRoutes);
router.use('/:taskId/timer', timeLogRoutes);

router.get('/my-tasks', protect, getMyTasks);
router.get('/:taskId/activities', protect, getTaskActivities);

router.route('/').get(protect, getTasks).post(protect, createTask);
router
    .route('/:id')
    .get(protect, getTaskById)
    .put(protect, updateTask)
    .delete(protect, deleteTask);

export default router;
