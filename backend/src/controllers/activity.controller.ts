import { Request, Response } from 'express';
import Activity from '../models/activity.model';
import mongoose from 'mongoose';

// Internal helper to log activity
export const logActivity = async (
    taskId: string | mongoose.Types.ObjectId,
    userId: string | mongoose.Types.ObjectId,
    action: string,
    details?: string
) => {
    try {
        await Activity.create({
            task: taskId,
            user: userId,
            action,
            details,
        });
    } catch (error) {
        console.error('Failed to log activity:', error);
        // Don't throw error to avoid breaking main flow
    }
};

// @desc    Get activities for a task
// @route   GET /api/tasks/:taskId/activities
// @access  Private
export const getTaskActivities = async (req: Request, res: Response) => {
    const activities = await Activity.find({ task: req.params.taskId })
        .populate('user', 'name email role')
        .sort({ createdAt: -1 });

    res.json(activities);
};
