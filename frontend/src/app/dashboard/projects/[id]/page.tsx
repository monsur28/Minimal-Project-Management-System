'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/axios';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { format } from 'date-fns';
import TaskBoard from '@/components/TaskBoard';
import { Calendar, User, Clock, ChevronLeft, Plus, Layout, Briefcase, DollarSign, Image as ImageIcon, Pencil, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ProjectDetailPage() {
    const { id } = useParams();
    const router = useRouter();

    const { data: project, isLoading } = useQuery({
        queryKey: ['project', id],
        queryFn: async () => {
            const { data } = await api.get(`/projects/${id}`);
            return data;
        },
    });

    const { data: sprints, refetch: refetchSprints } = useQuery({
        queryKey: ['sprints', id],
        queryFn: async () => {
            const { data } = await api.get(`/projects/${id}/sprints`);
            return data;
        },
        enabled: !!id,
    });

    const handleDeleteSprint = async (sprintId: string) => {
        if (confirm('Are you sure you want to delete this sprint?')) {
            try {
                await api.delete(`/projects/${id}/sprints/${sprintId}`);
                refetchSprints();
            } catch (error) {
                console.error('Failed to delete sprint', error);
            }
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-full text-slate-400">
                <div className="animate-pulse">Loading project details...</div>
            </div>
        );
    }

    if (!project) return <div className="text-red-400 text-center mt-10">Project not found</div>;

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm text-slate-400 mb-2">
                        <Button
                            variant="link"
                            className="p-0 h-auto text-slate-400 hover:text-white"
                            onClick={() => router.push('/dashboard/projects')}
                        >
                            Projects
                        </Button>
                        <span>/</span>
                        <span className="text-white">Project Details</span>
                    </div>
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        <Layout className="w-8 h-8 text-indigo-400" />
                        {project.name}
                    </h1>
                    <p className="text-slate-400 max-w-2xl">{project.description}</p>
                </div>
                <div className="flex gap-3">
                    <Button
                        onClick={() => router.push(`/dashboard/projects/${id}/edit`)}
                        variant="outline"
                        className="border-white/10 bg-white/5 hover:bg-white/10 text-white gap-2"
                    >
                        <Pencil className="w-4 h-4" />
                        Edit Project
                    </Button>
                    <Button
                        onClick={() => router.push(`/dashboard/projects/${id}/sprints/new`)}
                        variant="outline"
                        className="border-white/10 bg-white/5 hover:bg-white/10 text-white gap-2"
                    >
                        <Plus className="w-4 h-4" />
                        Add Sprint
                    </Button>
                    <Button
                        onClick={() => router.push(`/dashboard/projects/${id}/tasks/new`)}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2"
                    >
                        <Plus className="w-4 h-4" />
                        Create Task
                    </Button>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                {/* Project Info Card */}
                <Card className="bg-slate-900/50 border-white/10 md:col-span-2">
                    <CardHeader>
                        <CardTitle className="text-white">Overview</CardTitle>
                    </CardHeader>
                    <CardContent className="grid sm:grid-cols-2 gap-6">
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Status</label>
                            <div className="flex items-center gap-2 text-white capitalize">
                                <span className={`w-2 h-2 rounded-full ${project.status === 'active' ? 'bg-emerald-400' : 'bg-slate-400'}`} />
                                {project.status}
                            </div>
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Owner</label>
                            <div className="flex items-center gap-2 text-white">
                                <User className="w-4 h-4 text-indigo-400" />
                                {project.owner.name}
                            </div>
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Timeline</label>
                            <div className="flex items-center gap-2 text-white">
                                <Clock className="w-4 h-4 text-cyan-400" />
                                <span>
                                    {project.startDate ? format(new Date(project.startDate), 'MMM d, yyyy') : 'TBD'}
                                    {' - '}
                                    {project.endDate ? format(new Date(project.endDate), 'MMM d, yyyy') : 'TBD'}
                                </span>
                            </div>
                        </div>
                        {project.client && (
                            <div className="space-y-1">
                                <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Client</label>
                                <div className="flex items-center gap-2 text-white">
                                    <Briefcase className="w-4 h-4 text-indigo-400" />
                                    {project.client}
                                </div>
                            </div>
                        )}
                        {project.budget && (
                            <div className="space-y-1">
                                <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Budget</label>
                                <div className="flex items-center gap-2 text-white">
                                    <DollarSign className="w-4 h-4 text-emerald-400" />
                                    ${project.budget.toLocaleString()}
                                </div>
                            </div>
                        )}
                        {project.thumbnail && (
                            <div className="space-y-1 col-span-2">
                                <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Thumbnail</label>
                                <div className="relative h-48 rounded-lg overflow-hidden border border-white/10 bg-black/20">
                                    <img src={project.thumbnail} alt="Project Thumbnail" className="w-full h-full object-cover" />
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Sprints Card */}
                <Card className="bg-slate-900/50 border-white/10">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-white text-lg">Active Sprints</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {sprints?.length === 0 ? (
                            <div className="text-center py-8 text-slate-500 text-sm">
                                <p>No sprints started.</p>
                                <Button
                                    variant="link"
                                    className="text-indigo-400 hover:text-indigo-300 px-0"
                                    onClick={() => router.push(`/dashboard/projects/${id}/sprints/new`)}
                                >
                                    Create one now
                                </Button>
                            </div>
                        ) : (
                            <ul className="space-y-3">
                                {sprints?.map((sprint: any) => (
                                    <li key={sprint._id} className="group flex items-center justify-between p-3 rounded-lg bg-black/20 border border-white/5 hover:border-white/10 transition-colors">
                                        <div className="flex flex-col gap-1">
                                            <div className="flex items-center gap-2">
                                                <span className="text-white font-medium group-hover:text-indigo-300 transition-colors">
                                                    {sprint.name}
                                                </span>
                                                <span className="text-xs font-mono text-slate-500 bg-white/5 px-1.5 py-0.5 rounded">
                                                    #{sprint.sprintNumber}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-3 text-xs text-slate-500">
                                                <span className={`px-1.5 py-0.5 rounded capitalize ${sprint.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                                                    sprint.status === 'completed' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' :
                                                        'bg-slate-700/30 text-slate-400 border border-slate-700/50'
                                                    }`}>
                                                    {sprint.status}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Calendar className="w-3 h-3" />
                                                    {format(new Date(sprint.startDate), 'MMM d')} - {format(new Date(sprint.endDate), 'MMM d')}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-8 w-8 p-0 text-slate-400 hover:text-white"
                                                onClick={() => router.push(`/dashboard/projects/${id}/sprints/${sprint._id}/edit`)}
                                            >
                                                <Pencil className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-8 w-8 p-0 text-slate-400 hover:text-rose-400"
                                                onClick={() => handleDeleteSprint(sprint._id)}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Tasks Section */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-white">Project Tasks</h2>
                </div>
                {/* Wrap TaskBoard in a container that handles dark mode text properly if TaskBoard isn't updated yet */}
                <div className="bg-slate-900/30 rounded-xl border border-white/5 p-4 min-h-[400px]">
                    <TaskBoard />
                </div>
            </div>
        </div >
    );
}
