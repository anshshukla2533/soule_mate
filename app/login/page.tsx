'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const result = await signIn('credentials', {
                email,
                password,
                redirect: false,
            });

            if (result?.error) {
                setError('Invalid credentials');
            } else {
                router.push('/dashboard');
                router.refresh();
            }
        } catch (err) {
            setError('An error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] bg-pink-100/50 blur-[120px] rounded-full" />
            <div className="absolute bottom-[-20%] left-[-10%] w-[60%] h-[60%] bg-rose-100/50 blur-[120px] rounded-full" />

            <div className="max-w-md w-full glass rounded-[2.5rem] p-10 space-y-8 relative z-10 border-white/60 shadow-2xl">
                <div className="text-center space-y-2">
                    <h1 className="text-5xl font-black text-love mb-2">
                        Welcome
                    </h1>
                    <p className="text-gray-500 font-medium">Step into your next adventure in love.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-600 text-sm font-semibold animate-pulse">
                            {error}
                        </div>
                    )}

                    <div className="space-y-2">
                        <label className="block text-sm font-bold text-gray-700 ml-1">
                            Secret Email
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@example.com"
                            className="w-full px-6 py-4 bg-white/50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-rose-200 focus:bg-white transition-all duration-300 font-medium"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-bold text-gray-700 ml-1">
                            Your Password
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full px-6 py-4 bg-white/50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-rose-200 focus:bg-white transition-all duration-300 font-medium"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-5 love-gradient text-white rounded-2xl font-bold text-lg shadow-xl hover:shadow-rose-400/40 transition-all duration-300 transform hover:-translate-y-1 active:scale-95 disabled:opacity-50"
                    >
                        {loading ? 'Opening Doors...' : 'Login to Your Heart 💝'}
                    </button>
                </form>

                <p className="text-center text-sm text-gray-500 font-medium">
                    New here?{' '}
                    <Link href="/register" className="text-rose-600 font-bold hover:underline decoration-2 underline-offset-4">
                        Create an account
                    </Link>
                </p>
            </div>
        </div>
    );
}
