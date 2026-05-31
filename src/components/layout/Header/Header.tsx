"use client";

import React, { useState, useRef, useCallback, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
    FiShoppingCart, FiCamera, FiChevronDown, FiSearch, FiMenu, FiX,
    FiUpload, FiUser, FiHeart, FiPhone, FiMail, FiMapPin, FiGlobe
} from 'react-icons/fi';
import { useAppSelector, useAppDispatch } from '@/redux';
import { useGetCategoriesQuery } from '@/redux/api/categoryApi';
import { useGetSiteContentQuery } from '@/redux/api/siteContentApi';

import { setImageSearching, setImageSearchResults, clearImageSearch } from '@/redux/slices/imageSearchSlice';
import { logout } from '@/redux/slices/authSlice';
import { useTheme } from '@/components/shared/ThemeProvider';
import { resolveCategoryIcon } from '@/utils/categoryIcon';

interface Category {
    _id: string;
    name: string;
    slug: string;
    icon?: string;
    image?: string;
}

// Country options for the search filter (flag codes map to flagcdn.com).
// "All" = no country filter.
const COUNTRIES: { value: string; label: string; code: string }[] = [
    { value: 'All', label: 'All', code: '' },
    { value: 'Bangladesh', label: 'Bangladesh', code: 'bd' },
    { value: 'Pakistan', label: 'Pakistan', code: 'pk' },
    { value: 'UAE', label: 'UAE', code: 'ae' },
    { value: 'USA', label: 'USA', code: 'us' },
    { value: 'China', label: 'China', code: 'cn' },
];

const Header: React.FC = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isMobileCategoryOpen, setIsMobileCategoryOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [isImageSearchOpen, setIsImageSearchOpen] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const [isCategoryHovered, setIsCategoryHovered] = useState(false);
    const [isServicesHovered, setIsServicesHovered] = useState(false);
    const categoryTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const servicesTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const cartItems = useAppSelector((state) => state.cart.items);
    const { user, isAuthenticated } = useAppSelector((state) => state.auth);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const profileRef = useRef<HTMLDivElement>(null);
    const [selectedCountry, setSelectedCountry] = useState('All');
    const [isCountryOpen, setIsCountryOpen] = useState(false);
    const countryRef = useRef<HTMLDivElement>(null);
    const dispatch = useAppDispatch();
    const router = useRouter();

    const { data: categoriesData } = useGetCategoriesQuery({});
    const categories: Category[] = categoriesData?.data || [];

    // Dynamic contact info (managed from Admin → Site Content → Contact)
    const { data: siteContentRes } = useGetSiteContentQuery(undefined);
    const contact = siteContentRes?.data?.contact || {};
    const contactPhone: string = contact.phone || '+8809666786000';
    const contactEmail: string = contact.email || 'support@sinotriglobal.com';
    const contactAddress: string = contact.address || 'Plot 1020, Road 9, Avenue 9, Mirpur DOHS, Dhaka 1216';

    // Sticky scroll
    const [scrolled, setScrolled] = useState(false);
    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 10);
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    // Close profile / country dropdowns on outside click
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
                setIsProfileOpen(false);
            }
            if (countryRef.current && !countryRef.current.contains(e.target as Node)) {
                setIsCountryOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = () => {
        dispatch(logout());
        localStorage.removeItem('token');
        setIsProfileOpen(false);
        router.push('/');
    };

    // Category hover
    const handleCategoryMouseEnter = () => {
        if (categoryTimeoutRef.current) clearTimeout(categoryTimeoutRef.current);
        setIsCategoryHovered(true);
    };
    const handleCategoryMouseLeave = () => {
        categoryTimeoutRef.current = setTimeout(() => setIsCategoryHovered(false), 150);
    };

    // Services hover
    const handleServicesMouseEnter = () => {
        if (servicesTimeoutRef.current) clearTimeout(servicesTimeoutRef.current);
        setIsServicesHovered(true);
    };
    const handleServicesMouseLeave = () => {
        servicesTimeoutRef.current = setTimeout(() => setIsServicesHovered(false), 150);
    };

    // Image upload
    const handleImageUpload = useCallback(async (file: File) => {
        const imageUrl = URL.createObjectURL(file);
        setSelectedImage(imageUrl);
        setIsImageSearchOpen(false);
        setIsSearching(true);
        dispatch(setImageSearching(true));
        try {
            const { analyzeImage } = await import('@/utils/imageSearch');
            const analysis = await analyzeImage(file);
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/search/image`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    labels: analysis.labels,
                    colors: analysis.colors.map(c => c.name),
                    colorHexes: analysis.colors.map(c => c.hex),
                    keywords: analysis.keywords,
                }),
            });
            const data = await response.json();
            if (data.success) {
                dispatch(setImageSearchResults({
                    products: data.data.products,
                    searchMeta: { ...data.data.searchMeta, colors: analysis.colors },
                    previewImage: imageUrl,
                }));
                router.push('/products');
            } else {
                dispatch(setImageSearching(false));
            }
        } catch {
            dispatch(setImageSearching(false));
        } finally {
            setIsSearching(false);
        }
    }, [dispatch, router]);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) handleImageUpload(file);
    };

    const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
    const handleDragLeave = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(false); };
    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault(); setIsDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file && file.type.startsWith('image/')) handleImageUpload(file);
    };

    const handlePaste = useCallback((e: ClipboardEvent) => {
        if (!isImageSearchOpen) return;
        const items = e.clipboardData?.items;
        if (items) {
            for (let i = 0; i < items.length; i++) {
                if (items[i].type.startsWith('image/')) {
                    const file = items[i].getAsFile();
                    if (file) { handleImageUpload(file); break; }
                }
            }
        }
    }, [isImageSearchOpen, handleImageUpload]);

    useEffect(() => {
        document.addEventListener('paste', handlePaste);
        return () => document.removeEventListener('paste', handlePaste);
    }, [handlePaste]);

    const clearImage = () => { setSelectedImage(null); setIsSearching(false); };

    const handleSearch = () => {
        const trimmed = searchQuery.trim();
        const hasCountry = selectedCountry && selectedCountry !== 'All';
        // Nothing to search by — neither a query nor a country.
        if (!trimmed && !hasCountry) return;
        dispatch(clearImageSearch());
        const params = new URLSearchParams();
        if (trimmed) params.set('q', trimmed);
        if (hasCountry) params.set('country', selectedCountry);
        router.push(`/products?${params.toString()}`);
    };

    const handleGoHome = () => {
        setSearchQuery('');
        dispatch(clearImageSearch());
    };

    const serviceLinks = [
        { label: 'Sourcing', href: '/services/sourcing' },
        { label: 'Shipping', href: '/services/shipping' },
        { label: 'Freight Forwarding', href: '/services/freight' },
        { label: 'Customs Clearance', href: '/services/customs' },
        { label: 'Warehousing', href: '/services/warehousing' },
    ];

    return (
        <>
            <header
                style={{
                    position: 'sticky',
                    top: 0,
                    zIndex: 50,
                    transition: 'box-shadow 0.3s ease',
                    boxShadow: scrolled ? '0 2px 16px rgba(0,0,0,0.12)' : 'none',
                }}
            >
                {/* ═══ TOP BAR ═══ */}
                <div className="bg-[var(--color-primary)] hidden md:block">
                    <div className="container mx-auto px-2">
                        <div className="flex items-center justify-between h-[34px] text-[12px] text-white/90">
                            {/* Left — contact info */}
                            <div className="flex items-center gap-5">
                                <a
                                    href={`tel:${contactPhone.replace(/\s+/g, '')}`}
                                    className="flex items-center gap-1.5 hover:text-white transition-colors"
                                >
                                    <FiPhone size={12} />
                                    <span>{contactPhone}</span>
                                </a>
                                <span className="text-white/30">|</span>
                                <a
                                    href={`mailto:${contactEmail}`}
                                    className="flex items-center gap-1.5 hover:text-white transition-colors"
                                >
                                    <FiMail size={12} />
                                    <span>{contactEmail}</span>
                                </a>
                            </div>
                            {/* Right — address */}
                            <div className="flex items-center gap-1.5 text-white/80">
                                <FiMapPin size={12} className="shrink-0" />
                                <span>{contactAddress}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ═══ MAIN HEADER ═══ */}
                <div className="bg-white">
                    <div className="container mx-auto px-2">
                        <div className="flex items-center justify-between py-2.5 gap-3 lg:gap-5">

                            {/* Mobile Menu Button */}
                            <button
                                className="lg:hidden text-gray-700 hover:text-[var(--color-primary)] p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            >
                                {isMobileMenuOpen ? <FiX size={22} /> : <FiMenu size={22} />}
                            </button>

                            {/* Logo */}
                            <Link href="/" className="flex items-center gap-2 shrink-0" onClick={handleGoHome}>
                                <HeaderLogo />
                            </Link>

                            {/* Categories Button (Desktop) */}
                            <div
                                className="relative hidden lg:block shrink-0"
                                onMouseEnter={handleCategoryMouseEnter}
                                onMouseLeave={handleCategoryMouseLeave}
                            >
                                <button
                                    onClick={() => setIsCategoryHovered(v => !v)}
                                    className="flex items-center gap-2 bg-[var(--color-primary)] text-white px-4 py-2.5 rounded-md text-sm font-medium hover:bg-[#093a1d] transition-colors"
                                >
                                    <span>Categories</span>
                                    <FiChevronDown
                                        className={`transition-transform duration-200 ${isCategoryHovered ? 'rotate-180' : ''}`}
                                        size={14}
                                    />
                                </button>
                                {/* Category Dropdown */}
                                <div
                                    className={`absolute top-full left-0 mt-1 w-60 bg-white rounded-xl shadow-2xl z-50 border border-gray-100 overflow-hidden transition-all duration-200 origin-top ${isCategoryHovered
                                        ? 'opacity-100 scale-y-100 translate-y-0 pointer-events-auto'
                                        : 'opacity-0 scale-y-95 -translate-y-1 pointer-events-none'
                                        }`}
                                    onMouseEnter={handleCategoryMouseEnter}
                                    onMouseLeave={handleCategoryMouseLeave}
                                >
                                    <Link
                                        href="/products"
                                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-[var(--color-primary)] hover:text-white transition-colors border-b border-gray-50 font-medium"
                                        onClick={() => { setIsCategoryHovered(false); }}
                                    >
                                        <span>🛒</span> All Products
                                    </Link>
                                    {categories.length > 0 ? (
                                        categories.map((category) => (
                                            <Link
                                                key={category._id}
                                                href={`/products?category=${category._id}`}
                                                className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-[var(--color-primary)] hover:text-white transition-colors"
                                                onClick={() => setIsCategoryHovered(false)}
                                            >
                                                {category.image ? (
                                                    <img src={category.image} alt={category.name} className="w-6 h-6 rounded object-cover shrink-0" />
                                                ) : (
                                                    <span className="text-lg">{resolveCategoryIcon(category.name, category.icon)}</span>
                                                )}
                                                <span>{category.name}</span>
                                            </Link>
                                        ))
                                    ) : (
                                        <div className="px-4 py-3 text-sm text-gray-400">Loading...</div>
                                    )}
                                </div>
                            </div>

                            {/* Search Bar (Desktop) */}
                            <div className="flex-1 max-w-2xl hidden md:flex items-center gap-0">

                                {/* Country Selector */}
                                <div className="relative h-[42px] shrink-0" ref={countryRef}>
                                    {(() => {
                                        const sel = COUNTRIES.find(c => c.value === selectedCountry) || COUNTRIES[0];
                                        return (
                                            <button
                                                type="button"
                                                onClick={() => setIsCountryOpen(v => !v)}
                                                title="Filter by country"
                                                className="h-full flex items-center gap-1.5 pl-3 pr-2 bg-gray-50 border border-gray-300 border-r-0 rounded-l-md text-sm text-gray-700 hover:bg-gray-100 transition-colors whitespace-nowrap"
                                            >
                                                {sel.code ? (
                                                    // eslint-disable-next-line @next/next/no-img-element
                                                    <img src={`https://flagcdn.com/w40/${sel.code}.png`} alt={sel.label} className="w-5 h-[14px] object-cover rounded-[2px]" />
                                                ) : (
                                                    <FiGlobe size={15} className="text-gray-500" />
                                                )}
                                                <span className="font-medium hidden lg:inline">{sel.label}</span>
                                                <FiChevronDown size={14} className={`text-gray-400 transition-transform ${isCountryOpen ? 'rotate-180' : ''}`} />
                                            </button>
                                        );
                                    })()}

                                    {isCountryOpen && (
                                        <div className="absolute left-0 top-full mt-1 w-44 bg-white rounded-md shadow-xl border border-gray-100 overflow-hidden z-50" style={{ animation: 'fadeIn 0.15s ease-out' }}>
                                            {COUNTRIES.map((c) => (
                                                <button
                                                    key={c.value}
                                                    type="button"
                                                    onClick={() => { setSelectedCountry(c.value); setIsCountryOpen(false); }}
                                                    className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm transition-colors ${selectedCountry === c.value ? 'bg-[var(--color-primary)] text-white font-semibold' : 'text-gray-700 hover:bg-gray-50'}`}
                                                >
                                                    {c.code ? (
                                                        // eslint-disable-next-line @next/next/no-img-element
                                                        <img src={`https://flagcdn.com/w40/${c.code}.png`} alt={c.label} className="w-5 h-[14px] object-cover rounded-[2px]" />
                                                    ) : (
                                                        <FiGlobe size={15} className={selectedCountry === c.value ? 'text-white' : 'text-gray-500'} />
                                                    )}
                                                    {c.label}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Search Input */}
                                <div className="relative flex-1 h-[42px]">
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                        placeholder="Search products..."
                                        className="w-full h-full bg-white border border-gray-300 border-r-0 pl-4 pr-4 text-gray-700 placeholder-gray-400 focus:outline-none focus:border-[var(--color-primary)] transition-all text-sm"
                                    />
                                </div>

                                {/* Search Button */}
                                <button
                                    onClick={handleSearch}
                                    className="h-[42px] px-5 bg-[var(--color-primary)] text-white rounded-r-md hover:bg-[#093a1d] transition-colors flex items-center justify-center"
                                    title="Search"
                                >
                                    {isSearching
                                        ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        : <FiSearch size={18} />}
                                </button>
                            </div>

                            {/* Right Actions */}
                            <div className="flex items-center gap-1 lg:gap-2 shrink-0">

                                {/* Products Link */}
                                <Link href="/products" className="hidden lg:flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-700 hover:text-[var(--color-primary)] transition-colors">
                                    Products
                                </Link>

                                {/* Cart */}
                                <Link href="/cart" className="relative flex items-center justify-center w-9 h-9 text-gray-600 hover:text-[var(--color-primary)] transition-colors">
                                    <FiShoppingCart size={20} />
                                    {cartItems.length > 0 && (
                                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-[18px] h-[18px] rounded-full flex items-center justify-center font-bold">
                                            {cartItems.length}
                                        </span>
                                    )}
                                </Link>

                                {/* Divider */}
                                <div className="hidden lg:block w-px h-6 bg-gray-200 mx-1"></div>

                                {/* Auth Section */}
                                {isAuthenticated && user ? (
                                    <div className="relative" ref={profileRef}>
                                        <button
                                            onClick={() => setIsProfileOpen(!isProfileOpen)}
                                            className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
                                        >
                                            {user.avatar ? (
                                                <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full object-cover border-2 border-[var(--color-primary)]" />
                                            ) : (
                                                <div className="w-8 h-8 rounded-full bg-[var(--color-primary)] text-white flex items-center justify-center text-sm font-bold">
                                                    {(user.name || user.email || 'U').charAt(0).toUpperCase()}
                                                </div>
                                            )}
                                            <span className="hidden lg:inline text-sm font-medium text-gray-700 max-w-[100px] truncate">
                                                {user.name || 'Account'}
                                            </span>
                                            <FiChevronDown
                                                className={`hidden lg:block text-gray-400 transition-transform duration-200 ${isProfileOpen ? 'rotate-180' : ''}`}
                                                size={13}
                                            />
                                        </button>

                                        {/* Profile Dropdown */}
                                        {isProfileOpen && (
                                            <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-50" style={{ animation: 'fadeIn 0.15s ease-out' }}>
                                                {/* User Info */}
                                                <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
                                                    <p className="text-sm font-bold text-gray-800 truncate">{user.name || 'User'}</p>
                                                    <p className="text-xs text-gray-400 truncate">{user.email}</p>
                                                </div>
                                                {/* Menu Items */}
                                                <div className="py-1">
                                                    <Link
                                                        href={user.role === 'admin' ? '/dashboard/admin' : '/dashboard/user'}
                                                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-[var(--color-primary)] hover:text-white transition-colors"
                                                        onClick={() => setIsProfileOpen(false)}
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
                                                        Dashboard
                                                    </Link>
                                                    <Link
                                                        href="/dashboard/user/orders"
                                                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-[var(--color-primary)] hover:text-white transition-colors"
                                                        onClick={() => setIsProfileOpen(false)}
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
                                                        My Orders
                                                    </Link>
                                                    <Link
                                                        href="/dashboard/user/wishlist"
                                                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-[var(--color-primary)] hover:text-white transition-colors"
                                                        onClick={() => setIsProfileOpen(false)}
                                                    >
                                                        <FiHeart size={15} />
                                                        Wishlist
                                                    </Link>
                                                </div>
                                                {/* Logout */}
                                                <div className="border-t border-gray-100 py-1">
                                                    <button
                                                        onClick={handleLogout}
                                                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                                                        Logout
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <Link href="/login" className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-[var(--color-primary)] transition-colors">
                                        <FiUser size={18} />
                                        <span className="hidden lg:inline">Sign In/ Register</span>
                                    </Link>
                                )}
                            </div>
                        </div>

                        {/* Mobile Search */}
                        <div className="md:hidden pb-3">
                            <div className="flex items-center gap-0">
                                {/* Country (mobile) */}
                                <div className="relative shrink-0">
                                    <select
                                        value={selectedCountry}
                                        onChange={(e) => setSelectedCountry(e.target.value)}
                                        aria-label="Filter by country"
                                        className="h-[42px] bg-gray-50 border border-gray-300 border-r-0 rounded-l-md pl-2.5 pr-6 text-xs font-medium text-gray-700 outline-none appearance-none cursor-pointer"
                                    >
                                        {COUNTRIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                                    </select>
                                    <FiChevronDown size={12} className="absolute right-1.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                </div>
                                <div className="relative flex-1">
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                        placeholder="Search products..."
                                        className="w-full bg-white border border-gray-300 py-2.5 pl-4 pr-4 text-gray-700 placeholder-gray-400 focus:outline-none text-sm"
                                    />
                                </div>
                                <button onClick={handleSearch} className="h-[42px] px-4 bg-[var(--color-primary)] text-white flex items-center rounded-r-md">
                                    <FiSearch size={16} />
                                </button>
                            </div>
                        </div>

                        {/* Mobile Menu */}
                        {isMobileMenuOpen && (
                            <div className="lg:hidden border-t border-gray-200 py-4">
                                <div className="space-y-1">
                                    <button
                                        className="w-full flex items-center justify-between px-3 py-2 text-gray-700 font-semibold text-sm"
                                        onClick={() => setIsMobileCategoryOpen(!isMobileCategoryOpen)}
                                    >
                                        <span>Categories</span>
                                        <FiChevronDown className={`transition-transform ${isMobileCategoryOpen ? 'rotate-180' : ''}`} size={14} />
                                    </button>
                                    {isMobileCategoryOpen && (
                                        <div className="pl-2 space-y-1">
                                            <Link href="/products" className="block px-4 py-2 text-gray-600 hover:text-[var(--color-primary)] text-sm" onClick={() => { setIsMobileMenuOpen(false); }}>
                                                All Products
                                            </Link>
                                            {categories.map((cat) => (
                                                <Link key={cat._id} href={`/products?category=${cat._id}`} className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-50 hover:text-[var(--color-primary)] rounded-lg text-sm transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
                                                    {cat.image ? (
                                                        <img src={cat.image} alt={cat.name} className="w-6 h-6 rounded object-cover shrink-0" />
                                                    ) : (
                                                        <span className="text-lg">{resolveCategoryIcon(cat.name, cat.icon)}</span>
                                                    )}
                                                    <span>{cat.name}</span>
                                                </Link>
                                            ))}
                                        </div>
                                    )}
                                    <Link href="/products" className="block px-3 py-2 text-gray-600 hover:text-[var(--color-primary)] text-sm font-semibold">Products</Link>
                                    <Link href="/contact" className="block px-3 py-2 text-gray-600 hover:text-[var(--color-primary)] text-sm font-semibold">Support</Link>
                                    <Link href="/dashboard/user/wishlist" className="block px-3 py-2 text-gray-600 hover:text-[var(--color-primary)] text-sm font-semibold">Wishlist</Link>
                                </div>
                            </div>
                        )}
                    </div>
                </div>


            </header>
        </>
    );
};

/* Dynamic Logo Component */
function HeaderLogo() {
    const { logoUrl } = useTheme();
    return <img src={logoUrl} alt="Sinotri Global" style={{ width: '240px', height: 'auto', maxHeight: '62px', objectFit: 'contain' }} />;
}

export default Header;
