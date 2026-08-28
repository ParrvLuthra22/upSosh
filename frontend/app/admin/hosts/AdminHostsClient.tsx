'use client';

import { useCallback, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IconCheck, IconX, IconExternalLink } from '@tabler/icons-react';
import { toast } from 'sonner';
import { EASE_VERCEL, useReducedMotion } from '@/lib/motion';
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
    <div className="min-h-screen bg-void">
      <div className="max-w-6xl mx-auto px-6 md:px-12 pt-10 pb-24">

        {/* Heading */}
        <div className="mb-8">
          <p className="font-mono text-[11px] uppercase tracking-widest text-cream-dim mb-2">[ ADMIN ]</p>
          <h1 className="font-display text-4xl text-cream" style={{ letterSpacing: '-0.03em' }}>
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
                statusFilter === t.id ? 'text-cream' : 'text-cream-dim hover:text-cream'
              }`}
            >
              {t.label}
              {statusFilter === t.id && (
                <motion.span
                  layoutId="admin-hosts-tab"
                  className="absolute bottom-0 left-0 right-0 h-px bg-lime"
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
              <div key={i} className="h-20 bg-surface rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : error ? (
          <div className="py-24 text-center">
            <p className="font-display text-3xl text-cream mb-3">Couldn't load applications.</p>
            <p className="font-sans text-base text-cream-dim mb-8">Something went wrong reaching the server.</p>
            <button
              onClick={() => loadApplications(statusFilter)}
              className="font-sans text-sm bg-lime text-void px-6 py-3 rounded-full hover:bg-cream transition-colors"
            >
              Try again
            </button>
          </div>
        ) : applications.length === 0 ? (
          <div className="py-24 text-center">
            <p className="font-display text-3xl text-cream mb-3">No {statusFilter} applications.</p>
            <p className="font-sans text-base text-cream-dim">
              {statusFilter === 'pending'
                ? 'New host applications will show up here.'
                : `Applications you've ${statusFilter === 'approved' ? 'approved' : 'rejected'} will show up here.`}
            </p>
          </div>
        ) : (
          <div className="border border-border rounded-2xl overflow-hidden overflow-x-auto">
            <table className="w-full min-w-[720px] border-collapse">
              <thead>
                <tr className="bg-surface border-b border-border">
                  {['Applicant', 'Submitted', 'Bio', 'Categories', 'Docs', ''].map((h) => (
                    <th key={h} className="text-left font-mono text-[10px] uppercase tracking-widest text-cream-dim px-5 py-3">
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
                      className="border-b border-border last:border-0 hover:bg-surface transition-colors cursor-pointer"
                      onClick={() => setDetailApp(app)}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03, duration: 0.3, ease: EASE_VERCEL }}
                    >
                      <td className="px-5 py-4 align-top">
                        <p className="font-sans text-sm font-medium text-cream">{app.user.name}</p>
                        <p className="font-mono text-[11px] text-cream-dim">{app.user.email}</p>
                      </td>
                      <td className="px-5 py-4 align-top">
                        <p className="font-mono text-xs text-cream-dim whitespace-nowrap">{formatDate(app.createdAt)}</p>
                      </td>
                      <td className="px-5 py-4 align-top max-w-[220px]">
                        <p className="font-sans text-xs text-cream-dim leading-relaxed">{excerpt(app.bio)}</p>
                      </td>
                      <td className="px-5 py-4 align-top max-w-[160px]">
                        <p className="font-mono text-[11px] text-cream-dim">
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
                              className="inline-flex items-center gap-1 font-mono text-[11px] text-lime hover:underline"
                            >
                              ID <IconExternalLink size={11} />
                            </a>
                          )}
                          {app.selfieUrl && (
                            <a
                              href={app.selfieUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 font-mono text-[11px] text-lime hover:underline"
                            >
                              Selfie <IconExternalLink size={11} />
                            </a>
                          )}
                          {!app.govIdUrl && !app.selfieUrl && (
                            <span className="font-mono text-[11px] text-cream-faint">—</span>
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
  const reduced = useReducedMotion();

  useEscapeKey(onClose, true);

  return (
    <>
      <motion.div
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: reduced ? 0 : 0.2 }}
        onClick={onClose}
        role="button"
        tabIndex={0}
        aria-label="Close"
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onClose(); }}
      />
      <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8">
        <motion.div
          className="bg-void border border-border rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto shadow-2xl"
          role="dialog"
          aria-modal="true"
          aria-labelledby="host-app-modal-title"
          initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: 12 }}
          transition={{ duration: reduced ? 0 : 0.2, ease: EASE_VERCEL }}
        >
          {/* Header */}
          <div className="flex items-start justify-between px-6 py-5 border-b border-border sticky top-0 bg-void">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-widest text-cream-dim mb-1">Host application</p>
              <h3 id="host-app-modal-title" className="font-display text-xl text-cream">{app.user.name}</h3>
              <p className="font-mono text-xs text-cream-dim mt-0.5">{app.user.email}</p>
            </div>
            <button onClick={onClose} aria-label="Close" className="text-cream-dim hover:text-cream transition-colors p-1">
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
                      ? 'bg-border text-cream-dim'
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
              <p className="font-sans text-sm text-cream leading-relaxed">{app.bio}</p>
            </Field>

            <Field label="Experience">
              <p className="font-sans text-sm text-cream leading-relaxed">{app.experience}</p>
            </Field>

            <Field label="Categories">
              <p className="font-sans text-sm text-cream">{categories.length ? categories.join(', ') : '—'}</p>
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Government ID">
                {app.govIdUrl ? (
                  <a href={app.govIdUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-sans text-sm text-lime hover:underline">
                    View document <IconExternalLink size={13} />
                  </a>
                ) : (
                  <span className="font-sans text-sm text-cream-faint">Not provided</span>
                )}
              </Field>
              <Field label="Selfie">
                {app.selfieUrl ? (
                  <a href={app.selfieUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-sans text-sm text-lime hover:underline">
                    View photo <IconExternalLink size={13} />
                  </a>
                ) : (
                  <span className="font-sans text-sm text-cream-faint">Not provided</span>
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
                <p className="font-mono text-[10px] uppercase tracking-widest text-cream-dim mb-3">Sample event</p>
                <div className="border border-border rounded-xl p-4 space-y-3 bg-surface">
                  <div>
                    <p className="font-sans text-sm font-medium text-cream">{app.sampleEventTitle || 'Untitled'}</p>
                    {app.sampleEventCategory && (
                      <p className="font-mono text-[11px] text-lime uppercase tracking-widest mt-0.5">{app.sampleEventCategory}</p>
                    )}
                  </div>
                  {app.sampleEventDesc && (
                    <p className="font-sans text-sm text-cream-dim leading-relaxed">{app.sampleEventDesc}</p>
                  )}
                  <div className="grid grid-cols-2 gap-3 font-mono text-[11px] text-cream-dim">
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
                <p className="font-sans text-sm text-cream leading-relaxed">{app.reviewNotes}</p>
              </Field>
            )}
          </div>

          {/* Actions */}
          {app.status === 'pending' && (
            <div className="px-6 py-4 border-t border-border flex gap-3 sticky bottom-0 bg-void">
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
                className="flex-1 py-2.5 bg-lime text-void rounded-full font-sans text-sm font-medium hover:bg-cream transition-colors disabled:opacity-40"
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
      <p className="font-mono text-[10px] uppercase tracking-widest text-cream-dim mb-1.5">{label}</p>
      {typeof children === 'string' ? (
        <p className="font-sans text-sm text-cream">{children}</p>
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
      className="inline-flex items-center gap-1 font-sans text-sm text-lime hover:underline"
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
  const reduced = useReducedMotion();
  useEscapeKey(onCancel, true);

  return (
    <>
      <motion.div
        className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: reduced ? 0 : 0.2 }}
        onClick={onCancel}
        role="button"
        tabIndex={0}
        aria-label="Close"
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onCancel(); }}
      />
      <div className="fixed inset-0 z-[60] flex items-center justify-center px-6">
        <motion.div
          className="bg-void border border-border rounded-2xl p-8 max-w-md w-full shadow-2xl"
          role="dialog"
          aria-modal="true"
          aria-labelledby="reject-modal-title"
          initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: 12 }}
          transition={{ duration: reduced ? 0 : 0.2, ease: EASE_VERCEL }}
        >
          <h3 id="reject-modal-title" className="font-display text-xl text-cream mb-2">Reject application</h3>
          <p className="font-sans text-sm text-cream-dim mb-4">
            Rejecting <span className="text-cream">{appName}</span>'s host application. Add a note explaining
            why — this is saved for your own records.
          </p>
          <textarea
            value={reviewNotes}
            onChange={(e) => onChangeNotes(e.target.value)}
            rows={4}
            placeholder="e.g. ID document didn't match, incomplete profile…"
            className="w-full bg-surface border border-border rounded-xl px-4 py-3 font-sans text-sm text-cream focus:outline-none focus:border-lime transition-colors resize-none mb-5"
          />
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="flex-1 py-2.5 border border-border rounded-full font-sans text-sm text-cream-dim hover:text-cream transition-colors"
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
