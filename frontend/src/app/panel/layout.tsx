import Sidebar from '@/components/Sidebar';

export default function PanelLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen bg-slate-950 text-slate-100">
            <Sidebar />
            <main className="flex-1 overflow-x-hidden overflow-y-auto pt-16 md:pt-0">
                <div className="container mx-auto px-4 py-8 md:px-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
