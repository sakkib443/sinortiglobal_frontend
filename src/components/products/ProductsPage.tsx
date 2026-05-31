"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useGetProductsQuery } from '@/redux/api/productApi';
import NewProductCard from '@/components/shared/NewProductCard';
import { FiGrid, FiList, FiChevronDown, FiX, FiSearch, FiFilter } from 'react-icons/fi';

const LIMIT = 24;

const COUNTRIES = ['All', 'Bangladesh', 'Pakistan', 'UAE', 'USA', 'China'];

const SORT_OPTIONS = [
    { label: 'Newest First', value: '-createdAt' },
    { label: 'Price: Low to High', value: 'price' },
    { label: 'Price: High to Low', value: '-price' },
    { label: 'Most Popular', value: '-totalSold' },
    { label: 'Top Rated', value: '-rating' },
];

const ProductsPage: React.FC = () => {
    const router = useRouter();
    const searchParams = useSearchParams();

    const categoryParam = searchParams.get('category') || '';
    const subcategoryParam = searchParams.get('subcategory') || '';
    const searchParam = searchParams.get('q') || '';
    const countryParam = searchParams.get('country') || '';

    const [page, setPage] = useState(1);
    const [sortBy, setSortBy] = useState('-createdAt');
    const [showSortDropdown, setShowSortDropdown] = useState(false);
    const [showMobileFilter, setShowMobileFilter] = useState(false);
    const [categories, setCategories] = useState<any[]>([]);
    const [selectedCategory, setSelectedCategory] = useState(categoryParam);
    const [selectedSubcategory, setSelectedSubcategory] = useState(subcategoryParam);
    const [selectedCountry, setSelectedCountry] = useState(countryParam);
    const [localSearch, setLocalSearch] = useState(searchParam);
    const [priceRange, setPriceRange] = useState({ min: '', max: '' });

    // Category hierarchy helpers
    const topCategories = categories.filter((c: any) => !c.parent);
    const childrenOf = (id: string) => categories.filter((c: any) => (c.parent?._id || c.parent) === id);
    const catIcon = (c: any) => c.image
        ? <img src={c.image} alt="" className="w-4 h-4 rounded object-cover shrink-0" />
        : c.icon ? <span>{c.icon}</span> : null;

    // Fetch categories
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/categories`);
                const data = await res.json();
                if (data.success) setCategories(data.data || data.categories || []);
            } catch (e) { console.error(e); }
        };
        fetchCategories();
    }, []);

    // Sync URL params
    useEffect(() => {
        setSelectedCategory(categoryParam);
        setSelectedSubcategory(subcategoryParam);
        setSelectedCountry(countryParam);
        setLocalSearch(searchParam);
        setPage(1);
    }, [categoryParam, subcategoryParam, searchParam, countryParam]);

    // Build query
    const queryParams = useMemo(() => {
        const params: any = { page, limit: LIMIT, sort: sortBy };
        if (selectedCategory) params.category = selectedCategory;
        if (selectedSubcategory) params.subcategory = selectedSubcategory;
        if (selectedCountry && selectedCountry !== 'All') params.country = selectedCountry;
        if (searchParam) params.searchTerm = searchParam;
        if (priceRange.min) params.minPrice = priceRange.min;
        if (priceRange.max) params.maxPrice = priceRange.max;
        return params;
    }, [page, sortBy, selectedCategory, selectedSubcategory, selectedCountry, searchParam, priceRange]);

    const { data, isFetching } = useGetProductsQuery(queryParams);
    const products = data?.data || [];
    const meta = data?.meta || { total: 0, totalPage: 1 };

    // Central URL builder — only the passed keys change, the rest are preserved
    const pushFilters = (next: { category?: string; subcategory?: string; country?: string; q?: string }) => {
        const category = next.category !== undefined ? next.category : selectedCategory;
        const subcategory = next.subcategory !== undefined ? next.subcategory : selectedSubcategory;
        const country = next.country !== undefined ? next.country : selectedCountry;
        const q = next.q !== undefined ? next.q : searchParam;
        const params = new URLSearchParams();
        if (q && q.trim()) params.set('q', q.trim());
        if (category) params.set('category', category);
        if (subcategory) params.set('subcategory', subcategory);
        if (country && country !== 'All') params.set('country', country);
        router.push(`/products?${params.toString()}`);
        setShowMobileFilter(false);
    };

    // Selecting a category resets any active subcategory
    const handleCategorySelect = (catId: string) => pushFilters({ category: catId, subcategory: '' });
    const handleSubcategorySelect = (catId: string, subId: string) => pushFilters({ category: catId, subcategory: subId });
    const handleCountrySelect = (country: string) => pushFilters({ country });
    const handleSearch = (e: React.FormEvent) => { e.preventDefault(); pushFilters({ q: localSearch }); };

    const clearFilters = () => {
        setSelectedCategory('');
        setSelectedSubcategory('');
        setSelectedCountry('');
        setLocalSearch('');
        setPriceRange({ min: '', max: '' });
        router.push('/products');
    };

    const activeCategoryName = categories.find(c => c._id === selectedCategory)?.name || '';
    const activeSubcategoryName = categories.find(c => c._id === selectedSubcategory)?.name || '';

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Breadcrumb + Header */}
            <div className="bg-white border-b border-gray-200">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
                        <a href="/" className="hover:text-[var(--color-primary)]">Home</a>
                        <span>/</span>
                        <span className="text-gray-700 font-medium">Products</span>
                        {activeCategoryName && (
                            <>
                                <span>/</span>
                                <span className={activeSubcategoryName ? 'hover:text-[var(--color-primary)] cursor-pointer' : 'text-[var(--color-primary)] font-medium'} onClick={() => activeSubcategoryName && handleCategorySelect(selectedCategory)}>{activeCategoryName}</span>
                            </>
                        )}
                        {activeSubcategoryName && (
                            <>
                                <span>/</span>
                                <span className="text-[var(--color-primary)] font-medium">{activeSubcategoryName}</span>
                            </>
                        )}
                    </div>
                    <div className="flex items-center justify-between">
                        <h1 className="text-2xl font-bold text-gray-900">
                            {searchParam ? `Results for "${searchParam}"` : activeSubcategoryName || activeCategoryName || 'All Products'}
                        </h1>
                        <span className="text-sm text-gray-400">{meta.total || products.length} products found</span>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-6">
                <div className="flex gap-6">

                    {/* ── Sidebar Filters (Desktop) ── */}
                    <aside className="hidden lg:block w-64 shrink-0">
                        <div className="bg-white rounded-lg border border-gray-200 p-4 sticky top-24">

                            {/* Search within */}
                            <form onSubmit={handleSearch} className="mb-5">
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={localSearch}
                                        onChange={(e) => setLocalSearch(e.target.value)}
                                        placeholder="Search products..."
                                        className="w-full text-sm border border-gray-200 rounded-lg pl-9 pr-3 py-2.5 focus:outline-none focus:border-[var(--color-primary)]/40 bg-gray-50"
                                    />
                                    <FiSearch size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                </div>
                            </form>

                            {/* Categories */}
                            <div className="mb-5">
                                <h4 className="text-sm font-bold text-gray-900 mb-3">Categories</h4>
                                <ul className="space-y-1.5">
                                    <li>
                                        <label
                                            className={`flex items-center gap-2.5 text-sm px-3 py-2 rounded-md cursor-pointer transition-colors ${!selectedCategory ? 'bg-[var(--color-primary)]/10 text-[var(--color-primary)] font-medium' : 'text-gray-600 hover:bg-gray-50'}`}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={!selectedCategory}
                                                onChange={() => handleCategorySelect('')}
                                                className="w-4 h-4 rounded border-gray-300 text-[var(--color-primary)] focus:ring-[var(--color-primary)] accent-[var(--color-primary)]"
                                            />
                                            All Categories
                                        </label>
                                    </li>
                                    {topCategories.map((cat: any) => {
                                        const subs = childrenOf(cat._id);
                                        const isOpen = selectedCategory === cat._id;
                                        return (
                                            <li key={cat._id}>
                                                <label
                                                    className={`flex items-center gap-2.5 text-sm px-3 py-2 rounded-md cursor-pointer transition-colors ${isOpen ? 'bg-[var(--color-primary)]/10 text-[var(--color-primary)] font-medium' : 'text-gray-600 hover:bg-gray-50'}`}
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={isOpen}
                                                        onChange={() => handleCategorySelect(cat._id)}
                                                        className="w-4 h-4 rounded border-gray-300 text-[var(--color-primary)] focus:ring-[var(--color-primary)] accent-[var(--color-primary)]"
                                                    />
                                                    {catIcon(cat)}
                                                    <span className="flex-1">{cat.name}</span>
                                                    {cat.productCount > 0 && (
                                                        <span className="text-[10px] text-gray-400">({cat.productCount})</span>
                                                    )}
                                                </label>

                                                {/* Subcategories — shown when the parent is the active category */}
                                                {isOpen && subs.length > 0 && (
                                                    <ul className="mt-1 ml-4 pl-2 border-l border-gray-200 space-y-1">
                                                        <li>
                                                            <label className={`flex items-center gap-2 text-xs px-2.5 py-1.5 rounded-md cursor-pointer transition-colors ${!selectedSubcategory ? 'text-[var(--color-primary)] font-medium' : 'text-gray-500 hover:bg-gray-50'}`}>
                                                                <input
                                                                    type="checkbox"
                                                                    checked={!selectedSubcategory}
                                                                    onChange={() => handleCategorySelect(cat._id)}
                                                                    className="w-3.5 h-3.5 rounded border-gray-300 accent-[var(--color-primary)]"
                                                                />
                                                                All {cat.name}
                                                            </label>
                                                        </li>
                                                        {subs.map((sub: any) => (
                                                            <li key={sub._id}>
                                                                <label className={`flex items-center gap-2 text-xs px-2.5 py-1.5 rounded-md cursor-pointer transition-colors ${selectedSubcategory === sub._id ? 'bg-[var(--color-primary)]/10 text-[var(--color-primary)] font-medium' : 'text-gray-500 hover:bg-gray-50'}`}>
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={selectedSubcategory === sub._id}
                                                                        onChange={() => handleSubcategorySelect(cat._id, sub._id)}
                                                                        className="w-3.5 h-3.5 rounded border-gray-300 accent-[var(--color-primary)]"
                                                                    />
                                                                    {catIcon(sub)}
                                                                    <span className="flex-1">{sub.name}</span>
                                                                    {sub.productCount > 0 && (
                                                                        <span className="text-[10px] text-gray-400">({sub.productCount})</span>
                                                                    )}
                                                                </label>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                )}
                                            </li>
                                        );
                                    })}
                                </ul>
                            </div>

                            {/* Country */}
                            <div className="mb-5">
                                <h4 className="text-sm font-bold text-gray-900 mb-3">Country</h4>
                                <ul className="space-y-1.5">
                                    {COUNTRIES.map((country) => {
                                        const isActive = country === 'All' ? !selectedCountry || selectedCountry === 'All' : selectedCountry === country;
                                        return (
                                            <li key={country}>
                                                <label className={`flex items-center gap-2.5 text-sm px-3 py-2 rounded-md cursor-pointer transition-colors ${isActive ? 'bg-[var(--color-primary)]/10 text-[var(--color-primary)] font-medium' : 'text-gray-600 hover:bg-gray-50'}`}>
                                                    <input
                                                        type="checkbox"
                                                        checked={isActive}
                                                        onChange={() => handleCountrySelect(country)}
                                                        className="w-4 h-4 rounded border-gray-300 accent-[var(--color-primary)]"
                                                    />
                                                    {country}
                                                </label>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </div>

                            {/* Price Range */}
                            <div className="mb-5">
                                <h4 className="text-sm font-bold text-gray-900 mb-3">Price Range</h4>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="number"
                                        placeholder="Min"
                                        value={priceRange.min}
                                        onChange={(e) => setPriceRange(p => ({ ...p, min: e.target.value }))}
                                        className="w-full text-sm border border-gray-200 rounded-md px-2 py-2 bg-gray-50 focus:outline-none focus:border-[var(--color-primary)]/40"
                                    />
                                    <span className="text-gray-300">—</span>
                                    <input
                                        type="number"
                                        placeholder="Max"
                                        value={priceRange.max}
                                        onChange={(e) => setPriceRange(p => ({ ...p, max: e.target.value }))}
                                        className="w-full text-sm border border-gray-200 rounded-md px-2 py-2 bg-gray-50 focus:outline-none focus:border-[var(--color-primary)]/40"
                                    />
                                </div>
                            </div>

                            {/* Clear Filters */}
                            {(selectedCategory || (selectedCountry && selectedCountry !== 'All') || searchParam || priceRange.min || priceRange.max) && (
                                <button onClick={clearFilters} className="w-full text-sm text-red-500 hover:text-red-600 font-medium py-2 border border-red-200 rounded-md hover:bg-red-50 transition-colors flex items-center justify-center gap-1">
                                    <FiX size={14} /> Clear All Filters
                                </button>
                            )}
                        </div>
                    </aside>

                    {/* ── Main Content ── */}
                    <div className="flex-1 min-w-0">

                        {/* Top Bar - Sort + Filter toggle */}
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                {/* Mobile filter toggle */}
                                <button
                                    onClick={() => setShowMobileFilter(true)}
                                    className="lg:hidden flex items-center gap-1.5 text-sm text-gray-600 border border-gray-200 rounded-lg px-3 py-2 hover:border-[var(--color-primary)]/30"
                                >
                                    <FiFilter size={14} /> Filters
                                </button>

                                {/* Active filters */}
                                {activeCategoryName && (
                                    <span className="hidden sm:flex items-center gap-1 text-xs bg-[var(--color-primary)]/10 text-[var(--color-primary)] px-2.5 py-1 rounded-full font-medium">
                                        {activeCategoryName}
                                        <button onClick={() => handleCategorySelect('')}><FiX size={12} /></button>
                                    </span>
                                )}
                                {activeSubcategoryName && (
                                    <span className="hidden sm:flex items-center gap-1 text-xs bg-blue-50 text-blue-600 px-2.5 py-1 rounded-full font-medium">
                                        {activeSubcategoryName}
                                        <button onClick={() => handleCategorySelect(selectedCategory)}><FiX size={12} /></button>
                                    </span>
                                )}
                                {selectedCountry && selectedCountry !== 'All' && (
                                    <span className="hidden sm:flex items-center gap-1 text-xs bg-emerald-50 text-emerald-600 px-2.5 py-1 rounded-full font-medium">
                                        {selectedCountry}
                                        <button onClick={() => handleCountrySelect('All')}><FiX size={12} /></button>
                                    </span>
                                )}
                                {searchParam && (
                                    <span className="hidden sm:flex items-center gap-1 text-xs bg-blue-50 text-blue-600 px-2.5 py-1 rounded-full font-medium">
                                        "{searchParam}"
                                        <button onClick={() => pushFilters({ q: '' })}><FiX size={12} /></button>
                                    </span>
                                )}
                            </div>

                            {/* Sort dropdown */}
                            <div className="relative">
                                <button
                                    onClick={() => setShowSortDropdown(!showSortDropdown)}
                                    className="flex items-center gap-1.5 text-sm text-gray-600 border border-gray-200 rounded-lg px-3 py-2 hover:border-[var(--color-primary)]/30 bg-white"
                                >
                                    Sort: {SORT_OPTIONS.find(s => s.value === sortBy)?.label}
                                    <FiChevronDown size={14} />
                                </button>
                                {showSortDropdown && (
                                    <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-30 w-52">
                                        {SORT_OPTIONS.map(opt => (
                                            <button
                                                key={opt.value}
                                                onClick={() => { setSortBy(opt.value); setShowSortDropdown(false); }}
                                                className={`w-full text-left text-sm px-4 py-2 hover:bg-gray-50 ${sortBy === opt.value ? 'text-[var(--color-primary)] font-medium' : 'text-gray-600'}`}
                                            >
                                                {opt.label}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Product Grid */}
                        {isFetching && products.length === 0 ? (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-2">
                                {[...Array(10)].map((_, i) => (
                                    <div key={i} className="bg-white border border-gray-200 rounded-md overflow-hidden animate-pulse">
                                        <div className="aspect-[4/3] bg-gray-200" />
                                        <div className="p-3 space-y-2">
                                            <div className="h-3 bg-gray-200 rounded w-3/4" />
                                            <div className="h-3 bg-gray-200 rounded w-1/2" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : products.length === 0 ? (
                            <div className="text-center py-20">
                                <div className="text-6xl mb-4">🔍</div>
                                <h3 className="text-xl font-semibold text-gray-700 mb-2">No products found</h3>
                                <p className="text-gray-500 mb-6">Try different keywords or browse categories</p>
                                <button onClick={clearFilters} className="text-sm text-[var(--color-primary)] hover:underline font-medium">
                                    Clear all filters
                                </button>
                            </div>
                        ) : (
                            <div className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-2 transition-opacity ${isFetching ? 'opacity-60' : 'opacity-100'}`}>
                                {products.map((product: any) => (
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
                                            warranty: product.tagline || '',
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
                        )}

                        {/* Pagination */}
                        {meta.totalPage > 1 && (
                            <div className="flex items-center justify-center gap-2 mt-8">
                                <button
                                    disabled={page === 1}
                                    onClick={() => setPage(p => p - 1)}
                                    className="px-4 py-2 text-sm border border-gray-200 rounded-lg hover:border-[var(--color-primary)]/30 disabled:opacity-40 disabled:cursor-not-allowed bg-white"
                                >
                                    Previous
                                </button>
                                {Array.from({ length: Math.min(meta.totalPage, 5) }, (_, i) => {
                                    const pageNum = i + 1;
                                    return (
                                        <button
                                            key={pageNum}
                                            onClick={() => setPage(pageNum)}
                                            className={`w-10 h-10 text-sm rounded-lg border transition-colors ${page === pageNum ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)]' : 'border-gray-200 hover:border-[var(--color-primary)]/30 bg-white text-gray-600'}`}
                                        >
                                            {pageNum}
                                        </button>
                                    );
                                })}
                                <button
                                    disabled={page >= meta.totalPage}
                                    onClick={() => setPage(p => p + 1)}
                                    className="px-4 py-2 text-sm border border-gray-200 rounded-lg hover:border-[var(--color-primary)]/30 disabled:opacity-40 disabled:cursor-not-allowed bg-white"
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ── Mobile Filter Overlay ── */}
            {showMobileFilter && (
                <div className="fixed inset-0 z-50 lg:hidden">
                    <div className="absolute inset-0 bg-black/50" onClick={() => setShowMobileFilter(false)} />
                    <div className="absolute left-0 top-0 bottom-0 w-72 bg-white p-5 overflow-y-auto shadow-xl">
                        <div className="flex items-center justify-between mb-5">
                            <h3 className="text-lg font-bold text-gray-900">Filters</h3>
                            <button onClick={() => setShowMobileFilter(false)}><FiX size={20} /></button>
                        </div>

                        {/* Search */}
                        <form onSubmit={handleSearch} className="mb-5">
                            <div className="relative">
                                <input type="text" value={localSearch} onChange={(e) => setLocalSearch(e.target.value)} placeholder="Search..." className="w-full text-sm border border-gray-200 rounded-lg pl-9 pr-3 py-2.5 bg-gray-50 focus:outline-none" />
                                <FiSearch size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            </div>
                        </form>

                        {/* Categories */}
                        <h4 className="text-sm font-bold text-gray-900 mb-3">Categories</h4>
                        <ul className="space-y-1.5 mb-5">
                            <li>
                                <label className={`flex items-center gap-2.5 text-sm px-3 py-2 rounded-md cursor-pointer ${!selectedCategory ? 'bg-[var(--color-primary)]/10 text-[var(--color-primary)] font-medium' : 'text-gray-600'}`}>
                                    <input type="checkbox" checked={!selectedCategory} onChange={() => handleCategorySelect('')} className="w-4 h-4 rounded border-gray-300 accent-[var(--color-primary)]" />
                                    All
                                </label>
                            </li>
                            {topCategories.map((cat: any) => {
                                const subs = childrenOf(cat._id);
                                const isOpen = selectedCategory === cat._id;
                                return (
                                    <li key={cat._id}>
                                        <label className={`flex items-center gap-2.5 text-sm px-3 py-2 rounded-md cursor-pointer ${isOpen ? 'bg-[var(--color-primary)]/10 text-[var(--color-primary)] font-medium' : 'text-gray-600'}`}>
                                            <input type="checkbox" checked={isOpen} onChange={() => handleCategorySelect(cat._id)} className="w-4 h-4 rounded border-gray-300 accent-[var(--color-primary)]" />
                                            {catIcon(cat)}
                                            {cat.name}
                                        </label>
                                        {isOpen && subs.length > 0 && (
                                            <ul className="mt-1 ml-4 pl-2 border-l border-gray-200 space-y-1">
                                                <li>
                                                    <label className={`flex items-center gap-2 text-xs px-2.5 py-1.5 rounded-md cursor-pointer ${!selectedSubcategory ? 'text-[var(--color-primary)] font-medium' : 'text-gray-500'}`}>
                                                        <input type="checkbox" checked={!selectedSubcategory} onChange={() => handleCategorySelect(cat._id)} className="w-3.5 h-3.5 rounded border-gray-300 accent-[var(--color-primary)]" />
                                                        All {cat.name}
                                                    </label>
                                                </li>
                                                {subs.map((sub: any) => (
                                                    <li key={sub._id}>
                                                        <label className={`flex items-center gap-2 text-xs px-2.5 py-1.5 rounded-md cursor-pointer ${selectedSubcategory === sub._id ? 'bg-[var(--color-primary)]/10 text-[var(--color-primary)] font-medium' : 'text-gray-500'}`}>
                                                            <input type="checkbox" checked={selectedSubcategory === sub._id} onChange={() => handleSubcategorySelect(cat._id, sub._id)} className="w-3.5 h-3.5 rounded border-gray-300 accent-[var(--color-primary)]" />
                                                            {catIcon(sub)}
                                                            {sub.name}
                                                        </label>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </li>
                                );
                            })}
                        </ul>

                        {/* Country */}
                        <h4 className="text-sm font-bold text-gray-900 mb-3">Country</h4>
                        <ul className="space-y-1.5 mb-5">
                            {COUNTRIES.map((country) => {
                                const isActive = country === 'All' ? !selectedCountry || selectedCountry === 'All' : selectedCountry === country;
                                return (
                                    <li key={country}>
                                        <label className={`flex items-center gap-2.5 text-sm px-3 py-2 rounded-md cursor-pointer ${isActive ? 'bg-[var(--color-primary)]/10 text-[var(--color-primary)] font-medium' : 'text-gray-600'}`}>
                                            <input type="checkbox" checked={isActive} onChange={() => handleCountrySelect(country)} className="w-4 h-4 rounded border-gray-300 accent-[var(--color-primary)]" />
                                            {country}
                                        </label>
                                    </li>
                                );
                            })}
                        </ul>

                        {/* Price */}
                        <h4 className="text-sm font-bold text-gray-900 mb-3">Price Range</h4>
                        <div className="flex gap-2 mb-5">
                            <input type="number" placeholder="Min" value={priceRange.min} onChange={(e) => setPriceRange(p => ({ ...p, min: e.target.value }))} className="w-full text-sm border border-gray-200 rounded-md px-2 py-2 bg-gray-50" />
                            <input type="number" placeholder="Max" value={priceRange.max} onChange={(e) => setPriceRange(p => ({ ...p, max: e.target.value }))} className="w-full text-sm border border-gray-200 rounded-md px-2 py-2 bg-gray-50" />
                        </div>

                        <button onClick={clearFilters} className="w-full text-sm py-2.5 bg-[var(--color-primary)] text-white rounded-lg font-medium">Apply & Close</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductsPage;
