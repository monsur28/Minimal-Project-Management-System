'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/axios';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    CheckSquare,
    Search,
    Filter,
    ArrowRight,
    Flag,
    AlertCircle,
    Calendar,
    CheckCircle2,
    Circle,
    User,
    Briefcase
} from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';

interface Task {
    _id: string;
    title: string;
    status: string;
    priority: string;
    project: { _id: string; name: string };
    sprint?: { _id: string; name: string };
    assignees: { _id: string; name: string }[];
    dueDate?: string;
    estimate?: number;
}

const priorityConfig = {
    low: { color: 'text-emerald-400', icon: Flag },
    medium: { color: 'text-amber-400', icon: Flag },
    high: { color: 'text-rose-400', icon: AlertCircle },
};

export default function AllTasksPage() {
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [priorityFilter, setPriorityFilter] = useState('all');
    const [projectFilter, setProjectFilter] = useState('all');
    const [sprintFilter, setSprintFilter] = useState('all');
    const [assigneeFilter, setAssigneeFilter] = useState('all');

    const { data: tasks, isLoading: tasksLoading } = useQuery<Task[]>({
        queryKey: ['all-tasks'],
        queryFn: async () => {
            const { data } = await api.get('/tasks');
            return data;
        },
    });

    const { data: projects } = useQuery({
        queryKey: ['projects'],
        queryFn: async () => {
            const { data } = await api.get('/projects');
            return data;
        },
    });

    const { data: sprints } = useQuery({
        queryKey: ['project-sprints', projectFilter],
        queryFn: async () => {
            const { data } = await api.get(`/projects/${projectFilter}/sprints`);
            return data;
        },
        enabled: projectFilter !== 'all',
    });

    const { data: users } = useQuery({
        queryKey: ['users'],
        queryFn: async () => {
            const { data } = await api.get('/users');
            return data;
        },
    });

    const filteredTasks = tasks?.filter(task => {
        const matchesSearch = task.title.toLowerCase().includes(search.toLowerCase()) ||
            task.project?.name.toLowerCase().includes(search.toLowerCase());
        const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
        const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
        const matchesProject = projectFilter === 'all' || task.project?._id === projectFilter;
        const matchesSprint = sprintFilter === 'all' ||
            (sprintFilter === 'none' && !task.sprint) ||
            task.sprint?._id === sprintFilter;
        const matchesAssignee = assigneeFilter === 'all' || task.assignees?.some(a => a._id === assigneeFilter);

        return matchesSearch && matchesStatus && matchesPriority && matchesProject && matchesAssignee && matchesSprint;
    });

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        <CheckSquare className="w-8 h-8 text-indigo-400" />
                        Global Tasks
                    </h1>
                    <p className="text-slate-400 mt-1">
                        Oversee tasks across all projects
                    </p>
                </div>
            </div>

            <Card className="bg-slate-900/50 border-white/10">
                <CardHeader>
                    <div className="flex flex-col space-y-4">
                        <div className="flex flex-col md:flex-row gap-4 justify-between">
                            <div className="relative flex-1 max-w-sm">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                <Input
                                    placeholder="Search tasks, projects..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="pl-9 bg-black/20 border-white/10 text-white placeholder:text-slate-500 focus:border-indigo-500/50"
                                />
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            <div className="flex items-center gap-2 bg-black/20 border border-white/10 rounded-md px-2">
                                <Filter className="w-4 h-4 text-slate-500" />
                                <span className="text-sm text-slate-400">Filters:</span>
                            </div>

                            <select
                                className="bg-black/20 border border-white/10 rounded-md text-sm text-white px-3 py-2 outline-none focus:border-indigo-500/50"
                                value={projectFilter}
                                onChange={(e) => {
                                    setProjectFilter(e.target.value);
                                    setSprintFilter('all');
                                }}
                            >
                                <option value="all" className="bg-slate-900">All Projects</option>
                                {projects?.map((p: any) => (
                                    <option key={p._id} value={p._id} className="bg-slate-900">{p.name}</option>
                                ))}
                            </select>

                            <select
                                className="bg-black/20 border border-white/10 rounded-md text-sm text-white px-3 py-2 outline-none focus:border-indigo-500/50 disabled:opacity-50"
                                value={sprintFilter}
                                onChange={(e) => setSprintFilter(e.target.value)}
                                disabled={projectFilter === 'all'}
                            >
                                <option value="all" className="bg-slate-900">All Sprints</option>
                                <option value="none" className="bg-slate-900">No Sprint</option>
                                {sprints?.map((s: any) => (
                                    <option key={s._id} value={s._id} className="bg-slate-900">{s.name}</option>
                                ))}
                            </select>

                            <select
                                className="bg-black/20 border border-white/10 rounded-md text-sm text-white px-3 py-2 outline-none focus:border-indigo-500/50"
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                            >
                                <option value="all" className="bg-slate-900">All Status</option>
                                <option value="todo" className="bg-slate-900">To Do</option>
                                <option value="in-progress" className="bg-slate-900">In Progress</option>
                                <option value="review" className="bg-slate-900">Review</option>
                                <option value="done" className="bg-slate-900">Done</option>
                            </select>

                            <select
                                className="bg-black/20 border border-white/10 rounded-md text-sm text-white px-3 py-2 outline-none focus:border-indigo-500/50"
                                value={priorityFilter}
                                onChange={(e) => setPriorityFilter(e.target.value)}
                            >
                                <option value="all" className="bg-slate-900">All Priorities</option>
                                <option value="low" className="bg-slate-900">Low</option>
                                <option value="medium" className="bg-slate-900">Medium</option>
                                <option value="high" className="bg-slate-900">High</option>
                            </select>

                            <select
                                className="bg-black/20 border border-white/10 rounded-md text-sm text-white px-3 py-2 outline-none focus:border-indigo-500/50"
                                value={assigneeFilter}
                                onChange={(e) => setAssigneeFilter(e.target.value)}
                            >
                                <option value="all" className="bg-slate-900">All Assignees</option>
                                {users?.map((u: any) => (
                                    <option key={u._id} value={u._id} className="bg-slate-900">{u.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {tasksLoading ? (
                        <div className="text-center py-8 text-slate-500">Loading tasks...</div>
                    ) : filteredTasks?.length === 0 ? (
                        <div className="text-center py-12 text-slate-500">
                            No tasks found matching your filters.
                        </div>
                    ) : (
                        <div className="rounded-md border border-white/10 overflow-hidden">
                            <Table>
                                <TableHeader className="bg-slate-800/50">
                                    <TableRow className="border-white/10 hover:bg-transparent">
                                        <TableHead className="text-slate-400">Task</TableHead>
                                        <TableHead className="text-slate-400">Project</TableHead>
                                        <TableHead className="text-slate-400">Assignees</TableHead>
                                        <TableHead className="text-slate-400">Status</TableHead>
                                        <TableHead className="text-slate-400">Priority</TableHead>
                                        <TableHead className="text-slate-400">Due Date</TableHead>
                                        <TableHead className="text-right text-slate-400">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredTasks?.map((task) => {
                                        const PriorityIcon = priorityConfig[task.priority as keyof typeof priorityConfig]?.icon || Flag;
                                        const priorityColor = priorityConfig[task.priority as keyof typeof priorityConfig]?.color || 'text-slate-400';

                                        return (
                                            <TableRow key={task._id} className="border-white/10 hover:bg-white/5 bg-black/20">
                                                <TableCell className="font-medium text-slate-200">
                                                    <div className="flex flex-col">
                                                        <span>{task.title}</span>
                                                        <span className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                                                            {task.sprint && <span className="bg-indigo-500/10 text-indigo-400 px-1 rounded flex items-center gap-0.5"><Calendar className="w-2.5 h-2.5" /> {task.sprint.name}</span>}
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <span className="text-sm text-slate-400 hover:text-indigo-400 transition-colors flex items-center gap-1">
                                                        <Briefcase className="w-3 h-3" />
                                                        {task.project?.name}
                                                    </span>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex -space-x-2">
                                                        {task.assignees?.length > 0 ? (
                                                            task.assignees.map((assignee) => (
                                                                <div key={assignee._id} className="w-6 h-6 rounded-full bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-[10px] text-indigo-300" title={assignee.name}>
                                                                    {assignee.name.charAt(0)}
                                                                </div>
                                                            ))
                                                        ) : (
                                                            <span className="text-slate-600 text-xs">-</span>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs capitalize border ${task.status === 'done' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                                        task.status === 'in-progress' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' :
                                                            'bg-slate-700/30 text-slate-400 border-slate-700/50'
                                                        }`}>
                                                        {task.status === 'done' ? <CheckCircle2 className="w-3 h-3" /> : <Circle className="w-3 h-3" />}
                                                        {task.status}
                                                    </span>
                                                </TableCell>
                                                <TableCell>
                                                    <div className={`flex items-center gap-1.5 capitalize text-sm ${priorityColor}`}>
                                                        <PriorityIcon className="w-4 h-4" />
                                                        {task.priority}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-slate-400 text-sm">
                                                    {task.dueDate ? format(new Date(task.dueDate), 'MMM d, yyyy') : '-'}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-white" asChild>
                                                        <Link href={`/dashboard/projects/${task.project?._id}/tasks/${task._id}/edit`}>
                                                            <ArrowRight className="w-4 h-4" />
                                                        </Link>
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
