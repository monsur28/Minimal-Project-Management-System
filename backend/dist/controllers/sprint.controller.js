"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteSprint = exports.updateSprint = exports.createSprint = exports.getSprints = void 0;
const sprint_model_1 = __importDefault(require("../models/sprint.model"));
const project_model_1 = __importDefault(require("../models/project.model"));
const zod_1 = require("zod");
// @desc    Get all sprints for a project
// @route   GET /api/projects/:projectId/sprints
// @access  Private
const getSprints = async (req, res) => {
    const sprints = await sprint_model_1.default.find({ project: req.params.projectId });
    res.json(sprints);
};
exports.getSprints = getSprints;
// @desc    Create a sprint
// @route   POST /api/projects/:projectId/sprints
// @access  Private (Manager/Admin)
const createSprint = async (req, res) => {
    const schema = zod_1.z.object({
        name: zod_1.z.string().min(1),
        startDate: zod_1.z.string(),
        endDate: zod_1.z.string(),
    });
    const validation = schema.safeParse(req.body);
    if (!validation.success) {
        res.status(400);
        throw new Error(validation.error.issues[0].message);
    }
    const { name, startDate, endDate } = req.body;
    const projectId = req.params.projectId;
    const project = await project_model_1.default.findById(projectId);
    if (!project) {
        res.status(404);
        throw new Error('Project not found');
    }
    // Auto-increment sprint number
    const lastSprint = await sprint_model_1.default.findOne({ project: projectId }).sort({
        sprintNumber: -1,
    });
    const sprintNumber = lastSprint ? lastSprint.sprintNumber + 1 : 1;
    const sprint = await sprint_model_1.default.create({
        name,
        startDate,
        endDate,
        project: projectId,
        sprintNumber,
    });
    res.status(201).json(sprint);
};
exports.createSprint = createSprint;
// @desc    Update a sprint
// @route   PUT /api/sprints/:id
// @access  Private (Manager/Admin)
const updateSprint = async (req, res) => {
    const sprint = await sprint_model_1.default.findById(req.params.id);
    if (sprint) {
        sprint.name = req.body.name || sprint.name;
        sprint.startDate = req.body.startDate || sprint.startDate;
        sprint.endDate = req.body.endDate || sprint.endDate;
        sprint.status = req.body.status || sprint.status;
        const updatedSprint = await sprint.save();
        res.json(updatedSprint);
    }
    else {
        res.status(404);
        throw new Error('Sprint not found');
    }
};
exports.updateSprint = updateSprint;
// @desc    Delete a sprint
// @route   DELETE /api/sprints/:id
// @access  Private (Manager/Admin)
const deleteSprint = async (req, res) => {
    const sprint = await sprint_model_1.default.findById(req.params.id);
    if (sprint) {
        await sprint.deleteOne();
        res.json({ message: 'Sprint removed' });
    }
    else {
        res.status(404);
        throw new Error('Sprint not found');
    }
};
exports.deleteSprint = deleteSprint;
