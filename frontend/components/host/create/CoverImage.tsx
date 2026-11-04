'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { IconPhoto, IconPencil, IconUpload, IconLink } from '@tabler/icons-react';
import { getApiUrl } from '@/lib/api';
import { httpFetch, describeError } from '@/lib/http';
import { validateImageUrl } from '@/lib/imageHosts';

interface CoverImageProps {
  value: string;
  onChange: (url: string) => void;
}

/**
 * The live preview of the event: a square cover (16:9 banner on mobile) with a
 * small "change image" popover offering Upload file and Paste image URL.
 */
export function CoverImage({ value, onChange }: CoverImageProps) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<'menu' | 'url'>('menu');
  const [urlDraft, setUrlDraft] = useState('');
  const [urlError, setUrlError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  // Close the popover on Esc or an outside click.
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') close(); }
    function onDown(e: MouseEvent) { if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) close(); }
    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onDown);
    return () => { document.removeEventListener('keydown', onKey); document.removeEventListener('mousedown', onDown); };
  }, [open]);

  function close() { setOpen(false); setMode('menu'); setUrlError(null); }

  async function upload(file: File) {
    setUploading(true);
    setUploadError(null);
    close();
    try {
      const body = new FormData();
      body.append('file', file);
      const res = await httpFetch(`${getApiUrl()}/api/uploads`, { method: 'POST', credentials: 'include', body });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || 'Upload failed');
      onChange(data.url);
    } catch (err) {
      setUploadError(describeError(err, 'Image upload failed'));
    } finally {
      setUploading(false);
    }
  }

  function applyUrl() {
    const error = validateImageUrl(urlDraft);
    if (error || !urlDraft.trim()) {
      setUrlError(error ?? 'Paste an image link first.');
      return;
    }
    onChange(urlDraft.trim());
    setUrlDraft('');
    close();
  }

  return (
    <div ref={wrapRef} className="relative">
      <div className="relative aspect-video lg:aspect-square w-full overflow-hidden rounded-2xl border border-border bg-surface">
        {value ? (
          <Image src={value} alt="Event cover" fill unoptimized sizes="(min-width: 1024px) 380px, 100vw" className="object-cover" />
        ) : (
          <div
            data-testid="cover-placeholder"
            className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-cream-dim"
            style={{ background: 'linear-gradient(135deg, #1C1C26 0%, #13131B 45%, rgba(212,255,63,0.16) 100%)' }}
          >
            <IconPhoto size={40} stroke={1.25} aria-hidden="true" />
            <span className="font-sans text-sm">Add a cover image</span>
          </div>
        )}
        {uploading && (
          <div role="status" className="absolute inset-0 flex items-center justify-center bg-void/70 font-sans text-sm text-cream">
            Uploading…
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={() => (open ? close() : setOpen(true))}
        aria-haspopup="menu"
        aria-expanded={open}
        className="absolute bottom-3 right-3 min-h-[44px] inline-flex items-center gap-2 rounded-full bg-void/90 border border-border-strong px-4 font-sans text-sm text-cream hover:bg-void focus:outline-none focus-visible:ring-2 focus-visible:ring-lime"
      >
        <IconPencil size={16} aria-hidden="true" />
        {value ? 'Change image' : 'Add image'}
      </button>

      {open && (
        <div
          role="menu"
          aria-label="Change image"
          className="absolute bottom-[64px] right-3 z-20 w-64 rounded-xl border border-border-strong bg-surface p-2 shadow-2xl"
        >
          {mode === 'menu' ? (
            <>
              <button
                type="button"
                role="menuitem"
                onClick={() => fileRef.current?.click()}
                className="w-full min-h-[44px] flex items-center gap-3 rounded-lg px-3 text-left font-sans text-sm text-cream hover:bg-surface-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-lime"
              >
                <IconUpload size={18} aria-hidden="true" /> Upload file
              </button>
              <button
                type="button"
                role="menuitem"
                onClick={() => setMode('url')}
                className="w-full min-h-[44px] flex items-center gap-3 rounded-lg px-3 text-left font-sans text-sm text-cream hover:bg-surface-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-lime"
              >
                <IconLink size={18} aria-hidden="true" /> Paste image URL
              </button>
            </>
          ) : (
            <div className="p-1">
              <label htmlFor="cover-url" className="block font-sans text-xs text-cream-dim mb-2">Image URL</label>
              <input
                id="cover-url"
                type="url"
                autoFocus
                value={urlDraft}
                onChange={(e) => { setUrlDraft(e.target.value); setUrlError(null); }}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); applyUrl(); } }}
                placeholder="https://images.unsplash.com/…"
                aria-invalid={urlError ? true : undefined}
                aria-describedby={urlError ? 'cover-url-error' : undefined}
                className="w-full min-h-[44px] rounded-lg bg-void border border-border-strong px-3 font-sans text-sm text-cream placeholder:text-cream-dim focus:outline-none focus-visible:ring-2 focus-visible:ring-lime"
              />
              {urlError && <p id="cover-url-error" role="alert" className="mt-2 font-sans text-xs text-coral">{urlError}</p>}
              <button
                type="button"
                onClick={applyUrl}
                className="mt-2 w-full min-h-[44px] rounded-full bg-lime text-void font-sans text-sm font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-cream"
              >
                Use this image
              </button>
            </div>
          )}
        </div>
      )}

      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        className="hidden"
        aria-label="Upload cover image"
        data-testid="cover-file"
        onChange={(e) => {
          const f = e.target.files?.[0];
          e.target.value = '';
          if (f) upload(f);
        }}
      />

      {uploadError && (
        <p role="alert" className="mt-2 font-sans text-sm text-coral">
          {uploadError}{' '}
          <button type="button" onClick={() => fileRef.current?.click()} className="underline underline-offset-2 min-h-[44px]">Try again</button>
        </p>
      )}
    </div>
  );
}
