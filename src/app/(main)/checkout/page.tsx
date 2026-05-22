"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/redux';
import { clearCart } from '@/redux/slices/cartSlice';
import { loginSuccess } from '@/redux/slices/authSlice';
import { useCreateOrderMutation, useGuestCheckoutMutation } from '@/redux/api/orderApi';
import { useGetSiteContentQuery } from '@/redux/api/siteContentApi';
import {
    FiChevronLeft, FiInfo, FiCheck, FiCopy, FiLock
} from 'react-icons/fi';
import Link from 'next/link';
import { toast } from 'react-hot-toast';

// ─── Payment method metadata (numbers come dynamically from site settings) ──
const PAYMENT_META = [
    { id: 'bkash',  label: 'bKash',  color: '#E2136E' },
    { id: 'rocket', label: 'Rocket', color: '#8332AC' },
    { id: 'nagad',  label: 'Nagad',  color: '#F47920' },
];

const inputClass =
    "w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded text-sm text-gray-800 outline-none focus:border-gray-900 transition-colors placeholder:text-gray-400";

const labelClass =
    "block text-xs font-medium text-gray-600 mb-1.5";

const CheckoutPage = () => {
    const { items, totalPrice } = useAppSelector((state) => state.cart);
    const { user, isAuthenticated } = useAppSelector((state) => state.auth);
    const router = useRouter();
    const dispatch = useAppDispatch();
    const [createOrder, { isLoading: isPlacingOrder }] = useCreateOrderMutation();
    const [guestCheckout, { isLoading: isGuestPlacing }] = useGuestCheckoutMutation();
    const { data: siteRes } = useGetSiteContentQuery({});

    const paymentCfg = siteRes?.data?.payment || {};
    const methods = PAYMENT_META
        .map(m => ({
            ...m,
            number: paymentCfg[m.id]?.number || '',
            accountType: paymentCfg[m.id]?.accountType || 'Personal',
            active: paymentCfg[m.id]?.active !== false,
        }))
        .filter(m => m.active);
    const paymentInstructions = paymentCfg.instructions || '';
    const availableIds = methods.map(m => m.id).join(',');

    const [formData, setFormData] = useState({
        fullName: '', email: '', phone: '', address: '', city: '', area: '', postalCode: '',
    });

    const [selectedPayment, setSelectedPayment] = useState('bkash');
    const [paymentDetails, setPaymentDetails] = useState({
        senderNumber: '', transactionId: '', paymentTime: '',
    });
    const [copied, setCopied] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (isAuthenticated && user) {
            setFormData(prev => ({
                ...prev,
                fullName: user.name || prev.fullName,
                email: user.email || prev.email,
                phone: user.phone || prev.phone,
                address: user.address?.street || prev.address,
                city: user.address?.city || prev.city,
                area: user.address?.state || prev.area,
                postalCode: user.address?.zipCode || prev.postalCode,
            }));
        }
    }, [isAuthenticated, user]);

    useEffect(() => {
        if (items.length === 0) router.push('/cart');
    }, [items, router]);

    // Keep selected payment valid if admin hides the current method
    useEffect(() => {
        if (methods.length && !methods.some(m => m.id === selectedPayment)) {
            setSelectedPayment(methods[0].id);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [availableIds]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (errors[e.target.name]) setErrors(prev => { const n = { ...prev }; delete n[e.target.name]; return n; });
    };

    const handlePaymentDetailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPaymentDetails({ ...paymentDetails, [e.target.name]: e.target.value });
        if (errors[e.target.name]) setErrors(prev => { const n = { ...prev }; delete n[e.target.name]; return n; });
    };

    const validate = () => {
        const e: Record<string, string> = {};
        if (!formData.fullName.trim()) e.fullName = 'Full name is required';
        if (!formData.phone.trim()) e.phone = 'Phone number is required';
        else if (!/^01\d{9}$/.test(formData.phone.replace(/[\s-]/g, ''))) e.phone = 'Enter a valid 11-digit number';
        if (formData.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) e.email = 'Enter a valid email';
        if (!formData.address.trim()) e.address = 'Address is required';
        if (!formData.city.trim()) e.city = 'City is required';
        if (!paymentDetails.senderNumber.trim()) e.senderNumber = 'Sender number is required';
        if (!paymentDetails.transactionId.trim()) e.transactionId = 'Transaction ID is required';
        if (!paymentDetails.paymentTime.trim()) e.paymentTime = 'Payment time is required';
        return e;
    };

    const activeMethod = methods.find(m => m.id === selectedPayment) || methods[0]
        || { ...PAYMENT_META[0], number: '', accountType: 'Personal', active: true };

    const copyNumber = () => {
        if (!activeMethod?.number) return;
        navigator.clipboard.writeText(activeMethod.number);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const validationErrors = validate();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            toast.error('Please fix the highlighted fields');
            const firstField = Object.keys(validationErrors)[0];
            document.querySelector<HTMLElement>(`[name="${firstField}"]`)?.focus();
            return;
        }
        setErrors({});

        const orderPayload = {
            items: items.map(item => ({
                product: item.productId || item.id,
                quantity: item.quantity,
                color: item.color || undefined,
                size: item.size || undefined,
            })),
            shippingAddress: {
                fullName: formData.fullName,
                phone: formData.phone,
                email: formData.email,
                address: formData.address,
                area: formData.area,
                city: formData.city,
                postalCode: formData.postalCode,
            },
            paymentMethod: selectedPayment,
            paymentDetails: {
                senderNumber: paymentDetails.senderNumber,
                transactionId: paymentDetails.transactionId,
                paymentTime: paymentDetails.paymentTime,
            },
        };

        try {
            if (isAuthenticated) {
                await createOrder(orderPayload).unwrap();
                dispatch(clearCart());
                toast.success('Order placed successfully!', { duration: 5000 });
                router.push('/checkout/success');
            } else {
                const result = await guestCheckout(orderPayload).unwrap();
                dispatch(clearCart());

                if (result.data?.accessToken && result.data?.user) {
                    const userData = result.data.user;
                    dispatch(loginSuccess({
                        user: {
                            id: userData._id,
                            name: `${userData.firstName} ${userData.lastName}`.trim(),
                            email: userData.email,
                            phone: userData.phone || '',
                            role: userData.role || 'user',
                        },
                        token: result.data.accessToken,
                    }));
                }

                toast.success('Order placed! Your account has been created.', { duration: 7000 });
                router.push('/checkout/success');
            }
        } catch (err: any) {
            const errorData = err?.data;
            if (errorData?.errorMessages?.length > 0) {
                errorData.errorMessages.forEach((er: any) => toast.error(er.message, { duration: 6000 }));
            } else {
                toast.error(errorData?.message || 'Failed to place order. Please try again.', { duration: 6000 });
            }
        }
    };

    const isSubmitting = isPlacingOrder || isGuestPlacing;

    const cls = (field: string) =>
        `${inputClass} ${errors[field] ? 'border-red-400 focus:border-red-500' : ''}`;
    const FieldError = ({ field }: { field: string }) =>
        errors[field] ? <p className="mt-1 text-xs text-red-500">{errors[field]}</p> : null;

    if (items.length === 0) return null;

    return (
        <div className="bg-gray-50 min-h-screen pb-20">
            <div className="container mx-auto px-4 sm:px-8 md:px-12 lg:px-16 pt-8 max-w-6xl">

                {/* Back */}
                <Link href="/cart" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 mb-5 transition-colors">
                    <FiChevronLeft size={16} />
                    Back to Cart
                </Link>

                <h1 className="text-2xl font-semibold text-gray-900 mb-6">Checkout</h1>

                {/* Guest Banner */}
                {!isAuthenticated && (
                    <div className="mb-6 bg-blue-50 border border-blue-100 rounded-md px-4 py-3 flex items-start gap-3">
                        <FiInfo size={16} className="text-blue-500 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-blue-700 leading-relaxed">
                            No account needed. We&apos;ll create one automatically — your email will be your login ID and password.{' '}
                            <Link href="/login?redirect=/checkout" className="font-medium underline">Already have an account?</Link>
                        </p>
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="flex flex-col lg:grid lg:grid-cols-12 gap-6">

                        {/* ══ LEFT COLUMN ══ */}
                        <div className="lg:col-span-7 space-y-5">

                            {/* ── Shipping Details ── */}
                            <div className="bg-white rounded-md border border-gray-200">
                                <div className="px-5 py-3.5 border-b border-gray-100">
                                    <h2 className="text-sm font-semibold text-gray-900">Shipping Details</h2>
                                </div>
                                <div className="px-5 py-5 grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="md:col-span-2">
                                        <label className={labelClass}>Full Name <span className="text-red-500">*</span></label>
                                        <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} placeholder="Enter your full name" className={cls('fullName')} />
                                        <FieldError field="fullName" />
                                    </div>
                                    <div>
                                        <label className={labelClass}>Email {!isAuthenticated && <span className="text-gray-400">(login ID)</span>}</label>
                                        <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="email@example.com" className={cls('email')} />
                                        <FieldError field="email" />
                                    </div>
                                    <div>
                                        <label className={labelClass}>Phone Number <span className="text-red-500">*</span></label>
                                        <input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="01XXXXXXXXX" className={cls('phone')} />
                                        <FieldError field="phone" />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className={labelClass}>Address <span className="text-red-500">*</span></label>
                                        <input type="text" name="address" value={formData.address} onChange={handleChange} placeholder="House no, road, area" className={cls('address')} />
                                        <FieldError field="address" />
                                    </div>
                                    <div>
                                        <label className={labelClass}>City <span className="text-red-500">*</span></label>
                                        <input type="text" name="city" value={formData.city} onChange={handleChange} placeholder="Dhaka, Chittagong..." className={cls('city')} />
                                        <FieldError field="city" />
                                    </div>
                                    <div>
                                        <label className={labelClass}>Area / Thana</label>
                                        <input type="text" name="area" value={formData.area} onChange={handleChange} placeholder="Mirpur, Dhanmondi..." className={inputClass} />
                                    </div>
                                </div>
                            </div>

                            {/* ── Payment Method ── */}
                            <div className="bg-white rounded-md border border-gray-200">
                                <div className="px-5 py-3.5 border-b border-gray-100">
                                    <h2 className="text-sm font-semibold text-gray-900">Payment Method</h2>
                                </div>
                                <div className="px-5 py-5">
                                    <div className="grid grid-cols-3 gap-3">
                                        {methods.map((method) => {
                                            const active = selectedPayment === method.id;
                                            return (
                                                <button
                                                    key={method.id}
                                                    type="button"
                                                    onClick={() => setSelectedPayment(method.id)}
                                                    style={active ? { borderColor: method.color, color: method.color } : {}}
                                                    className={`flex items-center justify-center gap-2 py-3 rounded border text-sm font-medium transition-colors ${
                                                        active ? 'bg-white' : 'border-gray-200 text-gray-600 hover:border-gray-300'
                                                    }`}
                                                >
                                                    <span className="w-2 h-2 rounded-full" style={{ background: method.color }} />
                                                    {method.label}
                                                </button>
                                            );
                                        })}
                                    </div>

                                    {/* Merchant number */}
                                    <div className="mt-5 rounded border border-dashed border-gray-300 bg-gray-50 px-4 py-3 flex items-center justify-between">
                                        <div>
                                            <p className="text-xs text-gray-500">
                                                Send Money ({activeMethod.accountType}) to this {activeMethod.label} number
                                            </p>
                                            {activeMethod.number ? (
                                                <p className="text-base font-semibold tracking-wide text-gray-900 mt-0.5">{activeMethod.number}</p>
                                            ) : (
                                                <p className="text-sm font-medium text-amber-600 mt-0.5">Number not set — please contact support</p>
                                            )}
                                        </div>
                                        {activeMethod.number && (
                                            <button
                                                type="button"
                                                onClick={copyNumber}
                                                className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded border border-gray-300 bg-white text-gray-600 hover:border-gray-400 transition-colors"
                                            >
                                                {copied ? <><FiCheck size={13} /> Copied</> : <><FiCopy size={13} /> Copy</>}
                                            </button>
                                        )}
                                    </div>

                                    {paymentInstructions && (
                                        <p className="mt-3 text-xs text-gray-500 leading-relaxed">{paymentInstructions}</p>
                                    )}

                                    {/* Payment details form */}
                                    <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="md:col-span-2">
                                            <label className={labelClass}>Your {activeMethod.label} Number <span className="text-red-500">*</span></label>
                                            <input type="tel" name="senderNumber" value={paymentDetails.senderNumber} onChange={handlePaymentDetailChange} placeholder="Number you sent money from" className={cls('senderNumber')} />
                                            <FieldError field="senderNumber" />
                                        </div>
                                        <div>
                                            <label className={labelClass}>Transaction ID <span className="text-red-500">*</span></label>
                                            <input type="text" name="transactionId" value={paymentDetails.transactionId} onChange={handlePaymentDetailChange} placeholder="e.g. 9A1B2C3D4E" className={cls('transactionId')} />
                                            <FieldError field="transactionId" />
                                        </div>
                                        <div>
                                            <label className={labelClass}>Payment Time <span className="text-red-500">*</span></label>
                                            <input type="datetime-local" name="paymentTime" value={paymentDetails.paymentTime} onChange={handlePaymentDetailChange} className={cls('paymentTime')} />
                                            <FieldError field="paymentTime" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* ══ RIGHT COLUMN: Summary ══ */}
                        <div className="lg:col-span-5 lg:sticky lg:top-24 h-fit">
                            <div className="bg-white rounded-md border border-gray-200">
                                <div className="px-5 py-3.5 border-b border-gray-100">
                                    <h2 className="text-sm font-semibold text-gray-900">Order Summary</h2>
                                </div>

                                {/* Items */}
                                <div className="px-5 py-4 space-y-3 max-h-[260px] overflow-y-auto">
                                    {items.map((item) => (
                                        <div key={item.id} className="flex gap-3">
                                            <div className="w-14 h-14 bg-gray-50 rounded border border-gray-100 p-1 flex-shrink-0">
                                                <img src={item.image} alt={item.name} className="w-full h-full object-contain" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="text-sm text-gray-800 line-clamp-2 leading-snug">{item.name}</h4>
                                                {(item.color || item.size) && (
                                                    <p className="text-xs text-gray-400 mt-0.5">
                                                        {item.color && `Color: ${item.color}`}{item.color && item.size && ' · '}{item.size && `Size: ${item.size}`}
                                                    </p>
                                                )}
                                                <div className="flex items-center justify-between mt-1">
                                                    <span className="text-xs text-gray-400">Qty {item.quantity}</span>
                                                    <span className="text-sm font-medium text-gray-900">৳{(item.price * item.quantity).toLocaleString()}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Totals */}
                                <div className="px-5 py-4 border-t border-gray-100 space-y-2.5">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Subtotal ({items.reduce((a, i) => a + i.quantity, 0)} items)</span>
                                        <span className="text-gray-900">৳{totalPrice.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Delivery</span>
                                        <span className="text-gray-500 italic text-xs">To be negotiated</span>
                                    </div>
                                    <div className="flex justify-between items-center pt-3 mt-1 border-t border-gray-100">
                                        <span className="text-sm font-medium text-gray-900">Total</span>
                                        <span className="text-lg font-semibold text-gray-900">৳{totalPrice.toLocaleString()}</span>
                                    </div>
                                    <p className="text-xs text-gray-400">
                                        Paying via <span className="font-medium" style={{ color: activeMethod.color }}>{activeMethod.label}</span>
                                    </p>
                                </div>

                                {/* Submit */}
                                <div className="px-5 pb-5">
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="w-full flex items-center justify-center gap-2 py-3 bg-gray-900 text-white rounded text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                Placing order...
                                            </>
                                        ) : (
                                            <><FiLock size={14} /> Confirm Order</>
                                        )}
                                    </button>
                                    <p className="text-xs text-gray-400 text-center mt-3 leading-relaxed">
                                        By placing this order you agree to our{' '}
                                        <Link href="/terms" className="underline hover:text-gray-600">Terms &amp; Conditions</Link>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CheckoutPage;
