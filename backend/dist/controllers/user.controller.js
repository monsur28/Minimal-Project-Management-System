"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUser = exports.updateUserRole = exports.getUsers = void 0;
const user_model_1 = __importDefault(require("../models/user.model"));
// @desc    Get all users
// @route   GET /api/users
// @access  Private (Admin)
const getUsers = async (req, res) => {
    const users = await user_model_1.default.find({}).select('-password');
    res.json(users);
};
exports.getUsers = getUsers;
// @desc    Update user role
// @route   PUT /api/users/:id
// @access  Private (Admin)
const updateUserRole = async (req, res) => {
    const user = await user_model_1.default.findById(req.params.id);
    if (user) {
        user.role = req.body.role || user.role;
        const updatedUser = await user.save();
        res.json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            role: updatedUser.role,
        });
    }
    else {
        res.status(404);
        throw new Error('User not found');
    }
};
exports.updateUserRole = updateUserRole;
// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private (Admin)
const deleteUser = async (req, res) => {
    const user = await user_model_1.default.findById(req.params.id);
    if (user) {
        await user.deleteOne();
        res.json({ message: 'User removed' });
    }
    else {
        res.status(404);
        throw new Error('User not found');
    }
};
exports.deleteUser = deleteUser;
