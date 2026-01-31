"use client"
import "./globals.css";
import "@solana/wallet-adapter-react-ui/styles.css";
import Providers from "./providers";
import WalletButton from "./components/WalletButton";
import Link from "next/link";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <header style={{
            position: 'sticky',
            top: 0,
            zIndex: 50,
            background: 'rgba(22, 24, 33, 0.95)',
            borderBottom: '1px solid var(--border-primary)',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 4px 24px rgba(0, 0, 0, 0.1)',
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              maxWidth: '1400px',
              margin: '0 auto',
              padding: '16px 32px',
            }}>
              {/* Left Side - Logo & Nav */}
              <div style={{ display: 'flex', gap: '40px', alignItems: 'center' }}>
                {/* Logo */}
                <Link 
                  href="/" 
                  style={{
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                  }}
                >
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: '900',
                    fontSize: '18px',
                    color: 'white',
                    boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
                  }}>
                    I
                  </div>
                  <span style={{
                    fontSize: '22px',
                    fontWeight: '800',
                    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    letterSpacing: '-0.5px',
                  }}>
                    IncoBet
                  </span>
                </Link>

                {/* Navigation */}
                <nav style={{ display: 'flex', gap: '4px' }}>
                  {[
                    { href: '/', label: 'Markets', icon: '' },
                    { href: '/dashboard', label: 'Dashboard', icon: '' },
                    { href: '/admin', label: 'Admin', icon: '' },
                  ].map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      style={{
                        textDecoration: 'none',
                        color: 'var(--text-secondary)',
                        padding: '10px 16px',
                        borderRadius: '10px',
                        fontSize: '14px',
                        fontWeight: '600',
                        transition: 'all 0.2s ease',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
                        e.currentTarget.style.color = 'var(--text-primary)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.color = 'var(--text-secondary)';
                      }}
                    >
                      <span style={{ fontSize: '16px' }}>{link.icon}</span>
                      {link.label}
                    </Link>
                  ))}
                </nav>
              </div>

              {/* Right Side - Wallet Button */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
              }}>
                <WalletButton />
              </div>
            </div>
          </header>

          <main style={{
            maxWidth: '1400px',
            margin: '0 auto',
            padding: '40px 32px',
            minHeight: 'calc(100vh - 80px)',
          }}>
            {children}
          </main>

          {/* Footer */}
          <footer style={{
            borderTop: '1px solid var(--border-primary)',
            background: 'var(--bg-secondary)',
            padding: '32px 0',
          }}>
            <div style={{
              maxWidth: '1400px',
              margin: '0 auto',
              padding: '0 32px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <div style={{
                fontSize: '14px',
                color: 'var(--text-muted)',
              }}>
                © 2026 IncoBet. Powered by Inco FHE & Solana.
              </div>
              <div style={{
                display: 'flex',
                gap: '24px',
              }}>
                {['Twitter', 'Discord', 'GitHub', 'Docs'].map((item) => (
                  <a
                    key={item}
                    href="#"
                    style={{
                      fontSize: '14px',
                      color: 'var(--text-secondary)',
                      textDecoration: 'none',
                      fontWeight: '600',
                      transition: 'color 0.2s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = 'var(--brand-primary)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = 'var(--text-secondary)';
                    }}
                  >
                    {item}
                  </a>
                ))}
              </div>
            </div>
          </footer>
        </Providers>
      </body>
    </html>
  );
}