"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAppDispatch, useAppSelector } from '@/redux';
import { removeFromCart, increaseQuantity, decreaseQuantity, clearCart } from '@/redux/slices/cartSlice';
import { FiTrash2, FiChevronLeft, FiAlertTriangle, FiShoppingBag, FiMinus, FiPlus, FiShoppingCart, FiTruck, FiShield, FiCheckCircle } from 'react-icons/fi';
import EmptyState from '@/components/shared/EmptyState';
import OrderModal from '@/components/shared/OrderModal';
import { toast } from 'react-hot-toast';
import { numberToWords } from '@/utils/numberToWords';

const CartPage = () => {
    const { items, totalPrice, totalQuantity } = useAppSelector((state) => state.cart);
    const dispatch = useAppDispatch();
    const [showOrderModal, setShowOrderModal] = useState(false);
    const [orderSuccess, setOrderSuccess] = useState(false);
    const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

    /* ═══ ORDER SUCCESS STATE ═══ */
    if (orderSuccess) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center px-4 py-20">
                <div className="text-center max-w-md w-full animate-fadeIn">
                    <div className="w-20 h-20 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-6">
                        <FiCheckCircle size={40} className="text-emerald-500" />
                    </div>
                    <h2 className="text-2xl font-black text-gray-900 mb-3 tracking-tight">
                        Order Placed Successfully!
                    </h2>
                    <p className="text-sm text-gray-500 mb-8 leading-relaxed">
                        Thank you for your order. We will contact you shortly to confirm the details.
                    </p>
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 px-10 py-4 bg-[var(--color-primary)] text-white rounded-md font-bold text-sm tracking-widest uppercase hover:scale-105 transition-all shadow-lg shadow-[var(--color-primary)]/20 active:scale-95"
                    >
                        Continue Shopping
                    </Link>
                </div>
            </div>
        );
    }

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
            toast.success('Cart cleared successfully');
        }
    };

    return (
        <div className="bg-gray-50/50 min-h-screen pb-20">
            <div className="container mx-auto px-4 sm:px-6 md:px-8 lg:px-16 pt-6 md:pt-8">

                {/* ═══ HEADER ═══ */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 md:mb-10">
                    <div>
                        <Link
                            href="/"
                            className="inline-flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-[var(--color-primary)] transition-colors group mb-3"
                        >
                            <FiChevronLeft className="group-hover:-translate-x-1 transition-transform" size={16} />
                            Back to Shopping
                        </Link>
                        <h1 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                            <FiShoppingCart className="text-[var(--color-primary)]" />
                            Shopping Cart
                            <span className="text-sm font-bold text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
                                {totalQuantity} {totalQuantity === 1 ? 'item' : 'items'}
                            </span>
                        </h1>
                    </div>
                    <button
                        onClick={handleClearCart}
                        className="self-start sm:self-auto inline-flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-red-500 transition-colors uppercase tracking-widest group"
                    >
                        <FiTrash2 size={13} className="group-hover:scale-110 transition-transform" />
                        Clear Cart
                    </button>
                </div>

                {/* ═══ MAIN LAYOUT: Items + Summary ═══ */}
                <div className="flex flex-col lg:grid lg:grid-cols-12 gap-8 lg:gap-10">

                    {/* ═══ LEFT: CART ITEMS ═══ */}
                    <div className="lg:col-span-8 space-y-4">

                        {/* Table Header — Desktop Only */}
                        <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-[0.15em]">
                            <div className="col-span-6">Product</div>
                            <div className="col-span-2 text-center">Quantity</div>
                            <div className="col-span-2 text-center">Unit Price</div>
                            <div className="col-span-2 text-right">Total</div>
                        </div>

                        {/* Cart Items */}
                        {items.map((item, index) => (
                            <div
                                key={item.id}
                                className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 group animate-fadeIn"
                                style={{ animationDelay: `${index * 50}ms` }}
                            >
                                {/* Desktop Layout */}
                                <div className="hidden md:grid grid-cols-12 gap-4 items-center p-5">
                                    {/* Product Info */}
                                    <div className="col-span-6 flex items-center gap-4">
                                        <div className="w-[72px] h-[72px] rounded-lg overflow-hidden flex-shrink-0 border border-gray-100 bg-gray-50 p-1">
                                            <img
                                                src={item.image}
                                                alt={item.name}
                                                className="w-full h-full object-contain rounded"
                                            />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <h3 className="text-sm font-bold text-gray-900 line-clamp-2 leading-snug tracking-tight">
                                                {item.name}
                                            </h3>
                                            {(item.color || item.size) && (
                                                <div className="flex items-center gap-2 mt-2 flex-wrap">
                                                    {item.color && (
                                                        <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-gray-500 bg-gray-50 px-2.5 py-1 rounded-full border border-gray-100">
                                                            <span
                                                                className="w-2.5 h-2.5 rounded-full border border-gray-200 flex-shrink-0"
                                                                style={{ background: item.colorHex || '#ccc' }}
                                                            />
                                                            {item.color}
                                                        </span>
                                                    )}
                                                    {item.size && (
                                                        <span className="text-[10px] font-bold text-gray-500 bg-gray-50 px-2.5 py-1 rounded-full border border-gray-100 uppercase tracking-wider">
                                                            {item.size}
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Quantity */}
                                    <div className="col-span-2 flex justify-center">
                                        <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                                            <button
                                                onClick={() => dispatch(decreaseQuantity(item.id))}
                                                disabled={item.quantity <= 1}
                                                className="w-9 h-9 flex items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                            >
                                                <FiMinus size={12} />
                                            </button>
                                            <div className="w-12 h-9 flex items-center justify-center text-sm font-black text-gray-900 bg-white border-x border-gray-200">
                                                {item.quantity}
                                            </div>
                                            <button
                                                onClick={() => dispatch(increaseQuantity(item.id))}
                                                className="w-9 h-9 flex items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors"
                                            >
                                                <FiPlus size={12} />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Unit Price */}
                                    <div className="col-span-2 text-center">
                                        <span className="text-sm font-bold text-gray-700">
                                            ৳{item.price.toLocaleString()}
                                        </span>
                                    </div>

                                    {/* Total + Delete */}
                                    <div className="col-span-2 flex items-center justify-end gap-3">
                                        <span className="text-sm font-black text-gray-900">
                                            ৳{(item.price * item.quantity).toLocaleString()}
                                        </span>
                                        <button
                                            onClick={() => setDeleteConfirmId(item.id)}
                                            className="w-8 h-8 rounded-full flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100"
                                        >
                                            <FiTrash2 size={14} />
                                        </button>
                                    </div>
                                </div>

                                {/* Mobile Layout */}
                                <div className="md:hidden p-4">
                                    <div className="flex gap-3">
                                        <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 border border-gray-100 bg-gray-50 p-1">
                                            <img
                                                src={item.image}
                                                alt={item.name}
                                                className="w-full h-full object-contain rounded"
                                            />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2">
                                                <h3 className="text-sm font-bold text-gray-900 line-clamp-2 leading-snug">
                                                    {item.name}
                                                </h3>
                                                <button
                                                    onClick={() => setDeleteConfirmId(item.id)}
                                                    className="w-7 h-7 rounded-full flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all flex-shrink-0"
                                                >
                                                    <FiTrash2 size={13} />
                                                </button>
                                            </div>
                                            {(item.color || item.size) && (
                                                <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                                                    {item.color && (
                                                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-gray-500 bg-gray-50 px-2 py-0.5 rounded-full border border-gray-100">
                                                            <span
                                                                className="w-2 h-2 rounded-full border border-gray-200 flex-shrink-0"
                                                                style={{ background: item.colorHex || '#ccc' }}
                                                            />
                                                            {item.color}
                                                        </span>
                                                    )}
                                                    {item.size && (
                                                        <span className="text-[10px] font-bold text-gray-500 bg-gray-50 px-2 py-0.5 rounded-full border border-gray-100 uppercase">
                                                            {item.size}
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Price + Quantity Row */}
                                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-50">
                                        <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                                            <button
                                                onClick={() => dispatch(decreaseQuantity(item.id))}
                                                disabled={item.quantity <= 1}
                                                className="w-8 h-8 flex items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                            >
                                                <FiMinus size={11} />
                                            </button>
                                            <div className="w-10 h-8 flex items-center justify-center text-xs font-black text-gray-900 bg-white border-x border-gray-200">
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
                                            <p className="text-xs text-gray-400 font-medium">৳{item.price.toLocaleString()} × {item.quantity}</p>
                                            <p className="text-base font-black text-gray-900">৳{(item.price * item.quantity).toLocaleString()}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {/* Continue Shopping Link */}
                        <div className="pt-4">
                            <Link
                                href="/"
                                className="inline-flex items-center gap-2 text-sm font-bold text-[var(--color-primary)] hover:underline transition-all group"
                            >
                                <FiChevronLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                                Continue Shopping
                            </Link>
                        </div>
                    </div>

                    {/* ═══ RIGHT: ORDER SUMMARY ═══ */}
                    <div className="lg:col-span-4 lg:sticky lg:top-32 h-fit">
                        <div className="bg-white rounded-xl border border-gray-100 shadow-xl shadow-gray-200/20 overflow-hidden">

                            {/* Summary Header */}
                            <div className="px-6 md:px-8 pt-6 md:pt-8 pb-5 border-b border-gray-50">
                                <h2 className="text-lg md:text-xl font-black text-gray-900 tracking-tight">Order Summary</h2>
                            </div>

                            {/* Summary Content */}
                            <div className="px-6 md:px-8 py-6 space-y-4">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500 font-medium">
                                        Subtotal ({totalQuantity} {totalQuantity === 1 ? 'item' : 'items'})
                                    </span>
                                    <span className="font-bold text-gray-900">৳{totalPrice.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500 font-medium flex items-center gap-1.5">
                                        <FiTruck size={13} />
                                        Transportation
                                    </span>
                                    <span className="font-semibold text-amber-600 text-xs italic">To Be Negotiated</span>
                                </div>

                                {/* Divider */}
                                <div className="border-t border-dashed border-gray-200 pt-4 mt-4">
                                    <div className="flex justify-between items-end">
                                        <div>
                                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Grand Total</span>
                                            <p className="text-2xl font-black text-gray-900 tracking-tight mt-1">
                                                ৳{totalPrice.toLocaleString()}
                                            </p>
                                        </div>
                                        <FiCheckCircle className="text-emerald-500 mb-1" size={22} />
                                    </div>
                                    <p className="text-[11px] text-gray-400 font-medium mt-2 italic leading-relaxed">
                                        {numberToWords(totalPrice)}
                                    </p>
                                </div>
                            </div>

                            {/* CTA Button */}
                            <div className="px-6 md:px-8 pb-6 md:pb-8">
                                <button
                                    onClick={() => setShowOrderModal(true)}
                                    className="w-full flex items-center justify-center gap-3 py-4 bg-gray-900 text-white rounded-lg font-bold text-sm tracking-widest uppercase hover:bg-[var(--color-primary)] transition-all shadow-xl shadow-gray-200 hover:shadow-[var(--color-primary)]/20 hover:scale-[1.02] active:scale-[0.98] group"
                                >
                                    CONFIRM ORDER
                                    <FiShoppingBag className="group-hover:scale-110 transition-transform" size={16} />
                                </button>
                            </div>

                            {/* Trust Badges */}
                            <div className="px-6 md:px-8 pb-6 md:pb-8 pt-2 border-t border-gray-50">
                                <div className="flex items-center justify-center gap-6 text-gray-300">
                                    <div className="flex flex-col items-center gap-1.5">
                                        <FiShield size={16} />
                                        <span className="text-[9px] font-bold uppercase tracking-widest">Secure</span>
                                    </div>
                                    <div className="w-px h-8 bg-gray-100"></div>
                                    <div className="flex flex-col items-center gap-1.5">
                                        <FiTruck size={16} />
                                        <span className="text-[9px] font-bold uppercase tracking-widest">Delivery</span>
                                    </div>
                                    <div className="w-px h-8 bg-gray-100"></div>
                                    <div className="flex flex-col items-center gap-1.5">
                                        <FiCheckCircle size={16} />
                                        <span className="text-[9px] font-bold uppercase tracking-widest">Quality</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ═══ ORDER MODAL ═══ */}
            <OrderModal
                isOpen={showOrderModal}
                onClose={() => setShowOrderModal(false)}
                items={items.map(item => ({
                    product: item.productId || item.id,
                    quantity: item.quantity,
                    name: item.name,
                    color: item.color || undefined,
                    size: item.size || undefined,
                    price: item.price,
                }))}
                totalPrice={totalPrice}
                clearCartOnSuccess={true}
                onSuccess={() => setOrderSuccess(true)}
            />

            {/* ═══ DELETE CONFIRMATION MODAL ═══ */}
            {deleteConfirmId && (
                <div
                    className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/45 backdrop-blur-sm animate-fadeIn"
                    onClick={() => setDeleteConfirmId(null)}
                >
                    <div
                        className="bg-white rounded-2xl p-8 max-w-[360px] w-[90%] shadow-2xl text-center animate-slideUp"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Icon */}
                        <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-5">
                            <FiAlertTriangle size={26} className="text-red-500" />
                        </div>
                        {/* Title */}
                        <h3 className="text-lg font-black text-gray-900 mb-2">Remove Item?</h3>
                        {/* Message */}
                        <p className="text-sm text-gray-500 mb-7 leading-relaxed">
                            Are you sure you want to remove this item from your cart?
                        </p>
                        {/* Buttons */}
                        <div className="flex gap-3">
                            <button
                                onClick={() => setDeleteConfirmId(null)}
                                className="flex-1 py-3 rounded-xl border-2 border-gray-200 bg-white text-sm font-bold text-gray-600 hover:bg-gray-50 transition-all active:scale-95"
                            >
                                No, Keep It
                            </button>
                            <button
                                onClick={() => {
                                    dispatch(removeFromCart(deleteConfirmId));
                                    toast.success('Item removed from cart');
                                    setDeleteConfirmId(null);
                                }}
                                className="flex-1 py-3 rounded-xl border-none bg-red-500 text-sm font-bold text-white hover:bg-red-600 transition-all active:scale-95"
                            >
                                Yes, Remove
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CartPage;
