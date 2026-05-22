import Link from "next/link";

export default function Home() {
  return (
    <main>
      <section className="hero">
        <span className="badge">Next Generation Cloud Platform</span>
        <h1>Engineered for Performance. Built for Velocity.</h1>
        <p>
          LUMINUS is the premier platform designed to scale your operations effortlessly. Restructured into a clean monorepo architecture for modular development and global deployment.
        </p>
        <div style={{ display: "flex", gap: "1.5rem" }}>
          <Link href="/login" className="btn-primary">Get Started Free</Link>
          <Link href="/legal" className="nav-link" style={{ border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", padding: "0.75rem 1.5rem", display: "inline-block", textDecoration: "none", color: "#f8fafc", transition: "all 0.3s" }}>
            Read Terms
          </Link>
        </div>
      </section>

      <section className="features">
        <div style={{ textAlign: "center", marginBottom: "3rem" }}>
          <h2 style={{ fontSize: "2.2rem", marginBottom: "0.5rem" }}>Why LUMINUS?</h2>
          <p style={{ color: "var(--text-secondary)" }}>Designed with cutting edge tools and maximum efficiency.</p>
        </div>
        <div className="features-grid">
          <div className="card">
            <div className="card-icon">⚡</div>
            <h3>Sub-second Speeds</h3>
            <p>
              Optimized Next.js apps leverage static generation and edge computing to deliver your content instantly to users worldwide.
            </p>
          </div>
          <div className="card">
            <div className="card-icon">☁️</div>
            <h3>Amplify Gen 2 Backend</h3>
            <p>
              Leverage custom AWS architectures configured purely in TypeScript. Robust databases, functions, and real-time syncing.
            </p>
          </div>
          <div className="card">
            <div className="card-icon">📦</div>
            <h3>Clean Monorepo Organization</h3>
            <p>
              Organized with npm workspaces. Shared backend resources alongside perfectly decoupled platform and marketing applications.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
