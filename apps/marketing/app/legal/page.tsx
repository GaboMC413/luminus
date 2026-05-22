export default function Legal() {
  return (
    <main className="legal-layout">
      <div className="legal-header">
        <h1>Terms & Conditions</h1>
        <p className="legal-meta">Last updated: May 2026</p>
      </div>

      <article className="legal-content">
        <section className="legal-section">
          <h2>1. Overview</h2>
          <p>
            Welcome to LUMINUS. These Terms and Conditions govern your use of the LUMINUS platform, websites, and associated AWS services. By accessing or using our services, you agree to comply with and be bound by these terms.
          </p>
        </section>

        <section className="legal-section">
          <h2>2. Services & Architecture</h2>
          <p>
            LUMINUS provides cloud-integrated web services, leveraging the AWS Amplify infrastructure. All backend features, including data syncing, authentication, and functions, are managed dynamically in our workspaces-enabled monorepo.
          </p>
        </section>

        <section className="legal-section">
          <h2>3. Data & Privacy</h2>
          <p>
            Your data is stored and managed utilizing high-performance AWS database configurations. We implement standard protocols to secure and encrypt data in transit and at rest.
          </p>
          <ul>
            <li>User data is protected under robust Cognito authentication.</li>
            <li>No analytical data is collected on marketing surfaces without consent.</li>
            <li>We do not sell or trade user data to third parties.</li>
          </ul>
        </section>

        <section className="legal-section">
          <h2>4. Updates to Terms</h2>
          <p>
            We reserve the right to modify these terms at any time. Any changes will be posted directly to this legal workspace with an updated timestamp.
          </p>
        </section>
      </article>
    </main>
  );
}
