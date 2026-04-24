import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-bg-primary flex flex-col items-center justify-center px-6 text-center">
      <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink-muted mb-6">[ 404 ]</p>
      <h1
        className="font-display text-ink-primary mb-4"
        style={{ fontSize: 'clamp(3rem, 7vw, 6rem)', letterSpacing: '-0.04em', lineHeight: 1 }}
      >
        Lost in the noise.
      </h1>
      <p className="font-sans text-lg text-ink-muted max-w-md mb-10">
        This page doesn't exist or has been moved. Maybe the event already happened.
      </p>
      <Link
        href="/"
        className="font-sans text-sm font-medium bg-accent text-white px-6 py-3 rounded-full hover:bg-ink-primary transition-colors duration-300"
      >
        ← Back to home
      </Link>
    </div>
  );
}
