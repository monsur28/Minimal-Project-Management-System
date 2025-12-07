'use client';

import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/axios';
import Link from 'next/link';
import {
    CheckSquare,
    CheckCircle2,
    Circle,
    ArrowRight,
    Filter,
    Search
} from 'lucide-react';
import { Input } from '@/components/ui/input';

interface Task {
    _id: string;
    title: string;
    description: string;
    status: string;
    priority: string;
    estimate: number;
    timeLogged: number;
    project: { _id: string; name: string };
    sprint: { _id: string; name: string };
}

export default function MemberTasksPage() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const [filter, setFilter] = useState('all');
    const [search, setSearch] = useState('');

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

    const filteredTasks = myTasks?.filter(task => {
        const matchesFilter = filter === 'all' || task.status === filter;
        const matchesSearch = task.title.toLowerCase().includes(search.toLowerCase()) ||
            task.project?.name.toLowerCase().includes(search.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    if (loading || !user) {
        return (
            <div className="flex h-full items-center justify-center text-slate-400">
                <div className="animate-pulse">Loading tasks...</div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        <CheckSquare className="w-8 h-8 text-indigo-400" />
                        My Tasks
                    </h1>
                    <p className="text-slate-400 mt-1">
                        Manage your assigned tasks and track progress
                    </p>
                </div>
            </div>

            <Card className="bg-slate-900/50 border-white/10 backdrop-blur-sm">
                <CardHeader>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="relative flex-1 max-w-sm">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                            <Input
                                placeholder="Search tasks..."
                                className="pl-9 bg-black/20 border-white/10 text-white placeholder:text-slate-500 focus:border-indigo-500/50"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <Filter className="w-4 h-4 text-slate-400" />
                            <select
                                className="bg-black/20 border border-white/10 rounded-md text-sm text-white px-3 py-2 outline-none focus:border-indigo-500/50"
                                value={filter}
                                onChange={(e) => setFilter(e.target.value)}
                            >
                                <option value="all" className="bg-slate-900">All Status</option>
                                <option value="todo" className="bg-slate-900">To Do</option>
                                <option value="in-progress" className="bg-slate-900">In Progress</option>
                                <option value="done" className="bg-slate-900">Done</option>
                            </select>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {tasksLoading ? (
                        <div className="text-slate-500 py-8 text-center">Loading tasks...</div>
                    ) : filteredTasks?.length === 0 ? (
                        <div className="text-center py-12 text-slate-500 bg-white/5 rounded-lg border border-white/5 border-dashed">
                            <p>No tasks found matching your criteria.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {filteredTasks?.map((task) => (
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
                                            {task.sprint && <span className="text-slate-600">•</span>}
                                            {task.sprint && <span className="text-emerald-400">{task.sprint.name}</span>}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4 self-start sm:self-center">
                                        <div className="flex gap-2">
                                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${task.priority === 'high' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' :
                                                task.priority === 'medium' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                                                    'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                                }`}>
                                                {task.priority}
                                            </span>

                                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border flex items-center gap-1.5 ${task.status === 'done' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' :
                                                task.status === 'in-progress' ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' :
                                                    'bg-slate-500/10 text-slate-400 border-slate-500/20'
                                                }`}>
                                                {task.status === 'done' ? <CheckCircle2 className="w-3 h-3" /> : <Circle className="w-3 h-3" />}
                                                {task.status}
                                            </span>
                                        </div>

                                        <Button
                                            asChild
                                            size="sm"
                                            variant="ghost"
                                            className="text-slate-400 hover:text-white hover:bg-white/10"
                                        >
                                            <Link href={`/dashboard/projects/${task.project?._id}`}>
                                                View
                                                <ArrowRight className="w-4 h-4 ml-2" />
                                            </Link>
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
