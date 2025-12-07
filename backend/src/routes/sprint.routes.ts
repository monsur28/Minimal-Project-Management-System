import express from 'express';
import {
    getSprints,
    createSprint,
    updateSprint,
    deleteSprint,
} from '../controllers/sprint.controller';
import { protect, manager } from '../middleware/auth.middleware';

const router = express.Router({ mergeParams: true });

router.route('/').get(protect, getSprints).post(protect, manager, createSprint);
router
    .route('/:id')
    .put(protect, updateSprint)
    .delete(protect, deleteSprint);

export default router;
