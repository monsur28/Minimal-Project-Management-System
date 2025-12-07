'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
    FolderKanban,
    Plus,
    Search,
    Calendar,
    Users,
    Briefcase,
    DollarSign,
    CheckCircle2
} from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from '@/context/AuthContext';

interface Project {
    _id: string;
    name: string;
    description: string;
    status: 'planned' | 'active' | 'completed' | 'archived';
    startDate: string;
    endDate?: string;
    owner: { name: string };
    client?: string;
    budget?: number;
    thumbnail?: string;
    // Mocking stats since backend doesn't return them yet
    taskStats?: {
        total: number;
        completed: number;
    };
}

export default function ProjectsPage() {
    const { user } = useAuth();
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const queryClient = useQueryClient();

    // Data Fetching
    const { data: projects, isLoading } = useQuery<Project[]>({
        queryKey: ['projects'],
        queryFn: async () => {
            const { data } = await api.get('/projects');
            return data;
        },
    });

    const filteredProjects = projects?.filter(project => {
        const matchesSearch = project.name.toLowerCase().includes(search.toLowerCase()) ||
            project.description.toLowerCase().includes(search.toLowerCase()) ||
            project.client?.toLowerCase().includes(search.toLowerCase());
        const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    // Stats
    const totalProjects = projects?.length || 0;
    const activeProjects = projects?.filter(p => p.status === 'active').length || 0;
    const completedProjects = projects?.filter(p => p.status === 'completed').length || 0;

    const formatDate = (dateString?: string) => {
        if (!dateString) return 'N/A';
        try {
            return format(new Date(dateString), 'MMM d, yyyy');
        } catch {
            return 'N/A';
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        <FolderKanban className="w-8 h-8 text-indigo-400" />
                        Projects
                    </h1>
                    <p className="text-slate-400 mt-1">
                        Manage all your ongoing projects and initiatives
                    </p>
                </div>
                {(user?.role === 'admin' || user?.role === 'manager') && (
                    <Button asChild className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2">
                        <Link href="/dashboard/projects/new">
                            <Plus className="w-4 h-4" />
                            Create Project
                        </Link>
                    </Button>
                )}
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="bg-slate-900/50 border-white/10">
                    <CardContent className="p-4 flex items-center justify-between">
                        <div>
                            <p className="text-sm text-slate-400">Total Projects</p>
                            <p className="text-2xl font-bold text-white">{totalProjects}</p>
                        </div>
                        <FolderKanban className="w-8 h-8 text-slate-500/50" />
                    </CardContent>
                </Card>
                <Card className="bg-slate-900/50 border-white/10">
                    <CardContent className="p-4 flex items-center justify-between">
                        <div>
                            <p className="text-sm text-slate-400">Active</p>
                            <p className="text-2xl font-bold text-emerald-400">{activeProjects}</p>
                        </div>
                        <Briefcase className="w-8 h-8 text-emerald-500/20" />
                    </CardContent>
                </Card>
                <Card className="bg-slate-900/50 border-white/10">
                    <CardContent className="p-4 flex items-center justify-between">
                        <div>
                            <p className="text-sm text-slate-400">Completed</p>
                            <p className="text-2xl font-bold text-blue-400">{completedProjects}</p>
                        </div>
                        <CheckCircle2 className="w-8 h-8 text-blue-500/20" />
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 bg-slate-900/50 p-4 rounded-xl border border-white/10 text-slate-200">
                <div className="flex-1 flex items-center gap-2 bg-black/20 px-3 py-2 rounded-lg border border-white/5 focus-within:border-indigo-500/50 transition-colors">
                    <Search className="w-4 h-4 text-slate-400" />
                    <Input
                        placeholder="Search by name, description, or client..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="border-none bg-transparent focus-visible:ring-0 placeholder:text-slate-500 h-auto p-0 text-base"
                    />
                </div>
                <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
                    {['all', 'planned', 'active', 'completed', 'archived'].map((status) => (
                        <button
                            key={status}
                            onClick={() => setStatusFilter(status)}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium capitalize whitespace-nowrap transition-colors ${statusFilter === status
                                ? 'bg-indigo-600 text-white'
                                : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
                                }`}
                        >
                            {status}
                        </button>
                    ))}
                </div>
            </div>

            {/* Grid */}
            {isLoading ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <Card key={i} className="bg-slate-900/50 border-white/10 flex flex-col h-full">
                            {/* Thumbnail Skeleton */}
                            <div className="h-32 w-full border-b border-white/5">
                                <Skeleton className="h-full w-full rounded-t-xl rounded-b-none bg-slate-800/50" />
                            </div>

                            <CardHeader className="pb-3 space-y-2">
                                <div className="flex justify-between items-start gap-3">
                                    <div className="flex-1 space-y-2">
                                        <Skeleton className="h-6 w-3/4 bg-slate-800/50" />
                                        <Skeleton className="h-3 w-1/3 bg-slate-800/50" />
                                    </div>
                                    <Skeleton className="h-5 w-16 rounded bg-slate-800/50" />
                                </div>
                            </CardHeader>

                            <CardContent className="flex-1 flex flex-col gap-4">
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-full bg-slate-800/50" />
                                    <Skeleton className="h-4 w-5/6 bg-slate-800/50" />
                                </div>

                                <div className="grid grid-cols-2 gap-3 mt-auto pt-4">
                                    <div className="flex items-center gap-2">
                                        <Skeleton className="w-4 h-4 rounded-full bg-slate-800/50" />
                                        <Skeleton className="h-3 w-20 bg-slate-800/50" />
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Skeleton className="w-4 h-4 rounded-full bg-slate-800/50" />
                                        <Skeleton className="h-3 w-20 bg-slate-800/50" />
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                                    <Skeleton className="h-3 w-16 bg-slate-800/50" />
                                    <Skeleton className="h-8 w-24 rounded bg-slate-800/50" />
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : filteredProjects?.length === 0 ? (
                <div className="text-center py-20 bg-slate-900/30 rounded-xl border border-white/5 border-dashed">
                    <FolderKanban className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-slate-300">No projects found</h3>
                    <p className="text-slate-500 max-w-sm mx-auto mt-2">
                        Try adjusting your filters or create a new project.
                    </p>
                </div>
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredProjects?.map((project) => (
                        <Card key={project._id} className="group bg-slate-900/50 border-white/10 hover:border-indigo-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/10 flex flex-col">
                            {project.thumbnail && (
                                <div className="h-32 w-full overflow-hidden rounded-t-xl border-b border-white/5">
                                    <img src={project.thumbnail} alt={project.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                </div>
                            )}
                            <CardHeader className="pb-3">
                                <div className="flex justify-between items-start gap-3">
                                    <div className="space-y-1 flex-1 min-w-0">
                                        <CardTitle className="text-lg font-semibold text-white group-hover:text-indigo-400 transition-colors truncate">
                                            <Link href={`/dashboard/projects/${project._id}`} className="hover:underline">
                                                {project.name}
                                            </Link>
                                        </CardTitle>
                                        {project.client && (
                                            <p className="text-xs font-medium text-indigo-300">
                                                {project.client}
                                            </p>
                                        )}
                                    </div>
                                    <span className={`px-2 py-1 rounded text-[10px] uppercase font-bold tracking-wider ${project.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                                        project.status === 'completed' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                                            project.status === 'planned' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                                                'bg-slate-700/50 text-slate-400 border border-slate-600'
                                        }`}>
                                        {project.status}
                                    </span>
                                </div>
                            </CardHeader>
                            <CardContent className="flex-1 flex flex-col justify-between gap-4">
                                <div className="space-y-4">
                                    <CardDescription className="max-h-24 overflow-y-auto text-slate-400 pr-1 no-scrollbar text-sm leading-relaxed">
                                        {project.description || "No description provided."}
                                    </CardDescription>

                                    <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-xs text-slate-400">
                                        <div className="flex items-center gap-2">
                                            <Users className="w-3.5 h-3.5 text-slate-500" />
                                            <span className="truncate max-w-[100px]">{project.owner?.name}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-3.5 h-3.5 text-slate-500" />
                                            <span>{formatDate(project.startDate)}</span>
                                        </div>
                                        {project.budget && (
                                            <div className="flex items-center gap-2 col-span-2">
                                                <DollarSign className="w-3.5 h-3.5 text-emerald-500" />
                                                <span className="text-emerald-400 font-medium">${project.budget.toLocaleString()}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                                    <div className="text-xs text-slate-500">
                                        Tasks: {project.taskStats ? `${project.taskStats.completed}/${project.taskStats.total}` : '0/0'}
                                    </div>
                                    <Button asChild variant="secondary" size="sm" className="bg-white/5 hover:bg-indigo-600 hover:text-white text-slate-300 border border-white/10 h-8 text-xs">
                                        <Link href={`/dashboard/projects/${project._id}`}>View Details</Link>
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
