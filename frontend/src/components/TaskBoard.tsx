'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useParams, useRouter } from 'next/navigation';
import { Calendar, Clock, Flag, AlertCircle, User as UserIcon, Play, Square } from 'lucide-react';
import {
    DndContext,
    closestCorners,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
    useDroppable,
} from '@dnd-kit/core';
import {
    SortableContext,
    verticalListSortingStrategy,
    useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { format } from 'date-fns';

interface Task {
    _id: string;
    title: string;
    status: 'todo' | 'in-progress' | 'review' | 'done';
    priority: 'low' | 'medium' | 'high';
    estimate?: number;
    sprint?: { name: string };
    assignees: { name: string }[];
    dueDate?: string;
    timeLogged?: number;
    isTimerRunning?: boolean;
}

const columns = [
    { id: 'todo', title: 'To Do' },
    { id: 'in-progress', title: 'In Progress' },
    { id: 'review', title: 'Review' },
    { id: 'done', title: 'Done' },
];

const priorityConfig = {
    low: { color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', icon: Flag },
    medium: { color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20', icon: Flag },
    high: { color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/20', icon: AlertCircle },
};

// Sortable Task Card Component
function SortableTaskCard({ task, onClick, onStartTimer, onStopTimer }: {
    task: Task,
    onClick: () => void,
    onStartTimer: (e: React.MouseEvent, taskId: string) => void,
    onStopTimer: (e: React.MouseEvent, taskId: string) => void,
}) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({ id: task._id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    const PriorityIcon = priorityConfig[task.priority]?.icon || Flag;

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners} onClick={onClick}>
            <Card className="cursor-grab active:cursor-grabbing bg-slate-900/40 border-white/5 hover:border-indigo-500/30 hover:bg-slate-800/60 transition-all duration-200 group relative overflow-hidden">
                <div className={`absolute left-0 top-0 bottom-0 w-1 ${task.priority === 'high' ? 'bg-rose-500/50' : task.priority === 'medium' ? 'bg-amber-500/50' : 'bg-emerald-500/50'}`} />

                <CardHeader className="p-3 pb-2 space-y-2">
                    <div className="flex justify-between items-start gap-2">
                        <CardTitle className="text-sm font-medium text-slate-200 group-hover:text-indigo-300 transition-colors leading-snug line-clamp-2">
                            {task.title}
                        </CardTitle>
                        <button
                            onClick={(e) => task.isTimerRunning ? onStopTimer(e, task._id) : onStartTimer(e, task._id)}
                            className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center border transition-colors ${task.isTimerRunning
                                ? 'bg-rose-500/10 border-rose-500/30 text-rose-400 hover:bg-rose-500/20'
                                : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 opacity-0 group-hover:opacity-100'
                                }`}
                            title={task.isTimerRunning ? "Stop Timer" : "Start Timer"}
                        >
                            {task.isTimerRunning ? <Square className="w-3 h-3 fill-current" /> : <Play className="w-3 h-3 fill-current" />}
                        </button>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider border ${priorityConfig[task.priority]?.bg} ${priorityConfig[task.priority]?.color} ${priorityConfig[task.priority]?.border}`}>
                            <PriorityIcon className="w-3 h-3" />
                            {task.priority}
                        </div>
                        {task.sprint && (
                            <div className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                                <Calendar className="w-3 h-3" />
                                {task.sprint.name}
                            </div>
                        )}
                    </div>
                </CardHeader>

                <CardContent className="p-3 pt-2">
                    <div className="flex items-center justify-between gap-2 pt-2 border-t border-white/5 mt-1">
                        <div className="flex items-center gap-2 max-w-[60%]">
                            {task.assignees.length > 0 ? (
                                <div className="flex -space-x-2">
                                    {task.assignees.slice(0, 3).map((assignee, i) => (
                                        <div key={i} className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-[10px] text-slate-300 overflow-hidden" title={assignee.name}>
                                            {assignee.name.charAt(0)}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex items-center gap-1.5 text-slate-600">
                                    <UserIcon className="w-3.5 h-3.5" />
                                </div>
                            )}
                        </div>

                        <div className="flex items-center gap-2">
                            {task.dueDate && (
                                <div className="flex items-center gap-1 text-slate-500 text-[10px] whitespace-nowrap bg-white/5 px-1.5 py-0.5 rounded">
                                    <Calendar className="w-3 h-3 text-emerald-400" />
                                    {format(new Date(task.dueDate), 'MMM d')}
                                </div>
                            )}
                            {task.estimate && task.estimate > 0 && (
                                <div className="flex items-center gap-1 text-slate-500 text-[10px] whitespace-nowrap bg-white/5 px-1.5 py-0.5 rounded">
                                    <Clock className="w-3 h-3" />
                                    {task.estimate}h
                                </div>
                            )}
                            {task.timeLogged && task.timeLogged > 0 && (
                                <div className="flex items-center gap-1 text-slate-500 text-[10px] whitespace-nowrap bg-white/5 px-1.5 py-0.5 rounded" title="Time Logged">
                                    <Clock className="w-3 h-3 text-indigo-400" />
                                    {task.timeLogged.toFixed(1)}h
                                </div>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div >
    );
}

// Droppable Column Component
function TaskColumn({ column, tasks, onTaskClick, onStartTimer, onStopTimer }: {
    column: typeof columns[0],
    tasks: Task[],
    onTaskClick: (id: string) => void,
    onStartTimer: (e: React.MouseEvent, taskId: string) => void,
    onStopTimer: (e: React.MouseEvent, taskId: string) => void,
}) {
    const { setNodeRef } = useDroppable({
        id: column.id,
    });

    const columnTasks = tasks.filter((task) => task.status === column.id);

    return (
        <div className="flex flex-col gap-3 min-w-[280px]">
            <div className="flex items-center justify-between px-1">
                <h3 className="font-semibold text-slate-200">{column.title}</h3>
                <span className="text-xs font-medium text-slate-500 bg-white/5 px-2 py-0.5 rounded-full border border-white/5">
                    {columnTasks.length}
                </span>
            </div>

            <SortableContext
                id={column.id}
                items={columnTasks.map(t => t._id)}
                strategy={verticalListSortingStrategy}
            >
                <div
                    ref={setNodeRef}
                    className="flex flex-col gap-3 h-full min-h-[150px] bg-slate-900/10 rounded-xl border border-dashed border-white/5 p-2"
                >
                    {columnTasks.map((task) => (
                        <SortableTaskCard
                            key={task._id}
                            task={task}
                            onClick={() => onTaskClick(task._id)}
                            onStartTimer={onStartTimer}
                            onStopTimer={onStopTimer}
                        />
                    ))}
                </div>
            </SortableContext>
        </div>
    );
}

export default function TaskBoard() {
    const { id } = useParams();
    const router = useRouter();
    const queryClient = useQueryClient();

    const { data: tasks, isLoading } = useQuery<Task[]>({
        queryKey: ['tasks', id],
        queryFn: async () => {
            const { data } = await api.get(`/projects/${id}/tasks`);
            return data;
        },
        enabled: !!id,
    });

    const updateStatusMutation = useMutation({
        mutationFn: async ({ taskId, status }: { taskId: string, status: string }) => {
            await api.put(`/tasks/${taskId}`, { status });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tasks', id] });
        },
    });

    const startTimerMutation = useMutation({
        mutationFn: async (taskId: string) => {
            await api.post(`/tasks/${taskId}/timer/start`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tasks', id] });
        },
    });

    const stopTimerMutation = useMutation({
        mutationFn: async (taskId: string) => {
            await api.post(`/tasks/${taskId}/timer/stop`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tasks', id] });
        },
    });

    const handleStartTimer = (e: React.MouseEvent, taskId: string) => {
        e.stopPropagation();
        startTimerMutation.mutate(taskId);
    };

    const handleStopTimer = (e: React.MouseEvent, taskId: string) => {
        e.stopPropagation();
        stopTimerMutation.mutate(taskId);
    };

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
        useSensor(KeyboardSensor)
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (!over) return;

        const taskId = active.id as string;
        let newStatus = '';

        // Check if dropped over a column directly
        if (columns.some(col => col.id === over.id)) {
            newStatus = over.id as string;
        } else {
            // Check if dropped over another task
            const overTask = tasks?.find(t => t._id === over.id);
            if (overTask) {
                newStatus = overTask.status;
            }
        }

        const task = tasks?.find((t) => t._id === taskId);

        if (newStatus && task && task.status !== newStatus) {
            updateStatusMutation.mutate({ taskId, status: newStatus });
        }
    };

    const handleTaskClick = (taskId: string) => {
        router.push(`/dashboard/projects/${id}/tasks/${taskId}/edit`);
    };

    if (isLoading) return (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4 animate-pulse">
            {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-96 rounded-xl bg-slate-900/30 border border-white/5" />
            ))}
        </div>
    );

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragEnd={handleDragEnd}
        >
            <div className="grid grid-cols-1 gap-4 md:grid-cols-4 h-full align-top items-start">
                {columns.map((column) => (
                    <TaskColumn
                        key={column.id}
                        column={column}
                        tasks={tasks || []}
                        onTaskClick={handleTaskClick}
                        onStartTimer={handleStartTimer}
                        onStopTimer={handleStopTimer}
                    />
                ))}
            </div>
        </DndContext>
    );
}
