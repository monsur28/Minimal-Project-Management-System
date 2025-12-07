import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import api from '@/lib/axios';
import { useState } from 'react';
import { format } from 'date-fns';
import { MessageSquare, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';

interface TaskCommentsProps {
    taskId: string;
}

export function TaskComments({ taskId }: TaskCommentsProps) {
    return (
        <div className="flex flex-col h-full bg-black/20 border-l border-white/10">
            <div className="p-3 border-b border-white/10">
                <h3 className="text-sm font-medium flex items-center gap-2 text-white">
                    <MessageSquare className="w-4 h-4" />
                    Comments
                </h3>
            </div>
            <ScrollArea className="flex-1 p-3 min-h-[200px] max-h-[400px]">
                <CommentsList taskId={taskId} />
            </ScrollArea>
            <div className="p-3 border-t border-white/10 bg-slate-900/50">
                <CommentInput taskId={taskId} />
            </div>
        </div>
    );
}

function CommentsList({ taskId }: { taskId: string }) {
    const { data: comments, isLoading } = useQuery({
        queryKey: ['comments', taskId],
        queryFn: async () => {
            const res = await api.get(`/tasks/${taskId}/comments`);
            return res.data;
        }
    });

    if (isLoading) return <div className="text-xs text-slate-500 text-center py-4">Loading comments...</div>;
    if (!comments?.length) return <div className="text-xs text-slate-500 text-center py-4">No comments yet.</div>;

    return (
        <div className="space-y-4">
            {comments.map((comment: any) => (
                <div key={comment._id} className="flex gap-2 text-sm">
                    <Avatar className="w-6 h-6 mt-1">
                        <AvatarImage src={comment.user?.avatar} />
                        <AvatarFallback className="text-[10px] bg-slate-700">{comment.user?.name?.[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                        <div className="flex items-center gap-2">
                            <span className="font-medium text-xs text-slate-300">{comment.user?.name}</span>
                            <span className="text-[10px] text-slate-600">{format(new Date(comment.createdAt), 'MMM d, HH:mm')}</span>
                        </div>
                        <p className="text-slate-400 mt-0.5 text-xs leading-relaxed">{comment.content}</p>
                    </div>
                </div>
            ))}
        </div>
    );
}

function CommentInput({ taskId }: { taskId: string }) {
    const [content, setContent] = useState('');
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: async (text: string) => {
            await api.post(`/tasks/${taskId}/comments`, { content: text });
        },
        onSuccess: () => {
            setContent('');
            queryClient.invalidateQueries({ queryKey: ['comments', taskId] });
        }
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim()) return;
        mutation.mutate(content);
    };

    return (
        <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write a comment..."
                className="bg-black/20 border-white/10 text-xs h-8 focus-visible:ring-indigo-500/50 text-white"
            />
            <Button
                type="submit"
                size="icon"
                className="h-8 w-8 bg-indigo-600 hover:bg-indigo-700 text-white"
                disabled={!content.trim() || mutation.isPending}
            >
                <Send className="w-3.5 h-3.5" />
            </Button>
        </form>
    );
}
