import express from 'express';
import { getComments, createComment } from '../controllers/comment.controller';
import { protect } from '../middleware/auth.middleware';

const router = express.Router({ mergeParams: true });

router.route('/').get(protect, getComments).post(protect, createComment);

export default router;
