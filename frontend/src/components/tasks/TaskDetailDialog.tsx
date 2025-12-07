import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/context/AuthContext';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import api from '@/lib/axios';
import { useState } from 'react';
import { format } from 'date-fns';
import { AlertCircle, CheckCircle2, Circle, Clock, MessageSquare, Paperclip, Send, Upload } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { TaskComments } from './TaskComments';

interface Task {
    _id: string;
    title: string;
    description: string;
    status: 'todo' | 'in-progress' | 'review' | 'done';
    priority: 'low' | 'medium' | 'high';
    estimate: number;
    timeLogged: number;
    dueDate?: string;
    assignees: any[];
    project: any;
    sprint?: any;
    attachments: string[];
}

interface TaskDetailDialogProps {
    task: Task | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function TaskDetailDialog({ task, open, onOpenChange }: TaskDetailDialogProps) {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const [newComment, setNewComment] = useState('');
    const [isUploading, setIsUploading] = useState(false);

    const updateStatusMutation = useMutation({
        mutationFn: async (status: string) => {
            if (!task) return;
            await api.put(`/tasks/${task._id}`, { status });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['my-tasks'] });
            queryClient.invalidateQueries({ queryKey: [task?.project?._id, 'tasks'] });
            onOpenChange(false);
        },
    });

    const uploadMutation = useMutation({
        mutationFn: async (file: File) => {
            if (!task) return;
            const formData = new FormData();
            formData.append('file', file);
            const res = await api.post('/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            const relativePath = res.data;
            // Add attachment to task
            const newAttachments = [...(task.attachments || []), relativePath];
            await api.put(`/tasks/${task._id}`, { attachments: newAttachments });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['my-tasks'] });
            queryClient.invalidateQueries({ queryKey: [task?.project?._id, 'tasks'] });
            setIsUploading(false);
        },
        onError: () => {
            setIsUploading(false);
            alert('Upload failed');
        }
    });

    // Placeholder for comments query - needs backend support or fetching logs
    // ideally we would have a separate comment system or activity log.
    // implementing basic comments placeholder for now.

    if (!task) return null;

    const handleStatusChange = (newStatus: string) => {
        updateStatusMutation.mutate(newStatus);
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setIsUploading(true);
            uploadMutation.mutate(file);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="bg-slate-900 border-white/10 text-white sm:max-w-2xl max-h-[85vh] overflow-hidden flex flex-col p-0 gap-0">

                {/* Header */}
                <div className="p-6 pb-2">
                    <div className="flex justify-between items-start gap-4">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2 mb-1">
                                <Badge variant="outline" className="text-xs border-indigo-500/30 text-indigo-400">
                                    {task.project?.key}-{task._id.slice(-4)}
                                </Badge>
                                <Badge variant="secondary" className={`capitalize ${task.priority === 'high' ? 'bg-red-500/10 text-red-500 hover:bg-red-500/20' :
                                    task.priority === 'medium' ? 'bg-amber-500/10 text-amber-500 hover:bg-amber-500/20' :
                                        'bg-green-500/10 text-green-500 hover:bg-green-500/20'
                                    }`}>
                                    {task.priority}
                                </Badge>
                            </div>
                            <DialogTitle className="text-xl font-bold">{task.title}</DialogTitle>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                            {/* Status Actions */}
                            <div className="flex items-center gap-1">
                                {task.status !== 'todo' && (
                                    <Button size="sm" variant="ghost" onClick={() => handleStatusChange('todo')} disabled={updateStatusMutation.isPending}>Todo</Button>
                                )}
                                {task.status !== 'in-progress' && (
                                    <Button size="sm" variant="ghost" onClick={() => handleStatusChange('in-progress')} disabled={updateStatusMutation.isPending}>In Progress</Button>
                                )}
                                {task.status !== 'review' && (
                                    <Button size="sm" variant="ghost" onClick={() => handleStatusChange('review')} disabled={updateStatusMutation.isPending}>Review</Button>
                                )}
                                {task.status !== 'done' && (user?.role === 'manager' || user?.role === 'admin') && (
                                    <Button size="sm" variant="ghost" onClick={() => handleStatusChange('done')} disabled={updateStatusMutation.isPending}>Done</Button>
                                )}
                                {task.status !== 'done' && user?.role === 'member' && (
                                    <Button size="sm" variant="ghost" onClick={() => handleStatusChange('done')} disabled={updateStatusMutation.isPending}>Mark Done (Request Review)</Button>
                                )}
                            </div>
                            <Badge className={`uppercase ${task.status === 'done' ? 'bg-green-500' :
                                task.status === 'review' ? 'bg-purple-500' :
                                    task.status === 'in-progress' ? 'bg-blue-500' : 'bg-slate-500'
                                }`}>
                                {task.status}
                            </Badge>
                        </div>
                    </div>
                </div>

                <Separator className="bg-white/10" />

                <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
                    {/* Main Content */}
                    <ScrollArea className="flex-1 p-6">
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-sm font-medium text-slate-400 mb-2">Description</h3>
                                <div className="text-sm leading-relaxed whitespace-pre-wrap">
                                    {task.description || "No description provided."}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <h3 className="text-sm font-medium text-slate-400 mb-2">Details</h3>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-slate-500">Estimate:</span>
                                            <span>{task.estimate}h</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-slate-500">Logged:</span>
                                            <span>{task.timeLogged}h</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-slate-500">Due Date:</span>
                                            <span>{task.dueDate ? format(new Date(task.dueDate), 'MMM d, yyyy') : '-'}</span>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-sm font-medium text-slate-400 mb-2">Assignees</h3>
                                    <div className="flex flex-wrap gap-1">
                                        {task.assignees?.map((assignee: any, index: number) => (
                                            <div key={assignee._id || index} className="flex items-center gap-1.5 bg-white/5 rounded-full pl-1 pr-2 py-0.5">
                                                <Avatar className="w-5 h-5">
                                                    <AvatarImage src={assignee.avatar} />
                                                    <AvatarFallback className="text-[10px] bg-indigo-500">{assignee.name?.[0] || 'U'}</AvatarFallback>
                                                </Avatar>
                                                <span className="text-xs">{assignee.name?.split(' ')[0] || 'User'}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Attachments Section */}
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-sm font-medium text-slate-400">Attachments</h3>
                                    <label className="cursor-pointer text-xs flex items-center gap-1 text-indigo-400 hover:text-indigo-300 transition-colors">
                                        <Upload className="w-3 h-3" />
                                        Upload
                                        <input type="file" className="hidden" onChange={handleFileUpload} disabled={isUploading} />
                                    </label>
                                </div>
                                {task.attachments?.length > 0 ? (
                                    <div className="space-y-1">
                                        {task.attachments.map((att, i) => (
                                            <a key={i} href={api.defaults.baseURL?.replace('/api', '') + att} target="_blank" rel="noreferrer" className="flex items-center gap-2 p-2 rounded bg-white/5 hover:bg-white/10 transition-colors text-xs text-blue-300 truncate">
                                                <Paperclip className="w-3 h-3 flex-shrink-0" />
                                                <span className="truncate">{typeof att === 'string' ? att.split('/').pop() : 'Attachment'}</span>
                                            </a>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-xs text-slate-600 italic">No attachments</div>
                                )}
                            </div>
                        </div>
                    </ScrollArea>

                    {/* Right Side: Comments/Activity */}
                    <div className="w-full md:w-[320px]">
                        <TaskComments taskId={task._id} />
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
