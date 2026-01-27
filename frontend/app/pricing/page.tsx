'use client';

import React from 'react';

export default function PricingPage() {
    return (
        <div className="min-h-screen pt-24 pb-12">
            <section className="container mx-auto px-4 text-center mb-16">
                <h1 className="text-5xl font-heading font-bold mb-6">Simple, Transparent Pricing</h1>
                <p className="text-xl text-text-secondary max-w-2xl mx-auto">
                    Start for free, upgrade as you grow. No hidden fees, ever.
                </p>
            </section>

            
            <section className="container mx-auto px-4 mb-24">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    
                    <div className="bg-surface rounded-3xl p-8 border border-white/10 flex flex-col">
                        <div className="mb-8">
                            <h3 className="text-xl font-bold text-text-secondary mb-2">Starter</h3>
                            <div className="text-4xl font-bold mb-2">Free<span className="text-lg text-text-muted font-normal"></span></div>
                            <p className="text-sm text-text-muted">Perfect for hosting your first few events.</p>
                        </div>
                        <ul className="space-y-4 mb-8 flex-1">
                            {['Unlimited Free Events', 'Basic Analytics', 'Standard Support', '5% Ticket Fee'].map((feat, i) => (
                                <li key={i} className="flex items-center gap-3 text-sm">
                                    <span className="text-green-500">✓</span> {feat}
                                </li>
                            ))}
                        </ul>
                        <button className="w-full py-3 rounded-xl border border-white/20 hover:bg-white/5 transition-colors font-bold">
                            Get Started
                        </button>
                    </div>

                    
                    <div className="bg-surface-highlight rounded-3xl p-8 border border-primary/50 relative flex flex-col transform md:-translate-y-4 shadow-2xl shadow-primary/10">
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary text-white px-4 py-1 rounded-full text-sm font-bold">
                            Most Popular
                        </div>
                        <div className="mb-8">
                            <h3 className="text-xl font-bold text-primary mb-2">Pro Host</h3>
                            <div className="text-4xl font-bold mb-2">₹2,499<span className="text-lg text-text-muted font-normal">/mo</span></div>
                            <p className="text-sm text-text-muted">For serious organizers scaling up.</p>
                        </div>
                        <ul className="space-y-4 mb-8 flex-1">
                            {['Everything in Starter', 'Reduced 2% Ticket Fee', 'Advanced Analytics', 'Priority Support', 'Custom Branding'].map((feat, i) => (
                                <li key={i} className="flex items-center gap-3 text-sm">
                                    <span className="text-primary">✓</span> {feat}
                                </li>
                            ))}
                        </ul>
                        <button className="w-full py-3 rounded-xl bg-primary text-white hover:bg-primary/90 transition-colors font-bold shadow-lg shadow-primary/25">
                            Start Free Trial
                        </button>
                    </div>

                    
                    <div className="bg-surface rounded-3xl p-8 border border-white/10 flex flex-col">
                        <div className="mb-8">
                            <h3 className="text-xl font-bold text-text-secondary mb-2">Enterprise</h3>
                            <div className="text-4xl font-bold mb-2">Custom</div>
                            <p className="text-sm text-text-muted">For large-scale event agencies.</p>
                        </div>
                        <ul className="space-y-4 mb-8 flex-1">
                            {['Everything in Pro', '0% Ticket Fees', 'Dedicated Account Manager', 'API Access', 'White-label Solution'].map((feat, i) => (
                                <li key={i} className="flex items-center gap-3 text-sm">
                                    <span className="text-green-500">✓</span> {feat}
                                </li>
                            ))}
                        </ul>
                        <button className="w-full py-3 rounded-xl border border-white/20 hover:bg-white/5 transition-colors font-bold">
                            Contact Sales
                        </button>
                    </div>
                </div>
            </section>

            
            <section className="container mx-auto px-4 max-w-3xl">
                <h2 className="text-3xl font-heading font-bold text-center mb-12">Frequently Asked Questions</h2>
                <div className="space-y-6">
                    {[
                        { q: 'Can I cancel anytime?', a: 'Yes, you can cancel your subscription at any time. Your benefits will continue until the end of the billing cycle.' },
                        { q: 'How do payouts work?', a: 'Payouts are processed automatically to your connected bank account 24 hours after the event ends.' },
                        { q: 'Do you charge for free events?', a: 'No, free events are completely free to host on UpSosh. We only charge fees on paid tickets.' },
                    ].map((item, i) => (
                        <div key={i} className="bg-surface/50 rounded-2xl p-6 border border-white/5">
                            <h3 className="text-lg font-bold mb-2">{item.q}</h3>
                            <p className="text-text-secondary text-sm">{item.a}</p>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}
