import mongoose, { Document, Schema } from 'mongoose';

export interface IProject extends Document {
    name: string;
    description: string;
    owner: mongoose.Types.ObjectId;
    members: mongoose.Types.ObjectId[];
    status: 'planned' | 'active' | 'completed' | 'archived';
    startDate: Date;
    endDate: Date;
    client: string;
    budget: number;
    thumbnail: string;
}

const projectSchema = new Schema<IProject>(
    {
        name: { type: String, required: true },
        description: { type: String },
        owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
        status: {
            type: String,
            enum: ['planned', 'active', 'completed', 'archived'],
            default: 'planned',
        },
        startDate: { type: Date },
        endDate: { type: Date },
        client: { type: String, default: '' },
        budget: { type: Number, default: 0 },
        thumbnail: { type: String, default: '' },
    },
    {
        timestamps: true,
    }
);

const Project = mongoose.model<IProject>('Project', projectSchema);
export default Project;
