'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function NewProjectPage() {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [client, setClient] = useState('');
    const [budget, setBudget] = useState('');
    const [status, setStatus] = useState('planned');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [thumbnail, setThumbnail] = useState('');
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/projects', {
                name,
                description,
                client,
                budget: budget ? Number(budget) : undefined,
                status,
                startDate,
                endDate,
                thumbnail
            });
            router.push('/dashboard/projects');
        } catch (error) {
            console.error('Failed to create project', error);
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold text-white mb-6">Create New Project</h1>
            <Card className="bg-slate-900/50 border-white/10">
                <CardHeader>
                    <CardTitle className="text-white">Project Details</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-300">Project Name *</label>
                                <Input
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                    className="bg-black/20 border-white/10 text-white"
                                    placeholder="e.g. Website Redesign"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-300">Client Name</label>
                                <Input
                                    value={client}
                                    onChange={(e) => setClient(e.target.value)}
                                    className="bg-black/20 border-white/10 text-white"
                                    placeholder="e.g. Acme Corp"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300">Description</label>
                            <Input
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="bg-black/20 border-white/10 text-white"
                                placeholder="Brief overview of the project..."
                            />
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-300">Budget ($)</label>
                                <Input
                                    type="number"
                                    value={budget}
                                    onChange={(e) => setBudget(e.target.value)}
                                    className="bg-black/20 border-white/10 text-white"
                                    placeholder="0.00"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-300">Status</label>
                                <select
                                    value={status}
                                    onChange={(e) => setStatus(e.target.value)}
                                    className="w-full h-10 px-3 rounded-md bg-black/20 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                                >
                                    <option value="planned">Planned</option>
                                    <option value="active">Active</option>
                                    <option value="completed">Completed</option>
                                    <option value="archived">Archived</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-300">Start Date</label>
                                <Input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="bg-black/20 border-white/10 text-white"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-300">End Date</label>
                                <Input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="bg-black/20 border-white/10 text-white"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300">Thumbnail URL (Optional)</label>
                            <Input
                                value={thumbnail}
                                onChange={(e) => setThumbnail(e.target.value)}
                                className="bg-black/20 border-white/10 text-white"
                                placeholder="https://..."
                            />
                        </div>

                        <div className="flex justify-end gap-2 pt-4">
                            <Button type="button" variant="outline" onClick={() => router.back()} className="border-white/10 text-slate-300 hover:text-white hover:bg-white/5">
                                Cancel
                            </Button>
                            <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white">
                                Create Project
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
