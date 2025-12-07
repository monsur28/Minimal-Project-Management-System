'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';

export default function TaskDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const queryClient = useQueryClient();
    const [comment, setComment] = useState('');
    const [timeLog, setTimeLog] = useState(0);

    const { data: task, isLoading } = useQuery({
        queryKey: ['task', id],
        queryFn: async () => {
            const { data } = await api.get(`/tasks/${id}`); // We need a direct task route or use project route
            // Currently we only have /api/projects/:projectId/tasks/:id or similar?
            // Actually we implemented updateTask at /api/tasks/:id in controller but route mounting might be tricky.
            // Let's check routes. task.routes.ts is mounted at /api/tasks AND /api/projects/:projectId/tasks
            // So /api/tasks/:id should work if the route file handles it.
            // In task.routes.ts: router.route('/:id').put(...).delete(...)
            // We need GET /:id there too.
            // Let's assume we fix backend to allow GET /api/tasks/:id
            const { data } = await api.get(`/tasks/${id}`);
            return data;
        },
    });

    const { data: comments } = useQuery({
        queryKey: ['comments', id],
        queryFn: async () => {
            const { data } = await api.get(`/tasks/${id}/comments`);
            return data;
        },
        enabled: !!id,
    });

    const updateStatusMutation = useMutation({
        mutationFn: async (status: string) => {
            await api.put(`/tasks/${id}`, { status });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['task', id] });
        },
    });

    const logTimeMutation = useMutation({
        mutationFn: async () => {
            await api.put(`/tasks/${id}`, { timeLogged: (task.timeLogged || 0) + timeLog });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['task', id] });
            setTimeLog(0);
        },
    });

    const addCommentMutation = useMutation({
        mutationFn: async () => {
            await api.post(`/tasks/${id}/comments`, { content: comment });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['comments', id] });
            setComment('');
        },
    });

    if (isLoading) return <div>Loading...</div>;
    if (!task) return <div>Task not found</div>;

    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <div className="mb-8 flex items-center justify-between">
                <h1 className="text-3xl font-bold">{task.title}</h1>
                <Button variant="outline" onClick={() => router.back()}>
                    Back
                </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                <div className="md:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Description</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p>{task.description || 'No description provided.'}</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Comments</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex gap-2">
                                <Input
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    placeholder="Add a comment..."
                                />
                                <Button onClick={() => addCommentMutation.mutate()} disabled={!comment}>
                                    Post
                                </Button>
                            </div>
                            <div className="space-y-4">
                                {comments?.map((c: any) => (
                                    <div key={c._id} className="rounded border p-3 bg-gray-50">
                                        <div className="flex justify-between text-xs text-gray-500">
                                            <span className="font-semibold">{c.user.name}</span>
                                            <span>{format(new Date(c.createdAt), 'PP p')}</span>
                                        </div>
                                        <p className="mt-1 text-sm">{c.content}</p>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <span className="font-semibold block">Status</span>
                                <select
                                    className="w-full rounded border p-2 mt-1"
                                    value={task.status}
                                    onChange={(e) => updateStatusMutation.mutate(e.target.value)}
                                >
                                    <option value="todo">To Do</option>
                                    <option value="in-progress">In Progress</option>
                                    <option value="review">Review</option>
                                    <option value="done">Done</option>
                                </select>
                            </div>
                            <div>
                                <span className="font-semibold">Priority: </span>
                                <span className="capitalize">{task.priority}</span>
                            </div>
                            <div>
                                <span className="font-semibold">Estimate: </span>
                                {task.estimate}h
                            </div>
                            <div>
                                <span className="font-semibold">Time Logged: </span>
                                {task.timeLogged || 0}h
                            </div>
                            <div className="flex gap-2 items-end">
                                <div className="flex-1">
                                    <label className="text-xs font-semibold">Log Time (h)</label>
                                    <Input
                                        type="number"
                                        value={timeLog}
                                        onChange={(e) => setTimeLog(Number(e.target.value))}
                                    />
                                </div>
                                <Button onClick={() => logTimeMutation.mutate()} size="sm">
                                    Log
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
