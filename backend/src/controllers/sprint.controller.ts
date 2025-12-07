import { Request, Response } from 'express';
import Sprint from '../models/sprint.model';
import Project from '../models/project.model';
import { z } from 'zod';

// @desc    Get all sprints for a project
// @route   GET /api/projects/:projectId/sprints
// @access  Private
export const getSprints = async (req: Request, res: Response) => {
    const sprints = await Sprint.find({ project: req.params.projectId } as any);
    res.json(sprints);
};

// @desc    Create a sprint
// @route   POST /api/projects/:projectId/sprints
// @access  Private (Manager/Admin)
export const createSprint = async (req: Request, res: Response) => {
    const schema = z.object({
        name: z.string().min(1),
        startDate: z.string(),
        endDate: z.string(),
    });

    const validation = schema.safeParse(req.body);

    if (!validation.success) {
        res.status(400);
        throw new Error(validation.error.issues[0].message);
    }

    const { name, startDate, endDate } = req.body;
    const projectId = req.params.projectId;

    const project = await Project.findById(projectId);
    if (!project) {
        res.status(404);
        throw new Error('Project not found');
    }

    // Auto-increment sprint number
    const lastSprint = await Sprint.findOne({ project: projectId as any }).sort({
        sprintNumber: -1,
    });
    const sprintNumber = lastSprint ? lastSprint.sprintNumber + 1 : 1;

    const sprint = await Sprint.create({
        name,
        startDate,
        endDate,
        project: projectId,
        sprintNumber,
    } as any);

    res.status(201).json(sprint);
};

// @desc    Update a sprint
// @route   PUT /api/sprints/:id
// @access  Private (Manager/Admin)
export const updateSprint = async (req: Request, res: Response) => {
    const sprint = await Sprint.findById(req.params.id);

    if (sprint) {
        sprint.name = req.body.name || sprint.name;
        sprint.startDate = req.body.startDate || sprint.startDate;
        sprint.endDate = req.body.endDate || sprint.endDate;
        sprint.status = req.body.status || sprint.status;

        const updatedSprint = await sprint.save();
        res.json(updatedSprint);
    } else {
        res.status(404);
        throw new Error('Sprint not found');
    }
};

// @desc    Delete a sprint
// @route   DELETE /api/sprints/:id
// @access  Private (Manager/Admin)
export const deleteSprint = async (req: Request, res: Response) => {
    const sprint = await Sprint.findById(req.params.id);

    if (sprint) {
        await sprint.deleteOne();
        res.json({ message: 'Sprint removed' });
    } else {
        res.status(404);
        throw new Error('Sprint not found');
    }
};
