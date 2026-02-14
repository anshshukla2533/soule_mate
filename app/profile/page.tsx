'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'react-router-dom'; // Using next/navigation but keeping logic clean

interface Trait {
    id: string;
    name: string;
}

export default function ProfilePage() {
    const [traits, setTraits] = useState<Trait[]>([]);
    const [selectedTraits, setSelectedTraits] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    // We'll use window.location for simpler redirect in this overhaul

    useEffect(() => {
        fetchTraits();
    }, []);

    const fetchTraits = async () => {
        try {
            const res = await fetch('/api/traits');
            const data = await res.json();
            setTraits(data.traits);
        } catch (err) {
            setError('Failed to load traits');
        } finally {
            setLoading(false);
        }
    };

    const toggleTrait = (traitId: string) => {
        setSelectedTraits((prev) =>
            prev.includes(traitId)
                ? prev.filter((id) => id !== traitId)
                : [...prev, traitId]
        );
    };

    const handleSubmit = async () => {
        if (selectedTraits.length === 0) {
            setError('Please select at least one trait to describe your beautiful self');
            return;
        }

        setSubmitting(true);
        setError('');

        try {
            const res = await fetch('/api/users/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ traitIds: selectedTraits }),
            });

            if (res.ok) {
                window.location.href = '/dashboard';
            } else {
                setError('Failed to update your heart settings');
            }
        } catch (err) {
            setError('An error occurred');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-16 h-16 border-4 border-rose-200 border-t-rose-600 rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen p-6 py-16 relative overflow-hidden">
            <div className="max-w-4xl mx-auto glass rounded-[3.5rem] p-10 md:p-16 space-y-10 relative z-10 shadow-2xl">
                <div className="text-center space-y-4">
                    <div className="text-6xl">🎭</div>
                    <h1 className="text-5xl md:text-6xl font-black text-love">
                        Your Vibe
                    </h1>
                    <p className="text-gray-500 font-medium text-lg max-w-xl mx-auto">
                        Select the traits that define you. We use these to find your most compatible soulmate.
                    </p>
                </div>

                {error && (
                    <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-600 text-sm font-bold text-center animate-bounce">
                        {error}
                    </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {traits.map((trait) => (
                        <button
                            key={trait.id}
                            onClick={() => toggleTrait(trait.id)}
                            className={`group flex items-center justify-between p-6 rounded-2xl transition-all duration-500 transform ${selectedTraits.includes(trait.id)
                                    ? 'love-gradient text-white shadow-xl -translate-y-1 scale-105'
                                    : 'bg-white/40 hover:bg-white/70 text-gray-700 border border-white/60 hover:shadow-lg'
                                }`}
                        >
                            <span className="font-bold text-lg">{trait.name}</span>
                            <span className={`text-2xl transition-transform duration-500 ${selectedTraits.includes(trait.id) ? 'rotate-12 scale-125' : 'grayscale group-hover:grayscale-0'}`}>
                                {trait.name.toLowerCase().includes('adventure') ? '🏔️' :
                                    trait.name.toLowerCase().includes('social') ? '🤝' :
                                        trait.name.toLowerCase().includes('book') ? '📖' :
                                            trait.name.toLowerCase().includes('sport') ? '⚽' :
                                                trait.name.toLowerCase().includes('creative') ? '🎨' :
                                                    trait.name.toLowerCase().includes('music') ? '🎵' :
                                                        trait.name.toLowerCase().includes('tech') ? '💻' :
                                                            trait.name.toLowerCase().includes('nature') ? '🌿' :
                                                                trait.name.toLowerCase().includes('fitness') ? '💪' :
                                                                    trait.name.toLowerCase().includes('volunteer') ? '💖' : '✨'}
                            </span>
                        </button>
                    ))}
                </div>

                <div className="flex justify-center pt-8">
                    <button
                        onClick={handleSubmit}
                        disabled={submitting || selectedTraits.length === 0}
                        className="px-12 py-5 love-gradient text-white rounded-[2rem] font-black text-2xl shadow-2xl hover:shadow-rose-400/50 transition-all duration-300 transform hover:-translate-y-1 active:scale-95 disabled:opacity-50"
                    >
                        {submitting ? 'Updating Soul...' : `Ready for Love ✨`}
                    </button>
                </div>
            </div>
        </div>
    );
}
