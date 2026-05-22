import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "LUMINUS | The Ultimate Platform",
  description: "Experience the next-generation cloud infrastructure built for efficiency, velocity, and visual supremacy.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <div className="container">
          <header className="navbar">
            <Link href="/" className="logo">
              <span className="logo-dot"></span>
              LUMINUS
            </Link>
            <nav className="nav-links">
              <Link href="/" className="nav-link">Home</Link>
              <Link href="/legal" className="nav-link">Legal</Link>
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="nav-link">GitHub</a>
              <Link href="/login" className="btn-primary">Launch App</Link>
            </nav>
          </header>
          {children}
          <footer>
            <p>&copy; {new Date().getFullYear()} LUMINUS. All rights reserved.</p>
            <div className="footer-nav">
              <Link href="/">Home</Link>
              <Link href="/legal">Legal Terms</Link>
              <a href="https://docs.amplify.aws">Amplify Docs</a>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
