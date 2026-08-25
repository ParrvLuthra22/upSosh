'use client';

import { useCallback, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IconCheck, IconX, IconExternalLink } from '@tabler/icons-react';
import { toast } from 'sonner';
import { EASE_VERCEL } from '@/lib/motion';
import { api } from '@/lib/api';
import { useEscapeKey } from '@/lib/a11y';

// ─── Types ────────────────────────────────────────────────────────────────────

interface ApplicationUser {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

interface HostApplication {
  id: string;
  userId: string;
  user: ApplicationUser;
  govIdUrl: string | null;
  selfieUrl: string | null;
  bio: string;
  experience: string;
  categories: string;
  instagram: string | null;
  linkedin: string | null;
  website: string | null;
  sampleEventTitle: string | null;
  sampleEventCategory: string | null;
  sampleEventDesc: string | null;
  sampleEventDate: string | null;
  sampleEventTime: string | null;
  sampleEventVenue: string | null;
  sampleEventCity: string | null;
  sampleEventCapacity: number | null;
  sampleEventIsFree: boolean;
  sampleEventPrice: number | null;
  status: 'pending' | 'approved' | 'rejected';
  reviewedAt: string | null;
  reviewNotes: string | null;
  createdAt: string;
  updatedAt: string;
}

type StatusFilter = 'pending' | 'approved' | 'rejected';

const TABS: { id: StatusFilter; label: string }[] = [
  { id: 'pending', label: 'Pending' },
  { id: 'approved', label: 'Approved' },
  { id: 'rejected', label: 'Rejected' },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function parseCategories(json: string): string[] {
  try {
    const parsed = JSON.parse(json);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function excerpt(text: string, max = 110): string {
  return text.length > max ? `${text.slice(0, max).trim()}…` : text;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminHostsClient() {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('pending');
  const [applications, setApplications] = useState<HostApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [actioningId, setActioningId] = useState<string | null>(null);

  const [detailApp, setDetailApp] = useState<HostApplication | null>(null);
  const [rejectTarget, setRejectTarget] = useState<HostApplication | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');

  const loadApplications = useCallback(async (status: StatusFilter) => {
    setLoading(true);
    setError(false);
    try {
      const data = await api.get<{ applications: HostApplication[] }>(
        `/api/hosts/admin/applications?status=${status}`,
      );
      setApplications(data.applications ?? []);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadApplications(statusFilter);
  }, [statusFilter, loadApplications]);

  // ── Approve ───────────────────────────────────────────────────────────────

  async function handleApprove(app: HostApplication) {
    setActioningId(app.id);
    const snapshot = applications;
    setApplications((prev) => prev.filter((a) => a.id !== app.id));
    if (detailApp?.id === app.id) setDetailApp(null);
    try {
      await api.patch(`/api/hosts/admin/applications/${app.id}/approve`);
      toast.success(`${app.user.name} approved as a host.`);
    } catch (err) {
      setApplications(snapshot);
      toast.error(err instanceof Error ? err.message : 'Approve failed. Please try again.');
    } finally {
      setActioningId(null);
    }
  }

  // ── Reject ────────────────────────────────────────────────────────────────

  function openRejectModal(app: HostApplication) {
    setReviewNotes('');
    setRejectTarget(app);
  }

  async function confirmReject() {
    const app = rejectTarget;
    if (!app) return;
    setActioningId(app.id);
    setRejectTarget(null);
    const snapshot = applications;
    setApplications((prev) => prev.filter((a) => a.id !== app.id));
    if (detailApp?.id === app.id) setDetailApp(null);
    try {
      await api.patch(`/api/hosts/admin/applications/${app.id}/reject`, {
        reviewNotes: reviewNotes.trim() || undefined,
      });
      toast.success(`${app.user.name}'s application rejected.`);
    } catch (err) {
      setApplications(snapshot);
      toast.error(err instanceof Error ? err.message : 'Reject failed. Please try again.');
    } finally {
      setActioningId(null);
    }
  }

  return (
    <div className="min-h-screen bg-bg-primary">
      <div className="max-w-6xl mx-auto px-6 md:px-12 pt-10 pb-24">

        {/* Heading */}
        <div className="mb-8">
          <p className="font-mono text-[11px] uppercase tracking-widest text-ink-muted mb-2">[ ADMIN ]</p>
          <h1 className="font-display text-4xl text-ink-primary" style={{ letterSpacing: '-0.03em' }}>
            Host applications.
          </h1>
        </div>

        {/* Tab bar */}
        <div className="flex gap-0 border-b border-border mb-8">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setStatusFilter(t.id)}
              className={`relative px-5 py-3 font-sans text-sm transition-colors ${
                statusFilter === t.id ? 'text-ink-primary' : 'text-ink-muted hover:text-ink-primary'
              }`}
            >
              {t.label}
              {statusFilter === t.id && (
                <motion.span
                  layoutId="admin-hosts-tab"
                  className="absolute bottom-0 left-0 right-0 h-px bg-accent"
                  transition={{ type: 'spring', stiffness: 500, damping: 40 }}
                />
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-bg-secondary rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : error ? (
          <div className="py-24 text-center">
            <p className="font-display text-3xl text-ink-primary mb-3">Couldn't load applications.</p>
            <p className="font-sans text-base text-ink-muted mb-8">Something went wrong reaching the server.</p>
            <button
              onClick={() => loadApplications(statusFilter)}
              className="font-sans text-sm bg-accent text-void px-6 py-3 rounded-full hover:bg-ink-primary transition-colors"
            >
              Try again
            </button>
          </div>
        ) : applications.length === 0 ? (
          <div className="py-24 text-center">
            <p className="font-display text-3xl text-ink-primary mb-3">No {statusFilter} applications.</p>
            <p className="font-sans text-base text-ink-muted">
              {statusFilter === 'pending'
                ? 'New host applications will show up here.'
                : `Applications you've ${statusFilter === 'approved' ? 'approved' : 'rejected'} will show up here.`}
            </p>
          </div>
        ) : (
          <div className="border border-border rounded-2xl overflow-hidden overflow-x-auto">
            <table className="w-full min-w-[720px] border-collapse">
              <thead>
                <tr className="bg-bg-secondary border-b border-border">
                  {['Applicant', 'Submitted', 'Bio', 'Categories', 'Docs', ''].map((h) => (
                    <th key={h} className="text-left font-mono text-[10px] uppercase tracking-widest text-ink-muted px-5 py-3">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {applications.map((app, i) => {
                  const categories = parseCategories(app.categories);
                  const busy = actioningId === app.id;
                  return (
                    <motion.tr
                      key={app.id}
                      className="border-b border-border last:border-0 hover:bg-bg-secondary transition-colors cursor-pointer"
                      onClick={() => setDetailApp(app)}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03, duration: 0.3, ease: EASE_VERCEL }}
                    >
                      <td className="px-5 py-4 align-top">
                        <p className="font-sans text-sm font-medium text-ink-primary">{app.user.name}</p>
                        <p className="font-mono text-[11px] text-ink-muted">{app.user.email}</p>
                      </td>
                      <td className="px-5 py-4 align-top">
                        <p className="font-mono text-xs text-ink-muted whitespace-nowrap">{formatDate(app.createdAt)}</p>
                      </td>
                      <td className="px-5 py-4 align-top max-w-[220px]">
                        <p className="font-sans text-xs text-ink-muted leading-relaxed">{excerpt(app.bio)}</p>
                      </td>
                      <td className="px-5 py-4 align-top max-w-[160px]">
                        <p className="font-mono text-[11px] text-ink-muted">
                          {categories.length ? categories.join(', ') : '—'}
                        </p>
                      </td>
                      <td className="px-5 py-4 align-top" onClick={(e) => e.stopPropagation()}>
                        <div className="flex flex-col gap-1">
                          {app.govIdUrl && (
                            <a
                              href={app.govIdUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 font-mono text-[11px] text-accent hover:underline"
                            >
                              ID <IconExternalLink size={11} />
                            </a>
                          )}
                          {app.selfieUrl && (
                            <a
                              href={app.selfieUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 font-mono text-[11px] text-accent hover:underline"
                            >
                              Selfie <IconExternalLink size={11} />
                            </a>
                          )}
                          {!app.govIdUrl && !app.selfieUrl && (
                            <span className="font-mono text-[11px] text-ink-light">—</span>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-4 align-top" onClick={(e) => e.stopPropagation()}>
                        {app.status === 'pending' ? (
                          <div className="flex items-center gap-2">
                            <button
                              disabled={busy}
                              onClick={() => handleApprove(app)}
                              aria-label={`Approve ${app.user.name}`}
                              className="w-8 h-8 rounded-full border border-verified/30 bg-verified/10 text-verified flex items-center justify-center hover:bg-verified/20 transition-colors disabled:opacity-40"
                            >
                              <IconCheck size={15} strokeWidth={2.5} />
                            </button>
                            <button
                              disabled={busy}
                              onClick={() => openRejectModal(app)}
                              aria-label={`Reject ${app.user.name}`}
                              className="w-8 h-8 rounded-full border border-red-500/30 bg-red-500/10 text-red-500 flex items-center justify-center hover:bg-red-500/20 transition-colors disabled:opacity-40"
                            >
                              <IconX size={15} strokeWidth={2.5} />
                            </button>
                          </div>
                        ) : (
                          <span
                            className={`font-mono text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full ${
                              app.status === 'approved' ? 'bg-verified/10 text-verified' : 'bg-red-500/10 text-red-500'
                            }`}
                          >
                            {app.status}
                          </span>
                        )}
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail modal */}
      <AnimatePresence>
        {detailApp && (
          <DetailModal
            app={detailApp}
            busy={actioningId === detailApp.id}
            onClose={() => setDetailApp(null)}
            onApprove={() => handleApprove(detailApp)}
            onReject={() => openRejectModal(detailApp)}
          />
        )}
      </AnimatePresence>

      {/* Reject reason modal */}
      <AnimatePresence>
        {rejectTarget && (
          <RejectModal
            appName={rejectTarget.user.name}
            reviewNotes={reviewNotes}
            onChangeNotes={setReviewNotes}
            onCancel={() => setRejectTarget(null)}
            onConfirm={confirmReject}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Detail modal ─────────────────────────────────────────────────────────────

function DetailModal({
  app,
  busy,
  onClose,
  onApprove,
  onReject,
}: {
  app: HostApplication;
  busy: boolean;
  onClose: () => void;
  onApprove: () => void;
  onReject: () => void;
}) {
  const categories = parseCategories(app.categories);
  const hasSampleEvent = !!(app.sampleEventTitle || app.sampleEventDesc || app.sampleEventVenue);

  useEscapeKey(onClose, true);

  return (
    <>
      <motion.div
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        role="button"
        tabIndex={0}
        aria-label="Close"
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onClose(); }}
      />
      <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8">
        <motion.div
          className="bg-bg-primary border border-border rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto shadow-2xl"
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 12 }}
          transition={{ duration: 0.2, ease: EASE_VERCEL }}
        >
          {/* Header */}
          <div className="flex items-start justify-between px-6 py-5 border-b border-border sticky top-0 bg-bg-primary">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-widest text-ink-muted mb-1">Host application</p>
              <h3 className="font-display text-xl text-ink-primary">{app.user.name}</h3>
              <p className="font-mono text-xs text-ink-muted mt-0.5">{app.user.email}</p>
            </div>
            <button onClick={onClose} aria-label="Close" className="text-ink-muted hover:text-ink-primary transition-colors p-1">
              <IconX size={18} />
            </button>
          </div>

          {/* Body */}
          <div className="px-6 py-5 space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Status">
                <span
                  className={`font-mono text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full ${
                    app.status === 'pending'
                      ? 'bg-border text-ink-muted'
                      : app.status === 'approved'
                        ? 'bg-verified/10 text-verified'
                        : 'bg-red-500/10 text-red-500'
                  }`}
                >
                  {app.status}
                </span>
              </Field>
              <Field label="Submitted">{formatDate(app.createdAt)}</Field>
            </div>

            <Field label="Bio">
              <p className="font-sans text-sm text-ink-primary leading-relaxed">{app.bio}</p>
            </Field>

            <Field label="Experience">
              <p className="font-sans text-sm text-ink-primary leading-relaxed">{app.experience}</p>
            </Field>

            <Field label="Categories">
              <p className="font-sans text-sm text-ink-primary">{categories.length ? categories.join(', ') : '—'}</p>
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Government ID">
                {app.govIdUrl ? (
                  <a href={app.govIdUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-sans text-sm text-accent hover:underline">
                    View document <IconExternalLink size={13} />
                  </a>
                ) : (
                  <span className="font-sans text-sm text-ink-light">Not provided</span>
                )}
              </Field>
              <Field label="Selfie">
                {app.selfieUrl ? (
                  <a href={app.selfieUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-sans text-sm text-accent hover:underline">
                    View photo <IconExternalLink size={13} />
                  </a>
                ) : (
                  <span className="font-sans text-sm text-ink-light">Not provided</span>
                )}
              </Field>
            </div>

            {(app.instagram || app.linkedin || app.website) && (
              <Field label="Links">
                <div className="flex flex-wrap gap-3">
                  {app.instagram && <ExternalLink href={app.instagram} label="Instagram" />}
                  {app.linkedin && <ExternalLink href={app.linkedin} label="LinkedIn" />}
                  {app.website && <ExternalLink href={app.website} label="Website" />}
                </div>
              </Field>
            )}

            {hasSampleEvent && (
              <div className="border-t border-border pt-5">
                <p className="font-mono text-[10px] uppercase tracking-widest text-ink-muted mb-3">Sample event</p>
                <div className="border border-border rounded-xl p-4 space-y-3 bg-bg-secondary">
                  <div>
                    <p className="font-sans text-sm font-medium text-ink-primary">{app.sampleEventTitle || 'Untitled'}</p>
                    {app.sampleEventCategory && (
                      <p className="font-mono text-[11px] text-accent uppercase tracking-widest mt-0.5">{app.sampleEventCategory}</p>
                    )}
                  </div>
                  {app.sampleEventDesc && (
                    <p className="font-sans text-sm text-ink-muted leading-relaxed">{app.sampleEventDesc}</p>
                  )}
                  <div className="grid grid-cols-2 gap-3 font-mono text-[11px] text-ink-muted">
                    {app.sampleEventDate && <p>Date: {formatDate(app.sampleEventDate)}</p>}
                    {app.sampleEventTime && <p>Time: {app.sampleEventTime}</p>}
                    {app.sampleEventVenue && <p>Venue: {app.sampleEventVenue}</p>}
                    {app.sampleEventCity && <p>City: {app.sampleEventCity}</p>}
                    {app.sampleEventCapacity != null && <p>Capacity: {app.sampleEventCapacity}</p>}
                    <p>Price: {app.sampleEventIsFree ? 'Free' : `₹${app.sampleEventPrice ?? 0}`}</p>
                  </div>
                </div>
              </div>
            )}

            {app.reviewNotes && (
              <Field label="Review notes">
                <p className="font-sans text-sm text-ink-primary leading-relaxed">{app.reviewNotes}</p>
              </Field>
            )}
          </div>

          {/* Actions */}
          {app.status === 'pending' && (
            <div className="px-6 py-4 border-t border-border flex gap-3 sticky bottom-0 bg-bg-primary">
              <button
                disabled={busy}
                onClick={onReject}
                className="flex-1 py-2.5 border border-red-500/30 text-red-500 rounded-full font-sans text-sm font-medium hover:bg-red-500/10 transition-colors disabled:opacity-40"
              >
                Reject
              </button>
              <button
                disabled={busy}
                onClick={onApprove}
                className="flex-1 py-2.5 bg-accent text-void rounded-full font-sans text-sm font-medium hover:bg-ink-primary transition-colors disabled:opacity-40"
              >
                Approve
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="font-mono text-[10px] uppercase tracking-widest text-ink-muted mb-1.5">{label}</p>
      {typeof children === 'string' ? (
        <p className="font-sans text-sm text-ink-primary">{children}</p>
      ) : (
        children
      )}
    </div>
  );
}

function ExternalLink({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1 font-sans text-sm text-accent hover:underline"
    >
      {label} <IconExternalLink size={13} />
    </a>
  );
}

// ─── Reject modal ─────────────────────────────────────────────────────────────

function RejectModal({
  appName,
  reviewNotes,
  onChangeNotes,
  onCancel,
  onConfirm,
}: {
  appName: string;
  reviewNotes: string;
  onChangeNotes: (v: string) => void;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  useEscapeKey(onCancel, true);

  return (
    <>
      <motion.div
        className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onCancel}
        role="button"
        tabIndex={0}
        aria-label="Close"
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onCancel(); }}
      />
      <div className="fixed inset-0 z-[60] flex items-center justify-center px-6">
        <motion.div
          className="bg-bg-primary border border-border rounded-2xl p-8 max-w-md w-full shadow-2xl"
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 12 }}
          transition={{ duration: 0.2, ease: EASE_VERCEL }}
        >
          <h3 className="font-display text-xl text-ink-primary mb-2">Reject application</h3>
          <p className="font-sans text-sm text-ink-muted mb-4">
            Rejecting <span className="text-ink-primary">{appName}</span>'s host application. Add a note explaining
            why — this is saved for your own records.
          </p>
          <textarea
            value={reviewNotes}
            onChange={(e) => onChangeNotes(e.target.value)}
            rows={4}
            placeholder="e.g. ID document didn't match, incomplete profile…"
            className="w-full bg-bg-secondary border border-border rounded-xl px-4 py-3 font-sans text-sm text-ink-primary focus:outline-none focus:border-accent transition-colors resize-none mb-5"
          />
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="flex-1 py-2.5 border border-border rounded-full font-sans text-sm text-ink-muted hover:text-ink-primary transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 py-2.5 bg-red-500 text-white rounded-full font-sans text-sm font-medium hover:bg-red-600 transition-colors"
            >
              Confirm reject
            </button>
          </div>
        </motion.div>
      </div>
    </>
  );
}
