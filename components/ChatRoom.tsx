'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';

interface Message {
    id: string;
    content: string;
    senderId: string;
    createdAt: string;
    sender: { name: string };
}

export default function ChatRoom({ matchId }: { matchId: string }) {
    const { data: session } = useSession();
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetchMessages();
        const interval = setInterval(fetchMessages, 3000); // Polling every 3s
        return () => clearInterval(interval);
    }, [matchId]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTo({
                top: scrollRef.current.scrollHeight,
                behavior: 'smooth'
            });
        }
    }, [messages]);

    const fetchMessages = async () => {
        try {
            const res = await fetch(`/api/messages?matchId=${matchId}`);
            const data = await res.json();
            if (data.messages) {
                setMessages(data.messages);
            }
        } catch (err) {
            console.error('Fetch messages error:', err);
        } finally {
            setLoading(false);
        }
    };

    const sendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || sending) return;

        const content = input;
        setInput('');
        setSending(true);

        try {
            const res = await fetch('/api/messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content, matchId }),
            });
            const data = await res.json();
            if (data.message) {
                setMessages((prev) => [...prev, data.message]);
            }
        } catch (err) {
            console.error('Send message error:', err);
            setInput(content); // Restore input on error
        } finally {
            setSending(false);
        }
    };

    if (loading && messages.length === 0) {
        return (
            <div className="h-[500px] flex items-center justify-center glass rounded-[3rem]">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-rose-100 border-t-rose-500 rounded-full animate-spin" />
                    <p className="text-xs font-black text-rose-300 uppercase tracking-widest animate-pulse">Opening the Sanctuary...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-[600px] glass rounded-[3rem] overflow-hidden border-white/60 shadow-2xl relative">
            {/* Background Glow */}
            <div className="absolute inset-0 pointer-events-none opacity-20">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-rose-300 blur-[80px] rounded-full" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-pink-300 blur-[80px] rounded-full" />
            </div>

            {/* Header */}
            <div className="relative z-10 p-7 bg-white/40 backdrop-blur-xl border-b border-rose-50/50 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl love-gradient p-[1px]">
                        <div className="w-full h-full bg-white/20 backdrop-blur-md rounded-[calc(1rem-1px)] flex items-center justify-center text-xl">
                            💬
                        </div>
                    </div>
                    <div>
                        <h3 className="text-xl font-black text-love leading-tight">Private Sanctuary</h3>
                        <p className="text-[10px] font-bold text-rose-300 uppercase tracking-[0.2em]">End-to-end vibration</p>
                    </div>
                </div>
                <div className="flex items-center gap-3 px-4 py-2 bg-emerald-50/50 border border-emerald-100 rounded-full">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_10px_rgba(52,211,153,0.5)]" />
                    <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Enlightened</span>
                </div>
            </div>

            {/* Messages Area */}
            <div
                ref={scrollRef}
                className="relative z-10 flex-1 overflow-y-auto p-8 space-y-6 scroll-smooth scrollbar-hide"
            >
                {messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center space-y-6">
                        <div className="w-24 h-24 rounded-full bg-rose-50 flex items-center justify-center text-5xl animate-float">✨</div>
                        <div className="space-y-2">
                            <p className="text-lg font-black text-gray-800">The first spark is yours.</p>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest max-w-[200px] mx-auto leading-relaxed">
                                Break the silence with something truly beautiful.
                            </p>
                        </div>
                    </div>
                ) : (
                    messages.map((msg, idx) => {
                        const isMe = msg.senderId === session?.user?.id;
                        const showName = idx === 0 || messages[idx - 1].senderId !== msg.senderId;

                        return (
                            <div
                                key={msg.id}
                                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} group transform transition-all duration-500 hover:scale-[1.01]`}
                                style={{ animation: `msgIn 0.5s ease-out backwards ${idx * 0.05}s` }}
                            >
                                {showName && (
                                    <span className={`text-[10px] font-black mb-1 uppercase tracking-widest px-2 ${isMe ? 'text-rose-400' : 'text-gray-400'}`}>
                                        {isMe ? 'You' : msg.sender.name}
                                    </span>
                                )}
                                <div
                                    className={`max-w-[75%] px-6 py-4 rounded-[1.75rem] text-sm font-medium shadow-sm transition-all relative ${isMe
                                            ? 'love-gradient text-white rounded-tr-none shadow-rose-200/50'
                                            : 'bg-white/80 backdrop-blur-md text-gray-700 rounded-tl-none shadow-gray-100 border border-white'
                                        }`}
                                >
                                    {msg.content}
                                    {/* Bubble Accent */}
                                    <div className={`absolute top-0 w-4 h-4 ${isMe ? 'right-[-8px] text-rose-500' : 'left-[-8px] text-white/80'}`}>
                                        <svg viewBox="0 0 20 20" fill="currentColor" className="w-full h-full transform scale-x-[-1]">
                                            <path d="M10 0C10 0 10 10 0 10C10 10 10 20 10 20C10 20 10 10 20 10C10 10 10 0 10 0Z" />
                                        </svg>
                                    </div>
                                </div>
                                <span className="text-[9px] font-black text-gray-300 mt-2 uppercase tracking-tighter px-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Input Area */}
            <div className="relative z-10 p-6 bg-white/40 backdrop-blur-xl border-t border-rose-50/50">
                <form onSubmit={sendMessage} className="flex gap-3 bg-white/60 p-2 rounded-[2.5rem] border border-white shadow-inner focus-within:ring-4 focus-within:ring-rose-100 transition-all duration-500">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Type a vibration..."
                        className="flex-1 px-6 py-3 bg-transparent border-none rounded-[2rem] focus:outline-none font-medium placeholder:text-gray-300 text-gray-800"
                    />
                    <button
                        type="submit"
                        disabled={!input.trim() || sending}
                        className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500 shadow-lg active:scale-95 disabled:opacity-30 ${input.trim() ? 'love-gradient text-white shadow-rose-200 scale-100' : 'bg-gray-100 text-gray-300 scale-90'
                            }`}
                    >
                        {sending ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <svg className="w-6 h-6 transform rotate-45" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                            </svg>
                        )}
                    </button>
                </form>
            </div>

            <style jsx>{`
                @keyframes msgIn {
                    from { opacity: 0; transform: translateY(10px) scale(0.95); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }
                .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                }
                .scrollbar-hide {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>
        </div>
    );
}
