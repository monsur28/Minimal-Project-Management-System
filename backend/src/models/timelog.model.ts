import mongoose, { Document, Schema } from 'mongoose';

export interface ITimeLog extends Document {
    task: mongoose.Types.ObjectId;
    user: mongoose.Types.ObjectId;
    startTime: Date;
    endTime?: Date;
    duration: number; // in seconds
}

const timeLogSchema = new Schema<ITimeLog>(
    {
        task: { type: mongoose.Schema.Types.ObjectId, ref: 'Task', required: true },
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        startTime: { type: Date, required: true },
        endTime: { type: Date },
        duration: { type: Number, default: 0 },
    },
    {
        timestamps: true,
    }
);

const TimeLog = mongoose.model<ITimeLog>('TimeLog', timeLogSchema);
export default TimeLog;
