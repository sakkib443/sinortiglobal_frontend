"use client";

import React, { useState, useEffect, useRef } from 'react';
import { FiTruck } from 'react-icons/fi';
import { APP_DATA_READY_EVENT, isAppDataReady } from '@/utils/appReady';

const Preloader: React.FC = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [fadeOut, setFadeOut] = useState(false);
    const [progress, setProgress] = useState(0);

    const pageLoadedRef = useRef(false);
    const finishedRef = useRef(false);
    const progressRef = useRef(0);
    const dataReadyRef = useRef(false);

    useEffect(() => {
        // Only gate completion on backend data for routes that fetch critical
        // above-the-fold data (the homepage). Other pages keep the old, quick
        // behaviour so they never sit waiting for a signal that won't come.
        const waitForData = window.location.pathname === '/';

        const markLoaded = () => { pageLoadedRef.current = true; };
        if (document.readyState === 'complete') pageLoadedRef.current = true;
        else window.addEventListener('load', markLoaded);

        const markDataReady = () => { dataReadyRef.current = true; };
        if (!waitForData || isAppDataReady()) dataReadyRef.current = true;
        else window.addEventListener(APP_DATA_READY_EVENT, markDataReady);

        const finish = () => {
            if (finishedRef.current) return;
            finishedRef.current = true;
            setProgress(100);
            setTimeout(() => {
                setFadeOut(true);
                setTimeout(() => setIsLoading(false), 700);
            }, 520);
        };

        // Count up at a STEADY, even pace (linear) — like 1,2,3,4,5… — advanced
        // per real frame (NOT from wall-clock elapsed), so if the main thread is
        // briefly busy loading, dropped frames just slow the count a touch
        // instead of making it teleport. It creeps steadily toward 90 while the
        // page is still loading, then runs the rest of the way to 100 smoothly
        // once the page is ready.
        const MIN_DURATION = 1800;
        const start = performance.now();

        const CREEP = 0.4;   // % per frame while still loading (steady, gentle)
        const FINISH = 2.2;  // % per frame once ready (smooth, quick run to 100)

        let raf = 0;
        const loop = (now: number) => {
            if (finishedRef.current) return;
            const ready =
                pageLoadedRef.current &&
                dataReadyRef.current &&
                (now - start) >= MIN_DURATION;

            let next: number;
            if (ready) {
                next = progressRef.current + FINISH;
                if (next >= 100) {
                    progressRef.current = 100;
                    setProgress(100);
                    finish();
                    return;
                }
            } else {
                next = Math.min(progressRef.current + CREEP, 90);
            }
            progressRef.current = next;
            setProgress(next);
            raf = requestAnimationFrame(loop);
        };
        raf = requestAnimationFrame(loop);
        const safety = setTimeout(() => {
            pageLoadedRef.current = true;
            dataReadyRef.current = true;
        }, 8000);

        return () => {
            cancelAnimationFrame(raf);
            clearTimeout(safety);
            window.removeEventListener('load', markLoaded);
            window.removeEventListener(APP_DATA_READY_EVENT, markDataReady);
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
                @keyframes plDrop { 0% { transform: translateY(-50px) rotate(-10deg); opacity: 0; } 55% { transform: translateY(5px) rotate(3deg); opacity: 1; } 75% { transform: translateY(-2px) rotate(-1deg); } 100% { transform: translateY(0) rotate(0deg); opacity: 1; } }
                @keyframes plBob { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-2.5px); } }
                @keyframes plRoad { to { background-position: -24px 0; } }
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
                <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: 'radial-gradient(circle, var(--color-primary-foreground) 1px, transparent 1px)', backgroundSize: '46px 46px' }} />
                <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 50% 50%, transparent 35%, rgba(0,0,0,0.35) 100%)' }} />
            </div>

            {/* ── Content ── */}
            <div className="relative z-10 flex flex-col items-center px-6 text-center">

                {/* Logo / wordmark on top */}
                <div className="relative overflow-hidden" style={{ animation: 'plPop 0.7s cubic-bezier(0.22,1,0.36,1) both' }}>
                    <h1 className="text-[20px] sm:text-[26px] font-light tracking-[0.4em] text-[var(--color-primary-foreground)] select-none">
                        SINOTRI<span className="font-semibold">&nbsp;GLOBAL</span>
                    </h1>
                    <div className="pl-anim absolute top-0 left-0 h-full w-1/3" style={{ background: 'linear-gradient(90deg, transparent, color-mix(in srgb, var(--color-primary-foreground) 50%, transparent), transparent)', animation: 'plShimmer 2.6s ease-in-out infinite' }} />
                </div>

                {/* Tagline */}
                <p
                    className="mt-2 text-[9.5px] sm:text-[10px] font-medium uppercase tracking-[0.42em] text-[var(--color-primary-foreground)] opacity-60"
                    style={{ animation: 'plFadeUp 0.7s ease-out 0.2s both' }}
                >
                    Sourcing the world to you
                </p>

                {/* Delivery road with a travelling truck */}
                <div className="relative mt-14 w-72 sm:w-80" style={{ animation: 'plFadeUp 0.7s ease-out 0.3s both' }}>
                    {/* Truck — drops in from the top, then rides along to the progress point */}
                    <div
                        className="absolute -top-7 z-20"
                        style={{ left: `${pct}%`, transform: 'translateX(-50%)', transition: 'left 0.2s linear' }}
                    >
                        <div style={{ animation: 'plDrop 0.9s cubic-bezier(0.34,1.56,0.64,1) both' }}>
                            <div className="pl-anim" style={{ animation: 'plBob 0.55s ease-in-out infinite' }}>
                                <FiTruck size={30} className="text-[var(--color-primary-foreground)]" style={{ filter: 'drop-shadow(0 4px 7px rgba(0,0,0,0.35))' }} />
                            </div>
                        </div>
                    </div>

                    {/* Road */}
                    <div className="relative h-[3px] w-full rounded-full overflow-hidden" style={{ background: 'color-mix(in srgb, var(--color-primary-foreground) 18%, transparent)' }}>
                        {/* moving road dashes */}
                        <div className="pl-anim absolute inset-0 opacity-40" style={{ backgroundImage: 'repeating-linear-gradient(90deg, color-mix(in srgb, var(--color-primary-foreground) 70%, transparent) 0 8px, transparent 8px 16px)', animation: 'plRoad 0.5s linear infinite' }} />
                        {/* progress fill */}
                        <div className="absolute inset-y-0 left-0 rounded-full" style={{ width: `${pct}%`, background: 'var(--color-primary-foreground)', boxShadow: '0 0 12px color-mix(in srgb, var(--color-primary-foreground) 85%, transparent)', transition: 'width 0.2s linear' }} />
                    </div>

                    {/* end markers */}
                    <div className="flex justify-between mt-2 text-[9px] font-medium tracking-widest text-[var(--color-primary-foreground)] opacity-40 select-none">
                        <span>0%</span><span>100%</span>
                    </div>
                </div>

                {/* Percent counter below */}
                <div className="mt-4 flex items-center gap-2" style={{ animation: 'plFadeUp 0.7s ease-out 0.4s both' }}>
                    <span className="text-2xl sm:text-3xl font-extralight text-[var(--color-primary-foreground)] tabular-nums tracking-tight select-none">
                        {rounded}<span className="text-sm align-super opacity-50 ml-0.5">%</span>
                    </span>
                    <span className="flex gap-1 ml-1">
                        <span className="pl-anim w-1 h-1 rounded-full" style={{ background: 'var(--color-primary-foreground)', animation: 'plDot 1.2s ease-in-out infinite' }} />
                        <span className="pl-anim w-1 h-1 rounded-full" style={{ background: 'var(--color-primary-foreground)', animation: 'plDot 1.2s ease-in-out 0.2s infinite' }} />
                        <span className="pl-anim w-1 h-1 rounded-full" style={{ background: 'var(--color-primary-foreground)', animation: 'plDot 1.2s ease-in-out 0.4s infinite' }} />
                    </span>
                </div>
            </div>
        </div>
    );
};

export default Preloader;
