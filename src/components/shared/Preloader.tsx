"use client";

import React, { useState, useEffect, useRef } from 'react';

const Preloader: React.FC = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [fadeOut, setFadeOut] = useState(false);
    const [progress, setProgress] = useState(0);

    const pageLoadedRef = useRef(false);
    const finishedRef = useRef(false);
    const progressRef = useRef(0);

    useEffect(() => {
        const markLoaded = () => { pageLoadedRef.current = true; };
        if (document.readyState === 'complete') pageLoadedRef.current = true;
        else window.addEventListener('load', markLoaded);

        const finish = () => {
            if (finishedRef.current) return;
            finishedRef.current = true;
            setProgress(100);
            setTimeout(() => {
                setFadeOut(true);
                setTimeout(() => setIsLoading(false), 700);
            }, 520);
        };

        // 0 → 100 plays at a constant, even pace (linear) over a fixed window,
        // while the homepage loads in the background during it.
        const MIN_DURATION = 3000;
        const start = performance.now();

        let raf = 0;
        const loop = (now: number) => {
            if (finishedRef.current) return;
            const elapsed = now - start;
            const t = Math.min(elapsed / MIN_DURATION, 1);
            let p = t * 100;
            if (!pageLoadedRef.current) p = Math.min(p, 92);
            else if (t < 1) p = Math.min(p, 99);

            progressRef.current = p;
            setProgress(p);

            if (pageLoadedRef.current && t >= 1) { finish(); return; }
            raf = requestAnimationFrame(loop);
        };
        raf = requestAnimationFrame(loop);
        const safety = setTimeout(() => { pageLoadedRef.current = true; }, 8000);

        return () => {
            cancelAnimationFrame(raf);
            clearTimeout(safety);
            window.removeEventListener('load', markLoaded);
        };
    }, []);

    if (!isLoading) return null;

    const pct = Math.min(progress, 100);
    const rounded = Math.round(pct);

    return (
        <div
            className={`fixed inset-0 z-[99999] flex items-center justify-center overflow-hidden transition-all duration-700 ease-out ${fadeOut ? 'opacity-0 scale-[1.04]' : 'opacity-100 scale-100'}`}
            style={{ pointerEvents: fadeOut ? 'none' : 'auto', background: 'var(--color-primary-dark)' }}
        >
            <style>{`
                @keyframes plAurora {
                    0%   { transform: translate(-12%, -8%) scale(1); }
                    33%  { transform: translate(10%, 6%) scale(1.15); }
                    66%  { transform: translate(-6%, 10%) scale(1.05); }
                    100% { transform: translate(-12%, -8%) scale(1); }
                }
                @keyframes plAurora2 {
                    0%   { transform: translate(8%, 10%) scale(1.1); }
                    50%  { transform: translate(-10%, -6%) scale(1); }
                    100% { transform: translate(8%, 10%) scale(1.1); }
                }
                @keyframes plSpin { to { transform: rotate(360deg); } }
                @keyframes plPop { 0% { opacity: 0; transform: scale(0.85); } 100% { opacity: 1; transform: scale(1); } }
                @keyframes plFadeUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes plShimmer { 0% { transform: translateX(-120%); } 100% { transform: translateX(320%); } }
                @keyframes plDot { 0%,100% { opacity: 0.25; } 50% { opacity: 1; } }
                @media (prefers-reduced-motion: reduce) {
                    .pl-anim { animation: none !important; }
                }
            `}</style>

            {/* ── Animated aurora background ── */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div
                    className="pl-anim absolute -top-1/3 -left-1/4 w-[80vw] h-[80vw] rounded-full"
                    style={{ background: 'radial-gradient(circle, var(--color-primary) 0%, transparent 65%)', filter: 'blur(80px)', opacity: 0.9, animation: 'plAurora 14s ease-in-out infinite' }}
                />
                <div
                    className="pl-anim absolute -bottom-1/3 -right-1/4 w-[70vw] h-[70vw] rounded-full"
                    style={{ background: 'radial-gradient(circle, var(--color-secondary) 0%, transparent 65%)', filter: 'blur(90px)', opacity: 0.5, animation: 'plAurora2 16s ease-in-out infinite' }}
                />
                <div
                    className="pl-anim absolute top-1/4 right-1/3 w-[45vw] h-[45vw] rounded-full"
                    style={{ background: 'radial-gradient(circle, var(--color-primary-light) 0%, transparent 70%)', filter: 'blur(100px)', opacity: 0.25, animation: 'plAurora 20s ease-in-out infinite reverse' }}
                />
                {/* dotted texture + dark vignette for depth */}
                <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '46px 46px' }} />
                <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 50% 50%, transparent 35%, rgba(0,0,0,0.35) 100%)' }} />
            </div>

            {/* ── Content ── */}
            <div className="relative z-10 flex flex-col items-center px-6 text-center">

                {/* Wordmark — outline text with a bottom→top brand fill */}
                <div className="relative inline-block" style={{ animation: 'plPop 0.7s cubic-bezier(0.22,1,0.36,1) both' }}>
                    {/* faint outline base */}
                    <h1
                        className="text-[34px] sm:text-[52px] md:text-[60px] font-extrabold tracking-[0.06em] leading-none select-none"
                        style={{ color: 'transparent', WebkitTextStroke: '1px rgba(255,255,255,0.35)' }}
                    >
                        SINOTRI<span className="font-light"> GLOBAL</span>
                    </h1>
                    {/* solid white fill, revealed bottom→top with progress */}
                    <h1
                        aria-hidden
                        className="absolute inset-0 text-[34px] sm:text-[52px] md:text-[60px] font-extrabold tracking-[0.06em] leading-none text-white select-none"
                        style={{ clipPath: `inset(${100 - pct}% 0 0 0)`, transition: 'clip-path 0.12s linear', textShadow: '0 2px 24px rgba(255,255,255,0.25)' }}
                    >
                        SINOTRI<span className="font-light"> GLOBAL</span>
                    </h1>
                    {/* shimmer sweep across the wordmark */}
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                        <div className="pl-anim absolute top-0 left-0 h-full w-1/3" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.45), transparent)', animation: 'plShimmer 2.4s ease-in-out infinite' }} />
                    </div>
                </div>

                {/* Tagline + animated dots */}
                <div
                    className="mt-5 flex items-center gap-2 text-[10px] sm:text-[11px] font-medium uppercase tracking-[0.42em] text-white/70"
                    style={{ animation: 'plFadeUp 0.7s ease-out 0.25s both' }}
                >
                    Sourcing the world to you
                    <span className="flex gap-1 ml-1">
                        <span className="pl-anim w-1 h-1 rounded-full bg-white" style={{ animation: 'plDot 1.2s ease-in-out infinite' }} />
                        <span className="pl-anim w-1 h-1 rounded-full bg-white" style={{ animation: 'plDot 1.2s ease-in-out 0.2s infinite' }} />
                        <span className="pl-anim w-1 h-1 rounded-full bg-white" style={{ animation: 'plDot 1.2s ease-in-out 0.4s infinite' }} />
                    </span>
                </div>

                {/* Progress bar with shimmer + counter */}
                <div className="mt-8 flex flex-col items-center gap-3 w-60 sm:w-72" style={{ animation: 'plFadeUp 0.7s ease-out 0.35s both' }}>
                    <div className="relative h-[3px] w-full overflow-hidden rounded-full bg-white/15">
                        <div
                            className="absolute inset-y-0 left-0 rounded-full bg-white"
                            style={{ width: `${pct}%`, boxShadow: '0 0 12px rgba(255,255,255,0.8)', transition: 'width 0.12s linear' }}
                        />
                        <div className="pl-anim absolute top-0 left-0 h-full w-1/3" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.65), transparent)', animation: 'plShimmer 1.5s ease-in-out infinite' }} />
                    </div>
                    <span className="text-[13px] font-light tabular-nums tracking-[0.3em] text-white/85">
                        {rounded.toString().padStart(2, '0')}%
                    </span>
                </div>
            </div>
        </div>
    );
};

export default Preloader;
