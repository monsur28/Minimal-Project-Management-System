'use client';

import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Settings, User, Mail, Shield, LogOut, Key, Save, Lock } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import api from '@/lib/axios';

export default function MemberSettingsPage() {
    const { user, logout, loading, updateUser } = useAuth(); // Assuming setUser is available in AuthContext, if not I'll just rely on reload or similar. 
    // Wait, I should check AuthContext. If setUser isn't exposed, I might need to reload or just update backend.

    const router = useRouter();

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    useEffect(() => {
        if (!loading && !user) {
            router.push('/');
        } else if (user) {
            setFormData(prev => ({ ...prev, name: user.name, email: user.email }));
        }
    }, [user, loading, router]);

    const updateProfileMutation = useMutation({
        mutationFn: async (data: any) => {
            const res = await api.put('/users/profile', data);
            return res.data;
        },
        onSuccess: (data) => {
            setMessage({ type: 'success', text: 'Profile updated successfully' });
            setFormData(prev => ({ ...prev, password: '', confirmPassword: '' }));
            if (user && updateUser) {
                updateUser({ ...user, ...data });
            }
        },
        onError: (error: any) => {
            setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to update profile' });
        }
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(null);

        if (formData.password && formData.password !== formData.confirmPassword) {
            setMessage({ type: 'error', text: 'Passwords do not match' });
            return;
        }

        const updateData: any = {
            name: formData.name,
            email: formData.email,
        };

        if (formData.password) {
            updateData.password = formData.password;
        }

        updateProfileMutation.mutate(updateData);
    };

    if (loading || !user) {
        return (
            <div className="flex h-full items-center justify-center text-slate-400">
                <div className="animate-pulse">Loading settings...</div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        <Settings className="w-8 h-8 text-indigo-400" />
                        Settings
                    </h1>
                    <p className="text-slate-400 mt-1">
                        Manage your account preferences
                    </p>
                </div>
            </div>

            <div className="grid gap-6 max-w-2xl">
                <Card className="bg-slate-900/50 border-white/10 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="text-white">Profile Information</CardTitle>
                        <CardDescription className="text-slate-400">
                            Update your personal account details
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {message && (
                                <div className={`p-3 rounded text-sm ${message.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>
                                    {message.text}
                                </div>
                            )}

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-400 flex items-center gap-2">
                                    <User className="w-4 h-4" /> Full Name
                                </label>
                                <Input
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="bg-black/20 border-white/10 text-white focus:border-indigo-500/50"
                                    placeholder="Your Name"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-400 flex items-center gap-2">
                                    <Mail className="w-4 h-4" /> Email Address
                                </label>
                                <Input
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="bg-black/20 border-white/10 text-white focus:border-indigo-500/50"
                                    placeholder="email@example.com"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-white/10">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-400 flex items-center gap-2">
                                        <Lock className="w-4 h-4" /> New Password
                                    </label>
                                    <Input
                                        type="password"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        className="bg-black/20 border-white/10 text-white focus:border-indigo-500/50"
                                        placeholder="Leave blank to keep current"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-400 flex items-center gap-2">
                                        <Key className="w-4 h-4" /> Confirm Password
                                    </label>
                                    <Input
                                        type="password"
                                        value={formData.confirmPassword}
                                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                        className="bg-black/20 border-white/10 text-white focus:border-indigo-500/50"
                                        placeholder="Confirm new password"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2 pt-2">
                                <label className="text-sm font-medium text-slate-400 flex items-center gap-2">
                                    <Shield className="w-4 h-4" /> Role & Permissions
                                </label>
                                <div className="flex items-center justify-between p-3 rounded-md bg-black/20 border border-white/10 text-slate-200">
                                    <div className="flex items-center gap-2 capitalize">
                                        <span className={`w-2 h-2 rounded-full ${user.role === 'admin' ? 'bg-rose-500' :
                                            user.role === 'manager' ? 'bg-amber-500' :
                                                'bg-cyan-500'
                                            }`} />
                                        {user.role}
                                    </div>
                                    <span className="text-xs text-slate-500">Read-only</span>
                                </div>
                            </div>

                            <div className="pt-4 flex items-center justify-between">
                                <Button
                                    type="button"
                                    onClick={logout}
                                    variant="destructive"
                                    className="gap-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20"
                                >
                                    <LogOut className="w-4 h-4" />
                                    Sign Out
                                </Button>

                                <Button
                                    type="submit"
                                    disabled={updateProfileMutation.isPending}
                                    className="gap-2 bg-indigo-500 hover:bg-indigo-600 text-white"
                                >
                                    {updateProfileMutation.isPending ? 'Saving...' : 'Save Changes'}
                                    {!updateProfileMutation.isPending && <Save className="w-4 h-4" />}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
