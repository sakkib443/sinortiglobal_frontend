"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import NewProductCard from '@/components/shared/NewProductCard';
import { useGetProductsQuery } from '@/redux/api/productApi';
import { useGetCategoriesQuery } from '@/redux/api/categoryApi';
import { useAppSelector, useAppDispatch } from '@/redux';
import { clearImageSearch, loadSearchHistoryFromStorage } from '@/redux/slices/imageSearchSlice';
import { FiX, FiCamera } from 'react-icons/fi';
import { FiSearch } from 'react-icons/fi';
import HeroSection from './HeroSection';
import CategoryExpertise from './CategoryExpertise';
import QualityFeatures from './QualityFeatures';
import AssociatedProducts from './AssociatedProducts';
import CtaBanner from './CtaBanner';

const LIMIT = 20;

const NewHomePage: React.FC = () => {
    const searchParams = useSearchParams();
    const dispatch = useAppDispatch();

    const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
    const [searchTerm, setSearchTerm] = useState(searchParams.get('searchTerm') || '');
    const [page, setPage] = useState(1);
    const [accumulatedProducts, setAccumulatedProducts] = useState<any[]>([]);
    const [isLoadingMore, setIsLoadingMore] = useState(false);

    // Image search state from Redux
    const imageSearch = useAppSelector((state) => state.imageSearch);

    // Load search history from localStorage on mount
    useEffect(() => {
        dispatch(loadSearchHistoryFromStorage());
    }, [dispatch]);

    useEffect(() => {
        const cat = searchParams.get('category') || '';
        const search = searchParams.get('searchTerm') || '';
        setSelectedCategory(cat);
        setSearchTerm(search);
        setPage(1);
        setAccumulatedProducts([]);
    }, [searchParams]);

    const queryParams: Record<string, string | number | undefined> = {
        limit: LIMIT,
        page,
        sort: '-createdAt',
    };
    if (selectedCategory) queryParams.category = selectedCategory;
    if (searchTerm) queryParams.searchTerm = searchTerm;

    const { data: productsData, isLoading, isFetching } = useGetProductsQuery(queryParams);
    const { data: categoriesData } = useGetCategoriesQuery({});

    const products = productsData?.data || [];
    const meta = productsData?.meta;
    const totalPages = meta?.totalPages || 1;
    const categories = categoriesData?.data || [];

    // Accumulate products when new data arrives
    useEffect(() => {
        if (products.length > 0 && !isFetching) {
            if (page === 1) {
                setAccumulatedProducts(products);
            } else {
                setAccumulatedProducts(prev => {
                    const existingIds = new Set(prev.map((p: any) => p._id));
                    const newProducts = products.filter((p: any) => !existingIds.has(p._id));
                    return [...prev, ...newProducts];
                });
            }
            setIsLoadingMore(false);
        }
    }, [products, isFetching, page]);

    // ── Handle clearing image search — reset to normal product listing ──
    const handleClearImageSearch = () => {
        dispatch(clearImageSearch());
        setPage(1);
        if (products.length > 0) {
            setAccumulatedProducts(products);
        } else {
            setAccumulatedProducts([]);
        }
    };

    // ── Handle clearing text search ─────────────────────────────────
    const handleClearTextSearch = () => {
        setSearchTerm('');
        setPage(1);
        setAccumulatedProducts([]);
        window.history.pushState({}, '', '/');
    };

    // ── Handle category change ──────────────────────────────────────
    const handleCategoryChange = (categoryId: string) => {
        dispatch(clearImageSearch());
        // If same category (e.g. clicking "View All" when already on all), restore from cache
        if (categoryId === selectedCategory) {
            if (products.length > 0) {
                setAccumulatedProducts(products);
            }
            return;
        }
        const params = new URLSearchParams();
        if (categoryId) params.set('category', categoryId);
        window.history.pushState({}, '', `/?${params.toString()}`);
        setSelectedCategory(categoryId);
        setPage(1);
        setAccumulatedProducts([]);
    };

    // ── Handle load more ────────────────────────────────────────────
    const handleLoadMore = () => {
        if (page < totalPages) {
            setIsLoadingMore(true);
            setPage(prev => prev + 1);
        }
    };

    // ── Personalized sorting: boost products matching search history ──
    const sortByRelevance = (products: any[]) => {
        const history = imageSearch.lastSearchHistory;
        if (!history || (history.labels.length === 0 && history.colors.length === 0)) {
            return products;
        }

        return [...products].sort((a, b) => {
            const scoreA = getRelevanceScore(a, history);
            const scoreB = getRelevanceScore(b, history);
            // Higher relevance first, then keep original order
            return scoreB - scoreA;
        });
    };

    // Calculate how relevant a product is to the search history
    const getRelevanceScore = (product: any, history: { labels: string[]; colors: string[]; category: string | null; brand: string | null }) => {
        let score = 0;
        const productTags = (product.tags || []).map((t: string) => t.toLowerCase());
        const productColors = (product.colors || []).map((c: string) => c.toLowerCase());
        const productAiLabels = (product.aiLabels || []).map((l: string) => l.toLowerCase());
        const productName = (product.name || '').toLowerCase();
        const productBrand = (product.brand || '').toLowerCase();
        const productCategoryName = (product.category?.name || '').toLowerCase();

        // Match labels against tags & aiLabels
        for (const label of history.labels) {
            const lowerLabel = label.toLowerCase();
            if (productTags.some((t: string) => t.includes(lowerLabel) || lowerLabel.includes(t))) score += 10;
            if (productAiLabels.some((l: string) => l.includes(lowerLabel) || lowerLabel.includes(l))) score += 8;
            if (productName.includes(lowerLabel)) score += 5;
        }

        // Match colors
        for (const color of history.colors) {
            const lowerColor = color.toLowerCase();
            if (productColors.some((c: string) => c.includes(lowerColor) || lowerColor.includes(c))) score += 7;
        }

        // Match category
        if (history.category && productCategoryName.includes(history.category.toLowerCase())) {
            score += 15;
        }

        // Match brand
        if (history.brand && productBrand.includes(history.brand.toLowerCase())) {
            score += 12;
        }

        return score;
    };

    // ── Determine which products to display ─────────────────────────
    const displayProducts = useMemo(() => {
        if (imageSearch.isActive && imageSearch.products.length > 0) {
            return imageSearch.products;
        }
        // Use accumulated products, or fall back to current API products if accumulated is empty
        const productsToShow = accumulatedProducts.length > 0 ? accumulatedProducts : products;
        // Apply silent personalized sorting based on search history
        return sortByRelevance(productsToShow);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [imageSearch.isActive, imageSearch.products, accumulatedProducts, products, imageSearch.lastSearchHistory]);

    // Get the selected category name
    const selectedCategoryName = useMemo(() => {
        if (!selectedCategory) return '';
        const cat = categories.find((c: any) => c._id === selectedCategory);
        return cat?.name || '';
    }, [selectedCategory, categories]);

    // ── Loading skeleton ────────────────────────────────────────────
    if (isLoading && !imageSearch.isActive) {
        return (
            <div className="min-h-screen bg-gray-50">
                <div className="w-[95%] mx-auto py-6">
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2">
                        {[...Array(10)].map((_, i) => (
                            <div key={i} className="bg-white border border-gray-200 rounded-md overflow-hidden animate-pulse">
                                <div className="aspect-square bg-gray-200" />
                                <div className="p-4 space-y-2">
                                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                                    <div className="h-3 bg-gray-200 rounded w-1/2" />
                                    <div className="h-3 bg-gray-200 rounded w-full" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero Banner */}
            <HeroSection />

            {/* Categories + Expertise */}
            <CategoryExpertise />

            <div className="container mx-auto px-2 py-6">

                {/* ── Image Search Results Banner ── */}
                {imageSearch.isActive && (
                    <div className="mb-6 bg-white border border-gray-200 rounded-xl p-5 shadow-sm animate-fadeIn">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-4">
                                {imageSearch.previewImage && (
                                    <div className="w-16 h-16 rounded-xl overflow-hidden border-2 border-[var(--color-primary)]/20 shadow-sm flex-shrink-0">
                                        <img src={imageSearch.previewImage} alt="Search" className="w-full h-full object-cover" />
                                    </div>
                                )}
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <FiCamera className="text-[var(--color-primary)]" size={16} />
                                        <h3 className="text-lg font-bold text-gray-800">Image Search Results</h3>
                                    </div>
                                    <p className="text-sm text-gray-500">
                                        Found <span className="font-bold text-[var(--color-primary)]">{imageSearch.products.length}</span> matching products
                                        {(imageSearch.searchMeta?.labels?.length ?? 0) > 0 && (
                                            <span> — detected: <span className="font-medium">{imageSearch.searchMeta!.labels.slice(0, 5).join(', ')}</span></span>
                                        )}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={handleClearImageSearch}
                                className="flex items-center gap-1.5 px-4 py-2 bg-gray-100 hover:bg-red-50 text-gray-500 hover:text-red-500 rounded-full text-sm font-semibold transition-colors"
                            >
                                <FiX size={14} />
                                Clear
                            </button>
                        </div>

                        {/* Color chips */}
                        {(imageSearch.searchMeta?.colors?.length ?? 0) > 0 && (
                            <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Colors:</span>
                                {imageSearch.searchMeta!.colors.map((color: any, idx: number) => (
                                    <div key={idx} className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-full px-3 py-1">
                                        <div className="w-3 h-3 rounded-full border border-gray-300" style={{ backgroundColor: color.hex }} />
                                        <span className="text-xs text-gray-600 font-medium capitalize">{color.name}</span>
                                        <span className="text-[10px] text-gray-400">{color.percentage}%</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* ── Image Search Loading State ── */}
                {imageSearch.isSearching && (
                    <div className="mb-6 bg-white border border-gray-200 rounded-xl p-8 text-center shadow-sm animate-fadeIn">
                        <div className="w-12 h-12 border-4 border-[var(--color-primary)]/20 border-t-[var(--color-primary)] rounded-full animate-spin mx-auto mb-4" />
                        <h3 className="text-lg font-bold text-gray-800 mb-1">Analyzing your image...</h3>
                        <p className="text-sm text-gray-500">Using AI to identify products and colors</p>
                    </div>
                )}

                {/* ── Text Search Results Banner ── */}
                {searchTerm && !imageSearch.isActive && (
                    <div className="mb-6 bg-white border border-gray-200 rounded-xl p-5 shadow-sm animate-fadeIn">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-[var(--color-primary)]/10 flex items-center justify-center flex-shrink-0">
                                    <FiSearch className="text-[var(--color-primary)]" size={18} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-800">
                                        Search results for &quot;<span className="text-[var(--color-primary)]">{searchTerm}</span>&quot;
                                    </h3>
                                    <p className="text-sm text-gray-500">
                                        Found <span className="font-bold text-[var(--color-primary)]">{meta?.total || displayProducts.length}</span> products
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={handleClearTextSearch}
                                className="flex items-center gap-1.5 px-4 py-2 bg-gray-100 hover:bg-red-50 text-gray-500 hover:text-red-500 rounded-full text-sm font-semibold transition-colors"
                            >
                                <FiX size={14} />
                                Clear
                            </button>
                        </div>
                    </div>
                )}
                {/* ── Selected Category Title ── */}
                {selectedCategory && (
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800">{selectedCategoryName || 'Category'}</h2>
                            <p className="text-sm text-gray-500 mt-1">Showing all products in this category</p>
                        </div>
                        <button
                            onClick={() => handleCategoryChange('')}
                            className="mt-4 text-[var(--color-primary)] hover:underline"
                        >
                            View all products
                        </button>
                    </div>
                )}

                {/* ── Popular Products Section ── */}
                <div className="flex items-end justify-between mb-3 mt-2">
                    <div>
                        <h3 className="text-xl font-bold text-gray-900">Popular Products</h3>
                        <p className="text-[13px] text-gray-400 mt-0.5">Trending items loved by our customers worldwide</p>
                    </div>
                    <Link href="/products" className="text-sm text-[var(--color-primary)] hover:underline font-medium whitespace-nowrap">
                        View All →
                    </Link>
                </div>

                {/* ── Product Grid ── */}
                <div className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 transition-opacity duration-200 ${(isFetching && page === 1) ? 'opacity-60' : 'opacity-100'}`}>
                    {displayProducts.slice(0, 12).map((product: any) => (
                        <NewProductCard
                            key={product._id}
                            product={{
                                id: product._id,
                                slug: product.slug,
                                name: product.name,
                                image: product.thumbnail || product.images?.[0] || '',
                                price: product.price,
                                originalPrice: product.originalPrice || undefined,
                                discount: product.discount,
                                rating: product.rating,
                                reviews: product.reviewCount,
                                warranty: product.tagline || product.brand || 'Lower price than others but quality higher',
                                categoryName: product.category?.name || '',
                                priceType: product.priceType || 'negotiable',
                                sold: product.totalSold || 0,
                                likeCount: product.likeCount || 0,
                                commentCount: product.commentCount || 0,
                                shareCount: product.shareCount || 0,
                                viewCount: product.viewCount || 0,
                                reviewCount: product.reviewCount || 0,
                            }}
                        />
                    ))}
                </div>
            </div>

            {/* Quality Features — between Popular & New Arrivals */}
            <QualityFeatures />

            <div className="container mx-auto px-2 py-6">
                {/* ── New Arrivals Section ── */}
                <div className="flex items-end justify-between mb-3 mt-10">
                    <div>
                        <h3 className="text-xl font-bold text-gray-900">New Arrivals</h3>
                        <p className="text-[13px] text-gray-400 mt-0.5">Freshly added products you don't want to miss</p>
                    </div>
                    <Link href="/products" className="text-sm text-[var(--color-primary)] hover:underline font-medium whitespace-nowrap">
                        View All →
                    </Link>
                </div>

                {/* ── New Arrivals Grid ── */}
                <div className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 transition-opacity duration-200 ${(isFetching && page === 1) ? 'opacity-60' : 'opacity-100'}`}>
                    {[...displayProducts].reverse().slice(0, 12).map((product: any) => (
                        <NewProductCard
                            key={`new-${product._id}`}
                            product={{
                                id: product._id,
                                slug: product.slug,
                                name: product.name,
                                image: product.thumbnail || product.images?.[0] || '',
                                price: product.price,
                                originalPrice: product.originalPrice || undefined,
                                discount: product.discount,
                                rating: product.rating,
                                reviews: product.reviewCount,
                                warranty: product.tagline || product.brand || 'Lower price than others but quality higher',
                                categoryName: product.category?.name || '',
                                priceType: product.priceType || 'negotiable',
                                sold: product.totalSold || 0,
                                likeCount: product.likeCount || 0,
                                commentCount: product.commentCount || 0,
                                shareCount: product.shareCount || 0,
                                viewCount: product.viewCount || 0,
                                reviewCount: product.reviewCount || 0,
                            }}
                        />
                    ))}
                </div>

                {/* ── Empty State ── */}
                {!isFetching && displayProducts.length === 0 && !imageSearch.isSearching && (
                    <div className="text-center py-20">
                        <div className="text-6xl mb-4">🔍</div>
                        <h3 className="text-xl font-semibold text-gray-700 mb-2">No products found</h3>
                        <p className="text-gray-500 mb-6">Try browsing another category</p>
                        <button
                            onClick={() => handleCategoryChange('')}
                            className="px-8 py-3 bg-[var(--color-primary)] text-white rounded-full font-semibold hover:bg-[var(--color-primary-dark)] transition-colors"
                        >
                            View All Products
                        </button>
                    </div>
                )}

                {/* ── See More Products Button ── */}
                {!imageSearch.isActive && page < totalPages && displayProducts.length > 0 && (
                    <div className="mt-10 flex justify-center">
                        <button
                            onClick={handleLoadMore}
                            disabled={isLoadingMore || isFetching}
                            className="group relative px-10 py-3.5 bg-[var(--color-primary)] text-white rounded-full font-bold text-sm tracking-wide hover:bg-[var(--color-primary-dark)] transition-all shadow-md hover:shadow-xl disabled:opacity-60 disabled:cursor-not-allowed overflow-hidden"
                        >
                            {/* Shiny effect on hover */}
                            <div className="absolute top-0 left-0 w-full h-full">
                                <div className="absolute top-0 -left-full w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 group-hover:left-full transition-all duration-700 ease-in-out"></div>
                            </div>

                            <span className="relative z-10 flex items-center gap-2">
                                {isLoadingMore || isFetching ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Loading...
                                    </>
                                ) : (
                                    <>
                                        <FiSearch size={16} />
                                        See More Products
                                    </>
                                )}
                            </span>
                        </button>
                    </div>
                )}

                {/* ── Loading more skeleton ── */}
                {isLoadingMore && (
                    <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-2">
                        {[...Array(5)].map((_, i) => (
                            <div key={`skeleton-${i}`} className="bg-white border border-gray-200 rounded-md overflow-hidden animate-pulse">
                                <div className="aspect-square bg-gray-200" />
                                <div className="p-4 space-y-2">
                                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                                    <div className="h-3 bg-gray-200 rounded w-1/2" />
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Associated Products */}
            <AssociatedProducts />

            {/* CTA Banner */}
            <CtaBanner />
        </div>
    );
};

export default NewHomePage;
