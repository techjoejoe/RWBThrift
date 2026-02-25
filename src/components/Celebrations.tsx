'use client';

import React, { useEffect, useState } from 'react';

interface Particle {
    id: number;
    x: number;
    y: number;
    color: string;
    size: number;
    rotation: number;
    dx: number;
    dy: number;
    dr: number;
    shape: 'rect' | 'circle' | 'strip';
    delay: number;
}

const COLORS = ['#FF6B6B', '#4ECDC4', '#FFE66D', '#2563EB', '#A855F7', '#F97316', '#10B981', '#EC4899', '#F59E0B', '#06B6D4'];
const SHAPES: Particle['shape'][] = ['rect', 'circle', 'strip'];

export function Confetti({ trigger }: { trigger: boolean }) {
    const [particles, setParticles] = useState<Particle[]>([]);

    useEffect(() => {
        if (!trigger) return;

        // 3 burst waves from different positions
        const allParticles: Particle[] = [];
        const bursts = [
            { x: 50, count: 50, delay: 0 },     // center
            { x: 25, count: 35, delay: 0.15 },   // left
            { x: 75, count: 35, delay: 0.3 },    // right
        ];

        let id = 0;
        bursts.forEach(burst => {
            for (let i = 0; i < burst.count; i++) {
                allParticles.push({
                    id: id++,
                    x: burst.x + (Math.random() - 0.5) * 30,
                    y: -10 - Math.random() * 15,
                    color: COLORS[Math.floor(Math.random() * COLORS.length)],
                    size: 5 + Math.random() * 8,
                    rotation: Math.random() * 360,
                    dx: (Math.random() - 0.5) * 4,
                    dy: 1.5 + Math.random() * 3.5,
                    dr: (Math.random() - 0.5) * 20,
                    shape: SHAPES[Math.floor(Math.random() * SHAPES.length)],
                    delay: burst.delay + Math.random() * 0.2,
                });
            }
        });

        setParticles(allParticles);
        const timer = setTimeout(() => setParticles([]), 4500);
        return () => clearTimeout(timer);
    }, [trigger]);

    if (particles.length === 0) return null;

    return (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
            {particles.map((p) => {
                const w = p.shape === 'strip' ? p.size * 0.3 : p.size;
                const h = p.shape === 'circle' ? p.size : p.shape === 'strip' ? p.size * 1.5 : p.size * 0.6;
                const radius = p.shape === 'circle' ? '50%' : '2px';
                return (
                    <div
                        key={p.id}
                        className="absolute confetti-particle"
                        style={{
                            left: `${p.x}%`,
                            top: `${p.y}%`,
                            width: w,
                            height: h,
                            backgroundColor: p.color,
                            borderRadius: radius,
                            transform: `rotate(${p.rotation}deg)`,
                            '--dx': `${p.dx * 30}vw`,
                            '--dy': `${p.dy * 35}vh`,
                            '--dr': `${p.rotation + p.dr * 30}deg`,
                            animationDuration: `${2.5 + Math.random() * 1.5}s`,
                            animationDelay: `${p.delay}s`,
                        } as React.CSSProperties}
                    />
                );
            })}
        </div>
    );
}

// Streak toast notification
export function StreakToast({ count, onDismiss }: { count: number; onDismiss: () => void }) {
    useEffect(() => {
        const timer = setTimeout(onDismiss, 3000);
        return () => clearTimeout(timer);
    }, [onDismiss]);

    return (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 animate-toast-in">
            <div className="flex items-center gap-3 px-5 py-3 rounded-2xl shadow-xl border border-yellow/20"
                style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)' }}>
                <span className="text-2xl">🔥</span>
                <div>
                    <p className="text-white font-bold text-sm">{count} in a row!</p>
                    <p className="text-white/50 text-xs">Keep the momentum going</p>
                </div>
            </div>
        </div>
    );
}

// End of day reflection modal
export function ReflectionModal({ onSubmit, onClose }: {
    onSubmit: (data: { rating: number; win: string; challenge: string }) => void;
    onClose: () => void;
}) {
    const [rating, setRating] = useState(0);
    const [win, setWin] = useState('');
    const [challenge, setChallenge] = useState('');

    const handleSubmit = () => {
        if (rating === 0) return;
        onSubmit({ rating, win, challenge });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
            <div className="relative w-full max-w-md card p-6 space-y-5 animate-scale-in" onClick={e => e.stopPropagation()}>
                <div className="text-center">
                    <span className="text-3xl">🌅</span>
                    <h2 className="text-xl font-bold text-navy-dark mt-2">How was today?</h2>
                    <p className="text-sm text-gray-400 mt-1">30 seconds to reflect and grow</p>
                </div>

                {/* Star Rating */}
                <div className="flex justify-center gap-2">
                    {[1, 2, 3, 4, 5].map(star => (
                        <button
                            key={star}
                            onClick={() => setRating(star)}
                            className={`text-3xl transition-transform hover:scale-110 ${star <= rating ? '' : 'opacity-30 grayscale'}`}
                        >
                            ⭐
                        </button>
                    ))}
                </div>

                {/* Win */}
                <div>
                    <label className="text-sm font-semibold text-navy-dark flex items-center gap-2">
                        🏆 One win today
                    </label>
                    <input
                        type="text"
                        value={win}
                        onChange={e => setWin(e.target.value)}
                        placeholder="e.g. Team huddle was great energy"
                        className="mt-1.5 w-full px-4 py-2.5 rounded-xl border border-gray-100 text-sm focus:outline-none focus:border-navy focus:ring-2 focus:ring-navy/10 placeholder:text-gray-300"
                    />
                </div>

                {/* Challenge */}
                <div>
                    <label className="text-sm font-semibold text-navy-dark flex items-center gap-2">
                        💪 One challenge
                    </label>
                    <input
                        type="text"
                        value={challenge}
                        onChange={e => setChallenge(e.target.value)}
                        placeholder="e.g. Production was behind on rag out"
                        className="mt-1.5 w-full px-4 py-2.5 rounded-xl border border-gray-100 text-sm focus:outline-none focus:border-navy focus:ring-2 focus:ring-navy/10 placeholder:text-gray-300"
                    />
                </div>

                <div className="flex gap-3">
                    <button onClick={onClose} className="flex-1 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:bg-gray-50 transition-colors">
                        Skip
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={rating === 0}
                        className="flex-1 btn btn-primary py-2.5 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        Save Reflection
                    </button>
                </div>
            </div>
        </div>
    );
}
