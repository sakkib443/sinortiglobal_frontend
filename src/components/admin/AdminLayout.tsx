"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
    FiHome, FiShoppingBag, FiUsers,
    FiGrid, FiLogOut, FiMenu, FiX, FiChevronDown,
    FiShoppingCart, FiMessageSquare, FiUser, FiChevronLeft,
    FiLayout,
} from 'react-icons/fi';

interface AdminLayoutProps { children: React.ReactNode; }

const SIDEBAR_W = 220;

const menuItems = [
    { name: 'Dashboard',  href: '/dashboard/admin',            icon: FiHome,          submenu: null },
    { name: 'Products',   href: '/dashboard/admin/products',   icon: FiShoppingBag,   submenu: [
        { name: 'All Products', href: '/dashboard/admin/products' },
        { name: 'Add Product',  href: '/dashboard/admin/products/new' },
    ]},
    { name: 'Category',   href: '/dashboard/admin/categories', icon: FiGrid,          submenu: [
        { name: 'All Categories',  href: '/dashboard/admin/categories' },
        { name: 'Create Category', href: '/dashboard/admin/categories/new' },
    ]},
    { name: 'Orders',    href: '/dashboard/admin/orders',    icon: FiShoppingCart,  submenu: null },
    { name: 'Inquiries', href: '/dashboard/admin/inquiries', icon: FiMessageSquare, submenu: null },
    { name: 'Users',     href: '/dashboard/admin/customers', icon: FiUsers,         submenu: null },
    { name: 'Design',    href: '/dashboard/admin/site-content', icon: FiLayout,   submenu: [
        { name: 'Site Content', href: '/dashboard/admin/site-content' },
    ]},
    { name: 'Profile',   href: '/dashboard/admin/profile',   icon: FiUser,          submenu: null },
];

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
    const [mobileOpen, setMobileOpen] = useState(false);
    const [expandedMenu, setExpandedMenu] = useState<string | null>(null);
    const pathname = usePathname();
    const router = useRouter();

    useEffect(() => { setMobileOpen(false); }, [pathname]);

    useEffect(() => {
        menuItems.forEach((item) => {
            if (item.submenu?.some(s => pathname.startsWith(s.href))) {
                setExpandedMenu(item.name);
            }
        });
    }, [pathname]);

    const handleLogout = () => { localStorage.removeItem('token'); router.push('/'); };

    const isActive = (href: string) => pathname === href;
    const isParentActive = (item: typeof menuItems[0]) =>
        item.submenu ? item.submenu.some(s => pathname.startsWith(s.href)) : pathname === item.href;

    const Sidebar = () => (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            {/* Logo header */}
            <div style={{
                height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '0 16px', borderBottom: '1px solid #f0f0f0', flexShrink: 0,
            }}>
                <Link href="/dashboard/admin" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{
                        width: '26px', height: '26px', borderRadius: '6px',
                        background: '#1a1a1a', display: 'flex', alignItems: 'center',
                        justifyContent: 'center', color: '#fff', fontSize: '13px', fontWeight: 800,
                    }}>D</div>
                    <span style={{ fontSize: '14px', fontWeight: 800, color: '#111', letterSpacing: '-0.3px' }}>Dominion</span>
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
            <nav style={{ flex: 1, overflowY: 'auto', padding: '12px 8px' }}>
                <p style={{ fontSize: '9px', fontWeight: 700, color: '#bbb', textTransform: 'uppercase', letterSpacing: '1px', padding: '0 10px 8px', margin: 0 }}>
                    Main Menu
                </p>
                {menuItems.map((item) => {
                    const hasSubmenu = !!(item.submenu && item.submenu.length > 0);
                    const isExpanded = expandedMenu === item.name;
                    const parentActive = isParentActive(item);
                    const exactActive = !hasSubmenu && isActive(item.href);
                    const highlighted = exactActive || (hasSubmenu && parentActive);

                    return (
                        <div key={item.name} style={{ marginBottom: '2px' }}>
                            <Link
                                href={hasSubmenu ? '#' : item.href}
                                onClick={(e) => {
                                    if (hasSubmenu) { e.preventDefault(); setExpandedMenu(isExpanded ? null : item.name); }
                                }}
                                style={{
                                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                    padding: '9px 12px', borderRadius: '6px', textDecoration: 'none',
                                    background: highlighted ? '#ebebeb' : 'transparent',
                                    color: highlighted ? '#111' : '#666',
                                    fontSize: '13px', fontWeight: highlighted ? 700 : 500,
                                    transition: 'background 0.15s',
                                }}
                                onMouseEnter={e => { if (!highlighted) (e.currentTarget as HTMLElement).style.background = '#f5f5f5'; }}
                                onMouseLeave={e => { if (!highlighted) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <item.icon size={16} />
                                    <span>{item.name}</span>
                                </div>
                                {hasSubmenu && (
                                    <FiChevronDown size={13} style={{ transform: isExpanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', color: '#bbb' }} />
                                )}
                            </Link>

                            {hasSubmenu && isExpanded && (
                                <div style={{ marginLeft: '14px', paddingLeft: '12px', borderLeft: '1px solid #eee', marginTop: '2px', marginBottom: '4px' }}>
                                    {item.submenu!.map((sub) => (
                                        <Link key={sub.name} href={sub.href}
                                            style={{
                                                display: 'block', padding: '7px 10px', borderRadius: '6px',
                                                fontSize: '12px', textDecoration: 'none', marginBottom: '1px',
                                                background: isActive(sub.href) ? '#ebebeb' : 'transparent',
                                                color: isActive(sub.href) ? '#111' : '#888',
                                                fontWeight: isActive(sub.href) ? 700 : 400,
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
            </nav>

            {/* Logout */}
            <div style={{ padding: '8px', borderTop: '1px solid #f0f0f0', flexShrink: 0 }}>
                <button onClick={handleLogout}
                    style={{
                        width: '100%', display: 'flex', alignItems: 'center', gap: '10px',
                        padding: '9px 12px', borderRadius: '6px', background: 'none',
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
                    style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', zIndex: 99 }}
                />
            )}

            {/* Desktop Sidebar — fixed */}
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
                    position: 'fixed', top: 0, left: 0, width: '240px', height: '100vh',
                    background: '#fff', borderRight: '1px solid #f0f0f0', zIndex: 100,
                    transform: mobileOpen ? 'translateX(0)' : 'translateX(-100%)',
                    transition: 'transform 0.25s ease',
                }}
            >
                <Sidebar />
            </div>

            {/* Right side: header + content */}
            <div
                className="lg:ml-[220px]"
                style={{ minHeight: '100vh' }}
            >
                {/* Header */}
                <header style={{
                    height: '48px', background: '#fff', borderBottom: '1px solid #f0f0f0',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '0 24px', position: 'sticky', top: 0, zIndex: 40,
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <button
                            className="lg:hidden"
                            onClick={() => setMobileOpen(true)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#666', padding: '4px' }}
                        >
                            <FiMenu size={18} />
                        </button>
                        <span style={{ fontSize: '13px', fontWeight: 700, color: '#555' }}>Admin Panel</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <Link href="/" style={{
                            display: 'flex', alignItems: 'center', gap: '4px',
                            fontSize: '12px', fontWeight: 600, color: '#777',
                            textDecoration: 'none', padding: '5px 10px', borderRadius: '6px',
                        }}
                            onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#f5f5f5'}
                            onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
                        >
                            <FiChevronLeft size={13} /> Back to Store
                        </Link>
                        <div style={{ width: '1px', height: '18px', background: '#efefef' }} />
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{
                                width: '27px', height: '27px', borderRadius: '50%',
                                background: '#ebebeb', display: 'flex', alignItems: 'center',
                                justifyContent: 'center', fontSize: '11px', fontWeight: 700, color: '#444',
                            }}>A</div>
                            <span style={{ fontSize: '12px', fontWeight: 600, color: '#555' }} className="hidden sm:inline">Admin</span>
                        </div>
                    </div>
                </header>

                {/* Page content */}
                <main style={{ padding: '24px', minHeight: 'calc(100vh - 48px)' }}>
                    {children}
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
