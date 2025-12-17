
import { Request, Response } from 'express';
import TimeLog from '../models/timelog.model';
import Task from '../models/task.model';
import mongoose from 'mongoose';

interface AuthRequest extends Request {
    user?: any;
}

export const startTimer = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { taskId } = req.params;
        const userId = req.user._id;

        // Check if there's already a running timer for this user and task
        const existingTimer = await TimeLog.findOne({
            task: taskId,
            user: userId,
            endTime: { $exists: false }
        });

        if (existingTimer) {
            res.status(400).json({ message: 'Timer is already running for this task' });
            return;
        }

        const timeLog = await TimeLog.create({
            task: taskId,
            user: userId,
            startTime: new Date()
        });

        res.status(201).json(timeLog);
    } catch (error) {
        res.status(500).json({ message: 'Error starting timer', error });
    }
};

export const stopTimer = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { taskId } = req.params;
        const userId = req.user._id;

        const timeLog = await TimeLog.findOne({
            task: taskId,
            user: userId,
            endTime: { $exists: false }
        });

        if (!timeLog) {
            res.status(404).json({ message: 'No running timer found for this task' });
            return;
        }

        const endTime = new Date();
        const startTime = new Date(timeLog.startTime);
        const durationSeconds = (endTime.getTime() - startTime.getTime()) / 1000;
        const durationHours = durationSeconds / 3600;

        timeLog.endTime = endTime;
        timeLog.duration = durationSeconds;
        await timeLog.save();

        // Update total time in Task
        const task = await Task.findById(taskId);
        if (task) {
            task.timeLogged = (task.timeLogged || 0) + durationHours;
            await task.save();
        }

        res.json({ message: 'Timer stopped', timeLog, totalTimeLogged: task?.timeLogged });
    } catch (error) {
        res.status(500).json({ message: 'Error stopping timer', error });
    }
};

export const getTimerStatus = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { taskId } = req.params;
        const userId = req.user._id;

        const activeTimer = await TimeLog.findOne({
            task: taskId,
            user: userId,
            endTime: { $exists: false }
        });

        res.json({
            running: !!activeTimer,
            startTime: activeTimer?.startTime || null
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching timer status', error });
    }
};

export const getTaskTimeBreakdown = async (req: Request, res: Response) => {
    try {
        const { taskId } = req.params;

        const logs = await TimeLog.aggregate([
            { $match: { task: new mongoose.Types.ObjectId(taskId) } },
            {
                $group: {
                    _id: '$user',
                    totalSeconds: { $sum: '$duration' }
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'user'
                }
            },
            { $unwind: '$user' },
            {
                $project: {
                    'user.password': 0,
                    'user.createdAt': 0,
                    'user.updatedAt': 0
                }
            }
        ]);

        res.json(logs);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching time breakdown', error });
    }
};
