'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import api from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { Calendar, ChevronLeft, Flag, Clock, User, CheckCircle2, Circle, Paperclip } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { TaskComments } from '@/components/tasks/TaskComments';

export default function EditTaskPage() {
    const { id, taskId } = useParams();
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        status: 'todo',
        priority: 'medium',
        estimate: 0,
        dueDate: '',
        assignees: [] as string[],
        subtasks: [] as { title: string; completed: boolean }[],
        attachments: [] as string[],
    });

    const { data: task, isLoading: taskLoading, isError } = useQuery({
        queryKey: ['task', taskId],
        queryFn: async () => {
            const { data } = await api.get(`/tasks/${taskId}`);
            return data;
        },
        enabled: !!taskId,
    });

    const { data: project } = useQuery({
        queryKey: ['project', id],
        queryFn: async () => {
            const { data } = await api.get(`/projects/${id}`);
            return data;
        },
        enabled: !!id,
    });

    useEffect(() => {
        if (task) {
            try {
                setFormData({
                    title: task.title || '',
                    description: task.description || '',
                    status: task.status || 'todo',
                    priority: task.priority || 'medium',
                    estimate: task.estimate || 0,
                    dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
                    assignees: task.assignees?.map((u: any) => u._id) || [],
                    subtasks: task.subtasks || [],
                    attachments: task.attachments || [],
                });
            } catch (err) {
                console.error("Error setting form data:", err);
            }
        }
    }, [task]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.put(`/tasks/${taskId}`, formData);
            router.push(`/dashboard/projects/${id}`);
        } catch (error) {
            console.error('Failed to update task', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (confirm('Are you sure you want to delete this task?')) {
            try {
                await api.delete(`/tasks/${taskId}`);
                router.push(`/dashboard/projects/${id}`);
            } catch (error) {
                console.error('Failed to delete task', error);
            }
        }
    };

    if (taskLoading) {
        return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-500">Loading task...</div>;
    }

    if (isError) {
        return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-red-500">Error loading task. Please try again or check the ID.</div>;
    }

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-2xl space-y-4"
            >
                <div className="flex justify-between items-center">
                    <Button
                        variant="ghost"
                        className="text-slate-400 hover:text-white pl-0 gap-2"
                        onClick={() => router.back()}
                    >
                        <ChevronLeft className="w-4 h-4" />
                        Back to Board
                    </Button>
                    <Button
                        variant="ghost"
                        className="text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 gap-2"
                        onClick={handleDelete}
                    >
                        Delete Task
                    </Button>
                </div>

                <Card className="bg-slate-900 border-white/10 shadow-xl overflow-hidden relative">
                    <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${formData.priority === 'high' ? 'from-rose-500 to-orange-500' :
                        formData.priority === 'medium' ? 'from-amber-500 to-yellow-500' :
                            'from-emerald-500 to-teal-500'
                        }`} />
                    <CardHeader>
                        <CardTitle className="text-2xl text-white">Edit Task</CardTitle>
                        <CardDescription className="text-slate-400">
                            Update task details and progress.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-300">Task Title</label>
                                    <Input
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        className="bg-black/20 border-white/10 text-white focus:border-indigo-500/50"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-300">Description</label>
                                    <Textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        className="bg-black/20 border-white/10 text-white focus:border-indigo-500/50 min-h-[100px]"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                                            <Flag className="w-4 h-4 text-slate-400" />
                                            Priority
                                        </label>
                                        <select
                                            value={formData.priority}
                                            onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                                            className="flex h-10 w-full rounded-md border border-white/10 bg-black/20 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/50"
                                        >
                                            <option value="low" className="bg-slate-900">Low</option>
                                            <option value="medium" className="bg-slate-900">Medium</option>
                                            <option value="high" className="bg-slate-900">High</option>
                                        </select>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                                            {formData.status === 'done' ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Circle className="w-4 h-4 text-slate-400" />}
                                            Status
                                        </label>
                                        <select
                                            value={formData.status}
                                            onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                                            className="flex h-10 w-full rounded-md border border-white/10 bg-black/20 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/50"
                                        >
                                            <option value="todo" className="bg-slate-900">To Do</option>
                                            <option value="in-progress" className="bg-slate-900">In Progress</option>
                                            <option value="review" className="bg-slate-900">Review</option>
                                            <option value="done" className="bg-slate-900">Done</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                                            <Clock className="w-4 h-4 text-slate-400" />
                                            Estimate (Hours)
                                        </label>
                                        <Input
                                            type="number"
                                            value={formData.estimate}
                                            onChange={(e) => setFormData({ ...formData, estimate: Number(e.target.value) })}
                                            className="bg-black/20 border-white/10 text-white focus:border-indigo-500/50"
                                            min="0"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                                            <Calendar className="w-4 h-4 text-slate-400" />
                                            Due Date
                                        </label>
                                        <Input
                                            type="date"
                                            value={formData.dueDate}
                                            onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                                            className="bg-black/20 border-white/10 text-white focus:border-indigo-500/50 [color-scheme:dark]"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Assignees Section */}
                            <div className="grid grid-cols-1 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                                        <User className="w-4 h-4 text-slate-400" />
                                        Assignees
                                    </label>
                                    <div className="flex flex-wrap gap-2 mb-2">
                                        {formData.assignees.map(userId => {
                                            const member = project?.members?.find((m: any) => m._id === userId);
                                            return (
                                                <span key={userId} className="inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                                                    {member?.name || userId}
                                                    <button
                                                        type="button"
                                                        onClick={() => setFormData({
                                                            ...formData,
                                                            assignees: formData.assignees.filter(id => id !== userId)
                                                        })}
                                                        className="hover:text-white"
                                                    >
                                                        &times;
                                                    </button>
                                                </span>
                                            );
                                        })}
                                    </div>
                                    <select
                                        onChange={(e) => {
                                            if (e.target.value && !formData.assignees.includes(e.target.value)) {
                                                setFormData({
                                                    ...formData,
                                                    assignees: [...formData.assignees, e.target.value]
                                                });
                                            }
                                        }}
                                        className="flex h-10 w-full rounded-md border border-white/10 bg-black/20 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/50"
                                        value=""
                                    >
                                        <option value="">+ Add Assignee</option>
                                        {project?.members?.map((member: any) => (
                                            <option key={member._id} value={member._id}>
                                                {member.name} ({member.email})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Attachments Section */}
                            <div className="space-y-3 pt-4 border-t border-white/10">
                                <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                                    <Paperclip className="w-4 h-4 text-slate-400" />
                                    Attachments
                                </label>
                                <div className="space-y-2">
                                    {(formData.attachments || []).map((attachment, index) => (
                                        <div key={index} className="flex items-center gap-2">
                                            <div className="flex-1 h-8 bg-black/20 border border-white/10 rounded px-3 flex items-center text-sm text-slate-300 truncate">
                                                {attachment.split('/').pop()}
                                            </div>
                                            <Button
                                                asChild
                                                variant="ghost"
                                                size="sm"
                                                className="h-8 text-slate-500 hover:text-white"
                                            >
                                                <a href={`http://localhost:5000${attachment}`} target="_blank" rel="noreferrer">Open</a>
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => {
                                                    const newAttachments = formData.attachments.filter((_, i) => i !== index);
                                                    setFormData({ ...formData, attachments: newAttachments });
                                                }}
                                                className="h-8 w-8 text-slate-500 hover:text-rose-400"
                                            >
                                                &times;
                                            </Button>
                                        </div>
                                    ))}

                                    <div className="flex items-center gap-2 mt-2">
                                        <Input
                                            type="file"
                                            className="file:bg-indigo-600 file:border-0 file:text-white file:mr-4 file:px-4 file:py-2 file:rounded-md file:text-sm hover:file:bg-indigo-700 bg-black/20 text-slate-300"
                                            onChange={async (e) => {
                                                if (e.target.files?.[0]) {
                                                    const file = e.target.files[0];
                                                    const formData = new FormData();
                                                    formData.append('file', file);

                                                    try {
                                                        const { data: url } = await api.post('/upload', formData, {
                                                            headers: { 'Content-Type': 'multipart/form-data' }
                                                        });
                                                        setFormData(prev => ({
                                                            ...prev,
                                                            attachments: [...prev.attachments, url]
                                                        }));
                                                    } catch (err) {
                                                        console.error('Upload failed', err);
                                                        alert('Upload failed');
                                                    }
                                                }
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Subtasks Section */}
                            <div className="space-y-3 pt-4 border-t border-white/10">
                                <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-slate-400" />
                                    Subtasks
                                </label>
                                <div className="space-y-2">
                                    {(formData.subtasks || []).map((subtask, index) => (
                                        <div key={index} className="flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                checked={subtask.completed}
                                                onChange={(e) => {
                                                    const newSubtasks = [...formData.subtasks];
                                                    newSubtasks[index].completed = e.target.checked;
                                                    setFormData({ ...formData, subtasks: newSubtasks });
                                                }}
                                                className="rounded border-slate-600 bg-black/20 text-indigo-500 focus:ring-indigo-500/20"
                                            />
                                            <Input
                                                value={subtask.title}
                                                onChange={(e) => {
                                                    const newSubtasks = [...formData.subtasks];
                                                    newSubtasks[index].title = e.target.value;
                                                    setFormData({ ...formData, subtasks: newSubtasks });
                                                }}
                                                className="flex-1 h-8 bg-black/20 border-white/10 text-white focus:border-indigo-500/50 text-sm"
                                                placeholder="Subtask title..."
                                            />
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => {
                                                    const newSubtasks = formData.subtasks.filter((_, i) => i !== index);
                                                    setFormData({ ...formData, subtasks: newSubtasks });
                                                }}
                                                className="h-8 w-8 text-slate-500 hover:text-rose-400"
                                            >
                                                &times;
                                            </Button>
                                        </div>
                                    ))}
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setFormData({
                                            ...formData,
                                            subtasks: [...(formData.subtasks || []), { title: '', completed: false }]
                                        })}
                                        className="mt-2 text-xs border-dashed border-slate-600 text-slate-400 hover:text-white hover:bg-white/5"
                                    >
                                        + Add Subtask
                                    </Button>
                                </div>
                            </div>

                            <Button
                                type="submit"
                                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
                                disabled={loading}
                            >
                                {loading ? 'Saving Changes...' : 'Save Changes'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Comments Section for Admin */}
                <Card className="bg-slate-900 border-white/10 shadow-xl overflow-hidden">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-xl text-white">Task Discussion</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="h-[400px]">
                            <TaskComments taskId={taskId as string} />
                        </div>
                    </CardContent>
                </Card>

            </motion.div>
        </div >
    );
}
