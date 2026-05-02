"use client";

import React from 'react';
import Link from 'next/link';
import {
    FiShoppingBag, FiShoppingCart, FiUsers,
    FiArrowRight, FiRefreshCw, FiPackage,
    FiPhone, FiClock, FiPlus, FiGrid, FiLayout,
} from 'react-icons/fi';
import {
    useGetDashboardSummaryQuery,
    useGetRecentOrdersQuery,
    useGetTopProductsQuery,
} from '@/redux/api/dashboardApi';

const AdminDashboard: React.FC = () => {
    const {
        data: summaryData,
        isLoading,
        refetch: refetchSummary
    } = useGetDashboardSummaryQuery(undefined, { pollingInterval: 30000 });

    const {
        data: ordersData,
        refetch: refetchOrders
    } = useGetRecentOrdersQuery(8);

    const {
        data: productsData,
    } = useGetTopProductsQuery(5);

    const handleRefresh = () => { refetchSummary(); refetchOrders(); };

    const stats = summaryData?.data || null;
    const recentOrders = ordersData?.data || [];
    const topProducts = productsData?.data || [];

    const formatCurrency = (amount: number) => `৳${(amount || 0).toLocaleString()}`;

    const timeAgo = (date: string) => {
        const diff = Date.now() - new Date(date).getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 1) return 'Just now';
        if (mins < 60) return `${mins}m ago`;
        const hrs = Math.floor(mins / 60);
        if (hrs < 24) return `${hrs}h ago`;
        const days = Math.floor(hrs / 24);
        return `${days}d ago`;
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>

            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ fontSize: '18px', fontWeight: 800, color: '#111', margin: 0 }}>Dashboard</h1>
                    <p style={{ fontSize: '12px', color: '#888', margin: '2px 0 0' }}>Overview of your store</p>
                </div>
                <button
                    onClick={handleRefresh}
                    style={{
                        display: 'flex', alignItems: 'center', gap: '6px',
                        padding: '7px 14px', background: '#fff', border: '1px solid #e5e7eb',
                        borderRadius: '7px', fontSize: '12px', fontWeight: 600, color: '#555',
                        cursor: 'pointer',
                    }}
                >
                    <FiRefreshCw size={13} className={isLoading ? 'animate-spin' : ''} />
                    Refresh
                </button>
            </div>

            {/* Stats Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                {[
                    { label: 'Website Orders', value: stats?.totalOrders || 0, icon: FiShoppingCart, color: '#3B82F6', bg: '#EFF6FF' },
                    { label: 'Total Products', value: stats?.totalProducts || 0, icon: FiShoppingBag, color: '#F59E0B', bg: '#FFFBEB' },
                    { label: 'Registered Users', value: stats?.totalCustomers || 0, icon: FiUsers, color: '#EC4899', bg: '#FDF2F8' },
                ].map((item, i) => (
                    <div key={i} style={{
                        background: '#fff', border: '1px solid #eee', borderRadius: '10px',
                        padding: '16px', display: 'flex', alignItems: 'center', gap: '12px',
                    }}>
                        <div style={{
                            width: '40px', height: '40px', borderRadius: '10px',
                            background: item.bg, display: 'flex', alignItems: 'center',
                            justifyContent: 'center', flexShrink: 0,
                        }}>
                            <item.icon size={18} color={item.color} />
                        </div>
                        <div>
                            {isLoading ? (
                                <div style={{ width: '40px', height: '20px', background: '#f3f4f6', borderRadius: '4px' }} />
                            ) : (
                                <p style={{ fontSize: '20px', fontWeight: 800, color: '#111', margin: 0, lineHeight: 1 }}>
                                    {item.value.toLocaleString()}
                                </p>
                            )}
                            <p style={{ fontSize: '11px', color: '#888', margin: '3px 0 0', fontWeight: 500 }}>{item.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Main Content — 2 Columns */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '14px' }}>

                {/* LEFT — Website Orders */}
                <div style={{
                    background: '#fff', border: '1px solid #eee', borderRadius: '10px',
                    overflow: 'hidden',
                }}>
                    <div style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        padding: '14px 16px', borderBottom: '1px solid #f0f0f0',
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <h3 style={{ fontSize: '13px', fontWeight: 700, color: '#111', margin: 0 }}>Website Orders</h3>
                            {recentOrders.length > 0 && (
                                <span style={{
                                    fontSize: '10px', fontWeight: 700, color: '#fff',
                                    background: '#E4525C', padding: '2px 7px', borderRadius: '999px',
                                }}>
                                    {recentOrders.length}
                                </span>
                            )}
                        </div>
                        <Link href="/dashboard/admin/orders" style={{
                            fontSize: '11px', fontWeight: 600, color: '#0B4222',
                            textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '3px',
                        }}>
                            View All <FiArrowRight size={11} />
                        </Link>
                    </div>

                    {recentOrders.length > 0 ? (
                        <div>
                            {recentOrders.map((order: any, i: number) => (
                                <div key={order._id || i} style={{
                                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                    padding: '11px 16px',
                                    borderBottom: i < recentOrders.length - 1 ? '1px solid #f8f8f8' : 'none',
                                    transition: 'background 0.15s',
                                }}
                                    onMouseEnter={e => e.currentTarget.style.background = '#fafafa'}
                                    onMouseLeave={e => e.currentTarget.style.background = '#fff'}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <div style={{
                                            width: '32px', height: '32px', borderRadius: '8px',
                                            background: order.status === 'pending' ? '#FEF3C7' : '#F0FAF4',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            flexShrink: 0,
                                        }}>
                                            {order.status === 'pending'
                                                ? <FiClock size={14} color="#F59E0B" />
                                                : <FiShoppingCart size={14} color="#0B4222" />
                                            }
                                        </div>
                                        <div>
                                            <p style={{ fontSize: '12.5px', fontWeight: 700, color: '#111', margin: 0 }}>
                                                {order.user?.firstName || order.guestInfo?.name || 'Customer'} {order.user?.lastName || ''}
                                            </p>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '1px' }}>
                                                <span style={{ fontSize: '10.5px', color: '#aaa' }}>{order.orderNumber}</span>
                                                <span style={{ fontSize: '10.5px', color: '#ddd' }}>•</span>
                                                <span style={{ fontSize: '10.5px', color: '#aaa' }}>
                                                    {order.items?.length || 0} item{(order.items?.length || 0) !== 1 ? 's' : ''}
                                                </span>
                                                {order.guestInfo?.phone && (
                                                    <>
                                                        <span style={{ fontSize: '10.5px', color: '#ddd' }}>•</span>
                                                        <span style={{ fontSize: '10.5px', color: '#0B4222', display: 'flex', alignItems: 'center', gap: '2px' }}>
                                                            <FiPhone size={9} /> {order.guestInfo.phone}
                                                        </span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                                        <p style={{ fontSize: '12.5px', fontWeight: 700, color: '#111', margin: 0 }}>
                                            {formatCurrency(order.total)}
                                        </p>
                                        <p style={{ fontSize: '10px', color: '#ccc', margin: '1px 0 0' }}>
                                            {order.createdAt ? timeAgo(order.createdAt) : ''}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div style={{ padding: '40px', textAlign: 'center' }}>
                            <FiShoppingCart size={24} color="#ddd" style={{ margin: '0 auto 8px' }} />
                            <p style={{ fontSize: '12px', color: '#bbb', margin: 0 }}>No website orders yet</p>
                        </div>
                    )}
                </div>

                {/* RIGHT — Sidebar */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

                    {/* Quick Actions */}
                    <div style={{
                        background: '#fff', border: '1px solid #eee', borderRadius: '10px',
                        padding: '14px',
                    }}>
                        <h3 style={{ fontSize: '12px', fontWeight: 700, color: '#111', margin: '0 0 10px' }}>Quick Actions</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                            {[
                                { label: 'Add Product', href: '/dashboard/admin/products/new', icon: FiPlus, color: '#0B4222' },
                                { label: 'All Orders', href: '/dashboard/admin/orders', icon: FiShoppingCart, color: '#3B82F6' },
                                { label: 'Categories', href: '/dashboard/admin/categories', icon: FiGrid, color: '#F59E0B' },
                                { label: 'Site Content', href: '/dashboard/admin/site-content', icon: FiLayout, color: '#6366F1' },
                            ].map((item, i) => (
                                <Link key={i} href={item.href} style={{
                                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                    padding: '8px 10px', background: '#fafafa', borderRadius: '7px',
                                    textDecoration: 'none', color: '#555', fontSize: '12px', fontWeight: 500,
                                    transition: 'all 0.15s',
                                }}
                                    onMouseEnter={e => { e.currentTarget.style.background = '#f0faf4'; e.currentTarget.style.color = '#0B4222'; }}
                                    onMouseLeave={e => { e.currentTarget.style.background = '#fafafa'; e.currentTarget.style.color = '#555'; }}
                                >
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                                        <item.icon size={13} color={item.color} />
                                        {item.label}
                                    </span>
                                    <FiArrowRight size={11} color="#ccc" />
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Recent Products */}
                    <div style={{
                        background: '#fff', border: '1px solid #eee', borderRadius: '10px',
                        padding: '14px',
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                            <h3 style={{ fontSize: '12px', fontWeight: 700, color: '#111', margin: 0 }}>Products</h3>
                            <Link href="/dashboard/admin/products" style={{
                                fontSize: '10.5px', fontWeight: 600, color: '#0B4222',
                                textDecoration: 'none',
                            }}>View All</Link>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            {topProducts.length > 0 ? topProducts.map((product: any, i: number) => (
                                <div key={i} style={{
                                    display: 'flex', alignItems: 'center', gap: '10px',
                                    padding: '7px 8px', background: '#fafafa', borderRadius: '7px',
                                }}>
                                    <div style={{
                                        width: '34px', height: '34px', borderRadius: '6px',
                                        background: '#f0f0f0', overflow: 'hidden', flexShrink: 0,
                                        border: '1px solid #eee',
                                    }}>
                                        {product.thumbnail ? (
                                            <img src={product.thumbnail} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        ) : (
                                            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <FiShoppingBag size={14} color="#ccc" />
                                            </div>
                                        )}
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <p style={{ fontSize: '11.5px', fontWeight: 600, color: '#333', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {product.name}
                                        </p>
                                        <p style={{ fontSize: '10.5px', color: '#888', margin: 0 }}>
                                            {formatCurrency(product.price)} · {product.quantity || 0} in stock
                                        </p>
                                    </div>
                                </div>
                            )) : (
                                <p style={{ fontSize: '11px', color: '#bbb', textAlign: 'center', padding: '12px 0' }}>No products yet</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
