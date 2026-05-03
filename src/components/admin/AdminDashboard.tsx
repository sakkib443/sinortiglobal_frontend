"use client";

import React from 'react';
import Link from 'next/link';
import {
    FiShoppingBag, FiShoppingCart, FiUsers,
    FiArrowRight, FiRefreshCw, FiPackage, FiTrendingUp,
    FiPhone, FiClock, FiPlus, FiGrid, FiLayout,
    FiCheckCircle, FiTruck,
    FiAlertCircle, FiStar, FiTag,
} from 'react-icons/fi';
import {
    useGetDashboardSummaryQuery,
    useGetRecentOrdersQuery,
    useGetTopProductsQuery,
    useGetSalesByCategoryQuery,
} from '@/redux/api/dashboardApi';
import { useGetOrderStatsQuery } from '@/redux/api/orderApi';

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

    const { data: productsData } = useGetTopProductsQuery(5);
    const { data: categoryData } = useGetSalesByCategoryQuery(undefined);
    const { data: orderStatsData } = useGetOrderStatsQuery(undefined);

    const handleRefresh = () => { refetchSummary(); refetchOrders(); };

    const stats = summaryData?.data || null;
    const recentOrders = ordersData?.data || [];
    const topProducts = productsData?.data || [];
    const salesByCategory = categoryData?.data || [];
    const orderStats = orderStatsData?.data || {};

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

    const statusColor = (status: string) => {
        const map: Record<string, { bg: string; text: string }> = {
            pending: { bg: '#FEF3C7', text: '#D97706' },
            confirmed: { bg: '#DBEAFE', text: '#2563EB' },
            processing: { bg: '#EDE9FE', text: '#7C3AED' },
            shipped: { bg: '#E0E7FF', text: '#4F46E5' },
            delivered: { bg: 'var(--color-primary-border)', text: 'var(--color-primary)' },
            cancelled: { bg: '#FEE2E2', text: '#DC2626' },
        };
        return map[status] || { bg: '#F3F4F6', text: '#6B7280' };
    };


    // Category colors
    const catColors = ['var(--color-primary)', '#3B82F6', '#F59E0B', '#EC4899', '#8B5CF6', '#06B6D4', '#EF4444'];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#111', margin: 0, letterSpacing: '-0.5px' }}>Dashboard</h1>
                    <p style={{ fontSize: '13px', color: '#888', margin: '4px 0 0' }}>Welcome back! Here&apos;s what&apos;s happening with your store.</p>
                </div>
                <button
                    onClick={handleRefresh}
                    style={{
                        display: 'flex', alignItems: 'center', gap: '6px',
                        padding: '8px 16px', background: '#fff', border: '1px solid #e5e7eb',
                        borderRadius: '8px', fontSize: '13px', fontWeight: 600, color: '#555',
                        cursor: 'pointer', transition: 'all 0.2s',
                    }}
                >
                    <FiRefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
                    Refresh
                </button>
            </div>

            {/* Stats Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px' }}>
                {[
                    {
                        label: 'Total Orders',
                        value: (stats?.totalOrders || 0).toLocaleString(),
                        sub: `${orderStats.pending || 0} pending`,
                        icon: FiShoppingCart,
                        color: '#3B82F6',
                        bg: '#EFF6FF',
                        gradient: 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)',
                    },
                    {
                        label: 'Total Customers',
                        value: (stats?.totalCustomers || 0).toLocaleString(),
                        sub: 'Registered users',
                        icon: FiUsers,
                        color: '#8B5CF6',
                        bg: '#F5F3FF',
                        gradient: 'linear-gradient(135deg, #F5F3FF 0%, #EDE9FE 100%)',
                    },
                    {
                        label: 'Total Products',
                        value: (stats?.totalProducts || 0).toLocaleString(),
                        sub: 'In catalog',
                        icon: FiShoppingBag,
                        color: '#F59E0B',
                        bg: '#FFFBEB',
                        gradient: 'linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%)',
                    },
                    {
                        label: "Today's Orders",
                        value: (stats?.todayOrders || 0).toLocaleString(),
                        sub: `${stats?.deliveredOrders || 0} delivered total`,
                        icon: FiPackage,
                        color: 'var(--color-primary)',
                        bg: 'var(--color-primary-lightest)',
                        gradient: 'linear-gradient(135deg, var(--color-primary-lightest) 0%, var(--color-primary-border) 100%)',
                    },
                ].map((item, i) => (
                    <div key={i} style={{
                        background: item.gradient, border: '1px solid #f0f0f0', borderRadius: '14px',
                        padding: '20px', position: 'relative', overflow: 'hidden',
                    }}>
                        <div style={{
                            position: 'absolute', top: '-10px', right: '-10px',
                            width: '60px', height: '60px', borderRadius: '50%',
                            background: `${item.color}10`, 
                        }} />
                        <div style={{
                            width: '42px', height: '42px', borderRadius: '12px',
                            background: '#fff', display: 'flex', alignItems: 'center',
                            justifyContent: 'center', flexShrink: 0, marginBottom: '12px',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                        }}>
                            <item.icon size={20} color={item.color} />
                        </div>
                        {isLoading ? (
                            <div style={{ width: '60px', height: '24px', background: '#e5e7eb', borderRadius: '6px' }} />
                        ) : (
                            <p style={{ fontSize: '24px', fontWeight: 800, color: '#111', margin: 0, lineHeight: 1 }}>
                                {item.value}
                            </p>
                        )}
                        <p style={{ fontSize: '12px', color: '#888', margin: '4px 0 0', fontWeight: 500 }}>{item.label}</p>
                        <p style={{ fontSize: '11px', color: item.color, margin: '2px 0 0', fontWeight: 600 }}>{item.sub}</p>
                    </div>
                ))}
            </div>

            {/* Order Status Pipeline */}
            <div style={{
                background: '#fff', border: '1px solid #eee', borderRadius: '14px',
                padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '8px',
                overflowX: 'auto',
            }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#555', marginRight: '8px', whiteSpace: 'nowrap' }}>
                    Order Pipeline:
                </span>
                {[
                    { label: 'Pending', value: orderStats.pending || 0, color: '#D97706', bg: '#FEF3C7' },
                    { label: 'Confirmed', value: orderStats.confirmed || 0, color: '#2563EB', bg: '#DBEAFE' },
                    { label: 'Processing', value: orderStats.processing || 0, color: '#7C3AED', bg: '#EDE9FE' },
                    { label: 'Shipped', value: orderStats.shipped || 0, color: '#4F46E5', bg: '#E0E7FF' },
                    { label: 'Delivered', value: orderStats.delivered || 0, color: 'var(--color-primary)', bg: 'var(--color-primary-border)' },
                    { label: 'Cancelled', value: orderStats.cancelled || 0, color: '#DC2626', bg: '#FEE2E2' },
                ].map((item, i) => (
                    <React.Fragment key={item.label}>
                        {i > 0 && <span style={{ color: '#ddd', fontSize: '16px' }}>→</span>}
                        <Link href={`/dashboard/admin/orders?status=${item.label.toLowerCase()}`} style={{
                            display: 'flex', alignItems: 'center', gap: '6px',
                            padding: '6px 14px', borderRadius: '20px',
                            background: item.bg, textDecoration: 'none',
                            transition: 'transform 0.15s', whiteSpace: 'nowrap',
                        }}>
                            <span style={{ fontSize: '16px', fontWeight: 800, color: item.color }}>{item.value}</span>
                            <span style={{ fontSize: '11px', fontWeight: 600, color: item.color }}>{item.label}</span>
                        </Link>
                    </React.Fragment>
                ))}
            </div>

            {/* Sales by Category */}
            <div style={{
                background: '#fff', border: '1px solid #eee', borderRadius: '14px',
                padding: '20px',
            }}>
                <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#111', margin: '0 0 16px' }}>Sales by Category</h3>
                {salesByCategory.length > 0 ? (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        {salesByCategory.slice(0, 8).map((cat: any, i: number) => {
                            const totalSales = salesByCategory.reduce((sum: number, c: any) => sum + (c.count || c.totalSales || 0), 0);
                            const percentage = totalSales > 0 ? Math.round(((cat.count || cat.totalSales || 0) / totalSales) * 100) : 0;
                            return (
                                <div key={i}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                        <span style={{ fontSize: '12px', fontWeight: 600, color: '#555', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <span style={{
                                                width: '8px', height: '8px', borderRadius: '50%',
                                                background: catColors[i % catColors.length],
                                                display: 'inline-block',
                                            }} />
                                            {cat._id || cat.category || 'Other'}
                                        </span>
                                        <span style={{ fontSize: '11px', fontWeight: 700, color: '#333' }}>
                                            {percentage}% ({cat.count || cat.totalSales || 0})
                                        </span>
                                    </div>
                                    <div style={{
                                        height: '6px', background: '#f0f0f0', borderRadius: '3px', overflow: 'hidden',
                                    }}>
                                        <div style={{
                                            height: '100%', borderRadius: '3px',
                                            background: catColors[i % catColors.length],
                                            width: `${percentage}%`,
                                            transition: 'width 0.5s ease',
                                        }} />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div style={{ textAlign: 'center', padding: '30px 0' }}>
                        <FiShoppingBag size={24} color="#ddd" style={{ margin: '0 auto 8px' }} />
                        <p style={{ fontSize: '12px', color: '#bbb' }}>No category data yet</p>
                    </div>
                )}
            </div>

            {/* Orders Table + Sidebar */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '14px' }}>

                {/* Recent Orders */}
                <div style={{
                    background: '#fff', border: '1px solid #eee', borderRadius: '14px',
                    overflow: 'hidden',
                }}>
                    <div style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        padding: '16px 20px', borderBottom: '1px solid #f0f0f0',
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#111', margin: 0 }}>Recent Orders</h3>
                            {recentOrders.length > 0 && (
                                <span style={{
                                    fontSize: '10px', fontWeight: 700, color: '#fff',
                                    background: 'var(--color-primary)', padding: '2px 8px', borderRadius: '999px',
                                }}>
                                    {recentOrders.length}
                                </span>
                            )}
                        </div>
                        <Link href="/dashboard/admin/orders" style={{
                            fontSize: '12px', fontWeight: 600, color: 'var(--color-primary)',
                            textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '3px',
                        }}>
                            View All <FiArrowRight size={12} />
                        </Link>
                    </div>

                    {recentOrders.length > 0 ? (
                        <div>
                            {recentOrders.map((order: any, i: number) => {
                                const sc = statusColor(order.status);
                                return (
                                    <Link key={order._id || i} href={`/dashboard/admin/orders/${order._id}`}
                                        style={{
                                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                            padding: '12px 20px', textDecoration: 'none',
                                            borderBottom: i < recentOrders.length - 1 ? '1px solid #f8f8f8' : 'none',
                                            transition: 'background 0.15s',
                                        }}
                                        onMouseEnter={e => e.currentTarget.style.background = '#fafafa'}
                                        onMouseLeave={e => e.currentTarget.style.background = '#fff'}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <div style={{
                                                width: '36px', height: '36px', borderRadius: '10px',
                                                background: sc.bg,
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                flexShrink: 0,
                                            }}>
                                                {order.status === 'pending'
                                                    ? <FiClock size={15} color={sc.text} />
                                                    : order.status === 'shipped'
                                                        ? <FiTruck size={15} color={sc.text} />
                                                        : order.status === 'delivered'
                                                            ? <FiCheckCircle size={15} color={sc.text} />
                                                            : <FiShoppingCart size={15} color={sc.text} />
                                                }
                                            </div>
                                            <div>
                                                <p style={{ fontSize: '13px', fontWeight: 700, color: '#111', margin: 0 }}>
                                                    {order.user?.firstName || order.guestInfo?.name || 'Customer'} {order.user?.lastName || ''}
                                                </p>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                                                    <span style={{ fontSize: '11px', color: '#aaa', fontWeight: 500 }}>{order.orderNumber}</span>
                                                    <span style={{ fontSize: '11px', color: '#ddd' }}>•</span>
                                                    <span style={{
                                                        fontSize: '10px', fontWeight: 700,
                                                        color: sc.text, background: sc.bg,
                                                        padding: '1px 6px', borderRadius: '4px',
                                                        textTransform: 'capitalize',
                                                    }}>
                                                        {order.status}
                                                    </span>
                                                    {order.guestInfo?.phone && (
                                                        <>
                                                            <span style={{ fontSize: '11px', color: '#ddd' }}>•</span>
                                                            <span style={{ fontSize: '10.5px', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '2px' }}>
                                                                <FiPhone size={9} /> {order.guestInfo.phone}
                                                            </span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div style={{ textAlign: 'right', flexShrink: 0 }}>
                                            <p style={{ fontSize: '13px', fontWeight: 800, color: 'var(--color-primary)', margin: 0 }}>
                                                {formatCurrency(order.total)}
                                            </p>
                                            <p style={{ fontSize: '10px', color: '#ccc', margin: '2px 0 0', fontWeight: 500 }}>
                                                {order.createdAt ? timeAgo(order.createdAt) : ''}
                                            </p>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    ) : (
                        <div style={{ padding: '50px', textAlign: 'center' }}>
                            <FiShoppingCart size={28} color="#ddd" style={{ margin: '0 auto 10px' }} />
                            <p style={{ fontSize: '13px', color: '#bbb', margin: 0 }}>No website orders yet</p>
                        </div>
                    )}
                </div>

                {/* Right Sidebar */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

                    {/* Quick Actions */}
                    <div style={{
                        background: '#fff', border: '1px solid #eee', borderRadius: '14px',
                        padding: '16px',
                    }}>
                        <h3 style={{ fontSize: '13px', fontWeight: 700, color: '#111', margin: '0 0 12px' }}>Quick Actions</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                            {[
                                { label: 'Add Product', href: '/dashboard/admin/products/new', icon: FiPlus, color: 'var(--color-primary)', bg: 'var(--color-primary-lightest)' },
                                { label: 'All Orders', href: '/dashboard/admin/orders', icon: FiShoppingCart, color: '#3B82F6', bg: '#EFF6FF' },
                                { label: 'Shipping', href: '/dashboard/admin/shipping', icon: FiTruck, color: '#F59E0B', bg: '#FFFBEB' },
                                { label: 'Reports', href: '/dashboard/admin/analytics', icon: FiTrendingUp, color: '#8B5CF6', bg: '#F5F3FF' },
                                { label: 'Coupons', href: '/dashboard/admin/coupons', icon: FiTag, color: '#EC4899', bg: '#FDF2F8' },
                                { label: 'Reviews', href: '/dashboard/admin/reviews', icon: FiStar, color: '#06B6D4', bg: '#ECFEFF' },
                            ].map((item, i) => (
                                <Link key={i} href={item.href} style={{
                                    display: 'flex', alignItems: 'center', gap: '8px',
                                    padding: '10px 12px', background: item.bg, borderRadius: '10px',
                                    textDecoration: 'none', color: item.color, fontSize: '12px', fontWeight: 600,
                                    transition: 'all 0.15s', border: '1px solid transparent',
                                }}
                                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)'; }}
                                    onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
                                >
                                    <item.icon size={14} />
                                    {item.label}
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Top Products */}
                    <div style={{
                        background: '#fff', border: '1px solid #eee', borderRadius: '14px',
                        padding: '16px',
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                            <h3 style={{ fontSize: '13px', fontWeight: 700, color: '#111', margin: 0 }}>Top Products</h3>
                            <Link href="/dashboard/admin/products" style={{
                                fontSize: '11px', fontWeight: 600, color: 'var(--color-primary)',
                                textDecoration: 'none',
                            }}>View All</Link>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            {topProducts.length > 0 ? topProducts.map((product: any, i: number) => (
                                <div key={i} style={{
                                    display: 'flex', alignItems: 'center', gap: '10px',
                                    padding: '8px 10px', background: '#fafafa', borderRadius: '10px',
                                }}>
                                    <div style={{
                                        width: '36px', height: '36px', borderRadius: '8px',
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
                                        <p style={{ fontSize: '12px', fontWeight: 600, color: '#333', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {product.name}
                                        </p>
                                        <p style={{ fontSize: '11px', color: '#888', margin: 0 }}>
                                            {formatCurrency(product.price)} · {product.quantity || 0} stock
                                        </p>
                                    </div>
                                    <span style={{
                                        fontSize: '10px', fontWeight: 700,
                                        color: 'var(--color-primary)', background: 'var(--color-primary-lightest)',
                                        padding: '2px 6px', borderRadius: '4px',
                                    }}>
                                        #{i + 1}
                                    </span>
                                </div>
                            )) : (
                                <p style={{ fontSize: '11px', color: '#bbb', textAlign: 'center', padding: '16px 0' }}>No products yet</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
