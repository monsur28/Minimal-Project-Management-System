'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/axios';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
    FolderKanban,
    Search,
    Calendar,
    Users,
    ArrowRight
} from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

interface Project {
    _id: string;
    name: string;
    description: string;
    status: string;
    startDate: string;
    owner: { name: string };
    client?: string;
}

export default function MemberProjectsPage() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const [search, setSearch] = useState('');

    const { data: projects, isLoading } = useQuery<Project[]>({
        queryKey: ['my-projects'],
        queryFn: async () => {
            const { data } = await api.get('/projects/my-projects');
            return data;
        },
        enabled: !!user
    });

    const filteredProjects = projects?.filter(project =>
        project.name.toLowerCase().includes(search.toLowerCase()) ||
        project.description?.toLowerCase().includes(search.toLowerCase())
    );

    if (loading) return <div>Loading...</div>;

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        <FolderKanban className="w-8 h-8 text-indigo-400" />
                        My Projects
                    </h1>
                    <p className="text-slate-400 mt-1">
                        Projects you are a member of
                    </p>
                </div>
            </div>

            <div className="bg-slate-900/50 p-4 rounded-xl border border-white/10 text-slate-200">
                <div className="flex items-center gap-2 bg-black/20 px-3 py-2 rounded-lg border border-white/5 focus-within:border-indigo-500/50 transition-colors">
                    <Search className="w-4 h-4 text-slate-400" />
                    <Input
                        placeholder="Search projects..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="border-none bg-transparent focus-visible:ring-0 placeholder:text-slate-500 h-auto p-0 text-base"
                    />
                </div>
            </div>

            {isLoading ? (
                <div className="text-center text-slate-500">Loading projects...</div>
            ) : filteredProjects?.length === 0 ? (
                <div className="text-center py-12 text-slate-500 bg-white/5 rounded-lg border border-white/5 border-dashed">
                    <p>No projects found.</p>
                </div>
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredProjects?.map((project) => (
                        <Card key={project._id} className="group bg-slate-900/50 border-white/10 hover:border-indigo-500/30 transition-all duration-300">
                            <CardHeader>
                                <div className="flex justify-between items-start">
                                    <div className="space-y-1">
                                        <CardTitle className="text-white group-hover:text-indigo-400 transition-colors">
                                            {project.name}
                                        </CardTitle>
                                        <div className="flex items-center gap-2 text-xs text-slate-500">
                                            <span className={`px-2 py-0.5 rounded-full border ${project.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                                    'bg-slate-700/50 text-slate-400 border-slate-600'
                                                } uppercase`}>
                                                {project.status}
                                            </span>
                                            {project.client && <span>• {project.client}</span>}
                                        </div>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <CardDescription className="line-clamp-2 text-slate-400">
                                    {project.description}
                                </CardDescription>

                                <div className="grid grid-cols-2 gap-2 text-xs text-slate-500">
                                    <div className="flex items-center gap-2">
                                        <Users className="w-3.5 h-3.5" />
                                        {project.owner?.name}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Calendar className="w-3.5 h-3.5" />
                                        {project.startDate ? format(new Date(project.startDate), 'MMM d, yyyy') : 'N/A'}
                                    </div>
                                </div>

                                <Button asChild className="w-full bg-white/5 hover:bg-indigo-600 hover:text-white text-slate-300 border border-white/10">
                                    <Link href={`/panel/projects/${project._id}`}>
                                        View Details <ArrowRight className="w-4 h-4 ml-2" />
                                    </Link>
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
