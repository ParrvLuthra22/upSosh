'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { EASE_VERCEL } from '@/lib/motion';
import { useAuth } from '@/store/authStore';
import { api } from '@/lib/api';
import { toast } from 'sonner';

interface Payout {
  id: string;
  amount: number;
  method: string;
  status: 'paid' | 'pending' | 'failed';
  createdAt: string;
}

export default function HostPayoutsPage() {
  const { isAuth, user } = useAuth();
  const router = useRouter();
  const [balance, setBalance] = useState(0);
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuth || user?.hostStatus !== 'verified') {
      router.push('/become-a-host');
      return;
    }
    const load = async () => {
      try {
        const data = await api.get<{ balance: number; payouts: Payout[] }>('/api/host/payouts');
        setBalance(data.balance ?? 0);
        setPayouts(data.payouts ?? []);
      } catch {
        setBalance(0);
        setPayouts([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [isAuth, user, router]);

  async function handleWithdraw() {
    if (balance <= 0) { toast.error('No balance to withdraw'); return; }
    try {
      await api.post('/api/host/payouts/withdraw', { amount: balance });
      toast.success('Withdrawal requested. Funds arrive in 3-5 business days.');
      setBalance(0);
    } catch (err: any) {
      toast.error(err.message ?? 'Withdrawal failed');
    }
  }

  const STATUS = {
    paid: { label: 'Paid', bg: 'bg-verified/10', text: 'text-verified' },
    pending: { label: 'Pending', bg: 'bg-accent/10', text: 'text-accent' },
    failed: { label: 'Failed', bg: 'bg-red-50', text: 'text-red-500' },
  };

  return (
    <div className="min-h-screen bg-bg-primary">
      <div className="max-w-4xl mx-auto px-6 md:px-12 pt-10 pb-24">
        <p className="font-mono text-[11px] uppercase tracking-widest text-ink-muted mb-3">[ PAYOUTS ]</p>
        <h1 className="font-display text-4xl text-ink-primary mb-10" style={{ letterSpacing: '-0.03em' }}>Payouts.</h1>

        {/* Balance card */}
        <div className="border border-border rounded-3xl p-8 bg-bg-primary mb-8 flex items-center justify-between">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-widest text-ink-muted mb-3">Available balance</p>
            <p className="font-display mb-1" style={{ fontSize: 'clamp(2.5rem,5vw,4rem)', color: '#FF5A1F', letterSpacing: '-0.04em' }}>
              ₹{balance.toLocaleString('en-IN')}
            </p>
            <p className="font-mono text-xs text-ink-muted">Transfers in 3-5 business days</p>
          </div>
          <motion.button
            onClick={handleWithdraw}
            disabled={balance <= 0}
            className="px-6 py-3 bg-accent text-white rounded-full font-sans text-sm font-medium hover:bg-ink-primary transition-colors disabled:opacity-40"
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
          >
            Withdraw →
          </motion.button>
        </div>

        {/* Payout history */}
        <div className="border border-border rounded-2xl overflow-hidden">
          <div className="px-5 py-4 bg-bg-secondary border-b border-border">
            <p className="font-mono text-[11px] uppercase tracking-widest text-ink-muted">Payout history</p>
          </div>

          {loading ? (
            <div className="space-y-3 p-5">
              {[1, 2, 3].map((i) => <div key={i} className="h-12 bg-bg-secondary rounded-xl animate-pulse" />)}
            </div>
          ) : payouts.length === 0 ? (
            <div className="py-16 text-center">
              <p className="font-display text-xl text-ink-primary mb-2">No payouts yet.</p>
              <p className="font-sans text-sm text-ink-muted">Revenue from your events will appear here.</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {payouts.map((p) => {
                const s = STATUS[p.status];
                return (
                  <div key={p.id} className="flex items-center justify-between px-5 py-4 hover:bg-bg-secondary transition-colors">
                    <div>
                      <p className="font-mono text-sm text-ink-primary">₹{p.amount.toLocaleString('en-IN')}</p>
                      <p className="font-mono text-[11px] text-ink-muted">{p.method} · {new Date(p.createdAt).toLocaleDateString('en-IN')}</p>
                    </div>
                    <span className={`font-mono text-[10px] uppercase tracking-widest px-2.5 py-1 rounded-full ${s.bg} ${s.text}`}>
                      {s.label}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
