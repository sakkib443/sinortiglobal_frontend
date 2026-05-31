"use client";

import React from 'react';
import Link from 'next/link';

/* ════════════════════════════════════════════════════════════════
   FROM THE WORLD TO BANGLADESH
   A clean world map that simply marks the countries products are
   sourced from, with light routes converging into Bangladesh.
   Markers are placed using real lat/long on a full-extent
   equirectangular map, so they land on the correct countries.
═══════════════════════════════════════════════════════════════════ */

// Equirectangular projection. Longitude is full (-180..180); the map image is
// cropped vertically to latitude +84..-56 (polar ice strips removed), so the
// vertical mapping uses that range to keep markers on the right countries.
const px = (lon: number) => ((lon + 180) / 360) * 100; // % from left
const py = (lat: number) => ((64 - lat) / 120) * 100;   // % from top (lat 64..-56)
// SVG space is 200 x 100 (matches the 2:1 box → uniform scaling)
const sx = (lon: number) => px(lon) * 2;
const sy = (lat: number) => py(lat);

// `code` = ISO-3166 alpha-2, used to load the real flag image
// (emoji flags don't render on Windows, so we use PNGs).
const HUB = { name: 'Bangladesh', code: 'bd', lon: 90.4, lat: 23.7 };

const SOURCES = [
    { name: 'China', code: 'cn', lon: 104, lat: 35.8 },
    { name: 'United States', code: 'us', lon: -98, lat: 39.8 },
    { name: 'United Kingdom', code: 'gb', lon: -1.5, lat: 52.5 },
    { name: 'Pakistan', code: 'pk', lon: 69.3, lat: 30.4 },
    { name: 'UAE', code: 'ae', lon: 54, lat: 24 },
    { name: 'Philippines', code: 'ph', lon: 122, lat: 12.8 },
    { name: 'Australia', code: 'au', lon: 134, lat: -25 },
];

function arcPath(lon: number, lat: number): string {
    const x1 = sx(lon), y1 = sy(lat);
    const x2 = sx(HUB.lon), y2 = sy(HUB.lat);
    const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
    const lift = Math.min(Math.hypot(x2 - x1, y2 - y1) * 0.16, 22);
    return `M ${x1.toFixed(2)} ${y1.toFixed(2)} Q ${mx.toFixed(2)} ${(my - lift).toFixed(2)} ${x2.toFixed(2)} ${y2.toFixed(2)}`;
}

// A planted flag-on-a-pole. The anchor dot is centred on the country point;
// the pole + flag rise from it, and the hub label drops below it.
function Marker({ lon, lat, code, name, hub = false }: {
    lon: number; lat: number; code: string; name: string; hub?: boolean;
}) {
    return (
        <div
            className="absolute z-20 -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${px(lon)}%`, top: `${py(lat)}%` }}
            title={name}
        >
            {/* Flag + pole rising from the point */}
            <div className="absolute left-1/2 bottom-full -translate-x-1/2 flex flex-col items-center">
                <div
                    className={`bg-white rounded-[3px] shadow-lg p-1 ${hub
                        ? 'ring-2 ring-[var(--color-secondary)]'
                        : 'ring-1 ring-black/20'}`}
                >
                    <img
                        src={`/images/flags/${code}.png`}
                        alt={name}
                        className="block rounded-[1px]"
                        style={{ width: hub ? 40 : 30, height: 'auto', maxWidth: 'none' }}
                        draggable={false}
                    />
                </div>
                <div className={`bg-gradient-to-b from-gray-300 to-gray-500 ${hub ? 'w-[3px] h-6 md:h-7' : 'w-[2.5px] h-5 md:h-6'}`} />
            </div>

            {/* Pulse ring (hub only) */}
            {hub && (
                <span
                    className="absolute left-1/2 top-1/2 w-6 h-6 rounded-full"
                    style={{ background: 'var(--color-secondary)', opacity: 0.35, animation: 'wbPing 2s ease-out infinite' }}
                />
            )}

            {/* Anchor dot on the exact country point */}
            <span
                className={`relative block rounded-full ring-2 ring-white shadow ${hub
                    ? 'w-2.5 h-2.5 bg-[var(--color-secondary)]'
                    : 'w-1.5 h-1.5 bg-[var(--color-primary)]'}`}
            />

            {/* Hub label below the point */}
            {hub && (
                <span className="absolute left-1/2 top-full -translate-x-1/2 mt-1 px-2 py-0.5 rounded-[4px] bg-[var(--color-secondary)] text-white text-[10px] md:text-[11px] font-medium whitespace-nowrap shadow-sm">
                    {name}
                </span>
            )}
        </div>
    );
}

const WorldToBangladesh: React.FC = () => {
    return (
        <section className="w-full">
            <style>{`
                @keyframes wbDash { to { stroke-dashoffset: -40; } }
                @keyframes wbPing { 0% { transform: translate(-50%,-50%) scale(0.5); opacity: 0.5; } 100% { transform: translate(-50%,-50%) scale(2.6); opacity: 0; } }
                .wb-route { animation: wbDash 3s linear infinite; }
                @media (prefers-reduced-motion: reduce) { .wb-route, .wb-dot { animation: none !important; } }
            `}</style>

            {/* Map — real satellite Earth, full-bleed (edge to edge), keeps the
                natural 2:1 proportion so it never looks squished */}
            <div
                className="relative w-full overflow-hidden"
                style={{ aspectRatio: '1500 / 500' }}
            >
                    <img
                        src="/images/world-earth.jpg"
                        alt="World map"
                        className="absolute inset-0 w-full h-full object-fill select-none pointer-events-none"
                        style={{ filter: 'saturate(1.05) brightness(1.12)' }}
                        draggable={false}
                    />
                    {/* Light veil — gives the soft, natural look (less harsh) */}
                    <div
                        className="absolute inset-0 pointer-events-none"
                        style={{ background: 'rgba(255,255,255,0.24)' }}
                    />

                    {/* Light routes converging into Bangladesh */}
                    <svg
                        className="absolute inset-0 w-full h-full z-10 pointer-events-none"
                        viewBox="0 0 200 100"
                        preserveAspectRatio="none"
                        aria-hidden
                    >
                        {SOURCES.map((c, i) => {
                            const d = arcPath(c.lon, c.lat);
                            return (
                                <g key={c.name}>
                                    {/* thin dark underlay for contrast over bright ocean */}
                                    <path d={d} fill="none" stroke="rgba(3,12,24,0.35)" strokeWidth={0.45} strokeLinecap="round" />
                                    {/* thin white flight-path dashes flowing slowly toward the hub */}
                                    <path d={d} fill="none" stroke="rgba(255,255,255,0.9)" strokeWidth={0.3} strokeLinecap="round" strokeDasharray="1.2 3" className="wb-route" style={{ animationDelay: `${i * 0.2}s` }} />
                                    {/* travelling parcel dot */}
                                    <circle r={0.85} fill="#ffd24a" stroke="rgba(0,0,0,0.25)" strokeWidth={0.12} className="wb-dot">
                                        <animateMotion dur="5.5s" repeatCount="indefinite" path={d} begin={`${i * 0.7}s`} />
                                    </circle>
                                </g>
                            );
                        })}
                    </svg>

                    {/* Country markers */}
                    {SOURCES.map((c) => (
                        <Marker key={c.name} lon={c.lon} lat={c.lat} code={c.code} name={c.name} />
                    ))}
                    <Marker lon={HUB.lon} lat={HUB.lat} code={HUB.code} name={HUB.name} hub />
            </div>

            {/* Short content — placed below so the map stays clear */}
            <div className="container text-center py-9 md:py-11">
                <h2 className="text-xl md:text-2xl font-semibold text-gray-900">
                    From the World to Bangladesh
                </h2>
                <p className="mt-2 text-[13px] md:text-sm font-normal text-gray-500 max-w-lg mx-auto">
                    Quality products sourced from China, the USA, the UK, the UAE and beyond —
                    delivered to your doorstep.
                </p>
                <Link
                    href="/quotations"
                    className="mt-5 inline-flex items-center gap-2 px-6 py-2.5 rounded-md bg-[var(--color-primary)] text-white text-sm font-medium hover:bg-[var(--color-primary-dark)] transition-colors shadow-sm"
                >
                    Start Sourcing
                    <span aria-hidden>→</span>
                </Link>
            </div>
        </section>
    );
};

export default WorldToBangladesh;
