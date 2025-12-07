'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogFooter,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Users,
    Search,
    Mail,
    Shield,
    MoreVertical,
    Plus,
    Briefcase,
    Wrench,
    Loader2
} from 'lucide-react';

interface User {
    _id: string;
    name: string;
    email: string;
    role: 'admin' | 'manager' | 'member';
    department?: string;
    skills?: string[];
}

export default function TeamPage() {
    const [search, setSearch] = useState('');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        role: 'member',
        department: '',
        skills: '',
    });

    const queryClient = useQueryClient();

    const { data: users, isLoading } = useQuery<User[]>({
        queryKey: ['users'],
        queryFn: async () => {
            const { data } = await api.get('/users');
            return data;
        },
    });

    const createMutation = useMutation({
        mutationFn: async (newUser: any) => {
            await api.post('/users', newUser);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            setIsDialogOpen(false);
            resetForm();
        },
    });

    const updateMutation = useMutation({
        mutationFn: async (updatedUser: any) => {
            await api.put(`/users/${editingUser?._id}`, updatedUser);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            setIsDialogOpen(false);
            resetForm();
        },
    });

    const deleteMutation = useMutation({
        mutationFn: async (userId: string) => {
            await api.delete(`/users/${userId}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
        },
    });

    const resetForm = () => {
        setEditingUser(null);
        setFormData({
            name: '',
            email: '',
            role: 'member',
            department: '',
            skills: '',
        });
    };

    const handleEdit = (user: User) => {
        setEditingUser(user);
        setFormData({
            name: user.name,
            email: user.email,
            role: user.role,
            department: user.department || '',
            skills: user.skills?.join(', ') || '',
        });
        setIsDialogOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const payload = {
            ...formData,
            skills: formData.skills.split(',').map(s => s.trim()).filter(Boolean),
        };

        if (editingUser) {
            updateMutation.mutate(payload);
        } else {
            createMutation.mutate(payload);
        }
    };

    const filteredUsers = users?.filter(user =>
        user.name.toLowerCase().includes(search.toLowerCase()) ||
        user.email.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        <Users className="w-8 h-8 text-indigo-400" />
                        Team Members
                    </h1>
                    <p className="text-slate-400 mt-1">
                        Manage users and roles within your organization
                    </p>
                </div>
                <Button onClick={() => { resetForm(); setIsDialogOpen(true); }} className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2">
                    <Plus className="w-4 h-4" />
                    Add Member
                </Button>
            </div>

            <Card className="bg-slate-900/50 border-white/10">
                <CardHeader>
                    <div className="relative max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <Input
                            placeholder="Find team members..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-9 bg-black/20 border-white/10 text-white placeholder:text-slate-500 focus:border-indigo-500/50"
                        />
                    </div>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="text-center py-8 text-slate-500">Loading users...</div>
                    ) : filteredUsers?.length === 0 ? (
                        <div className="text-center py-12 text-slate-500">
                            No users found.
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {filteredUsers?.map((user) => (
                                <div key={user._id} className="flex flex-col md:flex-row md:items-center justify-between p-4 rounded-lg bg-black/20 border border-white/5 hover:border-white/10 transition-colors gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shrink-0">
                                            {user.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-slate-200">{user.name}</h3>
                                            <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
                                                <div className="flex items-center gap-1.5">
                                                    <Mail className="w-3.5 h-3.5" />
                                                    {user.email}
                                                </div>
                                                {user.department && (
                                                    <div className="flex items-center gap-1.5 text-slate-400">
                                                        <Briefcase className="w-3.5 h-3.5" />
                                                        {user.department}
                                                    </div>
                                                )}
                                            </div>
                                            {user.skills && user.skills.length > 0 && (
                                                <div className="flex gap-1 mt-1.5 flex-wrap">
                                                    {user.skills.map((skill, index) => (
                                                        <span key={index} className="px-1.5 py-0.5 rounded text-[10px] bg-white/5 text-slate-400 border border-white/5">
                                                            {skill}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4 self-end md:self-auto">
                                        <div className={`px-2.5 py-1 rounded-full text-xs font-medium border flex items-center gap-1.5 capitalize ${user.role === 'admin' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' :
                                            user.role === 'manager' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                                                'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'
                                            }`}>
                                            <Shield className="w-3 h-3" />
                                            {user.role}
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <Button variant="ghost" size="icon" onClick={() => handleEdit(user)} className="text-slate-400 hover:text-indigo-400 hover:bg-white/5" title="Edit User">
                                                <MoreVertical className="w-4 h-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" onClick={() => {
                                                if (confirm('Are you sure you want to remove this user?')) deleteMutation.mutate(user._id);
                                            }} className="text-slate-400 hover:text-red-400 hover:bg-red-500/10" title="Remove User">
                                                <Users className="w-4 h-4" /> {/* Using Users icon as generic remove for now, or X */}
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="bg-slate-900 border-white/10 text-white sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>{editingUser ? 'Edit Team Member' : 'Add New Member'}</DialogTitle>
                        <DialogDescription className="text-slate-400">
                            {editingUser ? 'Update user details and permissions.' : 'Create credentials for a new team member.'}
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300">Full Name</label>
                            <Input
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="John Doe"
                                required
                                className="bg-black/20 border-white/10"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300">Email Address</label>
                            <Input
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                placeholder="john@example.com"
                                required
                                className="bg-black/20 border-white/10"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-300">Role</label>
                                <select
                                    className="flex h-10 w-full rounded-md border border-white/10 bg-black/20 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                                    value={formData.role}
                                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                >
                                    <option value="member" className="bg-slate-800">Member</option>
                                    <option value="manager" className="bg-slate-800">Manager</option>
                                    <option value="admin" className="bg-slate-800">Admin</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-300">Department</label>
                                <Input
                                    value={formData.department}
                                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                    placeholder="Engineering"
                                    className="bg-black/20 border-white/10"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                                Skills <span className="text-slate-500 text-xs font-normal">(comma separated)</span>
                            </label>
                            <Input
                                value={formData.skills}
                                onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                                placeholder="React, Node.js, TypeScript"
                                className="bg-black/20 border-white/10"
                            />
                        </div>
                        <DialogFooter className="pt-4">
                            <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)} className="text-slate-400 hover:text-white">
                                Cancel
                            </Button>
                            <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                                {createMutation.isPending || updateMutation.isPending ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    'Save Member'
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
