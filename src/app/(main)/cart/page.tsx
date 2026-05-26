"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAppDispatch, useAppSelector } from '@/redux';
import { removeFromCart, increaseQuantity, decreaseQuantity, clearCart } from '@/redux/slices/cartSlice';
import { FiTrash2, FiChevronLeft, FiAlertTriangle, FiMinus, FiPlus, FiShoppingCart, FiTag, FiX, FiCheck } from 'react-icons/fi';
import EmptyState from '@/components/shared/EmptyState';
import { toast } from 'react-hot-toast';
import { useValidateCouponMutation } from '@/redux/api/couponApi';

const COUPON_STORAGE_KEY = 'sinotri_applied_coupon';

const CartPage = () => {
    const { items, totalPrice, totalQuantity } = useAppSelector((state) => state.cart);
    const dispatch = useAppDispatch();
    const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
    const [couponCode, setCouponCode] = useState('');
    const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number; finalAmount: number; message: string } | null>(null);
    const [couponError, setCouponError] = useState('');
    const [validateCoupon, { isLoading: isValidating }] = useValidateCouponMutation();

    // Restore saved coupon on mount
    useEffect(() => {
        try {
            const saved = localStorage.getItem(COUPON_STORAGE_KEY);
            if (saved) {
                const parsed = JSON.parse(saved);
                setAppliedCoupon(parsed);
                setCouponCode(parsed.code);
            }
        } catch {}
    }, []);

    const handleApplyCoupon = async () => {
        const code = couponCode.trim().toUpperCase();
        if (!code) return;
        setCouponError('');
        try {
            const result = await validateCoupon({ code, orderAmount: totalPrice }).unwrap();
            const couponData = {
                code,
                discount: result.data?.discount ?? result.discount ?? 0,
                finalAmount: result.data?.finalAmount ?? result.finalAmount ?? totalPrice,
                message: result.data?.message ?? result.message ?? 'Coupon applied!',
            };
            setAppliedCoupon(couponData);
            localStorage.setItem(COUPON_STORAGE_KEY, JSON.stringify(couponData));
            toast.success('Coupon applied successfully!');
        } catch (err: any) {
            const msg = err?.data?.message || 'Invalid or expired coupon code';
            setCouponError(msg);
            toast.error(msg);
        }
    };

    const handleRemoveCoupon = () => {
        setAppliedCoupon(null);
        setCouponCode('');
        setCouponError('');
        localStorage.removeItem(COUPON_STORAGE_KEY);
    };

    const finalTotal = appliedCoupon ? appliedCoupon.finalAmount : totalPrice;

    /* ═══ EMPTY CART STATE ═══ */
    if (items.length === 0) {
        return (
            <div className="py-20">
                <EmptyState
                    title="Your cart is empty"
                    description="Looks like you haven't added anything to your cart yet."
                    buttonText="Start Shopping"
                    buttonLink="/"
                />
            </div>
        );
    }

    const handleClearCart = () => {
        if (window.confirm('Are you sure you want to clear your cart?')) {
            dispatch(clearCart());
            toast.success('Cart cleared');
        }
    };

    return (
        <div className="bg-gray-50 min-h-screen pb-20">
            <div className="container mx-auto px-4 sm:px-8 md:px-12 lg:px-16 pt-8 max-w-6xl">

                {/* ═══ HEADER ═══ */}
                <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 mb-5 transition-colors">
                    <FiChevronLeft size={16} />
                    Back to Shopping
                </Link>

                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-semibold text-gray-900 flex items-center gap-2.5">
                        <FiShoppingCart size={22} className="text-gray-700" />
                        Shopping Cart
                        <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2.5 py-1 rounded">
                            {totalQuantity} {totalQuantity === 1 ? 'item' : 'items'}
                        </span>
                    </h1>
                    <button
                        onClick={handleClearCart}
                        className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-red-500 transition-colors"
                    >
                        <FiTrash2 size={13} />
                        Clear Cart
                    </button>
                </div>

                {/* ═══ MAIN LAYOUT ═══ */}
                <div className="flex flex-col lg:grid lg:grid-cols-12 gap-6">

                    {/* ═══ LEFT: CART ITEMS ═══ */}
                    <div className="lg:col-span-7">
                        <div className="bg-white rounded-md border border-gray-200">

                            {/* Table Header — Desktop */}
                            <div className="hidden md:grid grid-cols-12 gap-4 px-5 py-3 border-b border-gray-100 text-xs font-medium text-gray-500">
                                <div className="col-span-6">Product</div>
                                <div className="col-span-2 text-center">Quantity</div>
                                <div className="col-span-2 text-center">Unit Price</div>
                                <div className="col-span-2 text-right">Total</div>
                            </div>

                            {/* Cart Items */}
                            <div className="divide-y divide-gray-100">
                                {items.map((item) => (
                                    <div key={item.id} className="group">
                                        {/* Desktop Layout */}
                                        <div className="hidden md:grid grid-cols-12 gap-4 items-center px-5 py-4">
                                            <div className="col-span-6 flex items-center gap-3">
                                                <div className="w-16 h-16 rounded border border-gray-100 bg-gray-50 p-1 flex-shrink-0">
                                                    <img src={item.image} alt={item.name} className="w-full h-full object-contain" />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <h3 className="text-sm text-gray-800 line-clamp-2 leading-snug">{item.name}</h3>
                                                    {(item.color || item.size) && (
                                                        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                                                            {item.color && (
                                                                <span className="inline-flex items-center gap-1.5 text-xs text-gray-500 bg-gray-50 px-2 py-0.5 rounded border border-gray-100">
                                                                    <span className="w-2 h-2 rounded-full border border-gray-200" style={{ background: item.colorHex || '#ccc' }} />
                                                                    {item.color}
                                                                </span>
                                                            )}
                                                            {item.size && (
                                                                <span className="text-xs text-gray-500 bg-gray-50 px-2 py-0.5 rounded border border-gray-100">
                                                                    {item.size}
                                                                </span>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Quantity */}
                                            <div className="col-span-2 flex justify-center">
                                                <div className="flex items-center border border-gray-200 rounded overflow-hidden">
                                                    <button
                                                        onClick={() => dispatch(decreaseQuantity(item.id))}
                                                        disabled={item.quantity <= 1}
                                                        className="w-8 h-8 flex items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                                    >
                                                        <FiMinus size={12} />
                                                    </button>
                                                    <div className="w-10 h-8 flex items-center justify-center text-sm font-medium text-gray-900 border-x border-gray-200">
                                                        {item.quantity}
                                                    </div>
                                                    <button
                                                        onClick={() => dispatch(increaseQuantity(item.id))}
                                                        className="w-8 h-8 flex items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors"
                                                    >
                                                        <FiPlus size={12} />
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Unit Price */}
                                            <div className="col-span-2 text-center">
                                                <span className="text-sm text-gray-600">৳{item.price.toLocaleString()}</span>
                                            </div>

                                            {/* Total + Delete */}
                                            <div className="col-span-2 flex items-center justify-end gap-3">
                                                <span className="text-sm font-medium text-gray-900">৳{(item.price * item.quantity).toLocaleString()}</span>
                                                <button
                                                    onClick={() => setDeleteConfirmId(item.id)}
                                                    className="w-7 h-7 rounded flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all md:opacity-0 md:group-hover:opacity-100"
                                                >
                                                    <FiTrash2 size={14} />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Mobile Layout */}
                                        <div className="md:hidden p-4">
                                            <div className="flex gap-3">
                                                <div className="w-18 h-18 w-[72px] h-[72px] rounded border border-gray-100 bg-gray-50 p-1 flex-shrink-0">
                                                    <img src={item.image} alt={item.name} className="w-full h-full object-contain" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-start justify-between gap-2">
                                                        <h3 className="text-sm text-gray-800 line-clamp-2 leading-snug">{item.name}</h3>
                                                        <button
                                                            onClick={() => setDeleteConfirmId(item.id)}
                                                            className="w-7 h-7 rounded flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all flex-shrink-0"
                                                        >
                                                            <FiTrash2 size={13} />
                                                        </button>
                                                    </div>
                                                    {(item.color || item.size) && (
                                                        <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                                                            {item.color && (
                                                                <span className="inline-flex items-center gap-1 text-xs text-gray-500 bg-gray-50 px-2 py-0.5 rounded border border-gray-100">
                                                                    <span className="w-2 h-2 rounded-full border border-gray-200" style={{ background: item.colorHex || '#ccc' }} />
                                                                    {item.color}
                                                                </span>
                                                            )}
                                                            {item.size && (
                                                                <span className="text-xs text-gray-500 bg-gray-50 px-2 py-0.5 rounded border border-gray-100">
                                                                    {item.size}
                                                                </span>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50">
                                                <div className="flex items-center border border-gray-200 rounded overflow-hidden">
                                                    <button
                                                        onClick={() => dispatch(decreaseQuantity(item.id))}
                                                        disabled={item.quantity <= 1}
                                                        className="w-8 h-8 flex items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                                    >
                                                        <FiMinus size={11} />
                                                    </button>
                                                    <div className="w-10 h-8 flex items-center justify-center text-sm font-medium text-gray-900 border-x border-gray-200">
                                                        {item.quantity}
                                                    </div>
                                                    <button
                                                        onClick={() => dispatch(increaseQuantity(item.id))}
                                                        className="w-8 h-8 flex items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors"
                                                    >
                                                        <FiPlus size={11} />
                                                    </button>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-xs text-gray-400">৳{item.price.toLocaleString()} × {item.quantity}</p>
                                                    <p className="text-sm font-medium text-gray-900">৳{(item.price * item.quantity).toLocaleString()}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Continue Shopping */}
                        <div className="pt-4">
                            <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 transition-colors">
                                <FiChevronLeft size={14} />
                                Continue Shopping
                            </Link>
                        </div>
                    </div>

                    {/* ═══ RIGHT: ORDER SUMMARY ═══ */}
                    <div className="lg:col-span-5 lg:sticky lg:top-24 h-fit">
                        <div className="bg-white rounded-md border border-gray-200">

                            <div className="px-5 py-3.5 border-b border-gray-100">
                                <h2 className="text-sm font-semibold text-gray-900">Order Summary</h2>
                            </div>

                            <div className="px-5 py-4 space-y-2.5">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Subtotal ({totalQuantity} {totalQuantity === 1 ? 'item' : 'items'})</span>
                                    <span className="text-gray-900">৳{totalPrice.toLocaleString()}</span>
                                </div>
                                {appliedCoupon && (
                                    <div className="flex justify-between text-sm text-green-600">
                                        <span className="flex items-center gap-1">
                                            <FiTag size={12} />
                                            Coupon ({appliedCoupon.code})
                                        </span>
                                        <span className="font-medium">-৳{appliedCoupon.discount.toLocaleString()}</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Transportation</span>
                                    <span className="text-gray-500 italic text-xs">To be negotiated</span>
                                </div>
                                <div className="flex justify-between items-center pt-3 mt-1 border-t border-gray-100">
                                    <span className="text-sm font-medium text-gray-900">Total</span>
                                    <div className="text-right">
                                        {appliedCoupon && (
                                            <p className="text-xs line-through text-gray-400">৳{totalPrice.toLocaleString()}</p>
                                        )}
                                        <span className="text-lg font-semibold text-gray-900">৳{finalTotal.toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Coupon Input */}
                            <div className="px-5 pb-4">
                                <div className="border border-dashed border-gray-200 rounded-md p-3 bg-gray-50/50">
                                    <p className="text-xs font-semibold text-gray-600 mb-2 flex items-center gap-1.5">
                                        <FiTag size={12} /> Apply Coupon
                                    </p>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={couponCode}
                                            onChange={e => { setCouponCode(e.target.value.toUpperCase()); setCouponError(''); }}
                                            onKeyDown={e => e.key === 'Enter' && !appliedCoupon && handleApplyCoupon()}
                                            placeholder="Enter coupon code"
                                            disabled={!!appliedCoupon}
                                            className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded outline-none focus:border-gray-400 bg-white disabled:bg-gray-100 disabled:text-gray-500 uppercase placeholder:normal-case placeholder:text-gray-400"
                                        />
                                        {appliedCoupon ? (
                                            <button
                                                onClick={handleRemoveCoupon}
                                                className="px-3 py-2 text-xs font-semibold text-red-500 border border-red-200 rounded hover:bg-red-50 transition-colors flex items-center gap-1"
                                            >
                                                <FiX size={12} /> Remove
                                            </button>
                                        ) : (
                                            <button
                                                onClick={handleApplyCoupon}
                                                disabled={isValidating || !couponCode.trim()}
                                                className="px-4 py-2 text-xs font-semibold bg-gray-900 text-white rounded hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {isValidating ? '...' : 'Apply'}
                                            </button>
                                        )}
                                    </div>
                                    {couponError && (
                                        <p className="mt-1.5 text-xs text-red-500">{couponError}</p>
                                    )}
                                    {appliedCoupon && (
                                        <p className="mt-1.5 text-xs text-green-600 font-medium flex items-center gap-1">
                                            <FiCheck size={11} /> {appliedCoupon.message}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="px-5 pb-5">
                                <Link
                                    href="/checkout"
                                    className="w-full flex items-center justify-center gap-2 py-3 bg-gray-900 text-white rounded text-sm font-medium hover:bg-gray-800 transition-colors"
                                >
                                    Proceed to Checkout
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ═══ DELETE CONFIRMATION MODAL ═══ */}
            {deleteConfirmId && (
                <div
                    className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 px-4"
                    onClick={() => setDeleteConfirmId(null)}
                >
                    <div
                        className="bg-white rounded-md p-6 max-w-sm w-full border border-gray-200 text-center"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
                            <FiAlertTriangle size={22} className="text-red-500" />
                        </div>
                        <h3 className="text-base font-semibold text-gray-900 mb-1.5">Remove Item?</h3>
                        <p className="text-sm text-gray-500 mb-6 leading-relaxed">
                            Are you sure you want to remove this item from your cart?
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setDeleteConfirmId(null)}
                                className="flex-1 py-2.5 rounded border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                            >
                                Keep It
                            </button>
                            <button
                                onClick={() => {
                                    dispatch(removeFromCart(deleteConfirmId));
                                    toast.success('Item removed');
                                    setDeleteConfirmId(null);
                                }}
                                className="flex-1 py-2.5 rounded bg-red-500 text-sm font-medium text-white hover:bg-red-600 transition-colors"
                            >
                                Remove
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CartPage;
