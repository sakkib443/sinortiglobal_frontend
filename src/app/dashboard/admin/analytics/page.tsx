"use client";

import React, { useState } from 'react';
import {
    FiTrendingUp,
    FiTrendingDown,
    FiDollarSign,
    FiShoppingCart,
    FiUsers,
    FiPackage,
    FiRefreshCw,
    FiCalendar,
    FiArrowUp,
    FiArrowDown,
    FiPieChart,
    FiBarChart2,
    FiActivity,
    FiMapPin,
    FiStar,
    FiClock,
    FiCheckCircle,
    FiTruck,
    FiAlertCircle,
    FiTarget,
} from 'react-icons/fi';
import {
    useGetDashboardSummaryQuery,
    useGetMonthlyRevenueQuery,
    useGetSalesByCategoryQuery,
    useGetTopProductsQuery,
    useGetRecentOrdersQuery,
    useGetRevenueStatsQuery,
} from '@/redux/api/dashboardApi';
import { useGetOrderStatsQuery } from '@/redux/api/orderApi';

// Stat Card Component
const StatCard = ({ title, value, sub, icon: Icon, color, bgColor }: any) => (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 relative overflow-hidden">
        <div className="absolute -top-4 -right-4 w-20 h-20 rounded-full" style={{ background: `${color}08` }} />
        <div className="flex items-start justify-between">
            <div>
                <p className="text-sm text-gray-500 font-medium">{title}</p>
                <p className="text-3xl font-bold text-gray-800 mt-2">{value}</p>
                {sub && (
                    <p className="text-xs font-semibold mt-2" style={{ color }}>{sub}</p>
                )}
            </div>
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center`} style={{ background: bgColor }}>
                <Icon size={26} style={{ color }} />
            </div>
        </div>
    </div>
);

export default function AnalyticsPage() {
    const { data: summaryData, isLoading: loadingSummary, refetch: refetchSummary } = useGetDashboardSummaryQuery(undefined);
    const { data: monthlyRevData, isLoading: loadingMonthly } = useGetMonthlyRevenueQuery(undefined);
    const { data: categoryData, isLoading: loadingCategory } = useGetSalesByCategoryQuery(undefined);
    const { data: topProductsData, isLoading: loadingProducts } = useGetTopProductsQuery(10);
    const { data: recentOrdersData } = useGetRecentOrdersQuery(5);
    const { data: orderStatsData } = useGetOrderStatsQuery(undefined);

    const loading = loadingSummary || loadingMonthly;
    const stats = summaryData?.data || {};
    const monthlyRevenue = monthlyRevData?.data || [];
    const salesByCategory = categoryData?.data || [];
    const topProducts = topProductsData?.data || [];
    const recentOrders = recentOrdersData?.data || [];
    const orderStats = orderStatsData?.data || {};

    const maxRevenue = monthlyRevenue.length > 0
        ? Math.max(...monthlyRevenue.map((m: any) => m.revenue || 0))
        : 100;

    const formatCurrency = (n: number) => `৳${(n || 0).toLocaleString()}`;

    const catColors = ['#0B4222', '#3B82F6', '#F59E0B', '#EC4899', '#8B5CF6', '#06B6D4', '#EF4444', '#10B981'];

    const statusConfig: Record<string, { color: string; bg: string; icon: any }> = {
        pending: { color: '#D97706', bg: '#FEF3C7', icon: FiClock },
        confirmed: { color: '#2563EB', bg: '#DBEAFE', icon: FiCheckCircle },
        processing: { color: '#7C3AED', bg: '#EDE9FE', icon: FiPackage },
        shipped: { color: '#4F46E5', bg: '#E0E7FF', icon: FiTruck },
        delivered: { color: '#059669', bg: '#D1FAE5', icon: FiCheckCircle },
        cancelled: { color: '#DC2626', bg: '#FEE2E2', icon: FiAlertCircle },
    };

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 tracking-tight">Analytics & Reports</h1>
                    <p className="text-gray-500 mt-1">Comprehensive overview of your store performance</p>
                </div>
                <button
                    onClick={() => refetchSummary()}
                    className="px-5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50 flex items-center gap-2 transition-all shadow-sm"
                >
                    <FiRefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                    Refresh Data
                </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Revenue"
                    value={formatCurrency(stats.totalRevenue)}
                    sub={`Today: ${formatCurrency(stats.todayRevenue)}`}
                    icon={FiDollarSign}
                    color="#0B4222"
                    bgColor="#0B422215"
                />
                <StatCard
                    title="Total Orders"
                    value={(stats.totalOrders || 0).toLocaleString()}
                    sub={`${stats.todayOrders || 0} orders today`}
                    icon={FiShoppingCart}
                    color="#3B82F6"
                    bgColor="#3B82F615"
                />
                <StatCard
                    title="Total Customers"
                    value={(stats.totalCustomers || 0).toLocaleString()}
                    sub="Registered users"
                    icon={FiUsers}
                    color="#8B5CF6"
                    bgColor="#8B5CF615"
                />
                <StatCard
                    title="Avg. Order Value"
                    value={formatCurrency(stats.totalOrders > 0 ? Math.round(stats.totalRevenue / stats.totalOrders) : 0)}
                    sub={`${stats.totalProducts || 0} products in catalog`}
                    icon={FiActivity}
                    color="#F59E0B"
                    bgColor="#F59E0B15"
                />
            </div>

            {/* Order Status Distribution */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-5">
                    <div>
                        <h2 className="text-lg font-bold text-gray-800">Order Pipeline</h2>
                        <p className="text-sm text-gray-500">Current order status distribution</p>
                    </div>
                    <FiTarget size={20} className="text-gray-400" />
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                    {Object.entries(statusConfig).map(([status, config]) => {
                        const count = orderStats[status] || 0;
                        return (
                            <div key={status} className="rounded-xl p-4 text-center transition-all hover:shadow-md cursor-pointer"
                                style={{ background: config.bg, border: `1px solid ${config.color}20` }}
                            >
                                <config.icon size={22} style={{ color: config.color, margin: '0 auto 8px' }} />
                                <p className="text-2xl font-bold" style={{ color: config.color }}>{count}</p>
                                <p className="text-xs font-semibold capitalize mt-1" style={{ color: config.color }}>{status}</p>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Revenue Chart */}
                <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-xl font-bold text-gray-800">Revenue Overview</h2>
                            <p className="text-sm text-gray-500">Monthly revenue breakdown</p>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                            <span className="flex items-center gap-1">
                                <span className="w-3 h-3 rounded-full bg-[#0B4222]"></span>
                                Revenue
                            </span>
                        </div>
                    </div>

                    {monthlyRevenue.length > 0 ? (
                        <div className="h-72 flex items-end justify-between gap-3">
                            {monthlyRevenue.map((item: any, i: number) => (
                                <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                                    <div className="relative w-full">
                                        <div
                                            className="w-full bg-gradient-to-t from-[#0B4222] to-[#7BC4A8] rounded-t-lg transition-all duration-300 cursor-pointer hover:from-[#093519] hover:to-[#0B4222]"
                                            style={{ height: `${Math.max((item.revenue / maxRevenue) * 220, 4)}px` }}
                                        >
                                            <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2.5 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 shadow-lg">
                                                <span className="font-bold">{formatCurrency(item.revenue)}</span>
                                                <br />
                                                <span className="text-gray-300 text-[10px]">{item.orders || 0} orders</span>
                                            </div>
                                        </div>
                                    </div>
                                    <span className="text-xs text-gray-500 font-medium">{item.month}</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="h-72 flex items-center justify-center">
                            <div className="text-center">
                                <FiBarChart2 size={40} className="text-gray-200 mx-auto mb-3" />
                                <p className="text-gray-400 font-medium">No revenue data available yet</p>
                                <p className="text-gray-300 text-sm mt-1">Revenue will appear here once orders are processed</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Category Distribution */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-xl font-bold text-gray-800">Sales by Category</h2>
                            <p className="text-sm text-gray-500">Product category breakdown</p>
                        </div>
                        <FiPieChart size={20} className="text-gray-400" />
                    </div>

                    {salesByCategory.length > 0 ? (
                        <>
                            {/* Visual Pie (SVG) */}
                            <div className="relative w-44 h-44 mx-auto mb-6">
                                <svg viewBox="0 0 100 100" className="transform -rotate-90">
                                    {salesByCategory.reduce((acc: any[], cat: any, i: number) => {
                                        const total = salesByCategory.reduce((s: number, c: any) => s + (c.totalSales || c.count || 0), 0);
                                        const pct = total > 0 ? ((cat.totalSales || cat.count || 0) / total) * 100 : 0;
                                        const offset = acc.length > 0 ? acc[acc.length - 1].offset + acc[acc.length - 1].pct * 2.512 : 0;
                                        acc.push({ ...cat, pct, offset, color: catColors[i % catColors.length] });
                                        return acc;
                                    }, []).map((cat: any, i: number) => (
                                        <circle
                                            key={i}
                                            cx="50" cy="50" r="40"
                                            fill="none"
                                            stroke={cat.color}
                                            strokeWidth="18"
                                            strokeDasharray={`${cat.pct * 2.512} ${100 * 2.512}`}
                                            strokeDashoffset={-cat.offset}
                                            className="transition-all duration-500"
                                        />
                                    ))}
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="text-center">
                                        <p className="text-lg font-bold text-gray-800">{salesByCategory.length}</p>
                                        <p className="text-[10px] text-gray-500 uppercase font-semibold">Categories</p>
                                    </div>
                                </div>
                            </div>

                            {/* Legend */}
                            <div className="space-y-3">
                                {salesByCategory.slice(0, 6).map((cat: any, i: number) => {
                                    const total = salesByCategory.reduce((s: number, c: any) => s + (c.totalSales || c.count || 0), 0);
                                    const pct = total > 0 ? Math.round(((cat.totalSales || cat.count || 0) / total) * 100) : 0;
                                    return (
                                        <div key={i} className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: catColors[i % catColors.length] }}></span>
                                                <span className="text-sm text-gray-600">{cat.name || cat._id || 'Other'}</span>
                                            </div>
                                            <span className="text-sm font-semibold text-gray-800">{pct}%</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </>
                    ) : (
                        <div className="h-72 flex items-center justify-center">
                            <div className="text-center">
                                <FiPieChart size={40} className="text-gray-200 mx-auto mb-3" />
                                <p className="text-gray-400 font-medium">No category data yet</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Second Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top Products */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-xl font-bold text-gray-800">Top Products</h2>
                            <p className="text-sm text-gray-500">Best performing items</p>
                        </div>
                        <FiBarChart2 size={20} className="text-gray-400" />
                    </div>

                    {topProducts.length > 0 ? (
                        <div className="space-y-4">
                            {topProducts.slice(0, 8).map((product: any, i: number) => (
                                <div key={i} className="flex items-center gap-4 group hover:bg-gray-50 p-2 -mx-2 rounded-xl transition-colors">
                                    <span className="w-8 h-8 rounded-xl bg-gradient-to-br from-gray-100 to-gray-50 flex items-center justify-center text-sm font-bold text-gray-500 border border-gray-100">
                                        {i + 1}
                                    </span>
                                    {product.thumbnail ? (
                                        <img src={product.thumbnail} alt={product.name}
                                            className="w-10 h-10 rounded-lg object-cover border border-gray-100" />
                                    ) : (
                                        <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                                            <FiPackage size={16} className="text-gray-400" />
                                        </div>
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-gray-800 text-sm truncate">{product.name}</p>
                                        <div className="flex items-center gap-3 mt-1">
                                            <span className="text-xs text-gray-500">{product.totalSold || 0} sold</span>
                                            <span className="text-xs font-semibold text-[#0B4222]">{formatCurrency(product.price)}</span>
                                            {product.averageRating > 0 && (
                                                <span className="text-xs text-amber-500 flex items-center gap-0.5">
                                                    <FiStar size={10} className="fill-amber-400" /> {product.averageRating.toFixed(1)}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="w-24 h-2.5 bg-gray-100 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-[#0B4222] to-[#2D8B5E] rounded-full transition-all duration-500"
                                            style={{ width: `${topProducts[0]?.totalSold > 0 ? ((product.totalSold || 0) / topProducts[0].totalSold) * 100 : 0}%` }}
                                        ></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="h-60 flex items-center justify-center">
                            <div className="text-center">
                                <FiPackage size={36} className="text-gray-200 mx-auto mb-3" />
                                <p className="text-gray-400 font-medium">No product data yet</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Recent Activity / Orders */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-xl font-bold text-gray-800">Recent Orders</h2>
                            <p className="text-sm text-gray-500">Latest store activity</p>
                        </div>
                        <FiActivity size={20} className="text-gray-400" />
                    </div>

                    {recentOrders.length > 0 ? (
                        <div className="space-y-4">
                            {recentOrders.map((order: any, i: number) => {
                                const sc = statusConfig[order.status] || statusConfig.pending;
                                return (
                                    <div key={i} className="flex items-start gap-4 pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                                        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                                            style={{ background: sc.bg }}
                                        >
                                            <sc.icon size={18} style={{ color: sc.color }} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between gap-2">
                                                <p className="text-sm font-semibold text-gray-700 truncate">
                                                    {order.orderNumber}
                                                </p>
                                                <span className="text-xs font-bold px-2 py-0.5 rounded-md capitalize"
                                                    style={{ color: sc.color, background: sc.bg }}
                                                >
                                                    {order.status}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-xs font-bold text-[#0B4222]">
                                                    {formatCurrency(order.total)}
                                                </span>
                                                <span className="text-xs text-gray-300">•</span>
                                                <span className="text-xs text-gray-400">
                                                    {new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="h-60 flex items-center justify-center">
                            <div className="text-center">
                                <FiShoppingCart size={36} className="text-gray-200 mx-auto mb-3" />
                                <p className="text-gray-400 font-medium">No orders yet</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Store Metrics Summary */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                    { label: 'Products', value: stats.totalProducts || 0, icon: FiPackage, color: '#0B4222', bg: '#F0FAF4' },
                    { label: 'Categories', value: stats.totalCategories || 0, icon: FiPieChart, color: '#3B82F6', bg: '#EFF6FF' },
                    { label: 'Pending Orders', value: stats.pendingOrders || 0, icon: FiClock, color: '#D97706', bg: '#FFFBEB' },
                    { label: 'Delivered', value: stats.deliveredOrders || 0, icon: FiCheckCircle, color: '#059669', bg: '#F0FAF4' },
                ].map((item, i) => (
                    <div key={i} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: item.bg }}>
                            <item.icon size={22} style={{ color: item.color }} />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-800">{item.value.toLocaleString()}</p>
                            <p className="text-xs text-gray-500 font-medium mt-0.5">{item.label}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
