"use client";

import React, { useState } from 'react';
import { FiX } from 'react-icons/fi';
import { useGuestCheckoutMutation } from '@/redux/api/orderApi';
import { useAppDispatch } from '@/redux';
import { clearCart } from '@/redux/slices/cartSlice';
import { toast } from 'react-hot-toast';

interface OrderItem {
    product: string;
    quantity: number;
    name?: string;
    price?: number;
    image?: string;
    color?: string;
    size?: string;
}

interface OrderModalProps {
    isOpen: boolean;
    onClose: () => void;
    items: OrderItem[];
    totalPrice?: number;
    onSuccess?: () => void;
    clearCartOnSuccess?: boolean;
}

type FieldErrors = {
    name?: string;
    contact?: string;
    location?: string;
};

const baseInputStyle: React.CSSProperties = {
    width: '100%', padding: '10px 14px', fontSize: '13px',
    border: '1px solid #e5e7eb', borderRadius: '6px', outline: 'none',
    transition: 'border-color 0.2s', boxSizing: 'border-box', fontFamily: 'inherit',
};

const errorTextStyle: React.CSSProperties = {
    fontSize: '11px', fontWeight: 600, color: '#dc2626',
    margin: '4px 0 0', lineHeight: 1.4,
};

const NAME_RE = /^[A-Za-zঀ-৿ .'-]{2,}$/;
const EMAIL_RE = /^\S+@\S+\.\S+$/;
const PHONE_RE = /^[0-9+\-\s]{10,15}$/;

const validateField = (field: keyof FieldErrors, value: string): string | undefined => {
    const v = value.trim();
    if (field === 'name') {
        if (!v) return 'Name is required';
        if (/\d/.test(v)) return 'Name cannot contain numbers — letters only';
        if (!NAME_RE.test(v)) return 'Please enter a valid name (letters only, min 2 characters)';
    }
    if (field === 'contact') {
        if (!v) return 'Phone or Email is required';
        if (v.includes('@')) {
            if (!EMAIL_RE.test(v)) return 'Please enter a valid email (e.g. name@mail.com)';
        } else {
            if (!PHONE_RE.test(v)) return 'Please enter a valid phone number (10-15 digits)';
        }
    }
    if (field === 'location') {
        if (!v) return 'Delivery location is required';
        if (v.length < 5) return 'Please enter a complete address (at least 5 characters)';
    }
    return undefined;
};

const OrderModal: React.FC<OrderModalProps> = ({
    isOpen, onClose, items, totalPrice, onSuccess, clearCartOnSuccess = false,
}) => {
    const dispatch = useAppDispatch();
    const [guestCheckout, { isLoading }] = useGuestCheckoutMutation();
    const [formData, setFormData] = useState({ name: '', contact: '', location: '', query: '' });
    const [errors, setErrors] = useState<FieldErrors>({});
    const [touched, setTouched] = useState<Record<keyof FieldErrors, boolean>>({ name: false, contact: false, location: false });

    if (!isOpen) return null;

    const setField = (field: keyof typeof formData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (field in errors || field === 'name' || field === 'contact' || field === 'location') {
            const f = field as keyof FieldErrors;
            if (touched[f]) {
                setErrors(prev => ({ ...prev, [f]: validateField(f, value) }));
            }
        }
    };

    const onBlur = (field: keyof FieldErrors) => {
        setTouched(prev => ({ ...prev, [field]: true }));
        setErrors(prev => ({ ...prev, [field]: validateField(field, formData[field]) }));
    };

    const validateAll = (): boolean => {
        const next: FieldErrors = {
            name: validateField('name', formData.name),
            contact: validateField('contact', formData.contact),
            location: validateField('location', formData.location),
        };
        setErrors(next);
        setTouched({ name: true, contact: true, location: true });
        return !next.name && !next.contact && !next.location;
    };

    const inputStyle = (field: keyof FieldErrors): React.CSSProperties => ({
        ...baseInputStyle,
        borderColor: errors[field] ? '#dc2626' : '#e5e7eb',
    });

    const handleSubmit = async () => {
        if (!validateAll()) {
            toast.error('Please fill in all fields correctly', { duration: 3000 });
            return;
        }

        const isEmail = formData.contact.includes('@');
        const phone = isEmail ? '' : formData.contact.trim();
        const email = isEmail
            ? formData.contact.trim()
            : `${formData.contact.trim().replace(/\s+/g, '')}@guest.dominion.com`;

        try {
            const orderData = {
                shippingAddress: {
                    fullName: formData.name,
                    phone: phone || formData.contact.trim(),
                    email,
                    address: formData.location,
                    city: '',
                    area: '',
                },
                items: items.map(item => ({ product: item.product, quantity: item.quantity, color: item.color || '', size: item.size || '' })),
                paymentMethod: 'cod',
                note: formData.query || '',
                password: formData.contact.trim(),
            };

            await guestCheckout(orderData).unwrap();

            if (clearCartOnSuccess) dispatch(clearCart());

            setFormData({ name: '', contact: '', location: '', query: '' });
            setErrors({});
            setTouched({ name: false, contact: false, location: false });
            onClose();
            onSuccess?.();
            toast.success('Order placed successfully! 🎉', {
                style: { borderRadius: '10px', background: '#0B4222', color: '#fff' },
                duration: 4000,
            });
        } catch (err: any) {
            const data = err?.data;
            if (data?.errors) {
                if (Array.isArray(data.errors)) {
                    toast.error(data.errors.map((e: any) => typeof e === 'string' ? e : (e.message || e.msg || '')).join('\n'), { duration: 5000 });
                } else if (typeof data.errors === 'object') {
                    toast.error(Object.values(data.errors).map((e: any) => e?.message || String(e)).join('\n'), { duration: 5000 });
                } else {
                    toast.error(String(data.errors), { duration: 5000 });
                }
            } else {
                toast.error(data?.message || 'Failed to place order. Please try again.', { duration: 4000 });
            }
        }
    };

    const totalQty = items.reduce((s, i) => s + i.quantity, 0);

    return (
        <div
            style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}
            onClick={onClose}
        >
            <div
                onClick={(e) => e.stopPropagation()}
                style={{ background: '#fff', borderRadius: '12px', width: '100%', maxWidth: '460px', padding: '32px', position: 'relative', boxShadow: '0 25px 50px rgba(0,0,0,0.2)', maxHeight: '90vh', overflowY: 'auto' }}
            >
                {/* Close */}
                <button onClick={onClose} style={{ position: 'absolute', top: '12px', right: '12px', width: '32px', height: '32px', borderRadius: '50%', background: '#f3f4f6', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666' }}>
                    <FiX size={16} />
                </button>

                <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#1a1a1a', margin: '0 0 4px' }}>Confirm Your Order</h2>
                <p style={{ fontSize: '12px', color: '#888', margin: '0 0 24px' }}>Fill in your details to place the order</p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

                    {/* Name */}
                    <div>
                        <label style={{ fontSize: '12px', fontWeight: 700, color: '#555', display: 'block', marginBottom: '4px' }}>Full Name *</label>
                        <input type="text" value={formData.name}
                            onChange={e => setField('name', e.target.value)}
                            onBlur={() => onBlur('name')}
                            placeholder="Enter your full name" style={inputStyle('name')}
                            onFocus={e => { if (!errors.name) e.target.style.borderColor = '#0B4222'; }} />
                        {errors.name && <p style={errorTextStyle}>⚠ {errors.name}</p>}
                    </div>

                    {/* Phone or Email */}
                    <div>
                        <label style={{ fontSize: '12px', fontWeight: 700, color: '#555', display: 'block', marginBottom: '4px' }}>Phone or Email *</label>
                        <input type="text" value={formData.contact}
                            onChange={e => setField('contact', e.target.value)}
                            onBlur={() => onBlur('contact')}
                            placeholder="01XXXXXXXXX or name@email.com" style={inputStyle('contact')}
                            onFocus={e => { if (!errors.contact) e.target.style.borderColor = '#0B4222'; }} />
                        {errors.contact ? (
                            <p style={errorTextStyle}>⚠ {errors.contact}</p>
                        ) : (
                            <p style={{ fontSize: '11px', color: '#999', margin: '4px 0 0', lineHeight: 1.4 }}>
                                This will be your login username &amp; password for future orders.
                            </p>
                        )}
                    </div>

                    {/* Location */}
                    <div>
                        <label style={{ fontSize: '12px', fontWeight: 700, color: '#555', display: 'block', marginBottom: '4px' }}>Delivery Location *</label>
                        <textarea value={formData.location}
                            onChange={e => setField('location', e.target.value)}
                            onBlur={() => onBlur('location')}
                            placeholder="Enter your full delivery address" rows={2}
                            style={{ ...inputStyle('location'), resize: 'none' }}
                            onFocus={e => { if (!errors.location) e.target.style.borderColor = '#0B4222'; }} />
                        {errors.location && <p style={errorTextStyle}>⚠ {errors.location}</p>}
                    </div>

                    {/* Query */}
                    <div>
                        <label style={{ fontSize: '12px', fontWeight: 700, color: '#555', display: 'block', marginBottom: '4px' }}>
                            Query / Note <span style={{ color: '#aaa', fontWeight: 400 }}>(optional)</span>
                        </label>
                        <input type="text" value={formData.query} onChange={e => setFormData({ ...formData, query: e.target.value })}
                            placeholder="Any special instructions?" style={baseInputStyle}
                            onFocus={e => e.target.style.borderColor = '#0B4222'} onBlur={e => e.target.style.borderColor = '#e5e7eb'} />
                    </div>
                </div>

                {/* Order Summary */}
                {totalPrice !== undefined && (
                    <div style={{ marginTop: '20px', padding: '12px', background: '#f9fafb', borderRadius: '6px', border: '1px solid #e5e7eb' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#555' }}>
                            <span>Total Items: <strong>{totalQty}</strong></span>
                            <span>Total: <strong style={{ color: '#1a1a1a', fontSize: '15px' }}>৳{totalPrice.toLocaleString()}</strong></span>
                        </div>
                    </div>
                )}

                {/* Submit */}
                <button onClick={handleSubmit} disabled={isLoading}
                    style={{ width: '100%', marginTop: '20px', padding: '14px', background: isLoading ? '#999' : '#0B4222', color: '#fff', fontSize: '14px', fontWeight: 800, letterSpacing: '1px', textTransform: 'uppercase', border: 'none', borderRadius: '8px', cursor: isLoading ? 'not-allowed' : 'pointer', transition: 'all 0.2s ease', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                    {isLoading ? (
                        <>
                            <div style={{ width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'omSpin 0.8s linear infinite' }} />
                            Placing Order...
                        </>
                    ) : 'SUBMIT ORDER'}
                </button>
            </div>
            <style>{`@keyframes omSpin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
};

export default OrderModal;
