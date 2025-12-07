import mongoose, { Document, Schema } from 'mongoose';

export interface IActivity extends Document {
    task: mongoose.Types.ObjectId;
    user: mongoose.Types.ObjectId;
    action: string;
    details?: string;
}

const activitySchema = new Schema<IActivity>(
    {
        task: { type: mongoose.Schema.Types.ObjectId, ref: 'Task', required: true },
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        action: { type: String, required: true },
        details: { type: String },
    },
    {
        timestamps: true,
    }
);

const Activity = mongoose.model<IActivity>('Activity', activitySchema);
export default Activity;
