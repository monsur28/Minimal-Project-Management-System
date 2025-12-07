"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createComment = exports.getComments = void 0;
const comment_model_1 = __importDefault(require("../models/comment.model"));
const task_model_1 = __importDefault(require("../models/task.model"));
const zod_1 = require("zod");
// @desc    Get comments for a task
// @route   GET /api/tasks/:taskId/comments
// @access  Private
const getComments = async (req, res) => {
    const comments = await comment_model_1.default.find({ task: req.params.taskId })
        .populate('user', 'name email')
        .sort({ createdAt: -1 });
    res.json(comments);
};
exports.getComments = getComments;
// @desc    Add a comment to a task
// @route   POST /api/tasks/:taskId/comments
// @access  Private
const createComment = async (req, res) => {
    const schema = zod_1.z.object({
        content: zod_1.z.string().min(1),
    });
    const validation = schema.safeParse(req.body);
    if (!validation.success) {
        res.status(400);
        throw new Error(validation.error.issues[0].message);
    }
    const { content } = req.body;
    const taskId = req.params.taskId;
    const task = await task_model_1.default.findById(taskId);
    if (!task) {
        res.status(404);
        throw new Error('Task not found');
    }
    const comment = await comment_model_1.default.create({
        content,
        task: taskId,
        user: req.user?._id,
    });
    const populatedComment = await comment.populate('user', 'name email');
    res.status(201).json(populatedComment);
};
exports.createComment = createComment;
