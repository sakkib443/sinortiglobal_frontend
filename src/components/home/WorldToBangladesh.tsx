"use client";

import React from 'react';
import Link from 'next/link';
import { ComposableMap, Geographies, Geography } from 'react-simple-maps';
import { geoEquirectangular } from 'd3-geo';

/* ════════════════════════════════════════════════════════════════
   FROM THE WORLD TO BANGLADESH
   A plain, flat world map. Land is a soft grey; the countries we
   operate in are filled with the brand highlight colour and carry a
   planted flag. Light dashed routes converge into Bangladesh.

   The country shapes are drawn by react-simple-maps from a bundled
   world TopoJSON. The flags + routes are overlaid with the SAME
   equirectangular projection, so every flag lands on its country at
   any screen size.
═══════════════════════════════════════════════════════════════════ */

// Map canvas (viewBox units). Equirectangular, cropped to the inhabited
// latitude band (+83..-56) so the poles/Antarctica are trimmed.
const MAP_W = 800;
const MAP_H = 309;
const PROJ_SCALE = 127.3;
const PROJ_CENTER: [number, number] = [0, 13.5];

// One projection instance, reused for flag + route placement. Its scale,
// center and translate match what we pass to <ComposableMap> below.
const projection = geoEquirectangular()
    .scale(PROJ_SCALE)
    .center(PROJ_CENTER)
    .translate([MAP_W / 2, MAP_H / 2]);

const project = (lon: number, lat: number): [number, number] =>
    (projection([lon, lat]) as [number, number]) || [0, 0];

// `code` = ISO-3166 alpha-2, used to load the real flag PNG.
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

// Country names exactly as they appear in world-atlas countries-110m.json.
const HIGHLIGHT = new Set([
    'Bangladesh',
    'China',
    'United States of America',
    'United Kingdom',
    'Pakistan',
    'United Arab Emirates',
    'Philippines',
    'Australia',
]);

// Palette — plain grey land, warm highlight for our countries.
const LAND_FILL = '#E6E8EB';
const LAND_STROKE = '#FFFFFF';
const HILITE_FILL = '#E8843C';
const HILITE_STROKE = '#CE7029';

// Quadratic arc (in viewBox units) from a source country into the hub.
function arcPath(lon: number, lat: number): string {
    const [x1, y1] = project(lon, lat);
    const [x2, y2] = project(HUB.lon, HUB.lat);
    const mx = (x1 + x2) / 2;
    const my = (y1 + y2) / 2;
    const lift = Math.min(Math.hypot(x2 - x1, y2 - y1) * 0.18, 34);
    return `M ${x1.toFixed(2)} ${y1.toFixed(2)} Q ${mx.toFixed(2)} ${(my - lift).toFixed(2)} ${x2.toFixed(2)} ${y2.toFixed(2)}`;
}

// A small arrowhead near the hub end of a route, oriented along the flow
// (toward Bangladesh). Returns viewBox-space position + rotation in degrees.
function arrowMark(lon: number, lat: number, t = 0.7): { bx: number; by: number; ang: number } {
    const [x0, y0] = project(lon, lat);
    const [x2, y2] = project(HUB.lon, HUB.lat);
    const cx = (x0 + x2) / 2;
    const cy = (y0 + y2) / 2 - Math.min(Math.hypot(x2 - x0, y2 - y0) * 0.18, 34);
    const u = 1 - t;
    const bx = u * u * x0 + 2 * u * t * cx + t * t * x2;
    const by = u * u * y0 + 2 * u * t * cy + t * t * y2;
    const dx = 2 * u * (cx - x0) + 2 * t * (x2 - cx);
    const dy = 2 * u * (cy - y0) + 2 * t * (y2 - cy);
    return { bx, by, ang: (Math.atan2(dy, dx) * 180) / Math.PI };
}

// A planted flag-on-a-pole, positioned by % so it tracks the map at any size.
function FlagMarker({ lon, lat, code, name, hub = false }: {
    lon: number; lat: number; code: string; name: string; hub?: boolean;
}) {
    const [x, y] = project(lon, lat);
    const left = (x / MAP_W) * 100;
    const top = (y / MAP_H) * 100;
    return (
        <div
            className="absolute z-20 -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${left}%`, top: `${top}%` }}
            title={name}
        >
            {/* Flag + pole rising from the point */}
            <div className="absolute left-1/2 bottom-full -translate-x-1/2 flex flex-col items-center">
                <div className={`bg-white rounded-[3px] shadow-md p-[3px] ${hub ? 'ring-2 ring-[var(--color-secondary)]' : 'ring-1 ring-black/15'}`}>
                    <img
                        src={`/images/flags/${code}.png`}
                        alt={name}
                        className="block rounded-[1px]"
                        style={{ width: hub ? 'clamp(18px, 4vw, 34px)' : 'clamp(13px, 3vw, 26px)', height: 'auto', maxWidth: 'none' }}
                        draggable={false}
                    />
                </div>
                <div
                    className={`bg-gradient-to-b from-gray-300 to-gray-500 ${hub ? 'w-[3px]' : 'w-[2px]'}`}
                    style={{ height: hub ? 'clamp(14px, 3vw, 24px)' : 'clamp(11px, 2.4vw, 20px)' }}
                />
            </div>

            {/* Anchor dot on the exact country point */}
            <span className={`relative block rounded-full ring-2 ring-white shadow ${hub ? 'w-2.5 h-2.5 bg-[var(--color-secondary)]' : 'w-1.5 h-1.5 bg-[#E8843C]'}`} />

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
        <section className="w-full bg-white overflow-x-hidden">
            <style>{`
                @keyframes wbDash { to { stroke-dashoffset: -32; } }
                .wb-route { animation: wbDash 4s linear infinite; }
                @media (prefers-reduced-motion: reduce) { .wb-route { animation: none !important; } }
            `}</style>

            {/* Map — plain flat world, full-bleed (edge to edge) */}
            <div className="relative w-full overflow-hidden">
                <ComposableMap
                    projection="geoEquirectangular"
                    projectionConfig={{ scale: PROJ_SCALE, center: PROJ_CENTER }}
                    width={MAP_W}
                    height={MAP_H}
                    style={{ width: '100%', height: 'auto', display: 'block' }}
                >
                    <Geographies geography="/data/countries-110m.json">
                        {({ geographies }: { geographies: any[] }) =>
                            geographies.map((geo) => {
                                const on = HIGHLIGHT.has(geo.properties?.name);
                                return (
                                    <Geography
                                        key={geo.rsmKey}
                                        geography={geo}
                                        fill={on ? HILITE_FILL : LAND_FILL}
                                        stroke={on ? HILITE_STROKE : LAND_STROKE}
                                        strokeWidth={0.4}
                                        style={{
                                            default: { outline: 'none' },
                                            hover: { outline: 'none', fill: on ? HILITE_FILL : LAND_FILL },
                                            pressed: { outline: 'none' },
                                        }}
                                    />
                                );
                            })
                        }
                    </Geographies>
                </ComposableMap>

                {/* Dashed routes converging into Bangladesh */}
                <svg
                    className="absolute inset-0 w-full h-full z-10 pointer-events-none"
                    viewBox={`0 0 ${MAP_W} ${MAP_H}`}
                    preserveAspectRatio="none"
                    aria-hidden
                >
                    {SOURCES.map((c, i) => (
                        <path
                            key={c.name}
                            d={arcPath(c.lon, c.lat)}
                            fill="none"
                            stroke="rgba(120,130,140,0.55)"
                            strokeWidth={0.6}
                            strokeLinecap="round"
                            strokeDasharray="1.6 3"
                            className="wb-route"
                            style={{ animationDelay: `${i * 0.25}s` }}
                        />
                    ))}
                    {/* Subtle arrowheads showing the flow into Bangladesh */}
                    {SOURCES.map((c) => {
                        const a = arrowMark(c.lon, c.lat);
                        return (
                            <path
                                key={`${c.name}-arrow`}
                                d="M 0 0 L -4.8 -2.6 L -3.1 0 L -4.8 2.6 Z"
                                transform={`translate(${a.bx.toFixed(2)} ${a.by.toFixed(2)}) rotate(${a.ang.toFixed(1)})`}
                                fill="rgba(88,99,112,0.88)"
                            />
                        );
                    })}
                </svg>

                {/* Flags */}
                {SOURCES.map((c) => (
                    <FlagMarker key={c.name} lon={c.lon} lat={c.lat} code={c.code} name={c.name} />
                ))}
                <FlagMarker lon={HUB.lon} lat={HUB.lat} code={HUB.code} name={HUB.name} hub />
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
