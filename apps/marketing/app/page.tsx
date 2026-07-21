export default function ComingSoon() {
  return (
    <main style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100dvh',
      backgroundColor: '#000000',
      color: '#FFFFFF',
      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      padding: '24px',
      paddingTop: 'calc(24px + env(safe-area-inset-top))',
      paddingBottom: 'calc(24px + env(safe-area-inset-bottom))',
      textAlign: 'center'
    }}>
      <h1 style={{
        fontSize: '2rem',
        fontWeight: '300',
        letterSpacing: '0.05em',
        marginBottom: '16px',
        lineHeight: '1.4',
        color: '#F4F4F5'
      }}>
        "Nuestra luz pronto volverá a brillar"
      </h1>
      <p style={{
        fontSize: '0.875rem',
        fontWeight: '700',
        letterSpacing: '0.3em',
        textTransform: 'uppercase',
        color: '#A1A1AA',
        margin: 0
      }}>
        LUMINUS
      </p>
    </main>
  );
}
