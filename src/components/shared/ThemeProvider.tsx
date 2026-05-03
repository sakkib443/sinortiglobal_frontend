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

const defaultTheme: ThemeContextType = {
    primaryColor: '#0B4222',
    secondaryColor: '#E4525C',
    logoUrl: '',
    faviconUrl: '',
    isLoaded: false,
};

const ThemeContext = createContext<ThemeContextType>(defaultTheme);

export const useTheme = () => useContext(ThemeContext);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const { data: res } = useGetSiteContentQuery({});
    const [themeData, setThemeData] = useState<ThemeContextType>(defaultTheme);

    useEffect(() => {
        if (res?.data?.theme) {
            const t = res.data.theme;
            const primary = t.primaryColor || '#0B4222';
            const secondary = t.secondaryColor || '#E4525C';

            // Apply to CSS variables
            const root = document.documentElement;
            root.style.setProperty('--color-primary', primary);
            root.style.setProperty('--color-secondary', secondary);

            // Inject dynamic utility classes for hardcoded Tailwind selectors
            let styleEl = document.getElementById('dynamic-theme-colors');
            if (!styleEl) {
                styleEl = document.createElement('style');
                styleEl.id = 'dynamic-theme-colors';
                document.head.appendChild(styleEl);
            }
            styleEl.innerHTML = `
                /* Dynamic Primary Color Overrides */
                .bg-\\[\\#0B4222\\] { background-color: ${primary} !important; }
                .bg-\\[\\#0B4222\\]\\/10 { background-color: ${primary}1a !important; }
                .bg-\\[\\#0B4222\\]\\/5 { background-color: ${primary}0d !important; }
                .text-\\[\\#0B4222\\] { color: ${primary} !important; }
                .border-\\[\\#0B4222\\] { border-color: ${primary} !important; }
                .hover\\:bg-\\[\\#093519\\]:hover { background-color: ${primary}dd !important; }
                .focus\\:ring-\\[\\#0B4222\\]:focus { --tw-ring-color: ${primary} !important; }
                .from-\\[\\#0B4222\\] { --tw-gradient-from: ${primary} !important; }
                .to-\\[\\#0B4222\\] { --tw-gradient-to: ${primary} !important; }
                .via-\\[\\#0B4222\\] { --tw-gradient-via: ${primary} !important; }

                /* Dynamic Secondary Color Overrides */
                .bg-\\[\\#E4525C\\] { background-color: ${secondary} !important; }
                .text-\\[\\#E4525C\\] { color: ${secondary} !important; }
                .border-\\[\\#E4525C\\] { border-color: ${secondary} !important; }

                /* Inline style overrides for common patterns */
                [style*="color: #0B4222"],
                [style*="color:#0B4222"],
                [style*="color: rgb(11, 66, 34)"] {
                    color: ${primary} !important;
                }
                [style*="background-color: #0B4222"],
                [style*="background:#0B4222"],
                [style*="background-color:#0B4222"],
                [style*="background: #0B4222"] {
                    background-color: ${primary} !important;
                }
                [style*="border-color: #0B4222"],
                [style*="border-color:#0B4222"] {
                    border-color: ${primary} !important;
                }
                [style*="background-color: #E4525C"],
                [style*="background:#E4525C"],
                [style*="background-color:#E4525C"],
                [style*="background: #E4525C"] {
                    background-color: ${secondary} !important;
                }
                [style*="color: #E4525C"],
                [style*="color:#E4525C"] {
                    color: ${secondary} !important;
                }
            `;

            setThemeData({
                primaryColor: primary,
                secondaryColor: secondary,
                logoUrl: t.logoUrl || '',
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
