import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/user.model';
import Project from './models/project.model';
import Sprint from './models/sprint.model';
import Task from './models/task.model';
import connectDB from './config/db';

dotenv.config();

connectDB();

const importData = async () => {
    try {
        await User.deleteMany();
        await Project.deleteMany();
        await Sprint.deleteMany();
        await Task.deleteMany();

        const users = await User.create([
            {
                name: 'Admin User',
                email: 'admin@datapollax.com',
                password: 'password123',
                role: 'admin',
            },
            {
                name: 'Manager User',
                email: 'manager@datapollax.com',
                password: 'password123',
                role: 'manager',
            },
            {
                name: 'Member User',
                email: 'member@datapollax.com',
                password: 'password123',
                role: 'member',
            },
        ]);

        const admin = users[0]._id;
        const manager = users[1]._id;
        const member = users[2]._id;

        const project = await Project.create({
            name: 'MPMS Development',
            description: 'Building the Minimal Project Management System',
            owner: manager,
            members: [member],
            startDate: new Date(),
            endDate: new Date(new Date().setMonth(new Date().getMonth() + 1)),
        } as any) as any;

        const sprint = await Sprint.create({
            name: 'Sprint 1',
            startDate: new Date(),
            endDate: new Date(new Date().setDate(new Date().getDate() + 14)),
            project: project._id,
            sprintNumber: 1,
            status: 'active',
        });

        await Task.create({
            title: 'Setup Backend',
            description: 'Initialize Express and Mongoose',
            project: project._id,
            sprint: sprint._id,
            assignees: [member],
            priority: 'high',
            status: 'in-progress',
            estimate: 4,
        } as any) as any;

        console.log('Data Imported!');
        process.exit();
    } catch (error) {
        console.error(`${error}`);
        process.exit(1);
    }
};

const destroyData = async () => {
    try {
        await User.deleteMany();
        await Project.deleteMany();
        await Sprint.deleteMany();
        await Task.deleteMany();

        console.log('Data Destroyed!');
        process.exit();
    } catch (error) {
        console.error(`${error}`);
        process.exit(1);
    }
};

if (process.argv[2] === '-d') {
    destroyData();
} else {
    importData();
}
