"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useGetSiteContentQuery } from '@/redux/api/siteContentApi';

interface ThemeContextType {
    primaryColor: string;
    secondaryColor: string;
    logoUrl: string;
    faviconUrl: string;
    isLoaded: boolean;
}

const DEFAULT_LOGO = 'https://res.cloudinary.com/dkdp9sjty/image/upload/v1779572322/sinotri/products/product_1779572322226_x8mu1h.png';

const defaultTheme: ThemeContextType = {
    primaryColor: '#003B88',
    secondaryColor: '#E4525C',
    logoUrl: DEFAULT_LOGO,
    faviconUrl: '',
    isLoaded: false,
};

const ThemeContext = createContext<ThemeContextType>(defaultTheme);

export const useTheme = () => useContext(ThemeContext);

/* ─── Color Helpers ─── */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    try {
        hex = hex.replace('#', '');
        return {
            r: parseInt(hex.substring(0, 2), 16),
            g: parseInt(hex.substring(2, 4), 16),
            b: parseInt(hex.substring(4, 6), 16),
        };
    } catch { return null; }
}

function rgbToHex(r: number, g: number, b: number): string {
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

function darken(hex: string, amount: number): string {
    const rgb = hexToRgb(hex);
    if (!rgb) return hex;
    return rgbToHex(Math.max(0, rgb.r - amount), Math.max(0, rgb.g - amount), Math.max(0, rgb.b - amount));
}

function lighten(hex: string, factor: number): string {
    const rgb = hexToRgb(hex);
    if (!rgb) return hex;
    return rgbToHex(
        Math.min(255, Math.round(rgb.r + (255 - rgb.r) * factor)),
        Math.min(255, Math.round(rgb.g + (255 - rgb.g) * factor)),
        Math.min(255, Math.round(rgb.b + (255 - rgb.b) * factor)),
    );
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const { data: res } = useGetSiteContentQuery({});
    const [themeData, setThemeData] = useState<ThemeContextType>(defaultTheme);

    useEffect(() => {
        if (res?.data?.theme) {
            const t = res.data.theme;
            const primary = t.primaryColor || '#003B88';
            const secondary = t.secondaryColor || '#E4525C';

            // Calculate derivative colors from primary
            const primaryDark = darken(primary, 20);
            const primaryLight = lighten(primary, 0.85);      // soft background
            const primaryLightest = lighten(primary, 0.93);    // very light bg
            const primaryBorder = lighten(primary, 0.7);       // border color
            const primarySurface = lighten(primary, 0.96);     // surface bg

            // Apply all to CSS variables
            const root = document.documentElement;
            root.style.setProperty('--color-primary', primary);
            root.style.setProperty('--color-primary-dark', primaryDark);
            root.style.setProperty('--color-primary-light', primaryLight);
            root.style.setProperty('--color-primary-lightest', primaryLightest);
            root.style.setProperty('--color-primary-border', primaryBorder);
            root.style.setProperty('--color-primary-surface', primarySurface);
            root.style.setProperty('--color-secondary', secondary);

            setThemeData({
                primaryColor: primary,
                secondaryColor: secondary,
                logoUrl: t.logoUrl || DEFAULT_LOGO,
                faviconUrl: t.faviconUrl || '',
                isLoaded: true,
            });
        }
    }, [res]);

    return (
        <ThemeContext.Provider value={themeData}>
            {children}
        </ThemeContext.Provider>
    );
}
