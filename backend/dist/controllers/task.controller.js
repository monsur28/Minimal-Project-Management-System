"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteTask = exports.updateTask = exports.createTask = exports.getTaskById = exports.getTasks = exports.getMyTasks = void 0;
const task_model_1 = __importDefault(require("../models/task.model"));
const project_model_1 = __importDefault(require("../models/project.model"));
const zod_1 = require("zod");
// @desc    Get logged in user's tasks
// @route   GET /api/tasks/my-tasks
// @access  Private
const getMyTasks = async (req, res) => {
    const userId = req.user._id;
    const tasks = await task_model_1.default.find({ assignees: { $in: [userId] } })
        .populate('project', 'name')
        .populate('sprint', 'name');
    res.json(tasks);
};
exports.getMyTasks = getMyTasks;
// @desc    Get all tasks for a project (optional sprint filter)
// @route   GET /api/projects/:projectId/tasks
// @access  Private
const getTasks = async (req, res) => {
    const { sprintId } = req.query;
    const query = { project: req.params.projectId };
    if (sprintId) {
        query.sprint = sprintId;
    }
    const tasks = await task_model_1.default.find(query)
        .populate('assignees', 'name email')
        .populate('sprint', 'name');
    res.json(tasks);
};
exports.getTasks = getTasks;
// @desc    Get single task
// @route   GET /api/tasks/:id
// @access  Private
const getTaskById = async (req, res) => {
    const task = await task_model_1.default.findById(req.params.id)
        .populate('assignees', 'name email')
        .populate('sprint', 'name')
        .populate('project', 'name');
    if (task) {
        res.json(task);
    }
    else {
        res.status(404);
        throw new Error('Task not found');
    }
};
exports.getTaskById = getTaskById;
// @desc    Create a task
// @route   POST /api/projects/:projectId/tasks
// @access  Private
const createTask = async (req, res) => {
    const schema = zod_1.z.object({
        title: zod_1.z.string().min(1),
        description: zod_1.z.string().optional(),
        sprint: zod_1.z.string().optional(),
        assignees: zod_1.z.array(zod_1.z.string()).optional(),
        priority: zod_1.z.enum(['low', 'medium', 'high']).optional(),
        estimate: zod_1.z.number().optional(),
    });
    const validation = schema.safeParse(req.body);
    if (!validation.success) {
        res.status(400);
        throw new Error(validation.error.issues[0].message);
    }
    const { title, description, sprint, assignees, priority, estimate } = req.body;
    const projectId = req.params.projectId;
    const project = await project_model_1.default.findById(projectId);
    if (!project) {
        res.status(404);
        throw new Error('Project not found');
    }
    const task = new task_model_1.default({
        title,
        description,
        project: projectId,
        sprint,
        assignees: assignees || [],
        priority: priority || 'medium',
        estimate: estimate || 0,
    });
    const createdTask = await task.save();
    res.status(201).json(createdTask);
};
exports.createTask = createTask;
// @desc    Update a task
// @route   PUT /api/tasks/:id
// @access  Private
const updateTask = async (req, res) => {
    const task = await task_model_1.default.findById(req.params.id);
    if (task) {
        task.title = req.body.title || task.title;
        task.description = req.body.description || task.description;
        task.sprint = req.body.sprint || task.sprint;
        task.assignees = req.body.assignees || task.assignees;
        task.priority = req.body.priority || task.priority;
        task.status = req.body.status || task.status;
        task.estimate = req.body.estimate || task.estimate;
        task.timeLogged = req.body.timeLogged || task.timeLogged;
        task.subtasks = req.body.subtasks || task.subtasks;
        const updatedTask = await task.save();
        res.json(updatedTask);
    }
    else {
        res.status(404);
        throw new Error('Task not found');
    }
};
exports.updateTask = updateTask;
// @desc    Delete a task
// @route   DELETE /api/tasks/:id
// @access  Private
const deleteTask = async (req, res) => {
    const task = await task_model_1.default.findById(req.params.id);
    if (task) {
        await task.deleteOne();
        res.json({ message: 'Task removed' });
    }
    else {
        res.status(404);
        throw new Error('Task not found');
    }
};
exports.deleteTask = deleteTask;
