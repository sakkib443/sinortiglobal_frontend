import Link from 'next/link';

export default function AuthLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div style={{ minHeight: '100vh', display: 'flex', fontFamily: "'Inter', sans-serif" }}>

            {/* Left — Brand Panel (desktop only) */}
            <div style={{
                width: '45%', background: 'linear-gradient(145deg, #0B4222 0%, #0d5229 40%, #0a3b1e 100%)',
                display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
                padding: '60px 48px', position: 'relative', overflow: 'hidden',
            }} className="auth-brand-panel">

                {/* Decorative circles */}
                <div style={{ position: 'absolute', top: '-80px', right: '-80px', width: '300px', height: '300px', borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />
                <div style={{ position: 'absolute', bottom: '-60px', left: '-60px', width: '250px', height: '250px', borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />
                <div style={{ position: 'absolute', top: '50%', left: '-40px', width: '180px', height: '180px', borderRadius: '50%', background: 'rgba(255,255,255,0.03)' }} />

                <div style={{ position: 'relative', zIndex: 2, textAlign: 'center', maxWidth: '380px' }}>
                    {/* Logo */}
                    <Link href="/" style={{ textDecoration: 'none' }}>
                        <div style={{ marginBottom: '10px' }}>
                            <span style={{ fontSize: '36px', fontWeight: 900, color: '#fff', letterSpacing: '-1px' }}>SINOTRI</span>
                        </div>
                        <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', letterSpacing: '4px', textTransform: 'uppercase', marginBottom: '48px' }}>
                            GLOBAL TRADING
                        </div>
                    </Link>

                    <div style={{ width: '40px', height: '2px', background: 'rgba(255,255,255,0.3)', margin: '0 auto 40px' }} />

                    <h2 style={{ fontSize: '26px', fontWeight: 800, color: '#fff', marginBottom: '16px', lineHeight: 1.3 }}>
                        Global Sourcing &<br />Trading Platform
                    </h2>
                    <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)', lineHeight: 1.8, marginBottom: '48px' }}>
                        Quality products from China,<br />delivered to your doorstep in Bangladesh.
                    </p>

                    {/* Features */}
                    {[
                        { icon: '🛡️', text: 'Secure & Trusted Platform' },
                        { icon: '🚚', text: 'Worldwide Sourcing & Shipping' },
                        { icon: '💎', text: 'Verified Quality Products' },
                    ].map((f, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', textAlign: 'left' }}>
                            <span style={{ fontSize: '20px' }}>{f.icon}</span>
                            <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)', fontWeight: 500 }}>{f.text}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Right — Form Panel */}
            <div style={{
                flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
                background: '#fafafa', padding: '40px 24px',
            }}>
                {/* Mobile Logo */}
                <div className="auth-mobile-logo" style={{ display: 'none', marginBottom: '32px', textAlign: 'center' }}>
                    <Link href="/" style={{ textDecoration: 'none' }}>
                        <span style={{ fontSize: '28px', fontWeight: 900, color: '#0B4222', letterSpacing: '-1px' }}>SINOTRI</span>
                    </Link>
                </div>

                <div style={{ width: '100%', maxWidth: '440px' }}>
                    {children}
                </div>
            </div>

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
                @media (max-width: 768px) {
                    .auth-brand-panel { display: none !important; }
                    .auth-mobile-logo { display: block !important; }
                }
            `}</style>
        </div>
    );
}
