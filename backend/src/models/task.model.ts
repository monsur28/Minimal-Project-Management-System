import mongoose, { Document, Schema } from 'mongoose';

export interface ITask extends Document {
    title: string;
    description: string;
    project: mongoose.Types.ObjectId;
    sprint?: mongoose.Types.ObjectId;
    assignees: mongoose.Types.ObjectId[];
    priority: 'low' | 'medium' | 'high';
    status: 'todo' | 'in-progress' | 'review' | 'done';
    estimate: number; // in hours
    timeLogged: number; // in hours
    dueDate?: Date;
    attachments: string[];
    subtasks: { title: string; completed: boolean }[];
}

const taskSchema = new Schema<ITask>(
    {
        title: { type: String, required: true },
        description: { type: String },
        project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
        sprint: { type: mongoose.Schema.Types.ObjectId, ref: 'Sprint' },
        assignees: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
        priority: {
            type: String,
            enum: ['low', 'medium', 'high'],
            default: 'medium',
        },
        status: {
            type: String,
            enum: ['todo', 'in-progress', 'review', 'done'],
            default: 'todo',
        },
        estimate: { type: Number, default: 0 },
        timeLogged: { type: Number, default: 0 },
        dueDate: { type: Date },
        attachments: [{ type: String }],
        subtasks: [
            {
                title: { type: String, required: true },
                completed: { type: Boolean, default: false },
            },
        ],
    },
    {
        timestamps: true,
    }
);

const Task = mongoose.model<ITask>('Task', taskSchema);
export default Task;
