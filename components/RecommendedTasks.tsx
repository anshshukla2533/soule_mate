'use client';

import { useState, useEffect } from 'react';

interface Task {
    id: string;
    title: string;
    description: string;
    category: string;
    difficulty: string;
}

export default function RecommendedTasks() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTasks = async () => {
            try {
                const res = await fetch('/api/tasks');
                const data = await res.json();
                setTasks(data.tasks || []);
            } catch (err) {
                console.error('Failed to fetch tasks:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchTasks();
    }, []);

    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-pulse">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-40 bg-white/30 rounded-[2rem]" />
                ))}
            </div>
        );
    }

    if (tasks.length === 0) {
        return (
            <div className="text-center p-10 glass rounded-[2rem] border-rose-100">
                <p className="text-gray-500 font-medium italic">Select your personality traits to see recommended tasks!</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-black text-love">Tasks For You</h2>
                <span className="px-4 py-1.5 rounded-full bg-rose-100 text-rose-600 text-xs font-bold uppercase tracking-wider">
                    Based on your vibe
                </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {tasks.map((task) => (
                    <div key={task.id} className="group glass p-6 rounded-[2.5rem] border-white/60 hover:bg-white/60 transition-all duration-500 card-hover">
                        <div className="flex justify-between items-start mb-4">
                            <span className="px-4 py-1 rounded-full bg-white/80 text-gray-600 text-[10px] font-black uppercase tracking-widest shadow-sm">
                                {task.category}
                            </span>
                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${task.difficulty === 'easy' ? 'bg-emerald-100 text-emerald-700' :
                                    task.difficulty === 'medium' ? 'bg-amber-100 text-amber-700' :
                                        'bg-rose-100 text-rose-700'
                                }`}>
                                {task.difficulty}
                            </span>
                        </div>

                        <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-love transition-colors">{task.title}</h3>
                        <p className="text-sm text-gray-500 font-medium leading-relaxed mb-4">
                            {task.description}
                        </p>

                        <div className="pt-4 border-t border-rose-50 flex items-center justify-between text-[11px] font-bold text-rose-400">
                            <span>SHARED GOAL</span>
                            <span className="opacity-0 group-hover:opacity-100 transition-opacity">COMPATIBLE MATCH REQUIRED →</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
