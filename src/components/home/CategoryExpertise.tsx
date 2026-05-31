"use client";

import React from 'react';
import Link from 'next/link';
import { FiX } from 'react-icons/fi';
import { useGetCategoriesQuery } from '@/redux/api/categoryApi';
import { resolveCategoryIcon } from '@/utils/categoryIcon';

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
                                    <div className="w-[64px] h-[64px] sm:w-[80px] sm:h-[80px] rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-100 flex items-center justify-center overflow-hidden transition-all duration-300 group-hover:border-[var(--color-primary)]/30 group-hover:shadow-xl group-hover:scale-110 group-hover:from-[var(--color-primary)]/5 group-hover:to-[var(--color-primary)]/10 shrink-0">
                                        {cat.image ? (
                                            <img src={cat.image} alt={cat.name} className="w-full h-full object-cover rounded-2xl" />
                                        ) : (
                                            <span className="text-2xl sm:text-3xl transition-transform duration-300 group-hover:scale-110">{resolveCategoryIcon(cat.name, cat.icon)}</span>
                                        )}
                                    </div>
                                    <span className="text-[12px] sm:text-[13px] text-gray-600 text-center font-medium group-hover:text-[var(--color-primary)] transition-colors whitespace-nowrap max-w-[80px] truncate">{cat.name}</span>
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
