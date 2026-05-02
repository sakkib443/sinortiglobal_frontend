"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
    FiHome, FiShoppingBag, FiUsers,
    FiGrid, FiLogOut, FiMenu, FiX, FiChevronDown,
    FiShoppingCart, FiMessageSquare, FiUser, FiChevronLeft,
    FiLayout, FiBarChart2, FiTruck, FiTag, FiStar,
    FiSettings, FiBell, FiSearch, FiCreditCard,
} from 'react-icons/fi';

interface AdminLayoutProps { children: React.ReactNode; }

const SIDEBAR_W = 240;

const menuSections = [
    {
        label: 'Main',
        items: [
            { name: 'Dashboard', href: '/dashboard/admin', icon: FiHome, submenu: null },
            { name: 'Analytics', href: '/dashboard/admin/analytics', icon: FiBarChart2, submenu: null },
        ],
    },
    {
        label: 'Commerce',
        items: [
            { name: 'Orders', href: '/dashboard/admin/orders', icon: FiShoppingCart, submenu: null },
            {
                name: 'Products', href: '/dashboard/admin/products', icon: FiShoppingBag, submenu: [
                    { name: 'All Products', href: '/dashboard/admin/products' },
                    { name: 'Add Product', href: '/dashboard/admin/products/new' },
                ]
            },
            {
                name: 'Categories', href: '/dashboard/admin/categories', icon: FiGrid, submenu: [
                    { name: 'All Categories', href: '/dashboard/admin/categories' },
                    { name: 'Create Category', href: '/dashboard/admin/categories/new' },
                ]
            },
            { name: 'Coupons', href: '/dashboard/admin/coupons', icon: FiTag, submenu: null },
        ],
    },
    {
        label: 'Fulfillment',
        items: [
            { name: 'Payments', href: '/dashboard/admin/payments', icon: FiCreditCard, submenu: null },
        ],
    },
    {
        label: 'Customers',
        items: [
            { name: 'Users & Admins', href: '/dashboard/admin/customers', icon: FiUsers, submenu: null },
            { name: 'Reviews', href: '/dashboard/admin/reviews', icon: FiStar, submenu: null },
        ],
    },
    {
        label: 'Content & Settings',
        items: [
            { name: 'Site Content', href: '/dashboard/admin/site-content', icon: FiLayout, submenu: null },
            { name: 'Settings', href: '/dashboard/admin/settings', icon: FiSettings, submenu: null },
            { name: 'Profile', href: '/dashboard/admin/profile', icon: FiUser, submenu: null },
        ],
    },
];

// Flatten for compatibility
const allMenuItems = menuSections.flatMap(s => s.items);

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
    const [mobileOpen, setMobileOpen] = useState(false);
    const [expandedMenu, setExpandedMenu] = useState<string | null>(null);
    const pathname = usePathname();
    const router = useRouter();

    useEffect(() => { setMobileOpen(false); }, [pathname]);

    useEffect(() => {
        allMenuItems.forEach((item) => {
            if (item.submenu?.some(s => pathname.startsWith(s.href))) {
                setExpandedMenu(item.name);
            }
        });
    }, [pathname]);

    const handleLogout = () => { localStorage.removeItem('token'); router.push('/'); };

    const isActive = (href: string) => pathname === href;
    const isParentActive = (item: typeof allMenuItems[0]) =>
        item.submenu ? item.submenu.some(s => pathname.startsWith(s.href)) : pathname === item.href;

    const Sidebar = () => (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            {/* Logo */}
            <div style={{
                height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '0 16px', borderBottom: '1px solid #f0f0f0', flexShrink: 0,
            }}>
                <Link href="/dashboard/admin" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                        width: '30px', height: '30px', borderRadius: '8px',
                        background: 'linear-gradient(135deg, #0B4222 0%, #1a6b3c 100%)',
                        display: 'flex', alignItems: 'center',
                        justifyContent: 'center', color: '#fff', fontSize: '14px', fontWeight: 800,
                        boxShadow: '0 2px 8px rgba(11,66,34,0.3)',
                    }}>S</div>
                    <div>
                        <span style={{ fontSize: '14px', fontWeight: 800, color: '#111', letterSpacing: '-0.3px', display: 'block', lineHeight: 1.1 }}>Sinotri</span>
                        <span style={{ fontSize: '9px', fontWeight: 600, color: '#999', textTransform: 'uppercase', letterSpacing: '1px' }}>Admin Panel</span>
                    </div>
                </Link>
                <button
                    className="lg:hidden"
                    onClick={() => setMobileOpen(false)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888', padding: '4px' }}
                >
                    <FiX size={18} />
                </button>
            </div>

            {/* Nav */}
            <nav style={{ flex: 1, overflowY: 'auto', padding: '12px 10px' }}>
                {menuSections.map((section) => (
                    <div key={section.label} style={{ marginBottom: '16px' }}>
                        <p style={{
                            fontSize: '9px', fontWeight: 700, color: '#bbb',
                            textTransform: 'uppercase', letterSpacing: '1.2px',
                            padding: '0 10px 6px', margin: 0,
                        }}>
                            {section.label}
                        </p>
                        {section.items.map((item) => {
                            const hasSubmenu = !!(item.submenu && item.submenu.length > 0);
                            const isExpanded = expandedMenu === item.name;
                            const parentActive = isParentActive(item);
                            const exactActive = !hasSubmenu && isActive(item.href);
                            const highlighted = exactActive || (hasSubmenu && parentActive);

                            return (
                                <div key={item.name} style={{ marginBottom: '1px' }}>
                                    <Link
                                        href={hasSubmenu ? '#' : item.href}
                                        onClick={(e) => {
                                            if (hasSubmenu) { e.preventDefault(); setExpandedMenu(isExpanded ? null : item.name); }
                                        }}
                                        style={{
                                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                            padding: '8px 12px', borderRadius: '8px', textDecoration: 'none',
                                            background: highlighted ? '#0B4222' : 'transparent',
                                            color: highlighted ? '#fff' : '#555',
                                            fontSize: '13px', fontWeight: highlighted ? 600 : 500,
                                            transition: 'all 0.2s ease',
                                        }}
                                        onMouseEnter={e => { if (!highlighted) { (e.currentTarget as HTMLElement).style.background = '#f5f5f5'; } }}
                                        onMouseLeave={e => { if (!highlighted) { (e.currentTarget as HTMLElement).style.background = 'transparent'; } }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <item.icon size={16} />
                                            <span>{item.name}</span>
                                        </div>
                                        {hasSubmenu && (
                                            <FiChevronDown size={13} style={{
                                                transform: isExpanded ? 'rotate(180deg)' : 'none',
                                                transition: 'transform 0.2s',
                                                opacity: 0.5,
                                            }} />
                                        )}
                                    </Link>

                                    {hasSubmenu && isExpanded && (
                                        <div style={{
                                            marginLeft: '16px', paddingLeft: '12px',
                                            borderLeft: '2px solid #e5e7eb', marginTop: '2px', marginBottom: '4px',
                                        }}>
                                            {item.submenu!.map((sub) => (
                                                <Link key={sub.name} href={sub.href}
                                                    style={{
                                                        display: 'block', padding: '6px 10px', borderRadius: '6px',
                                                        fontSize: '12px', textDecoration: 'none', marginBottom: '1px',
                                                        background: isActive(sub.href) ? '#f0faf4' : 'transparent',
                                                        color: isActive(sub.href) ? '#0B4222' : '#888',
                                                        fontWeight: isActive(sub.href) ? 600 : 400,
                                                    }}
                                                >
                                                    {sub.name}
                                                </Link>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                ))}
            </nav>

            {/* Footer */}
            <div style={{ padding: '8px 10px', borderTop: '1px solid #f0f0f0', flexShrink: 0 }}>
                <button onClick={handleLogout}
                    style={{
                        width: '100%', display: 'flex', alignItems: 'center', gap: '10px',
                        padding: '9px 12px', borderRadius: '8px', background: 'none',
                        border: 'none', cursor: 'pointer', color: '#999', fontSize: '13px', fontWeight: 500,
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#fff0f0'; (e.currentTarget as HTMLElement).style.color = '#dc2626'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = '#999'; }}
                >
                    <FiLogOut size={16} /> Logout
                </button>
            </div>
        </div>
    );

    return (
        <div style={{ minHeight: '100vh', background: '#f8f9fb' }}>

            {/* Mobile overlay */}
            {mobileOpen && (
                <div
                    onClick={() => setMobileOpen(false)}
                    style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 99, backdropFilter: 'blur(4px)' }}
                />
            )}

            {/* Desktop Sidebar */}
            <div
                className="hidden lg:block"
                style={{
                    position: 'fixed', top: 0, left: 0, width: `${SIDEBAR_W}px`, height: '100vh',
                    background: '#fff', borderRight: '1px solid #f0f0f0', zIndex: 50, overflowY: 'hidden',
                }}
            >
                <Sidebar />
            </div>

            {/* Mobile Sidebar */}
            <div
                className="lg:hidden"
                style={{
                    position: 'fixed', top: 0, left: 0, width: '260px', height: '100vh',
                    background: '#fff', borderRight: '1px solid #f0f0f0', zIndex: 100,
                    transform: mobileOpen ? 'translateX(0)' : 'translateX(-100%)',
                    transition: 'transform 0.25s ease',
                    boxShadow: mobileOpen ? '4px 0 20px rgba(0,0,0,0.1)' : 'none',
                }}
            >
                <Sidebar />
            </div>

            {/* Main Content */}
            <div
                className="lg:ml-[240px]"
                style={{ minHeight: '100vh' }}
            >
                {/* Top Header */}
                <header style={{
                    height: '56px', background: '#fff', borderBottom: '1px solid #f0f0f0',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '0 24px', position: 'sticky', top: 0, zIndex: 40,
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <button
                            className="lg:hidden"
                            onClick={() => setMobileOpen(true)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#666', padding: '4px' }}
                        >
                            <FiMenu size={20} />
                        </button>

                        {/* Search Bar */}
                        <div style={{
                            position: 'relative', display: 'flex', alignItems: 'center',
                        }} className="hidden md:flex">
                            <FiSearch size={14} style={{
                                position: 'absolute', left: '12px', color: '#bbb',
                            }} />
                            <input
                                type="text"
                                placeholder="Search orders, products, customers..."
                                style={{
                                    width: '320px', padding: '7px 12px 7px 34px',
                                    background: '#f5f5f5', border: '1px solid transparent',
                                    borderRadius: '8px', fontSize: '12.5px', color: '#555',
                                    outline: 'none', transition: 'all 0.2s',
                                }}
                                onFocus={e => { e.target.style.background = '#fff'; e.target.style.borderColor = '#e5e7eb'; e.target.style.boxShadow = '0 2px 8px rgba(0,0,0,0.05)'; }}
                                onBlur={e => { e.target.style.background = '#f5f5f5'; e.target.style.borderColor = 'transparent'; e.target.style.boxShadow = 'none'; }}
                            />
                        </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        {/* Notifications */}
                        <button style={{
                            position: 'relative', background: 'none', border: 'none',
                            cursor: 'pointer', color: '#888', padding: '6px',
                            borderRadius: '8px',
                        }}
                            onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#f5f5f5'}
                            onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
                        >
                            <FiBell size={18} />
                            <span style={{
                                position: 'absolute', top: '2px', right: '2px',
                                width: '7px', height: '7px', borderRadius: '50%',
                                background: '#ef4444', border: '2px solid #fff',
                            }} />
                        </button>

                        <div style={{ width: '1px', height: '20px', background: '#efefef' }} />

                        <Link href="/" style={{
                            display: 'flex', alignItems: 'center', gap: '4px',
                            fontSize: '12px', fontWeight: 600, color: '#777',
                            textDecoration: 'none', padding: '5px 10px', borderRadius: '6px',
                        }}
                            onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#f5f5f5'}
                            onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
                        >
                            <FiChevronLeft size={13} /> Store
                        </Link>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{
                                width: '30px', height: '30px', borderRadius: '50%',
                                background: 'linear-gradient(135deg, #0B4222, #1a6b3c)',
                                display: 'flex', alignItems: 'center',
                                justifyContent: 'center', fontSize: '12px', fontWeight: 700, color: '#fff',
                            }}>A</div>
                            <span style={{ fontSize: '12px', fontWeight: 600, color: '#555' }} className="hidden sm:inline">Admin</span>
                        </div>
                    </div>
                </header>

                {/* Page content */}
                <main style={{ padding: '24px', minHeight: 'calc(100vh - 56px)' }}>
                    {children}
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
