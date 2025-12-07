import { Request, Response } from 'express';
import Task from '../models/task.model';
import Project from '../models/project.model';
import { z } from 'zod';
import { logActivity } from './activity.controller';

// @desc    Get all tasks for a project
// @route   GET /api/projects/:projectId/tasks
// @access  Private
export const getTasks = async (req: Request, res: Response) => {
    const tasks = await Task.find({ project: req.params.projectId })
        .populate('assignees', 'name avatar email')
        .populate('sprint', 'name')
        .sort({ createdAt: -1 });

    res.json(tasks);
};

// @desc    Get single task
// @route   GET /api/tasks/:id
// @access  Private
export const getTaskById = async (req: Request, res: Response) => {
    const task = await Task.findById(req.params.id)
        .populate('assignees', 'name avatar email')
        .populate('project', 'name key')
        .populate('sprint', 'name');

    if (task) {
        res.json(task);
    } else {
        res.status(404);
        throw new Error('Task not found');
    }
};

// @desc    Get current user's tasks
// @route   GET /api/tasks/my-tasks
// @access  Private
export const getMyTasks = async (req: Request, res: Response) => {
    const tasks = await Task.find({ assignees: req.user!._id })
        .populate('project', 'name key')
        .sort({ dueDate: 1 });
    res.json(tasks);
};

// @desc    Create a task
// ...
export const createTask = async (req: Request, res: Response) => {
    // ... validation ...
    const { title, description, sprint, assignees, priority, estimate, dueDate, attachments } = req.body;
    const projectId = req.params.projectId;

    const project = await Project.findById(projectId);
    if (!project) {
        res.status(404);
        throw new Error('Project not found');
    }

    const task = new Task({
        title,
        description,
        project: projectId,
        sprint,
        assignees: assignees || [],
        priority: priority || 'medium',
        estimate: estimate || 0,
        dueDate,
        attachments: attachments || [],
    });

    const createdTask = await task.save();

    // Log Activity
    await logActivity(createdTask._id, req.user!._id, 'created', 'Task created');

    res.status(201).json(createdTask);
};

// @desc    Update a task
// ...
// @desc    Update a task
// @route   PUT /api/tasks/:id
// @access  Private
export const updateTask = async (req: Request, res: Response) => {
    const task = await Task.findById(req.params.id);

    if (task) {
        // Track changes (simple version)
        let action = 'updated';
        let details = 'Task details updated';

        // Check for Status Transition logic
        if (req.body.status && req.body.status !== task.status) {
            action = 'status_change';

            let newStatus = req.body.status;

            // Enforce Role-Based Logic
            if (req.user?.role === 'member' && newStatus === 'done') {
                newStatus = 'review'; // Force review for members
            }

            // Optional: Block members from approving (review -> done) if strict enforcement is needed
            // For now, we assume if they send 'done' it goes to 'review', but if a manager sends 'done' it goes to 'done'.

            details = `Status changed from ${task.status} to ${newStatus}`;
            task.status = newStatus;
        }

        if (req.body.assignees) {
            action = 'assigned';
            details = 'Assignees updated';
            task.assignees = req.body.assignees;
        }

        if (req.body.timeLogged && req.body.timeLogged !== task.timeLogged) {
            action = 'time_logged';
            const added = req.body.timeLogged - task.timeLogged;
            // If we just set total, it's hard to know added amount without calc, but we know total changed.
            details = `Time logged updated to ${req.body.timeLogged}h`;
            task.timeLogged = req.body.timeLogged;
        }

        task.title = req.body.title || task.title;
        task.description = req.body.description || task.description;
        task.sprint = req.body.sprint || task.sprint;
        task.priority = req.body.priority || task.priority;
        task.estimate = req.body.estimate || task.estimate;
        task.dueDate = req.body.dueDate || task.dueDate;
        task.subtasks = req.body.subtasks || task.subtasks;
        task.attachments = req.body.attachments || task.attachments;

        const updatedTask = await task.save();

        // Log Activity
        await logActivity(updatedTask._id, req.user!._id, action, details);

        res.json(updatedTask);
    } else {
        res.status(404);
        throw new Error('Task not found');
    }
};

// @desc    Delete a task
// @route   DELETE /api/tasks/:id
// @access  Private
export const deleteTask = async (req: Request, res: Response) => {
    const task = await Task.findById(req.params.id);

    if (task) {
        await task.deleteOne();
        res.json({ message: 'Task removed' });
    } else {
        res.status(404);
        throw new Error('Task not found');
    }
};
