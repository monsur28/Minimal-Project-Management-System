import mongoose, { Document, Schema } from 'mongoose';

export interface IComment extends Document {
    content: string;
    task: mongoose.Types.ObjectId;
    user: mongoose.Types.ObjectId;
}

const commentSchema = new Schema<IComment>(
    {
        content: { type: String, required: true },
        task: { type: mongoose.Schema.Types.ObjectId, ref: 'Task', required: true },
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    },
    {
        timestamps: true,
    }
);

const Comment = mongoose.model<IComment>('Comment', commentSchema);
export default Comment;
