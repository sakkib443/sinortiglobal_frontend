"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useAppDispatch, useAppSelector } from '@/redux';
import { removeFromCart, increaseQuantity, decreaseQuantity, clearCart } from '@/redux/slices/cartSlice';
import { FiTrash2, FiChevronLeft, FiAlertTriangle } from 'react-icons/fi';
import EmptyState from '@/components/shared/EmptyState';
import OrderModal from '@/components/shared/OrderModal';
import { toast } from 'react-hot-toast';
import { numberToWords } from '@/utils/numberToWords';

const CartPage = () => {
    const { items, totalPrice } = useAppSelector((state) => state.cart);
    const dispatch = useAppDispatch();
    const [showOrderModal, setShowOrderModal] = useState(false);
    const [orderSuccess, setOrderSuccess] = useState(false);
    const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

    if (orderSuccess) {
        return (
            <div style={{ minHeight: '100vh', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 16px' }}>
                <div style={{ textAlign: 'center', maxWidth: '420px', width: '100%' }}>
                    <div style={{
                        width: '80px', height: '80px', borderRadius: '50%',
                        background: '#ecfdf5', display: 'flex', alignItems: 'center',
                        justifyContent: 'center', margin: '0 auto 20px',
                        fontSize: '40px',
                    }}>✅</div>
                    <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#0B4222', margin: '0 0 10px 0' }}>
                        Order Placed Successfully!
                    </h2>
                    <p style={{ fontSize: '14px', color: '#666', margin: '0 0 28px 0', lineHeight: 1.6 }}>
                        Thank you for your order. We will contact you shortly to confirm the details.
                    </p>
                    <Link
                        href="/"
                        style={{
                            display: 'inline-flex', padding: '14px 40px',
                            background: '#0B4222', color: '#fff', borderRadius: '8px',
                            fontSize: '13px', fontWeight: 800, textDecoration: 'none',
                            letterSpacing: '1px', textTransform: 'uppercase',
                        }}
                    >
                        Continue Shopping
                    </Link>
                </div>
            </div>
        );
    }

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
        <div style={{ minHeight: '100vh', paddingBottom: '60px', background: '#f3f4f6' }}>
            <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 1rem' }}>
                {/* Back Button */}
                <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 700, color: '#888', textDecoration: 'none', padding: '16px 0', transition: 'color 0.2s' }}>
                    <FiChevronLeft /> Back to Shopping
                </Link>

                {/* Cart Table */}
                <div style={{ width: '100%', borderCollapse: 'collapse', marginTop: '8px' }}>
                    {/* Table Header */}
                    <div style={{
                        display: 'grid', gridTemplateColumns: '60px 1fr 40px 160px 120px 120px',
                        borderBottom: '2px solid #e5e7eb', padding: '12px 16px',
                        fontSize: '12px', fontWeight: 800, color: '#1a1a1a', textTransform: 'uppercase', letterSpacing: '0.5px',
                    }}>
                        <div>SL NO</div>
                        <div style={{ paddingLeft: '8px' }}>Product Details</div>
                        <div></div>
                        <div style={{ textAlign: 'center' }}>Qty</div>
                        <div style={{ textAlign: 'center' }}>Unit Price</div>
                        <div style={{ textAlign: 'right' }}>Total Price</div>
                    </div>

                    {/* Cart Items */}
                    {items.map((item, index) => (
                        <div key={item.id} style={{
                            display: 'grid', gridTemplateColumns: '60px 1fr 40px 160px 120px 120px',
                            alignItems: 'center', padding: '8px 16px',
                            borderBottom: '1px solid #f3f4f6',
                            transition: 'background 0.15s',
                        }}>
                            {/* SL NO */}
                            <div style={{ fontSize: '14px', fontWeight: 600, color: '#555' }}>{index + 1}</div>

                            {/* Product Details */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingLeft: '8px' }}>
                                <div style={{
                                    width: '56px', height: '56px', borderRadius: '8px', overflow: 'hidden',
                                    flexShrink: 0, border: '1px solid #e5e7eb', background: '#f9fafb',
                                }}>
                                    <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                </div>
                                <div>
                                    <h3 style={{ fontSize: '13px', fontWeight: 700, color: '#1a1a1a', margin: 0, lineHeight: 1.4 }}>{item.name}</h3>
                                    {(item.color || item.size) && (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px', flexWrap: 'wrap' }}>
                                            {item.color && (
                                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#666', fontWeight: 600 }}>
                                                    <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: item.colorHex || '#ccc', border: '1px solid #ddd', flexShrink: 0 }} />
                                                    {item.color}
                                                </span>
                                            )}
                                            {item.size && (
                                                <span style={{ fontSize: '10px', fontWeight: 700, color: '#555', background: '#f3f4f6', padding: '2px 8px', borderRadius: '4px', border: '1px solid #e5e7eb' }}>
                                                    {item.size}
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Remove Icon */}
                            <div style={{ display: 'flex', justifyContent: 'center' }}>
                                <button
                                    onClick={() => setDeleteConfirmId(item.id)}
                                    style={{
                                        background: 'none', border: 'none', cursor: 'pointer',
                                        color: '#ccc', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        padding: '4px', borderRadius: '4px', transition: 'color 0.2s',
                                    }}
                                    onMouseEnter={(e) => (e.currentTarget.style.color = '#ef4444')}
                                    onMouseLeave={(e) => (e.currentTarget.style.color = '#ccc')}
                                >
                                    <FiTrash2 size={15} />
                                </button>
                            </div>

                            {/* Quantity Controls */}
                            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                <div style={{
                                    display: 'flex', alignItems: 'center',
                                    border: '1px solid #e5e7eb', borderRadius: '4px', overflow: 'hidden',
                                }}>
                                    <button
                                        onClick={() => dispatch(decreaseQuantity(item.id))}
                                        disabled={item.quantity <= 1}
                                        title={item.quantity <= 1 ? 'Minimum quantity is 1' : 'Decrease quantity'}
                                        style={{
                                            width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            background: '#f9fafb', border: 'none',
                                            cursor: item.quantity <= 1 ? 'not-allowed' : 'pointer',
                                            fontSize: '14px', fontWeight: 700,
                                            color: item.quantity <= 1 ? '#c4c4c4' : '#555',
                                            opacity: item.quantity <= 1 ? 0.5 : 1,
                                        }}
                                    >−</button>
                                    <div style={{
                                        width: '48px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: '13px', fontWeight: 800, color: '#1a1a1a', background: '#fff',
                                        borderLeft: '1px solid #e5e7eb', borderRight: '1px solid #e5e7eb',
                                    }}>{item.quantity}</div>
                                    <button
                                        onClick={() => dispatch(increaseQuantity(item.id))}
                                        style={{
                                            width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            background: '#f9fafb', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: 700, color: '#555',
                                        }}
                                    >+</button>
                                </div>
                            </div>

                            {/* Unit Price */}
                            <div style={{ textAlign: 'center', fontSize: '13px', fontWeight: 700, color: '#1a1a1a' }}>
                                {item.price.toLocaleString()}
                            </div>

                            {/* Total Price */}
                            <div style={{ textAlign: 'right', fontSize: '14px', fontWeight: 800, color: '#1a1a1a' }}>
                                {(item.price * item.quantity).toLocaleString()}
                            </div>
                        </div>
                    ))}

                    {/* Total Amount + Transportation Row */}
                    <div style={{
                        display: 'grid', gridTemplateColumns: '60px 1fr 160px 120px 120px',
                        padding: '14px 16px 4px', background: '#f3f4f6',
                    }}>
                        <div></div>
                        <div style={{ gridColumn: '2 / 5', fontSize: '14px', fontWeight: 800, color: '#1a1a1a', textAlign: 'left', paddingLeft: '8px', display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                            <span>Total Amount</span>
                            <span style={{ fontSize: '12px', fontWeight: 600, color: '#555' }}>
                                ({numberToWords(totalPrice)})
                            </span>
                        </div>
                        <div style={{ textAlign: 'right', fontSize: '16px', fontWeight: 900, color: '#1a1a1a' }}>
                            {totalPrice.toLocaleString()}
                        </div>
                        <div style={{ gridColumn: '2 / 5', fontSize: '12px', fontWeight: 600, color: '#666', textAlign: 'left', paddingLeft: '8px', marginTop: '2px' }}>
                            Transportation: To Be Negotiated
                        </div>
                    </div>
                </div>

                {/* Add More Products & Clear Cart */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '20px', padding: '12px 16px' }}>
                    <button
                        onClick={handleClearCart}
                        style={{
                            fontSize: '12px', fontWeight: 700, color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', gap: '4px',
                        }}
                    >
                        <FiTrash2 size={12} /> Clear Cart
                    </button>
                    <Link href="/" style={{ fontSize: '12px', fontWeight: 700, color: '#0B4222', textDecoration: 'none' }}>
                        To Add More Products
                    </Link>
                </div>

                {/* Confirm Order Button */}
                <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
                    <button
                        onClick={() => setShowOrderModal(true)}
                        style={{
                            display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                            padding: '14px 48px', background: '#0B4222', color: '#fff',
                            fontSize: '14px', fontWeight: 800, letterSpacing: '1.5px', textTransform: 'uppercase',
                            borderRadius: '4px', border: 'none', cursor: 'pointer',
                            transition: 'all 0.2s ease',
                        }}
                    >
                        CONFIRM ORDER
                    </button>
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
                    <div style={{
                        position: 'fixed', inset: 0, zIndex: 9999,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: 'rgba(0,0,0,0.45)',
                        backdropFilter: 'blur(3px)',
                        animation: 'fadeIn 0.18s ease',
                    }}>
                        <div style={{
                            background: '#fff', borderRadius: '16px',
                            padding: '36px 32px 28px', maxWidth: '360px', width: '90%',
                            boxShadow: '0 20px 60px rgba(0,0,0,0.18)',
                            textAlign: 'center',
                            animation: 'slideUp 0.2s ease',
                        }}>
                            {/* Icon */}
                            <div style={{
                                width: '56px', height: '56px', borderRadius: '50%',
                                background: '#fff1f2', display: 'flex', alignItems: 'center',
                                justifyContent: 'center', margin: '0 auto 16px',
                            }}>
                                <FiAlertTriangle size={26} color="#ef4444" />
                            </div>
                            {/* Title */}
                            <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#1a1a1a', margin: '0 0 8px' }}>
                                Delete Item?
                            </h3>
                            {/* Message */}
                            <p style={{ fontSize: '13px', color: '#666', margin: '0 0 24px', lineHeight: 1.6 }}>
                                Are you sure you want to remove this item from your cart?
                            </p>
                            {/* Buttons */}
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <button
                                    onClick={() => setDeleteConfirmId(null)}
                                    style={{
                                        flex: 1, padding: '11px', borderRadius: '8px',
                                        border: '1.5px solid #e5e7eb', background: '#fff',
                                        fontSize: '13px', fontWeight: 700, color: '#555',
                                        cursor: 'pointer', transition: 'all 0.15s',
                                    }}
                                    onMouseEnter={(e) => { e.currentTarget.style.background = '#f9fafb'; }}
                                    onMouseLeave={(e) => { e.currentTarget.style.background = '#fff'; }}
                                >
                                    No, Keep It
                                </button>
                                <button
                                    onClick={() => {
                                        dispatch(removeFromCart(deleteConfirmId));
                                        toast.success('Item removed from cart');
                                        setDeleteConfirmId(null);
                                    }}
                                    style={{
                                        flex: 1, padding: '11px', borderRadius: '8px',
                                        border: 'none', background: '#ef4444',
                                        fontSize: '13px', fontWeight: 700, color: '#fff',
                                        cursor: 'pointer', transition: 'all 0.15s',
                                    }}
                                    onMouseEnter={(e) => { e.currentTarget.style.background = '#dc2626'; }}
                                    onMouseLeave={(e) => { e.currentTarget.style.background = '#ef4444'; }}
                                >
                                    Yes, Delete
                                </button>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};

export default CartPage;
