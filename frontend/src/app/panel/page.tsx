'use client';

import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import {
    Layout,
    CheckCircle2,
    Circle,
    ArrowRight,
    Clock,
} from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { TaskDetailDialog } from '@/components/tasks/TaskDetailDialog';
import { Progress } from '@/components/ui/progress';

interface Task {
    _id: string;
    title: string;
    description: string;
    status: 'todo' | 'in-progress' | 'review' | 'done';
    priority: 'low' | 'medium' | 'high';
    estimate: number;
    timeLogged: number;
    project: { _id: string; name: string; key: string };
    sprint?: { _id: string; name: string };
    assignees: any[];
    attachments: string[];
    dueDate?: string;
    subtasks?: any[];
}

export default function UserPanelPage() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const queryClient = useQueryClient();

    const [isTimeDialogOpen, setIsTimeDialogOpen] = useState(false);
    const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [timeToAdd, setTimeToAdd] = useState('');

    const logTimeMutation = useMutation({
        mutationFn: async ({ taskId, totalTime }: { taskId: string, totalTime: number }) => {
            await api.put(`/tasks/${taskId}`, { timeLogged: totalTime });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['my-tasks'] });
            setIsTimeDialogOpen(false);
            setTimeToAdd('');
            setSelectedTask(null);
        },
    });

    const handleLogTimeClick = (task: Task) => {
        setSelectedTask(task);
        setIsTimeDialogOpen(true);
    };

    const handleTaskClick = (task: Task) => {
        setSelectedTask(task);
        setIsDetailDialogOpen(true);
    };

    const handleSaveTime = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedTask || !timeToAdd) return;

        const additionalTime = parseFloat(timeToAdd);
        if (isNaN(additionalTime) || additionalTime <= 0) return;

        const newTotal = (selectedTask.timeLogged || 0) + additionalTime;
        logTimeMutation.mutate({ taskId: selectedTask._id, totalTime: newTotal });
    };

    useEffect(() => {
        if (!loading && !user) {
            router.push('/');
        }
    }, [user, loading, router]);

    const { data: myTasks, isLoading: tasksLoading } = useQuery<Task[]>({
        queryKey: ['my-tasks'],
        queryFn: async () => {
            const response = await api.get('/tasks/my-tasks');
            return response.data;
        },
        enabled: !!user,
    });

    if (loading || !user) {
        return (
            <div className="flex h-full items-center justify-center text-slate-400">
                <div className="animate-pulse">Loading workspace...</div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        <Layout className="w-8 h-8 text-indigo-400" />
                        My Workspace
                    </h1>
                    <p className="text-slate-400 mt-1">
                        Welcome back, <span className="text-indigo-400">{user.name}</span>
                    </p>
                </div>
            </div>

            <div className="grid gap-6">
                <Card className="bg-slate-900/50 border-white/10 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="text-white">My Assigned Tasks</CardTitle>
                        <CardDescription className="text-slate-400">
                            Tasks assigned to you across all projects
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {tasksLoading ? (
                            <div className="text-slate-500 py-4 text-center">Loading tasks...</div>
                        ) : myTasks?.length === 0 ? (
                            <div className="text-center py-12 text-slate-500 bg-white/5 rounded-lg border border-white/5 border-dashed">
                                <p>No tasks assigned to you yet.</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {myTasks?.map((task) => (
                                    <div
                                        key={task._id}
                                        className="group flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-white/5 bg-black/20 p-4 hover:border-indigo-500/30 hover:bg-white/5 transition-all duration-200"
                                    >
                                        <div className="space-y-1">
                                            <h3 className="font-semibold text-slate-200 group-hover:text-white transition-colors">
                                                {task.title}
                                            </h3>
                                            <div className="text-sm text-slate-500 flex items-center gap-2">
                                                <span className="text-indigo-400">{task.project?.name}</span>
                                                <span>•</span>
                                                <span className="text-emerald-400">{task.sprint?.name}</span>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4 self-start sm:self-center">
                                            {/* Progress Bar for Time Logged */}
                                            {task.estimate > 0 && (
                                                <div className="hidden md:flex flex-col w-24 gap-1">
                                                    <div className="flex justify-between text-[10px] text-slate-500">
                                                        <span>{task.timeLogged}h</span>
                                                        <span>{task.estimate}h</span>
                                                    </div>
                                                    <Progress value={(task.timeLogged / task.estimate) * 100} className="h-1" />
                                                </div>
                                            )}

                                            <div className="flex gap-2">
                                                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${task.priority === 'high' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' :
                                                    task.priority === 'medium' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                                                        'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                                    }`}>
                                                    {task.priority}
                                                </span>
                                                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border flex items-center gap-1.5 ${task.status === 'done' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' :
                                                    'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'
                                                    }`}>
                                                    {task.status === 'done' ? <CheckCircle2 className="w-3 h-3" /> : <Circle className="w-3 h-3" />}
                                                    {task.status}
                                                </span>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="text-slate-400 hover:text-indigo-400"
                                                onClick={() => handleLogTimeClick(task)}
                                            >
                                                <Clock className="w-4 h-4 mr-1" /> Log Time
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="text-slate-400 hover:text-indigo-400"
                                                onClick={() => handleTaskClick(task)}
                                            >
                                                View <ArrowRight className="w-4 h-4 ml-1" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            <Dialog open={isTimeDialogOpen} onOpenChange={setIsTimeDialogOpen}>
                <DialogContent className="sm:max-w-[425px] bg-slate-900 border-white/10 text-white">
                    <DialogHeader>
                        <DialogTitle>Log Time for Task</DialogTitle>
                        <DialogDescription className="text-slate-400">
                            Add time spent on "{selectedTask?.title}"
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSaveTime}>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="time" className="text-right">
                                    Time (hours)
                                </Label>
                                <Input
                                    id="time"
                                    type="number"
                                    step="0.1"
                                    value={timeToAdd}
                                    onChange={(e) => setTimeToAdd(e.target.value)}
                                    className="col-span-3 bg-slate-800 border-slate-700 text-white"
                                    required
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white">
                                {logTimeMutation.isPending ? 'Logging...' : 'Log Time'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {selectedTask && (
                <TaskDetailDialog
                    task={selectedTask}
                    open={isDetailDialogOpen}
                    onOpenChange={setIsDetailDialogOpen}
                />
            )}
        </div>
    );
}
