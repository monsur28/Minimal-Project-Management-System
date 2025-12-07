'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import api from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { ChevronLeft, Flag, CheckCircle2, Circle, Layout, Briefcase, DollarSign, Image as ImageIcon, Users } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

export default function EditProjectPage() {
    const { id } = useParams();
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        status: 'planned',
        client: '',
        budget: 0,
        startDate: '',
        endDate: '',
        thumbnail: '',
        members: [] as string[],
    });

    const { data: project, isLoading: projectLoading } = useQuery({
        queryKey: ['project', id],
        queryFn: async () => {
            const { data } = await api.get(`/projects/${id}`);
            return data;
        },
        enabled: !!id,
    });

    const { data: users } = useQuery({
        queryKey: ['users'],
        queryFn: async () => {
            const { data } = await api.get('/users');
            return data;
        },
    });

    useEffect(() => {
        if (project) {
            setFormData({
                name: project.name,
                description: project.description || '',
                status: project.status || 'planned',
                client: project.client || '',
                budget: project.budget || 0,
                startDate: project.startDate ? project.startDate.split('T')[0] : '',
                endDate: project.endDate ? project.endDate.split('T')[0] : '',
                thumbnail: project.thumbnail || '',
                members: project.members?.map((m: any) => m._id) || [],
            });
        }
    }, [project]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.put(`/projects/${id}`, formData);
            router.push(`/dashboard/projects/${id}`);
        } catch (error) {
            console.error('Failed to update project', error);
        } finally {
            setLoading(false);
        }
    };

    if (projectLoading) {
        return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-500">Loading project...</div>;
    }

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-2xl space-y-4"
            >
                <div className="flex justify-between items-center">
                    <Button
                        variant="ghost"
                        className="text-slate-400 hover:text-white pl-0 gap-2"
                        onClick={() => router.back()}
                    >
                        <ChevronLeft className="w-4 h-4" />
                        Back to Project
                    </Button>
                </div>

                <Card className="bg-slate-900 border-white/10 shadow-xl overflow-hidden relative">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-purple-500" />
                    <CardHeader>
                        <CardTitle className="text-2xl text-white">Edit Project</CardTitle>
                        <CardDescription className="text-slate-400">
                            Update project details and status.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-300">Project Name</label>
                                    <Input
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="bg-black/20 border-white/10 text-white focus:border-indigo-500/50"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-300">Description</label>
                                    <Textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        className="bg-black/20 border-white/10 text-white focus:border-indigo-500/50 min-h-[100px]"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                                            <Flag className="w-4 h-4 text-slate-400" />
                                            Status
                                        </label>
                                        <select
                                            value={formData.status}
                                            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                            className="flex h-10 w-full rounded-md border border-white/10 bg-black/20 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/50"
                                        >
                                            <option value="planned" className="bg-slate-900">Planned</option>
                                            <option value="active" className="bg-slate-900">Active</option>
                                            <option value="completed" className="bg-slate-900">Completed</option>
                                            <option value="archived" className="bg-slate-900">Archived</option>
                                        </select>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                                            <Briefcase className="w-4 h-4 text-slate-400" />
                                            Client (Optional)
                                        </label>
                                        <Input
                                            value={formData.client}
                                            onChange={(e) => setFormData({ ...formData, client: e.target.value })}
                                            className="bg-black/20 border-white/10 text-white focus:border-indigo-500/50"
                                            placeholder="Client Name"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                                            <DollarSign className="w-4 h-4 text-slate-400" />
                                            Budget
                                        </label>
                                        <Input
                                            type="number"
                                            value={formData.budget}
                                            onChange={(e) => setFormData({ ...formData, budget: Number(e.target.value) })}
                                            className="bg-black/20 border-white/10 text-white focus:border-indigo-500/50"
                                            min="0"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                                            <ImageIcon className="w-4 h-4 text-slate-400" />
                                            Thumbnail URL
                                        </label>
                                        <Input
                                            value={formData.thumbnail}
                                            onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
                                            className="bg-black/20 border-white/10 text-white focus:border-indigo-500/50"
                                            placeholder="https://..."
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-300">Start Date</label>
                                        <Input
                                            type="date"
                                            value={formData.startDate}
                                            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                            className="bg-black/20 border-white/10 text-white focus:border-indigo-500/50 [color-scheme:dark]"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-300">End Date</label>
                                        <Input
                                            type="date"
                                            value={formData.endDate}
                                            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                            className="bg-black/20 border-white/10 text-white focus:border-indigo-500/50 [color-scheme:dark]"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Member Management Section */}
                            <div className="space-y-3 pt-4 border-t border-white/10">
                                <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                                    <Users className="w-4 h-4 text-slate-400" />
                                    Team Members
                                </label>
                                <div className="space-y-2">
                                    <div className="flex flex-wrap gap-2 mb-2">
                                        {formData.members.map(userId => {
                                            const user = users?.find((u: any) => u._id === userId) || project?.members?.find((m: any) => m._id === userId);
                                            return (
                                                <div key={userId} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-sm">
                                                    <span>{user?.name || userId}</span>
                                                    <button
                                                        type="button"
                                                        onClick={() => setFormData(prev => ({
                                                            ...prev,
                                                            members: prev.members.filter(id => id !== userId)
                                                        }))}
                                                        className="text-indigo-400 hover:text-white"
                                                    >
                                                        &times;
                                                    </button>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    <select
                                        className="flex h-10 w-full rounded-md border border-white/10 bg-black/20 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/50"
                                        value=""
                                        onChange={(e) => {
                                            if (e.target.value && !formData.members.includes(e.target.value)) {
                                                setFormData(prev => ({
                                                    ...prev,
                                                    members: [...prev.members, e.target.value]
                                                }));
                                            }
                                        }}
                                    >
                                        <option value="">+ Add Team Member</option>
                                        {users?.filter((u: any) => !formData.members.includes(u._id)).map((user: any) => (
                                            <option key={user._id} value={user._id} className="bg-slate-900">
                                                {user.name} ({user.email})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <Button
                                type="submit"
                                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
                                disabled={loading}
                            >
                                {loading ? 'Saving Changes...' : 'Save Changes'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
}
