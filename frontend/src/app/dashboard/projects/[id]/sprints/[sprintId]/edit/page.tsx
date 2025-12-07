'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import api from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { Calendar, ChevronLeft, Flag, Save } from 'lucide-react';
import { format } from 'date-fns';

export default function EditSprintPage() {
    const [name, setName] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [status, setStatus] = useState('planned');
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);

    const router = useRouter();
    const { id, sprintId } = useParams();

    useEffect(() => {
        const fetchSprint = async () => {
            try {
                // Assuming we can fetch a single sprint from the list or we need a new endpoint
                // The backend has getSprints (plural). Let's see if we used a single getSprint endpoint in the controller.
                // Looking at checking controller previously...
                // Controller has: getSprints (all for project), createSprint, updateSprint, deleteSprint.
                // It does NOT seem to have a getSprintById for a single sprint exposed publicly or protected? 
                // Wait, updateSprint uses findById, deleteSprint uses findById. 
                // But there is no getSprintById in standard exports shown in view_file.
                // Let's re-read the sprint.routes.ts to be sure.
                // If not, I can just fetch all sprints and find the one I want, or I should add getSprintById.
                // Let's just fetch all for now and filter, it's safer than modifying backend unless needed.

                const { data } = await api.get(`/projects/${id}/sprints`);
                const sprint = data.find((s: any) => s._id === sprintId);

                if (sprint) {
                    setName(sprint.name);
                    setStartDate(sprint.startDate.split('T')[0]);
                    setEndDate(sprint.endDate.split('T')[0]);
                    setStatus(sprint.status);
                } else {
                    console.error('Sprint not found');
                    router.push(`/dashboard/projects/${id}`);
                }
            } catch (error) {
                console.error('Failed to fetch sprint', error);
            } finally {
                setFetching(false);
            }
        };

        if (id && sprintId) {
            fetchSprint();
        }
    }, [id, sprintId, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.put(`/projects/${id}/sprints/${sprintId}`, {
                name,
                startDate,
                endDate,
                status
            });
            router.push(`/dashboard/projects/${id}`);
        } catch (error) {
            console.error('Failed to update sprint', error);
        } finally {
            setLoading(false);
        }
    };

    if (fetching) {
        return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-500">Loading sprint details...</div>;
    }

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-lg space-y-4"
            >
                <Button
                    variant="ghost"
                    className="text-slate-400 hover:text-white pl-0 gap-2"
                    onClick={() => router.back()}
                >
                    <ChevronLeft className="w-4 h-4" />
                    Back to Project
                </Button>

                <Card className="bg-slate-900 border-white/10 shadow-xl overflow-hidden relative">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-purple-500" />
                    <CardHeader>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                                <Flag className="w-5 h-5" />
                            </div>
                            <CardTitle className="text-2xl text-white">Edit Sprint</CardTitle>
                        </div>
                        <CardDescription className="text-slate-400">
                            Update sprint timeline and status.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-300">Sprint Name</label>
                                <Input
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="e.g. Sprint 1 - Core Features"
                                    required
                                    className="bg-black/20 border-white/10 text-white focus:border-indigo-500/50"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                                        <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                                        Start Date
                                    </label>
                                    <Input
                                        type="date"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        required
                                        className="bg-black/20 border-white/10 text-white focus:border-indigo-500/50 [color-scheme:dark]"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                                        <Calendar className="w-3.5 h-3.5 text-purple-400" />
                                        End Date
                                    </label>
                                    <Input
                                        type="date"
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                        required
                                        className="bg-black/20 border-white/10 text-white focus:border-indigo-500/50 [color-scheme:dark]"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-300">Status</label>
                                <select
                                    value={status}
                                    onChange={(e) => setStatus(e.target.value)}
                                    className="flex h-10 w-full rounded-md border border-white/10 bg-black/20 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/50"
                                >
                                    <option value="planned" className="bg-slate-900">Planned</option>
                                    <option value="active" className="bg-slate-900">Active</option>
                                    <option value="completed" className="bg-slate-900">Completed</option>
                                </select>
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
