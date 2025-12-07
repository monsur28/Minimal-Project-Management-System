import { Request, Response } from 'express';
import User from '../models/user.model';

// @desc    Get all users
// @route   GET /api/users
// @access  Private (Admin)
export const getUsers = async (req: Request, res: Response) => {
    const users = await User.find({}).select('-password');
    res.json(users);
};

// @desc    Create a new user (Test credentials flow)
// @route   POST /api/users
// @access  Private (Admin)
export const createUser = async (req: Request, res: Response) => {
    const { name, email, role, department, skills, password } = req.body;

    const userExists = await User.findOne({ email });

    if (userExists) {
        res.status(400);
        throw new Error('User already exists');
    }

    const user = await User.create({
        name,
        email,
        password: password || '123456', // Default password if not provided
        role: role || 'member',
        department: department || 'Engineering',
        skills: skills || [],
    });

    if (user) {
        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            department: user.department,
            skills: user.skills,
        });
    } else {
        res.status(400);
        throw new Error('Invalid user data');
    }
};

// @desc    Update user details (Role, Department, Skills)
// @route   PUT /api/users/:id
// @access  Private (Admin)
export const updateUser = async (req: Request, res: Response) => {
    const user = await User.findById(req.params.id);

    if (user) {
        user.name = req.body.name || user.name;
        user.email = req.body.email || user.email;
        user.role = req.body.role || user.role;
        user.department = req.body.department || user.department;
        user.skills = req.body.skills || user.skills; // Expecting array of strings

        if (req.body.password) {
            user.password = req.body.password;
        }

        const updatedUser = await user.save();

        res.json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            role: updatedUser.role,
            department: updatedUser.department,
            skills: updatedUser.skills,
        });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private (Admin)
export const deleteUser = async (req: Request, res: Response) => {
    const user = await User.findById(req.params.id);

    if (user) {
        await user.deleteOne();
        res.json({ message: 'User removed' });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
};
// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
export const getUserProfile = async (req: Request, res: Response) => {
    const user = await User.findById(req.user?._id);

    if (user) {
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            department: user.department,
            skills: user.skills,
        });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
};

// @desc    Update user profile (Name, Email, Password)
// @route   PUT /api/users/profile
// @access  Private
export const updateUserProfile = async (req: Request, res: Response) => {
    const user = await User.findById(req.user?._id);

    if (user) {
        user.name = req.body.name || user.name;
        user.email = req.body.email || user.email;

        if (req.body.password) {
            user.password = req.body.password;
        }

        const updatedUser = await user.save();

        res.json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            role: updatedUser.role,
            department: updatedUser.department,
            skills: updatedUser.skills,
        });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
};
