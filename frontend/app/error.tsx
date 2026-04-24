'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#FAFAF7] flex flex-col items-center justify-center px-6 text-center font-sans">
        <p className="text-xs uppercase tracking-[0.2em] text-[#6B6B6B] mb-6">[ 500 ]</p>
        <h1
          className="text-[#0A0A0A] mb-4"
          style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(3rem,7vw,6rem)', letterSpacing: '-0.04em', lineHeight: 1 }}
        >
          Something broke.
        </h1>
        <p className="text-lg text-[#6B6B6B] max-w-md mb-10">
          An unexpected error occurred. Our team has been notified.
        </p>
        <button
          onClick={reset}
          className="text-sm font-medium bg-[#FF5A1F] text-white px-6 py-3 rounded-full hover:bg-[#0A0A0A] transition-colors duration-300"
        >
          Try again
        </button>
      </body>
    </html>
  );
}
