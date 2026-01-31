import "./globals.css";
import Providers from "./providers";
import WalletButton from "./components/WalletButton";
import Link from "next/link";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#0F111A] text-slate-200 antialiased selection:bg-blue-500 selection:text-white">
        <Providers>
          {/* Polymarket-style Navbar */}
          <header className="sticky top-0 z-50 border-b border-[#2C3240] bg-[#0F111A]/80 backdrop-blur-md">
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
              <div className="flex items-center gap-8">
                <Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
                  {/* You can add a logo SVG here later */}
                  <span className="text-xl font-bold tracking-tight text-white">
                    Inco<span className="text-blue-500">Bet</span>
                  </span>
                </Link>
                
                <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-400">
                  <Link href="/" className="transition-colors hover:text-white hover:text-blue-500">
                    Markets
                  </Link>
                  <Link href="/dashboard" className="transition-colors hover:text-white">
                    Dashboard
                  </Link>
                  <Link href="/admin" className="transition-colors hover:text-white">
                    Admin
                  </Link>
                </nav>
              </div>

              <div className="flex items-center gap-4">
                <WalletButton />
              </div>
            </div>
          </header>

          <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}