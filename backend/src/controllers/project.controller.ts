import { Request, Response } from 'express';
import Project from '../models/project.model';
import Task, { ITask } from '../models/task.model';
import User from '../models/user.model';
import Sprint from '../models/sprint.model';
import { z } from 'zod';
import mongoose from 'mongoose';

// @desc    Get dashboard stats (Admin/Manager)
// @route   GET /api/projects/stats
// @access  Private
export const getDashboardStats = async (req: Request, res: Response) => {
    // 1. Global Counts
    const totalProjects = await Project.countDocuments();
    const activeSprints = await Sprint.countDocuments({ status: 'active' });
    const totalUsers = await User.countDocuments();
    const tasksInProgress = await Task.countDocuments({ status: 'in-progress' });

    // 2. Project Performance (Aggregation)
    const projectStats = await Project.aggregate([
        {
            $lookup: {
                from: 'tasks',
                localField: '_id',
                foreignField: 'project',
                as: 'tasks',
            },
        },
        {
            $project: {
                name: 1,
                status: 1,
                totalTasks: { $size: '$tasks' },
                completedTasks: {
                    $size: {
                        $filter: {
                            input: '$tasks',
                            as: 'task',
                            cond: { $eq: ['$$task.status', 'done'] },
                        },
                    },
                },
                tasksRemaining: {
                    $size: {
                        $filter: {
                            input: '$tasks',
                            as: 'task',
                            cond: { $ne: ['$$task.status', 'done'] },
                        },
                    },
                },
                timeLogged: { $sum: '$tasks.timeLogged' },
            },
        },
        {
            $addFields: {
                progress: {
                    $cond: [
                        { $eq: ['$totalTasks', 0] },
                        0,
                        { $multiply: [{ $divide: ['$completedTasks', '$totalTasks'] }, 100] },
                    ],
                },
            },
        },
        { $sort: { createdAt: -1 } }, // Most recent first
    ]);

    // 3. User Performance (Aggregation)
    const userStats = await User.aggregate([
        {
            $lookup: {
                from: 'tasks',
                localField: '_id',
                foreignField: 'assignees',
                as: 'assignedTasks',
            },
        },
        {
            $project: {
                name: 1,
                email: 1,
                department: 1, // Include new field
                completedTasks: {
                    $size: {
                        $filter: {
                            input: '$assignedTasks',
                            as: 'task',
                            cond: { $eq: ['$$task.status', 'done'] },
                        },
                    },
                },
                totalTimeLogged: { $sum: '$assignedTasks.timeLogged' }, // Note: This sums TOTAL time of tasks assigned to user. 
                // Refining time logged per user on shared tasks is complex without a separate "WorkLog" model.
                // For now, we'll assume the task's timeLogged applies to the assignee context or just show total tasks.
            },
        },
        { $sort: { completedTasks: -1 } },
        { $limit: 5 } // Top 5 performers
    ]);

    res.json({
        global: {
            totalProjects,
            totalUsers,
            tasksInProgress,
            activeSprints,
        },
        projects: projectStats,
        users: userStats,
    });
};

// @desc    Get all projects
// @route   GET /api/projects
// @access  Private
export const getProjects = async (req: Request, res: Response) => {
    const projects = await Project.aggregate([
        {
            $match: {
                $or: [{ owner: req.user?._id }, { members: req.user?._id }],
            },
        },
        {
            $lookup: {
                from: 'tasks',
                localField: '_id',
                foreignField: 'project',
                as: 'tasks',
            },
        },
        {
            $addFields: {
                taskStats: {
                    total: { $size: '$tasks' },
                    completed: {
                        $size: {
                            $filter: {
                                input: '$tasks',
                                as: 'task',
                                cond: { $eq: ['$$task.status', 'done'] },
                            },
                        },
                    },
                },
            },
        },
        { $unset: 'tasks' },
        { $sort: { createdAt: -1 } }
    ]);

    await Project.populate(projects, { path: 'owner members', select: 'name email' });

    res.json(projects);
};

// @desc    Get single project
// @route   GET /api/projects/:id
// @access  Private
export const getProjectById = async (req: Request, res: Response) => {
    const project = await Project.findById(req.params.id)
        .populate('owner', 'name email')
        .populate('members', 'name email');

    if (project) {
        // Check if user is owner or member
        const isMember = project.members.some(
            (member: any) => member._id.toString() === req.user?._id.toString()
        );
        const isOwner = (project.owner as any)._id.toString() === req.user?._id.toString();

        if (isMember || isOwner || req.user?.role === 'admin') {
            res.json(project);
        } else {
            res.status(401);
            throw new Error('Not authorized to view this project');
        }
    } else {
        res.status(404);
        throw new Error('Project not found');
    }
};

// @desc    Create a project
// @route   POST /api/projects
// @access  Private (Manager/Admin)
export const createProject = async (req: Request, res: Response) => {
    const schema = z.object({
        name: z.string().min(1),
        description: z.string().optional(),
        members: z.array(z.string()).optional(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
        client: z.string().optional(),
        budget: z.coerce.number().optional(),
        status: z.enum(['planned', 'active', 'completed', 'archived']).optional(),
        thumbnail: z.string().optional(),
    });

    const validation = schema.safeParse(req.body);

    if (!validation.success) {
        res.status(400);
        throw new Error(validation.error.issues[0].message);
    }

    const { name, description, members, startDate, endDate, client, budget, status, thumbnail } = req.body;

    const project = await Project.create({
        name,
        description,
        owner: req.user?._id,
        members: members || [],
        startDate,
        endDate,
        client,
        budget,
        status: status || 'planned',
        thumbnail
    } as any);

    res.status(201).json(project);
};

// @desc    Update a project
// @route   PUT /api/projects/:id
// @access  Private (Owner/Admin)
export const updateProject = async (req: Request, res: Response) => {
    const project = await Project.findById(req.params.id);

    if (project) {
        if (
            project.owner.toString() !== req.user?._id.toString() &&
            req.user?.role !== 'admin'
        ) {
            res.status(401);
            throw new Error('Not authorized to update this project');
        }

        project.name = req.body.name || project.name;
        project.description = req.body.description || project.description;
        project.members = req.body.members || project.members;
        project.status = req.body.status || project.status;
        project.startDate = req.body.startDate || project.startDate;
        project.endDate = req.body.endDate || project.endDate;
        project.client = req.body.client || project.client;
        project.budget = req.body.budget || project.budget;
        project.thumbnail = req.body.thumbnail || project.thumbnail;

        const updatedProject = await project.save();
        res.json(updatedProject);
    } else {
        res.status(404);
        throw new Error('Project not found');
    }
};

// @desc    Delete a project
// @route   DELETE /api/projects/:id
// @access  Private (Owner/Admin)
export const deleteProject = async (req: Request, res: Response) => {
    const project = await Project.findById(req.params.id);

    if (project) {
        if (
            project.owner.toString() !== req.user?._id.toString() &&
            req.user?.role !== 'admin'
        ) {
            res.status(401);
            throw new Error('Not authorized to delete this project');
        }

        await project.deleteOne();
        res.json({ message: 'Project removed' });
    } else {
        res.status(404);
        throw new Error('Project not found');
    }
};

// @desc    Get logged in user's projects
// @route   GET /api/projects/my-projects
// @access  Private
export const getMyProjects = async (req: Request, res: Response) => {
    const userId = req.user!._id;
    const projects = await Project.find({
        $or: [{ owner: userId }, { members: { $in: [userId] } }],
    })
        .populate('owner', 'name email')
        .sort({ createdAt: -1 });
    res.json(projects);
};
