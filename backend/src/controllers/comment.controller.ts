import { Request, Response } from 'express';
import Comment from '../models/comment.model';
import Task from '../models/task.model';
import { z } from 'zod';

// @desc    Get comments for a task
// @route   GET /api/tasks/:taskId/comments
// @access  Private
export const getComments = async (req: Request, res: Response) => {
    const comments = await Comment.find({ task: req.params.taskId } as any)
        .populate('user', 'name email')
        .sort({ createdAt: -1 });
    res.json(comments);
};

// @desc    Add a comment to a task
// @route   POST /api/tasks/:taskId/comments
// @access  Private
export const createComment = async (req: Request, res: Response) => {
    const schema = z.object({
        content: z.string().min(1),
    });

    const validation = schema.safeParse(req.body);

    if (!validation.success) {
        res.status(400);
        throw new Error(validation.error.issues[0].message);
    }

    const { content } = req.body;
    const taskId = req.params.taskId;

    const task = await Task.findById(taskId);
    if (!task) {
        res.status(404);
        throw new Error('Task not found');
    }

    const comment = await Comment.create({
        content,
        task: taskId,
        user: req.user?._id,
    } as any);

    const populatedComment = await (comment as any).populate('user', 'name email');

    res.status(201).json(populatedComment);
};
