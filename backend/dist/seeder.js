"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const user_model_1 = __importDefault(require("./models/user.model"));
const project_model_1 = __importDefault(require("./models/project.model"));
const sprint_model_1 = __importDefault(require("./models/sprint.model"));
const task_model_1 = __importDefault(require("./models/task.model"));
const db_1 = __importDefault(require("./config/db"));
dotenv_1.default.config();
(0, db_1.default)();
const importData = async () => {
    try {
        await user_model_1.default.deleteMany();
        await project_model_1.default.deleteMany();
        await sprint_model_1.default.deleteMany();
        await task_model_1.default.deleteMany();
        const users = await user_model_1.default.create([
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
        const project = await project_model_1.default.create({
            name: 'MPMS Development',
            description: 'Building the Minimal Project Management System',
            owner: manager,
            members: [member],
            startDate: new Date(),
            endDate: new Date(new Date().setMonth(new Date().getMonth() + 1)),
        });
        const sprint = await sprint_model_1.default.create({
            name: 'Sprint 1',
            startDate: new Date(),
            endDate: new Date(new Date().setDate(new Date().getDate() + 14)),
            project: project._id,
            sprintNumber: 1,
            status: 'active',
        });
        await task_model_1.default.create({
            title: 'Setup Backend',
            description: 'Initialize Express and Mongoose',
            project: project._id,
            sprint: sprint._id,
            assignees: [member],
            priority: 'high',
            status: 'in-progress',
            estimate: 4,
        });
        console.log('Data Imported!');
        process.exit();
    }
    catch (error) {
        console.error(`${error}`);
        process.exit(1);
    }
};
const destroyData = async () => {
    try {
        await user_model_1.default.deleteMany();
        await project_model_1.default.deleteMany();
        await sprint_model_1.default.deleteMany();
        await task_model_1.default.deleteMany();
        console.log('Data Destroyed!');
        process.exit();
    }
    catch (error) {
        console.error(`${error}`);
        process.exit(1);
    }
};
if (process.argv[2] === '-d') {
    destroyData();
}
else {
    importData();
}
