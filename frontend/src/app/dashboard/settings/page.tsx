'use client';

import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Settings, Shield, User, Bell, Lock } from 'lucide-react';

export default function SettingsPage() {
    const { user } = useAuth();

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        <Settings className="w-8 h-8 text-indigo-400" />
                        Settings
                    </h1>
                    <p className="text-slate-400 mt-1">
                        Configure application and account settings
                    </p>
                </div>
            </div>

            <div className="grid gap-6 max-w-4xl">
                {/* Admin Profile */}
                <Card className="bg-slate-900/50 border-white/10">
                    <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                            <User className="w-5 h-5 text-indigo-400" />
                            Admin Profile
                        </CardTitle>
                        <CardDescription className="text-slate-400">
                            Your account information
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-400">Full Name</label>
                            <Input
                                value={user?.name || ''}
                                readOnly
                                className="bg-black/20 border-white/10 text-slate-200"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-400">Email Address</label>
                            <Input
                                value={user?.email || ''}
                                readOnly
                                className="bg-black/20 border-white/10 text-slate-200"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-400">Role</label>
                            <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-black/20 border border-white/10 text-rose-400 w-fit">
                                <Shield className="w-4 h-4" />
                                <span className="capitalize">{user?.role}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* System Preferences (Mock) */}
                <Card className="bg-slate-900/50 border-white/10 opacity-75">
                    <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                            <Lock className="w-5 h-5 text-emerald-400" />
                            Security
                        </CardTitle>
                        <CardDescription className="text-slate-400">
                            Password and authentication settings
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button disabled variant="outline" className="border-white/10 text-slate-400 hover:bg-white/5">
                            Change Password
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
