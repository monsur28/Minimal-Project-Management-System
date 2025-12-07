"use client"

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import api from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Calendar, Clock, Flag, Layout, Type, ChevronLeft, Loader2, CheckCircle2 } from 'lucide-react';

export default function NewTaskPage() {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [sprintId, setSprintId] = useState('');
    const [priority, setPriority] = useState('medium');
    const [estimate, setEstimate] = useState(0);
    const [dueDate, setDueDate] = useState('');
    const [subtasks, setSubtasks] = useState<{ title: string; completed: boolean }[]>([]);
    const [assignees, setAssignees] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const router = useRouter();
    const { id } = useParams();

    const { data: project } = useQuery({
        queryKey: ['project', id],
        queryFn: async () => {
            const { data } = await api.get(`/projects/${id}`);
            return data;
        },
        enabled: !!id,
    });

    const { data: sprints } = useQuery({
        queryKey: ['sprints', id],
        queryFn: async () => {
            const { data } = await api.get(`/projects/${id}/sprints`);
            return data;
        },
        enabled: !!id,
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await api.post(`/projects/${id}/tasks`, {
                title,
                description,
                sprint: sprintId || undefined,
                priority,
                estimate,
                assignees,
                dueDate,
                subtasks,
            });
            router.push(`/dashboard/projects/${id}`);
        } catch (error) {
            console.error('Failed to create task', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-2xl"
            >
                <div className="mb-6">
                    <Button
                        variant="ghost"
                        onClick={() => router.back()}
                        className="text-slate-400 hover:text-white hover:bg-white/5 pl-0 gap-2"
                    >
                        <ChevronLeft className="w-4 h-4" />
                        Back to Project
                    </Button>
                </div>

                <Card className="border-white/10 bg-slate-900/50 backdrop-blur-xl shadow-2xl">
                    <CardHeader className="border-b border-white/5 pb-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-400">
                                <Layout className="w-6 h-6" />
                            </div>
                            <div>
                                <CardTitle className="text-2xl font-bold text-white">Create New Task</CardTitle>
                                <CardDescription className="text-slate-400">
                                    Add a new task to your project workflow
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-8">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Title Input */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                                    <Type className="w-4 h-4 text-indigo-400" />
                                    Task Title
                                </label>
                                <Input
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="e.g., Implement Authentication Flow"
                                    required
                                    className="bg-black/20 border-white/10 text-white placeholder:text-slate-500 focus:border-indigo-500/50 focus:ring-indigo-500/20"
                                />
                            </div>

                            {/* Description Input */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-300">Description</label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Describe the acceptance criteria and details..."
                                    className="flex min-h-[120px] w-full rounded-md border border-white/10 bg-black/20 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/50"
                                />
                            </div>

                            <div className="grid gap-6 md:grid-cols-2">
                                {/* Sprint Selection */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                                        <Calendar className="w-4 h-4 text-cyan-400" />
                                        Sprint (Optional)
                                    </label>
                                    <select
                                        className="flex h-10 w-full rounded-md border border-white/10 bg-black/20 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/50"
                                        value={sprintId}
                                        onChange={(e) => setSprintId(e.target.value)}
                                    >
                                        <option value="" className="bg-slate-900">Select Sprint</option>
                                        {sprints?.map((sprint: any) => (
                                            <option key={sprint._id} value={sprint._id} className="bg-slate-900">
                                                {sprint.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Priority Selection */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                                        <Flag className="w-4 h-4 text-rose-400" />
                                        Priority
                                    </label>
                                    <select
                                        className="flex h-10 w-full rounded-md border border-white/10 bg-black/20 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/50"
                                        value={priority}
                                        onChange={(e) => setPriority(e.target.value)}
                                    >
                                        <option value="low" className="bg-slate-900">Low Priority</option>
                                        <option value="medium" className="bg-slate-900">Medium Priority</option>
                                        <option value="high" className="bg-slate-900">High Priority</option>
                                    </select>
                                </div>
                            </div>

                            {/* Assignees Section */}
                            <div className="grid grid-cols-1 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                                        <Type className="w-4 h-4 text-slate-400" />
                                        Assignees
                                    </label>
                                    <div className="flex flex-wrap gap-2 mb-2">
                                        {assignees.map(userId => {
                                            const member = project?.members?.find((m: any) => m._id === userId);
                                            return (
                                                <span key={userId} className="inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                                                    {member?.name || userId}
                                                    <button
                                                        type="button"
                                                        onClick={() => setAssignees(assignees.filter(id => id !== userId))}
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
                                            if (e.target.value && !assignees.includes(e.target.value)) {
                                                setAssignees([...assignees, e.target.value]);
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

                            {/* Subtasks Section */}
                            <div className="space-y-3 pt-4 border-t border-white/10">
                                <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-slate-400" />
                                    Subtasks
                                </label>
                                <div className="space-y-2">
                                    {subtasks.map((subtask, index) => (
                                        <div key={index} className="flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                checked={subtask.completed}
                                                onChange={(e) => {
                                                    const newSubtasks = [...subtasks];
                                                    newSubtasks[index].completed = e.target.checked;
                                                    setSubtasks(newSubtasks);
                                                }}
                                                className="rounded border-slate-600 bg-black/20 text-indigo-500 focus:ring-indigo-500/20"
                                            />
                                            <Input
                                                value={subtask.title}
                                                onChange={(e) => {
                                                    const newSubtasks = [...subtasks];
                                                    newSubtasks[index].title = e.target.value;
                                                    setSubtasks(newSubtasks);
                                                }}
                                                className="flex-1 h-8 bg-black/20 border-white/10 text-white focus:border-indigo-500/50 text-sm"
                                                placeholder="Subtask title..."
                                            />
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => {
                                                    setSubtasks(subtasks.filter((_, i) => i !== index));
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
                                        onClick={() => setSubtasks([...subtasks, { title: '', completed: false }])}
                                        className="mt-2 text-xs border-dashed border-slate-600 text-slate-400 hover:text-white hover:bg-white/5"
                                    >
                                        + Add Subtask
                                    </Button>
                                </div>
                            </div>

                            {/* Estimate and Due Date Input */}
                            <div className="grid gap-6 md:grid-cols-2">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                                        <Clock className="w-4 h-4 text-emerald-400" />
                                        Estimate (Hours)
                                    </label>
                                    <Input
                                        type="number"
                                        min="0"
                                        step="0.5"
                                        value={estimate}
                                        onChange={(e) => setEstimate(Number(e.target.value))}
                                        className="bg-black/20 border-white/10 text-white placeholder:text-slate-500 focus:border-indigo-500/50 focus:ring-indigo-500/20"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                                        <Calendar className="w-4 h-4 text-slate-400" />
                                        Due Date
                                    </label>
                                    <Input
                                        type="date"
                                        value={dueDate}
                                        onChange={(e) => setDueDate(e.target.value)}
                                        className="bg-black/20 border-white/10 text-white focus:border-indigo-500/50 [color-scheme:dark]"
                                    />
                                </div>
                            </div>

                            <div className="pt-4 flex justify-end gap-3">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={() => router.back()}
                                    className="text-slate-400 hover:text-white hover:bg-white/5"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white min-w-[140px]"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            Creating...
                                        </>
                                    ) : (
                                        'Create Task'
                                    )}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
}
