'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        gender: '',
        age: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setLoading(true);

        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    password: formData.password,
                    gender: formData.gender,
                    age: formData.age,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || 'Registration failed');
            } else {
                router.push('/login?registered=true');
            }
        } catch (_err) {
            setError('An error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 py-20 relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute top-[-15%] left-[-10%] w-[50%] h-[50%] bg-rose-200/40 blur-[130px] rounded-full" />
            <div className="absolute bottom-[-15%] right-[-10%] w-[50%] h-[50%] bg-pink-200/40 blur-[130px] rounded-full" />

            <div className="max-w-xl w-full glass rounded-[3rem] p-10 md:p-14 space-y-10 relative z-10 border-white/60 shadow-2xl">
                <div className="text-center space-y-3">
                    <h1 className="text-5xl md:text-6xl font-black text-love">
                        Start Forever
                    </h1>
                    <p className="text-gray-500 font-medium text-lg">Create an account and find your perfect rhythm.</p>
                </div>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {error && (
                        <div className="col-span-full p-4 bg-rose-50 border border-rose-200 rounded-[1.5rem] text-rose-600 text-sm font-bold text-center">
                            {error}
                        </div>
                    )}

                    <div className="col-span-full space-y-2">
                        <label className="block text-sm font-bold text-gray-700 ml-2">Full Name</label>
                        <input
                            type="text"
                            placeholder="Your beautiful name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-6 py-4 bg-white/50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-rose-200 focus:bg-white transition-all duration-300 font-medium"
                            required
                        />
                    </div>

                    <div className="col-span-full space-y-2">
                        <label className="block text-sm font-bold text-gray-700 ml-2">Email Address</label>
                        <input
                            type="email"
                            placeholder="heart@example.com"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="w-full px-6 py-4 bg-white/50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-rose-200 focus:bg-white transition-all duration-300 font-medium"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-bold text-gray-700 ml-2">Gender</label>
                        <select
                            value={formData.gender}
                            onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                            className="w-full px-6 py-4 bg-white/50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-rose-200 focus:bg-white transition-all duration-300 font-medium appearance-none"
                            required
                        >
                            <option value="">Select Gender</option>
                            <option value="boy">Gentleman</option>
                            <option value="girl">Lady</option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-bold text-gray-700 ml-2">Age</label>
                        <input
                            type="number"
                            placeholder="Age"
                            value={formData.age}
                            onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                            className="w-full px-6 py-4 bg-white/50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-rose-200 focus:bg-white transition-all duration-300 font-medium"
                            min="18"
                            max="100"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-bold text-gray-700 ml-2">Password</label>
                        <input
                            type="password"
                            placeholder="••••••••"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            className="w-full px-6 py-4 bg-white/50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-rose-200 focus:bg-white transition-all duration-300 font-medium"
                            required
                            minLength={6}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-bold text-gray-700 ml-2">Confirm Passion</label>
                        <input
                            type="password"
                            placeholder="••••••••"
                            value={formData.confirmPassword}
                            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                            className="w-full px-6 py-4 bg-white/50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-rose-200 focus:bg-white transition-all duration-300 font-medium"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="col-span-full mt-4 py-5 love-gradient text-white rounded-2xl font-black text-xl shadow-2xl hover:shadow-rose-400/50 transition-all duration-300 transform hover:-translate-y-1 active:scale-95 disabled:opacity-50"
                    >
                        {loading ? 'Sowing Seeds...' : 'Join the Love Circle 🌹'}
                    </button>
                </form>

                <p className="text-center text-sm text-gray-500 font-medium">
                    Already a member?{' '}
                    <Link href="/login" className="text-rose-600 font-black hover:underline decoration-2 underline-offset-4">
                        Login here
                    </Link>
                </p>
            </div>
        </div>
    );
}
