'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/axios';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { format } from 'date-fns';

interface Project {
    _id: string;
    name: string;
    description: string;
    status: string;
    startDate: string;
    endDate: string;
    owner: { name: string };
    members: { name: string }[];
}

export default function ProjectList() {
    const { data: projects, isLoading, error } = useQuery<Project[]>({
        queryKey: ['projects'],
        queryFn: async () => {
            const { data } = await api.get('/projects');
            return data;
        },
    });

    if (isLoading) return <div>Loading projects...</div>;
    if (error) return <div>Error loading projects</div>;

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {projects?.map((project) => (
                <Card key={project._id}>
                    <CardHeader>
                        <CardTitle>{project.name}</CardTitle>
                        <CardDescription>{project.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="font-semibold">Status:</span>
                                <span className="capitalize">{project.status}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="font-semibold">Owner:</span>
                                <span>{project.owner.name}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="font-semibold">Members:</span>
                                <span>{project.members.length}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="font-semibold">Due:</span>
                                <span>{project.endDate ? format(new Date(project.endDate), 'MMM d, yyyy') : 'N/A'}</span>
                            </div>
                            <Button asChild className="w-full mt-4">
                                <Link href={`/dashboard/projects/${project._id}`}>View Details</Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            ))}
            {projects?.length === 0 && (
                <div className="col-span-full text-center text-gray-500">
                    No projects found.
                </div>
            )}
        </div>
    );
}
