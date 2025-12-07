import mongoose, { Document, Schema } from 'mongoose';

export interface ISprint extends Document {
    name: string;
    startDate: Date;
    endDate: Date;
    status: 'planned' | 'active' | 'completed';
    project: mongoose.Types.ObjectId;
    sprintNumber: number;
}

const sprintSchema = new Schema<ISprint>(
    {
        name: { type: String, required: true },
        startDate: { type: Date, required: true },
        endDate: { type: Date, required: true },
        status: {
            type: String,
            enum: ['planned', 'active', 'completed'],
            default: 'planned',
        },
        project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
        sprintNumber: { type: Number, required: true },
    },
    {
        timestamps: true,
    }
);

// Compound index to ensure unique sprint numbers per project
sprintSchema.index({ project: 1, sprintNumber: 1 }, { unique: true });

const Sprint = mongoose.model<ISprint>('Sprint', sprintSchema);
export default Sprint;
