'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/axios';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    Calendar,
    Users,
    Clock,
    ChevronDown,
    ChevronUp,
    CheckCircle2,
    Circle,
    ArrowLeft
} from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';

interface Project {
    _id: string;
    name: string;
    description: string;
    startDate: string;
    endDate: string;
    status: string;
    owner: { name: string };
    client?: string;
}

interface Sprint {
    _id: string;
    name: string;
    startDate: string;
    endDate: string;
    status: 'planned' | 'active' | 'completed';
}

interface Task {
    _id: string;
    title: string;
    status: string;
    priority: string;
    sprint?: string; // ID
    assignees: { _id: string; name: string }[];
}

export default function MemberProjectDetailsPage() {
    const params = useParams();
    const projectId = params.id as string;
    const router = useRouter();
    const { user } = useAuth();

    // State for expanded sprints
    const [expandedSprints, setExpandedSprints] = useState<Record<string, boolean>>({});

    const toggleSprint = (sprintId: string) => {
        setExpandedSprints(prev => ({
            ...prev,
            [sprintId]: !prev[sprintId]
        }));
    };

    // Queries
    const { data: project, isLoading: loadingProject } = useQuery<Project>({
        queryKey: ['project', projectId],
        queryFn: async () => (await api.get(`/projects/${projectId}`)).data
    });

    const { data: sprints, isLoading: loadingSprints } = useQuery<Sprint[]>({
        queryKey: ['project-sprints', projectId],
        queryFn: async () => (await api.get(`/projects/${projectId}/sprints`)).data
    });

    const { data: tasks, isLoading: loadingTasks } = useQuery<Task[]>({
        queryKey: ['project-tasks', projectId],
        queryFn: async () => (await api.get(`/projects/${projectId}/tasks`)).data
    });

    if (loadingProject || loadingSprints || loadingTasks) {
        return <div className="text-center py-12 text-slate-500">Loading project details...</div>;
    }

    if (!project) return <div>Project not found</div>;

    // Group tasks by sprint
    const getSprintTasks = (sprintId: string) => tasks?.filter(t => t.sprint === sprintId) || [];
    const backlogTasks = tasks?.filter(t => !t.sprint) || [];

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'done': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
            case 'in-progress': return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
            default: return 'text-slate-400 bg-slate-700/50 border-slate-600';
        }
    };

    return (
        <div className="space-y-8 max-w-5xl mx-auto">
            <Button variant="ghost" onClick={() => router.back()} className="text-slate-400 hover:text-white pl-0 gap-2">
                <ArrowLeft className="w-4 h-4" /> Back to Projects
            </Button>

            {/* Project Header */}
            <div className="space-y-4">
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">{project.name}</h1>
                        <p className="text-slate-400 max-w-2xl">{project.description}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full border text-sm font-medium uppercase tracking-wide ${project.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                            'bg-slate-700/50 text-slate-400 border-slate-600'
                        }`}>
                        {project.status}
                    </span>
                </div>

                <div className="flex flex-wrap gap-4 text-sm text-slate-400 bg-slate-900/50 p-4 rounded-xl border border-white/10">
                    <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-indigo-400" />
                        <span className="text-slate-500">Owner:</span>
                        <span className="text-slate-200">{project.owner?.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-indigo-400" />
                        <span className="text-slate-500">Start:</span>
                        <span className="text-slate-200">{format(new Date(project.startDate), 'MMM d, yyyy')}</span>
                    </div>
                    {project.client && (
                        <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-indigo-400" />
                            <span className="text-slate-500">Client:</span>
                            <span className="text-slate-200">{project.client}</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Sprints & Tasks */}
            <div className="space-y-6">
                <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                    <Clock className="w-5 h-5 text-indigo-400" />
                    Sprints & Tasks
                </h2>

                <div className="space-y-4">
                    {sprints?.map((sprint, index) => {
                        const sprintTasks = getSprintTasks(sprint._id);
                        const isExpanded = expandedSprints[sprint._id];

                        return (
                            <div key={sprint._id} className="bg-slate-900/50 border border-white/10 rounded-xl overflow-hidden transition-all">
                                <div
                                    className="p-4 flex items-center justify-between cursor-pointer hover:bg-white/5 transition-colors"
                                    onClick={() => toggleSprint(sprint._id)}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-400 font-bold text-sm border border-indigo-500/30">
                                            {index + 1}
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-medium text-white">{sprint.name}</h3>
                                            <div className="flex items-center gap-2 text-xs text-slate-500">
                                                <span>{format(new Date(sprint.startDate), 'MMM d')} - {format(new Date(sprint.endDate), 'MMM d')}</span>
                                                <span>•</span>
                                                <span className={sprint.status === 'active' ? 'text-emerald-400' : ''}>{sprint.status}</span>
                                                <span>•</span>
                                                <span>{sprintTasks.length} tasks</span>
                                            </div>
                                        </div>
                                    </div>
                                    {isExpanded ? <ChevronUp className="w-5 h-5 text-slate-500" /> : <ChevronDown className="w-5 h-5 text-slate-500" />}
                                </div>

                                {isExpanded && (
                                    <div className="border-t border-white/5 bg-black/20 p-2 space-y-2">
                                        {sprintTasks.length === 0 ? (
                                            <div className="text-center py-4 text-slate-600 text-sm">No tasks in this sprint</div>
                                        ) : (
                                            sprintTasks.map(task => (
                                                <Link href={`/panel/tasks/${task._id}`} key={task._id}>
                                                    <div className="flex items-center justify-between p-3 rounded-lg hover:bg-white/5 transition-colors group">
                                                        <div className="flex items-center gap-3">
                                                            {task.status === 'done' ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Circle className="w-4 h-4 text-slate-600" />}
                                                            <span className={`text-sm ${task.status === 'done' ? 'text-slate-500 line-through' : 'text-slate-300 group-hover:text-white'}`}>
                                                                {task.title}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            {task.assignees.some(a => a._id === user?._id) && (
                                                                <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-1.5 py-0.5 rounded border border-indigo-500/30">Assigned</span>
                                                            )}
                                                            <span className={`text-[10px] px-2 py-0.5 rounded border uppercase ${getStatusColor(task.status)}`}>
                                                                {task.status}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </Link>
                                            ))
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}

                    {/* Backlog / Unassigned Tasks */}
                    {backlogTasks.length > 0 && (
                        <div className="bg-slate-900/30 border border-white/5 rounded-xl overflow-hidden mt-8">
                            <div className="p-4 bg-white/5 border-b border-white/5">
                                <h3 className="text-white font-medium">Unassigned / Backlog Tasks</h3>
                            </div>
                            <div className="p-2 space-y-1">
                                {backlogTasks.map(task => (
                                    <Link href={`/panel/tasks/${task._id}`} key={task._id}>
                                        <div className="flex items-center justify-between p-3 rounded-lg hover:bg-white/5 transition-colors group">
                                            <div className="flex items-center gap-3">
                                                <Circle className="w-4 h-4 text-slate-600" />
                                                <span className="text-sm text-slate-300 group-hover:text-white">{task.title}</span>
                                            </div>
                                            <span className={`text-[10px] px-2 py-0.5 rounded border uppercase ${getStatusColor(task.status)}`}>
                                                {task.status}
                                            </span>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
