'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import api from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { Calendar, ChevronLeft, Flag } from 'lucide-react';

export default function NewSprintPage() {
    const [name, setName] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const { id } = useParams();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post(`/projects/${id}/sprints`, {
                name,
                startDate,
                endDate,
            });
            router.push(`/dashboard/projects/${id}`);
        } catch (error) {
            console.error('Failed to create sprint', error);
        } finally {
            setLoading(false);
        }
    };

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
                            <CardTitle className="text-2xl text-white">Create Sprint</CardTitle>
                        </div>
                        <CardDescription className="text-slate-400">
                            Define a new timeline for tasks.
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

                            <Button
                                type="submit"
                                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-lg shadow-indigo-500/20"
                                disabled={loading}
                            >
                                {loading ? 'Creating Sprint...' : 'Start Sprint'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
}
