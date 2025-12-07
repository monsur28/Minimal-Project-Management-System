"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteProject = exports.updateProject = exports.createProject = exports.getProjectById = exports.getProjects = void 0;
const project_model_1 = __importDefault(require("../models/project.model"));
const zod_1 = require("zod");
// @desc    Get all projects
// @route   GET /api/projects
// @access  Private
const getProjects = async (req, res) => {
    const projects = await project_model_1.default.find({
        $or: [{ owner: req.user?._id }, { members: req.user?._id }],
    }).populate('owner', 'name email').populate('members', 'name email');
    res.json(projects);
};
exports.getProjects = getProjects;
// @desc    Get single project
// @route   GET /api/projects/:id
// @access  Private
const getProjectById = async (req, res) => {
    const project = await project_model_1.default.findById(req.params.id)
        .populate('owner', 'name email')
        .populate('members', 'name email');
    if (project) {
        // Check if user is owner or member
        const isMember = project.members.some((member) => member._id.toString() === req.user?._id.toString());
        const isOwner = project.owner._id.toString() === req.user?._id.toString();
        if (isMember || isOwner || req.user?.role === 'admin') {
            res.json(project);
        }
        else {
            res.status(401);
            throw new Error('Not authorized to view this project');
        }
    }
    else {
        res.status(404);
        throw new Error('Project not found');
    }
};
exports.getProjectById = getProjectById;
// @desc    Create a project
// @route   POST /api/projects
// @access  Private (Manager/Admin)
const createProject = async (req, res) => {
    const schema = zod_1.z.object({
        name: zod_1.z.string().min(1),
        description: zod_1.z.string().optional(),
        members: zod_1.z.array(zod_1.z.string()).optional(),
        startDate: zod_1.z.string().optional(),
        endDate: zod_1.z.string().optional(),
    });
    const validation = schema.safeParse(req.body);
    if (!validation.success) {
        res.status(400);
        throw new Error(validation.error.issues[0].message);
    }
    const { name, description, members, startDate, endDate } = req.body;
    const project = await project_model_1.default.create({
        name,
        description,
        owner: req.user?._id,
        members: members || [],
        startDate,
        endDate,
    });
    res.status(201).json(project);
};
exports.createProject = createProject;
// @desc    Update a project
// @route   PUT /api/projects/:id
// @access  Private (Owner/Admin)
const updateProject = async (req, res) => {
    const project = await project_model_1.default.findById(req.params.id);
    if (project) {
        if (project.owner.toString() !== req.user?._id.toString() &&
            req.user?.role !== 'admin') {
            res.status(401);
            throw new Error('Not authorized to update this project');
        }
        project.name = req.body.name || project.name;
        project.description = req.body.description || project.description;
        project.members = req.body.members || project.members;
        project.status = req.body.status || project.status;
        project.startDate = req.body.startDate || project.startDate;
        project.endDate = req.body.endDate || project.endDate;
        const updatedProject = await project.save();
        res.json(updatedProject);
    }
    else {
        res.status(404);
        throw new Error('Project not found');
    }
};
exports.updateProject = updateProject;
// @desc    Delete a project
// @route   DELETE /api/projects/:id
// @access  Private (Owner/Admin)
const deleteProject = async (req, res) => {
    const project = await project_model_1.default.findById(req.params.id);
    if (project) {
        if (project.owner.toString() !== req.user?._id.toString() &&
            req.user?.role !== 'admin') {
            res.status(401);
            throw new Error('Not authorized to delete this project');
        }
        await project.deleteOne();
        res.json({ message: 'Project removed' });
    }
    else {
        res.status(404);
        throw new Error('Project not found');
    }
};
exports.deleteProject = deleteProject;
