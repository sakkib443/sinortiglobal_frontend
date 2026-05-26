"use client";

import React from 'react';
import Link from 'next/link';
import { FiX } from 'react-icons/fi';
import { useGetCategoriesQuery } from '@/redux/api/categoryApi';

interface Category {
    _id: string;
    name: string;
    slug: string;
    icon?: string;
    image?: string;
}

interface CategoryExpertiseProps {
    onClose?: () => void;
}

// Map category names → emoji icons (first keyword match wins)
const ICON_MAP: { keywords: string[]; icon: string }[] = [
    { keywords: ['construction', 'engineering', 'civil', 'architect'],                              icon: '🏗️' },
    { keywords: ['electrical', 'electronics', 'electric'],                                          icon: '⚡' },
    { keywords: ['family', 'kids', 'daily care', 'baby', 'child'],                                 icon: '👨‍👩‍👧‍👦' },
    { keywords: ['fashion', 'personal style', 'clothing', 'apparel', 'garment'],                   icon: '👗' },
    { keywords: ['home & lifestyle', 'home and lifestyle', 'lifestyle', 'home decor', 'interior', 'furniture'], icon: '🏠' },
    { keywords: ['industrial', 'manufacturing', 'factory', 'machinery'],                            icon: '🏭' },
    { keywords: ['agriculture', 'food industry', 'farming', 'agro'],                               icon: '🌾' },
    { keywords: ['auto', 'vehicle', 'motor', 'car', 'bike', 'truck'],                             icon: '🚗' },
    { keywords: ['sport', 'fitness', 'gym', 'exercise', 'outdoor'],                               icon: '⚽' },
    { keywords: ['health', 'beauty', 'cosmetic', 'skincare', 'medical', 'pharma', 'wellness'],    icon: '💊' },
    { keywords: ['toy', 'game', 'play', 'puzzle'],                                                 icon: '🧸' },
    { keywords: ['bag', 'luggage', 'backpack', 'suitcase'],                                        icon: '👜' },
    { keywords: ['shoe', 'footwear', 'sneaker', 'sandal', 'boot'],                                icon: '👟' },
    { keywords: ['watch', 'jewel', 'accessories', 'sunglass'],                                     icon: '⌚' },
    { keywords: ['gadget', 'tool', 'hardware', 'equipment'],                                       icon: '🔧' },
    { keywords: ['book', 'stationery', 'education', 'office', 'school'],                          icon: '📚' },
    { keywords: ['phone', 'smartphone', 'mobile', 'tablet'],                                       icon: '📱' },
    { keywords: ['computer', 'laptop', 'pc', 'desktop'],                                           icon: '💻' },
    { keywords: ['grocery', 'supermarket', 'vegetable', 'fruit'],                                  icon: '🛒' },
    { keywords: ['pet', 'animal', 'dog', 'cat', 'bird'],                                          icon: '🐾' },
    { keywords: ['energy', 'solar', 'power', 'oil', 'gas'],                                       icon: '🔋' },
    { keywords: ['chemical', 'plastic', 'rubber', 'material'],                                     icon: '🧪' },
    { keywords: ['security', 'safety', 'surveillance', 'cctv'],                                   icon: '🔒' },
    { keywords: ['textile', 'fabric', 'yarn', 'thread'],                                          icon: '🧵' },
    { keywords: ['food', 'restaurant', 'catering', 'bakery'],                                     icon: '🍽️' },
    { keywords: ['printing', 'packaging', 'paper', 'cardboard'],                                  icon: '🖨️' },
];

function resolveIcon(name: string, dbIcon?: string): string {
    const lower = name.toLowerCase();
    for (const entry of ICON_MAP) {
        if (entry.keywords.some(kw => lower.includes(kw))) {
            return entry.icon;
        }
    }
    return dbIcon || '📦';
}

const CategoryExpertise: React.FC<CategoryExpertiseProps> = ({ onClose }) => {
    const { data: categoriesData } = useGetCategoriesQuery({});
    const categories: Category[] = categoriesData?.data || [];

    // Triple for seamless infinite loop
    const displayCategories = categories.length > 0 ? [...categories, ...categories, ...categories] : [];

    return (
        <section className="w-full bg-gradient-to-b from-white to-gray-50/50">
            <div className="container mx-auto px-2 py-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 overflow-hidden">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-5">
                        <div className="flex items-center gap-3">
                            <div className="w-1 h-6 bg-[var(--color-primary)] rounded-full"></div>
                            <h3 className="text-lg font-bold text-gray-800">Top Categories</h3>
                        </div>
                        <div className="flex items-center gap-3">
                            <Link href="/products" className="text-sm text-[var(--color-primary)] hover:underline font-medium">
                                View All →
                            </Link>
                            {onClose && (
                                <button
                                    onClick={onClose}
                                    className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-red-50 text-gray-500 hover:text-red-500 transition-colors"
                                >
                                    <FiX size={16} />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Carousel */}
                    <div className="category-carousel-wrapper">
                        <div className="category-carousel-track">
                            {displayCategories.length > 0 ? displayCategories.map((cat, idx) => (
                                <Link
                                    key={`${cat._id}-${idx}`}
                                    href={`/products?category=${cat._id}`}
                                    className="category-carousel-item flex flex-col items-center gap-3 group"
                                >
                                    <div className="w-[80px] h-[80px] rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-100 flex items-center justify-center overflow-hidden transition-all duration-300 group-hover:border-[var(--color-primary)]/30 group-hover:shadow-xl group-hover:scale-110 group-hover:from-[var(--color-primary)]/5 group-hover:to-[var(--color-primary)]/10">
                                        {cat.image ? (
                                            <img src={cat.image} alt={cat.name} className="w-full h-full object-cover rounded-2xl" />
                                        ) : (
                                            <span className="text-3xl transition-transform duration-300 group-hover:scale-110">{resolveIcon(cat.name, cat.icon)}</span>
                                        )}
                                    </div>
                                    <span className="text-[13px] text-gray-600 text-center font-medium group-hover:text-[var(--color-primary)] transition-colors whitespace-nowrap">{cat.name}</span>
                                </Link>
                            )) : (
                                [...Array(8)].map((_, i) => (
                                    <div key={i} className="category-carousel-item flex flex-col items-center gap-3">
                                        <div className="w-[80px] h-[80px] rounded-2xl bg-gray-100 animate-pulse" />
                                        <div className="w-14 h-3 bg-gray-100 rounded animate-pulse" />
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default CategoryExpertise;
