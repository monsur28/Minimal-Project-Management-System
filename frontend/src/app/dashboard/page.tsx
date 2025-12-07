'use client';

import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/axios';
import {
    LayoutDashboard,
    Briefcase,
    CheckSquare,
    Users,
    Activity,
    Clock,
    TrendingUp
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';

export default function DashboardPage() {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) {
            router.push('/');
        }
    }, [user, loading, router]);

    const { data: stats, isLoading } = useQuery({
        queryKey: ['dashboard-stats'],
        queryFn: async () => {
            const { data } = await api.get('/projects/stats');
            return data;
        },
        enabled: !!user,
    });

    if (loading || !user) {
        return (
            <div className="flex h-full items-center justify-center text-slate-400">
                <div className="animate-pulse">Loading dashboard...</div>
            </div>
        );
    }

    const { global, projects, users } = stats || {};

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        <LayoutDashboard className="w-8 h-8 text-indigo-400" />
                        Admin Dashboard
                    </h1>
                    <p className="text-slate-400 mt-1">
                        Overview of project performance and team activity
                    </p>
                </div>
            </div>

            {/* Global Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {[
                    { title: 'Total Projects', value: global?.totalProjects || 0, icon: Briefcase, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
                    { title: 'Tasks In Progress', value: global?.tasksInProgress || 0, icon: Activity, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
                    { title: 'Total Team Members', value: global?.totalUsers || 0, icon: Users, color: 'text-purple-400', bg: 'bg-purple-500/10' },
                    { title: 'Active Sprints', value: global?.activeSprints || 0, icon: TrendingUp, color: 'text-amber-400', bg: 'bg-amber-500/10' },
                ].map((stat, i) => (
                    <Card key={i} className="bg-slate-900/50 border-white/10 backdrop-blur-sm">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-slate-400">{stat.title}</CardTitle>
                            <div className={`p-2 rounded-lg ${stat.bg}`}>
                                <stat.icon className={`w-4 h-4 ${stat.color}`} />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-white">{isLoading ? '-' : stat.value}</div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Project Performance */}
                <Card className="bg-slate-900/50 border-white/10 backdrop-blur-sm col-span-2 lg:col-span-1">
                    <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                            <Briefcase className="w-5 h-5 text-indigo-400" />
                            Project Performance
                        </CardTitle>
                        <CardDescription className="text-slate-400">
                            Progress tracking and task completion rates
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className="text-center text-slate-500 py-8">Loading stats...</div>
                        ) : projects?.length === 0 ? (
                            <div className="text-center text-slate-500 py-8">No active projects found.</div>
                        ) : (
                            <div className="space-y-6">
                                {projects?.map((project: any) => (
                                    <div key={project._id} className="space-y-2">
                                        <div className="flex items-center justify-between text-sm">
                                            <div className="font-medium text-slate-200">{project.name}</div>
                                            <div className="text-slate-400">{Math.round(project.progress || 0)}%</div>
                                        </div>
                                        <Progress value={project.progress || 0} className="h-2 bg-slate-800" />
                                        <div className="flex justify-between text-xs text-slate-500">
                                            <span>{project.completedTasks} / {project.totalTasks} Tasks Done</span>
                                            <span>{project.tasksRemaining} Remaining</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Team Performance */}
                <Card className="bg-slate-900/50 border-white/10 backdrop-blur-sm col-span-2 lg:col-span-1">
                    <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                            <Users className="w-5 h-5 text-purple-400" />
                            Team Performance
                        </CardTitle>
                        <CardDescription className="text-slate-400">
                            Top completed tasks and time logging
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className="text-center text-slate-500 py-8">Loading stats...</div>
                        ) : users?.length === 0 ? (
                            <div className="text-center text-slate-500 py-8">No team activity found.</div>
                        ) : (
                            <div className="space-y-4">
                                {users?.map((member: any) => (
                                    <div key={member._id} className="flex items-center justify-between p-3 rounded-lg bg-black/20 border border-white/5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-300 font-bold text-xs ring-1 ring-white/10">
                                                {member.name.charAt(0)}
                                            </div>
                                            <div>
                                                <div className="text-sm font-medium text-slate-200">{member.name}</div>
                                                <div className="text-xs text-slate-500">{member.department || 'Member'}</div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-sm font-semibold text-emerald-400 flex items-center justify-end gap-1">
                                                <CheckSquare className="w-3 h-3" />
                                                {member.completedTasks}
                                            </div>
                                            <div className="text-xs text-slate-500 flex items-center justify-end gap-1">
                                                <Clock className="w-3 h-3" />
                                                {member.totalTimeLogged}h
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
