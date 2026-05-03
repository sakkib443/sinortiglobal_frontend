"use client";

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAppDispatch } from '@/redux/hooks';
import { loginSuccess } from '@/redux/slices/authSlice';
import { useLoginMutation } from '@/redux/api/authApi';
import { toast } from 'react-hot-toast';
import { FiLock, FiEye, FiEyeOff, FiArrowRight, FiAlertCircle, FiUser } from 'react-icons/fi';

const LoginPageInner = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [focused, setFocused] = useState<string | null>(null);

    const router = useRouter();
    const searchParams = useSearchParams();
    const dispatch = useAppDispatch();
    const [login, { isLoading }] = useLoginMutation();

    const isExpired = searchParams.get('expired') === 'true';
    const redirectPath = searchParams.get('redirect');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const isPhone = /^[0-9+\-\s()]{7,}$/.test(identifier.trim());
        const credentials = isPhone
            ? { phone: identifier.trim(), password }
            : { email: identifier.trim(), password };

        try {
            const res = await login(credentials).unwrap();
            const apiUser = res.data.user;
            const token = res.data.tokens.accessToken;
            const user = {
                id: apiUser._id || apiUser.id,
                name: apiUser.name || `${apiUser.firstName || ''} ${apiUser.lastName || ''}`.trim() || apiUser.email,
                email: apiUser.email,
                phone: apiUser.phone || '',
                role: apiUser.role || 'user',
                avatar: apiUser.avatar || '',
            };

            dispatch(loginSuccess({ user, token }));
            localStorage.setItem('token', token);
            toast.success('Welcome back! Login successful.', {
                style: { borderRadius: '10px', background: 'var(--color-primary)', color: '#fff' },
                icon: '✅',
            });

            // ── Smart Redirect Logic ──
            if (redirectPath) {
                // If user came from a specific page, go back there
                router.push(redirectPath);
            } else if (user.role === 'admin') {
                // Admin always goes to admin dashboard
                router.push('/dashboard/admin');
            } else {
                // Regular user: check if they have previous orders
                try {
                    const ordersRes = await fetch(
                        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/orders/my?limit=1`,
                        { headers: { Authorization: `Bearer ${token}` } }
                    );
                    const ordersData = await ordersRes.json();
                    const hasOrders = ordersData?.data?.orders?.length > 0 || ordersData?.data?.length > 0;

                    if (hasOrders) {
                        router.push('/dashboard/user');
                    } else {
                        router.push('/');
                    }
                } catch {
                    // If order check fails, go to home
                    router.push('/');
                }
            }
        } catch (err: any) {
            toast.error(err?.data?.message || 'Invalid email/phone or password.', { duration: 4000 });
        }
    };

    const inputStyle = (name: string): React.CSSProperties => ({
        width: '100%', padding: '14px 16px 14px 44px',
        border: `1.5px solid ${focused === name ? 'var(--color-primary)' : '#e5e7eb'}`,
        borderRadius: '10px', fontSize: '14px', fontFamily: 'inherit',
        background: '#fff', outline: 'none', transition: 'border-color 0.2s ease',
        boxSizing: 'border-box', color: '#111',
    });

    return (
        <div style={{ background: '#fff', borderRadius: '20px', padding: '44px 40px', boxShadow: '0 4px 40px rgba(0,0,0,0.08)', border: '1px solid #f0f0f0' }}>

            {/* Session Expired */}
            {isExpired && (
                <div style={{ marginBottom: '24px', padding: '14px 16px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <FiAlertCircle size={18} color="#ef4444" />
                    <div>
                        <p style={{ fontSize: '13px', fontWeight: 700, color: '#b91c1c', margin: 0 }}>Session Expired</p>
                        <p style={{ fontSize: '12px', color: '#dc2626', margin: 0 }}>Please login again to continue.</p>
                    </div>
                </div>
            )}

            <div style={{ marginBottom: '36px' }}>
                <h1 style={{ fontSize: '28px', fontWeight: 900, color: 'var(--color-primary)', margin: '0 0 6px', letterSpacing: '-0.5px' }}>Welcome Back</h1>
                <p style={{ fontSize: '14px', color: '#6b7280', margin: 0, fontWeight: 500 }}>Please enter your credentials to sign in</p>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

                {/* Email or Phone */}
                <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#374151', marginBottom: '8px' }}>
                        Email or Phone Number
                    </label>
                    <div style={{ position: 'relative' }}>
                        <div style={{ position: 'absolute', top: '50%', left: '14px', transform: 'translateY(-50%)', color: focused === 'id' ? 'var(--color-primary)' : '#9ca3af', transition: 'color 0.2s' }}>
                            <FiUser size={17} />
                        </div>
                        <input
                            type="text"
                            required
                            value={identifier}
                            onChange={e => setIdentifier(e.target.value)}
                            onFocus={() => setFocused('id')}
                            onBlur={() => setFocused(null)}
                            style={inputStyle('id')}
                            placeholder="name@example.com or 01XXXXXXXXX"
                            autoComplete="username"
                        />
                    </div>
                </div>

                {/* Password */}
                <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#374151', marginBottom: '8px' }}>
                        Password
                    </label>
                    <div style={{ position: 'relative' }}>
                        <div style={{ position: 'absolute', top: '50%', left: '14px', transform: 'translateY(-50%)', color: focused === 'pw' ? 'var(--color-primary)' : '#9ca3af', transition: 'color 0.2s' }}>
                            <FiLock size={17} />
                        </div>
                        <input
                            type={showPassword ? 'text' : 'password'}
                            required
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            onFocus={() => setFocused('pw')}
                            onBlur={() => setFocused(null)}
                            style={{ ...inputStyle('pw'), paddingRight: '44px' }}
                            placeholder="Enter your password"
                            autoComplete="current-password"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            style={{ position: 'absolute', top: '50%', right: '14px', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', display: 'flex', alignItems: 'center', padding: 0 }}
                        >
                            {showPassword ? <FiEyeOff size={17} /> : <FiEye size={17} />}
                        </button>
                    </div>
                </div>

                {/* Submit */}
                <button
                    type="submit"
                    disabled={isLoading}
                    style={{
                        width: '100%', padding: '15px', marginTop: '4px',
                        background: isLoading ? '#5a8a6e' : 'linear-gradient(135deg, var(--color-primary) 0%, #0d5229 100%)',
                        color: '#fff', border: 'none', borderRadius: '12px',
                        fontSize: '15px', fontWeight: 800, cursor: isLoading ? 'not-allowed' : 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                        transition: 'all 0.2s ease', letterSpacing: '0.3px', fontFamily: 'inherit',
                    }}
                    onMouseEnter={e => { if (!isLoading) (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-1px)'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)'; }}
                >
                    {isLoading ? (
                        <>
                            <div style={{ width: '18px', height: '18px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'authSpin 0.8s linear infinite' }} />
                            Signing In...
                        </>
                    ) : (
                        <>
                            Sign In
                            <FiArrowRight size={17} />
                        </>
                    )}
                </button>
            </form>

            <div style={{ marginTop: '28px', paddingTop: '24px', borderTop: '1px solid #f3f4f6', textAlign: 'center' }}>
                <p style={{ fontSize: '13px', color: '#6b7280', margin: 0, fontWeight: 500 }}>
                    {"Don't have an account? "}
                    <Link
                        href={redirectPath ? `/register?redirect=${encodeURIComponent(redirectPath)}` : '/register'}
                        style={{ color: 'var(--color-primary)', fontWeight: 800, textDecoration: 'none' }}
                    >
                        Create Account &rarr;
                    </Link>
                </p>
            </div>

            <style>{`@keyframes authSpin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
};

const LoginPage = () => (
    <Suspense fallback={<div style={{ padding: '40px', textAlign: 'center', color: 'var(--color-primary)' }}>Loading...</div>}>
        <LoginPageInner />
    </Suspense>
);

export default LoginPage;
