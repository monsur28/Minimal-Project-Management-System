import express from 'express';
import { getUsers, createUser, updateUser, deleteUser, updateUserProfile, getUserProfile } from '../controllers/user.controller';
import { protect, admin } from '../middleware/auth.middleware';

const router = express.Router();

router.route('/profile')
    .get(protect, getUserProfile)
    .put(protect, updateUserProfile);

router.route('/')
    .get(protect, admin, getUsers)
    .post(protect, admin, createUser);

router
    .route('/:id')
    .put(protect, admin, updateUser)
    .delete(protect, admin, deleteUser);

export default router;
