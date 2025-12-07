import express from 'express';
import {
    getProjects,
    createProject,
    getProjectById,
    updateProject,
    deleteProject,
    getDashboardStats,
    getMyProjects
} from '../controllers/project.controller';
import { protect, manager } from '../middleware/auth.middleware';

import sprintRoutes from './sprint.routes';
import taskRoutes from './task.routes';

const router = express.Router();

router.use('/:projectId/sprints', sprintRoutes);
router.use('/:projectId/tasks', taskRoutes);

router.get('/stats', protect, getDashboardStats);
router.get('/my-projects', protect, getMyProjects);

router.route('/').get(protect, getProjects).post(protect, manager, createProject);
router
    .route('/:id')
    .get(protect, getProjectById)
    .put(protect, updateProject)
    .delete(protect, deleteProject);

export default router;
