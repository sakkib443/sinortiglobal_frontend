"use client";

import React, { useState, useEffect } from 'react';

const Preloader: React.FC = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [fadeOut, setFadeOut] = useState(false);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const progressInterval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 90) { clearInterval(progressInterval); return 90; }
                return prev + Math.random() * 15;
            });
        }, 200);

        const handleLoad = () => {
            setProgress(100);
            setTimeout(() => {
                setFadeOut(true);
                setTimeout(() => setIsLoading(false), 700);
            }, 400);
        };

        if (document.readyState === 'complete') {
            setTimeout(handleLoad, 1500);
        } else {
            window.addEventListener('load', () => setTimeout(handleLoad, 800));
        }

        const safetyTimeout = setTimeout(handleLoad, 4000);
        return () => { clearInterval(progressInterval); clearTimeout(safetyTimeout); };
    }, []);

    if (!isLoading) return null;

    return (
        <div
            className={`fixed inset-0 z-[99999] flex items-center justify-center transition-all duration-700 ${fadeOut ? 'opacity-0 scale-105' : 'opacity-100 scale-100'}`}
            style={{
                background: 'linear-gradient(135deg, #041a0e 0%, #0B4222 40%, #0d5229 70%, #083d1f 100%)',
                pointerEvents: fadeOut ? 'none' : 'auto',
            }}
        >
            {/* Background Elements */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full bg-[#18764a]/15 blur-[100px]" style={{ animation: 'preloaderFloat 6s ease-in-out infinite' }} />
                <div className="absolute -bottom-32 -right-32 w-[400px] h-[400px] rounded-full bg-[#22c55e]/10 blur-[80px]" style={{ animation: 'preloaderFloat 8s ease-in-out infinite reverse' }} />
                
                {/* Grid */}
                <div className="absolute inset-0 opacity-[0.03]" style={{
                    backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.15) 1px, transparent 1px)`,
                    backgroundSize: '40px 40px',
                }} />
            </div>

            {/* Content */}
            <div className="relative z-10 flex flex-col items-center">

                {/* Logo Icon */}
                <div className="relative mb-8">
                    {/* Outer spinning ring */}
                    <div className="w-32 h-32 rounded-full" style={{ animation: 'preloaderSpin 3s linear infinite' }}>
                        <svg viewBox="0 0 128 128" className="w-full h-full">
                            <circle cx="64" cy="64" r="60" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="2" />
                            <circle cx="64" cy="64" r="60" fill="none" stroke="url(#preloaderRing)" strokeWidth="2.5" strokeDasharray="90 280" strokeLinecap="round" />
                            <defs>
                                <linearGradient id="preloaderRing" x1="0%" y1="0%" x2="100%" y2="0%">
                                    <stop offset="0%" stopColor="#22c55e" stopOpacity="0.9" />
                                    <stop offset="100%" stopColor="#22c55e" stopOpacity="0" />
                                </linearGradient>
                            </defs>
                        </svg>
                    </div>

                    {/* Inner globe */}
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-24 h-24 rounded-full flex items-center justify-center" style={{
                            background: 'linear-gradient(135deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.04) 100%)',
                            backdropFilter: 'blur(12px)',
                            border: '1px solid rgba(255,255,255,0.15)',
                            animation: 'preloaderPulse 2s ease-in-out infinite',
                        }}>
                            {/* Globe SVG */}
                            <svg width="56" height="56" viewBox="0 0 56 56">
                                <circle cx="28" cy="28" r="24" fill="rgba(34,197,94,0.15)" stroke="rgba(255,255,255,0.2)" strokeWidth="1"/>
                                <ellipse cx="28" cy="28" rx="13" ry="24" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="0.8"/>
                                <ellipse cx="28" cy="28" rx="20" ry="24" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="0.6"/>
                                <line x1="4" y1="28" x2="52" y2="28" stroke="rgba(255,255,255,0.12)" strokeWidth="0.6"/>
                                <line x1="8" y1="16" x2="48" y2="16" stroke="rgba(255,255,255,0.08)" strokeWidth="0.5"/>
                                <line x1="8" y1="40" x2="48" y2="40" stroke="rgba(255,255,255,0.08)" strokeWidth="0.5"/>
                                <text x="28" y="36" textAnchor="middle" fontFamily="'Segoe UI', Arial" fontWeight="800" fontSize="28" fill="white" opacity="0.95">S</text>
                            </svg>
                        </div>
                    </div>

                    {/* Orbiting dot */}
                    <div className="absolute inset-[-6px]" style={{ animation: 'preloaderSpin 2s linear infinite reverse' }}>
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-[#22c55e] shadow-[0_0_12px_rgba(34,197,94,0.6)]" />
                    </div>
                </div>

                {/* Brand Text */}
                <div className="text-center" style={{ animation: 'preloaderFadeUp 0.8s ease-out 0.3s both' }}>
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-[0.15em] uppercase">
                        SINOTRI
                    </h1>
                    <div className="mt-1.5 h-[1.5px] bg-gradient-to-r from-transparent via-[#22c55e]/50 to-transparent" style={{ animation: 'preloaderLineExpand 1s ease-out 0.6s both' }} />
                    <p className="mt-2.5 text-[#22c55e]/50 text-[11px] tracking-[0.4em] uppercase font-medium" style={{ animation: 'preloaderFadeUp 0.8s ease-out 0.8s both' }}>
                        Global Trading Platform
                    </p>
                </div>

                {/* Progress */}
                <div className="w-52 sm:w-64 mt-10" style={{ animation: 'preloaderFadeUp 0.8s ease-out 0.5s both' }}>
                    <div className="h-[2px] bg-white/[0.06] rounded-full overflow-hidden">
                        <div
                            className="h-full rounded-full transition-all duration-500 ease-out"
                            style={{
                                width: `${Math.min(progress, 100)}%`,
                                background: 'linear-gradient(90deg, #22c55e, #4ade80, #22c55e)',
                                boxShadow: '0 0 8px rgba(34,197,94,0.4)',
                            }}
                        />
                    </div>
                    <div className="flex justify-between mt-2">
                        <span className="text-[10px] text-white/25 font-medium tracking-[0.2em] uppercase">Loading</span>
                        <span className="text-[10px] text-[#22c55e]/60 font-bold tabular-nums">
                            {Math.round(Math.min(progress, 100))}%
                        </span>
                    </div>
                </div>
            </div>

            {/* Inline Animations */}
            <style jsx>{`
                @keyframes preloaderSpin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                @keyframes preloaderFloat {
                    0%, 100% { transform: translate(0, 0) scale(1); }
                    50% { transform: translate(30px, -20px) scale(1.1); }
                }
                @keyframes preloaderPulse {
                    0%, 100% { transform: scale(1); opacity: 1; }
                    50% { transform: scale(1.04); opacity: 0.9; }
                }
                @keyframes preloaderFadeUp {
                    from { opacity: 0; transform: translateY(12px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes preloaderLineExpand {
                    from { transform: scaleX(0); }
                    to { transform: scaleX(1); }
                }
            `}</style>
        </div>
    );
};

export default Preloader;
