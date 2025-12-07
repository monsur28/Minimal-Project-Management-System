'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Calendar, Circle, CheckCircle2, MessageSquare, Clock, Send, User } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';

interface Task {
    _id: string;
    title: string;
    description: string;
    status: string;
    priority: string;
    estimate: number;
    timeLogged: number;
    assignees: { _id: string; name: string }[];
    dueDate?: string;
    project: { _id: string; name: string };
    sprint?: { name: string };
}

interface Comment {
    _id: string;
    content: string;
    user: { _id: string; name: string };
    createdAt: string;
}

interface Activity {
    _id: string;
    action: string;
    details?: string;
    user: { name: string };
    createdAt: string;
}

export default function TaskDetailsPage() {
    const params = useParams();
    const taskId = params.id as string;
    const router = useRouter();
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const [newComment, setNewComment] = useState('');

    // Queries
    const { data: task, isLoading: loadingTask } = useQuery<Task>({
        queryKey: ['task', taskId],
        queryFn: async () => (await api.get(`/tasks/${taskId}`)).data
    });

    const { data: comments, isLoading: loadingComments } = useQuery<Comment[]>({
        queryKey: ['task-comments', taskId],
        queryFn: async () => (await api.get(`/tasks/${taskId}/comments`)).data
    });

    const { data: activities, isLoading: loadingActivities } = useQuery<Activity[]>({
        queryKey: ['task-activities', taskId],
        queryFn: async () => (await api.get(`/tasks/${taskId}/activities`)).data
    });

    // Mutations
    const commentMutation = useMutation({
        mutationFn: async (content: string) => {
            await api.post(`/tasks/${taskId}/comments`, { content });
        },
        onSuccess: () => {
            setNewComment('');
            queryClient.invalidateQueries({ queryKey: ['task-comments', taskId] });
        }
    });

    if (loadingTask) return <div className="text-center py-12 text-slate-500">Loading task...</div>;
    if (!task) return <div>Task not found</div>;

    const handleDataSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (newComment.trim()) {
            commentMutation.mutate(newComment);
        }
    };

    return (
        <div className="space-y-8 max-w-4xl mx-auto">
            <Button variant="ghost" onClick={() => router.back()} className="text-slate-400 hover:text-white pl-0 gap-2">
                <ArrowLeft className="w-4 h-4" /> Back to Project
            </Button>

            <div className="grid md:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="md:col-span-2 space-y-8">
                    {/* Header */}
                    <div>
                        <div className="flex items-center gap-3 mb-4 text-sm text-slate-500">
                            <span className="text-indigo-400 font-medium">{task.project.name}</span>
                            {task.sprint && (
                                <>
                                    <span>/</span>
                                    <span>{task.sprint.name}</span>
                                </>
                            )}
                        </div>
                        <h1 className="text-2xl font-bold text-white mb-4">{task.title}</h1>
                        <div className="flex flex-wrap gap-2">
                            <span className={`px-2 py-1 rounded text-xs uppercase font-bold tracking-wider ${task.status === 'done' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-blue-500/10 text-blue-400'
                                }`}>
                                {task.status}
                            </span>
                            <span className={`px-2 py-1 rounded text-xs uppercase font-bold tracking-wider ${task.priority === 'high' ? 'bg-red-500/10 text-red-400' : 'bg-slate-700/50 text-slate-400'
                                }`}>
                                {task.priority} Priority
                            </span>
                        </div>
                    </div>

                    {/* Description */}
                    <div className="bg-slate-900/50 p-6 rounded-xl border border-white/10">
                        <h3 className="text-sm font-medium text-slate-400 mb-3">Description</h3>
                        <p className="text-slate-200 leading-relaxed whitespace-pre-wrap">
                            {task.description || "No description provided."}
                        </p>
                    </div>

                    {/* Comments */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                            <MessageSquare className="w-5 h-5 text-indigo-400" />
                            Comments
                        </h3>

                        <div className="space-y-4">
                            {comments?.map(comment => (
                                <div key={comment._id} className="flex gap-4 p-4 rounded-xl bg-slate-900/30 border border-white/5">
                                    <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold text-xs shrink-0">
                                        {comment.user.name.charAt(0)}
                                    </div>
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-medium text-white">{comment.user.name}</span>
                                            <span className="text-xs text-slate-500">{format(new Date(comment.createdAt), 'MMM d, h:mm a')}</span>
                                        </div>
                                        <p className="text-sm text-slate-300">{comment.content}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <form onSubmit={handleDataSubmit} className="flex gap-4">
                            <Textarea
                                placeholder="Write a comment..."
                                className="bg-slate-900/50 border-white/10 text-white min-h-[80px]"
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                            />
                            <Button
                                type="submit"
                                disabled={commentMutation.isPending || !newComment.trim()}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white shrink-0"
                            >
                                <Send className="w-4 h-4" />
                            </Button>
                        </form>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Activity Log */}
                    <Card className="bg-slate-900/50 border-white/10">
                        <CardContent className="p-4 space-y-4">
                            <h3 className="text-sm font-medium text-slate-400 flex items-center gap-2">
                                <Clock className="w-4 h-4" />
                                Activity Log
                            </h3>
                            <div className="space-y-4 relative before:absolute before:left-1.5 before:top-2 before:bottom-0 before:w-px before:bg-white/5">
                                {activities?.map(activity => (
                                    <div key={activity._id} className="relative pl-6">
                                        <div className="absolute left-0 top-1 w-3 h-3 rounded-full bg-slate-800 border-2 border-slate-600"></div>
                                        <p className="text-xs text-slate-300">
                                            <span className="font-semibold text-white">{activity.user.name}</span> {activity.details || activity.action}
                                        </p>
                                        <p className="text-[10px] text-slate-500 mt-0.5">
                                            {format(new Date(activity.createdAt), 'MMM d, h:mm a')}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Details Sidebar */}
                    <Card className="bg-slate-900/50 border-white/10">
                        <CardContent className="p-4 space-y-4">
                            <div>
                                <h3 className="text-xs font-medium text-slate-500 uppercase mb-2">Assignees</h3>
                                <div className="flex flex-wrap gap-2">
                                    {task.assignees.map(u => (
                                        <div key={u._id} className="flex items-center gap-2 bg-white/5 px-2 py-1 rounded-lg text-xs text-slate-200">
                                            <div className="w-4 h-4 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-[10px]">
                                                {u.name.charAt(0)}
                                            </div>
                                            {u.name}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {task.dueDate && (
                                <div>
                                    <h3 className="text-xs font-medium text-slate-500 uppercase mb-2">Due Date</h3>
                                    <div className="flex items-center gap-2 text-sm text-slate-300">
                                        <Calendar className="w-4 h-4 text-slate-500" />
                                        {format(new Date(task.dueDate), 'MMM d, yyyy')}
                                    </div>
                                </div>
                            )}

                            <div>
                                <h3 className="text-xs font-medium text-slate-500 uppercase mb-2">Estimate</h3>
                                <p className="text-sm text-slate-300">{task.estimate} hours</p>
                            </div>

                            <div>
                                <h3 className="text-xs font-medium text-slate-500 uppercase mb-2">Time Logged</h3>
                                <p className="text-sm text-slate-300">{task.timeLogged} hours</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
