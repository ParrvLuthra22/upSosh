'use client';

import React from 'react';

export default function RefundPage() {
    const sections = [
        {
            id: '1',
            title: 'General Policy Principles',
            content: (
                <>
                    <ul className="list-disc pl-6 space-y-2 text-cream-dim">
                        <li>One refund rule applies to every event when you cancel your own booking (section 2). If a Host cancels an event, you always get everything back (section 3).</li>
                        <li>UpSosh acts only as a ticketing and discovery platform, not an event organizer.</li>
                        <li>Dates and times on this page are in Indian Standard Time (IST).</li>
                        <li>All refund amounts will be returned using the original mode of payment unless otherwise specified.</li>
                    </ul>
                </>
            ),
        },
        {
            id: '2',
            title: 'User-Initiated Cancellations',
            content: (
                <>
                    <p className="text-cream-dim mb-4">
                        If you cancel your own booking, the day of the event decides whether you get your money back. The event day is the calendar day of the event in India (IST).
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-cream-dim mb-4">
                        <li><strong>Before the event day:</strong> full refund of the ticket price and the flat ₹25 service fee. You can cancel any time up to midnight (00:00 IST) at the start of the event day. For an event on 15 November, that is the moment 15 November begins.</li>
                        <li><strong>On the event day or later:</strong> you can still cancel, which frees your spot, but no refund is given.</li>
                        <li><strong>After the event has ended:</strong> no refund.</li>
                    </ul>
                    <p className="text-cream-dim mb-3">
                        The cancel screen tells you, before you confirm, whether you will get a refund.
                    </p>
                    <p className="text-cream-dim">
                        Free bookings have nothing to refund.
                    </p>
                </>
            ),
        },
        {
            id: '3',
            title: 'Host-Initiated Cancellations',
            content: (
                <>
                    <p className="text-cream-dim mb-4">
                        If the Host cancels the event for any reason:
                    </p>
                    <p className="text-cream-dim mb-3">
                        ✅ Users will receive:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-cream-dim mb-4">
                        <li>100% refund of the ticket price, AND</li>
                        <li>Refund of UpSosh service fees, AND</li>
                        <li>Refund of applicable taxes</li>
                    </ul>
                    <p className="text-cream-dim">
                        UpSosh will process this automatically.
                    </p>
                </>
            ),
        },
        {
            id: '4',
            title: 'Event Rescheduling or Significant Changes',
            content: (
                <>
                    <p className="text-cream-dim mb-4">
                        If a Host changes the date, time, venue or content of an event, there is no automatic refund just because of the change.
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-cream-dim mb-4">
                        <li>If you cancel before the event day starts, you get a full refund (section 2).</li>
                        <li>If the Host cancels the event instead, you get a full refund (section 3).</li>
                        <li>In any other case, contact us. We will look at it with the Host, but we cannot promise an outcome.</li>
                    </ul>
                </>
            ),
        },
        {
            id: '5',
            title: 'Partial Event Completion',
            content: (
                <>
                    <p className="text-cream-dim mb-4">
                        If an event:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-cream-dim mb-4">
                        <li>Starts late</li>
                        <li>Ends early</li>
                        <li>Has reduced capacity</li>
                        <li>Experiences technical delays</li>
                    </ul>
                    <p className="text-cream-dim mb-3">
                        These are not covered by the automatic refund rules above. Contact support and we will look at your case with the Host, taking into account how much the event was disrupted.
                    </p>
                    <p className="text-cream-dim">
                        UpSosh may mediate disputes, but a refund is not guaranteed in these cases.
                    </p>
                </>
            ),
        },
        {
            id: '6',
            title: 'No-Shows (User Does Not Attend)',
            content: (
                <>
                    <p className="text-cream-dim mb-4">
                        If the User does not attend an event:
                    </p>
                    <p className="text-cream-dim mb-3">
                        ❌ No refund will be provided
                    </p>
                    <p className="text-cream-dim">
                        This also applies if you cancel on or after the event day (section 2). This is standard across ticketing platforms.
                    </p>
                </>
            ),
        },
        {
            id: '7',
            title: 'Force Majeure Events',
            content: (
                <>
                    <p className="text-cream-dim mb-4">
                        Events can be affected by things nobody controls, such as:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-cream-dim mb-4">
                        <li>Weather conditions</li>
                        <li>Government restrictions</li>
                        <li>Natural disasters</li>
                        <li>Public safety issues</li>
                        <li>Venue breakdowns</li>
                        <li>National emergencies</li>
                    </ul>
                    <p className="text-cream-dim mb-3">
                        If the Host cancels the event, you get a full refund (section 3).
                    </p>
                    <p className="text-cream-dim mb-3">
                        If the event is rescheduled or only partly happens, there is no automatic refund. You can cancel before the event day starts for a full refund (section 2). Otherwise contact us and we will look at it with the Host, without promising an outcome.
                    </p>
                </>
            ),
        },
        {
            id: '8',
            title: 'Ticket Misuse, Fraud, or Duplication',
            content: (
                <>
                    <p className="text-cream-dim mb-4">
                        UpSosh is not responsible for issues caused by ticket misuse, including:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-cream-dim mb-4">
                        <li>Sharing screenshots</li>
                        <li>Duplicate QR codes</li>
                        <li>Unauthorized resale</li>
                        <li>Fake tickets generated by Users</li>
                    </ul>
                    <p className="text-cream-dim mb-3">
                        In such cases:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-cream-dim">
                        <li>No refund will be issued.</li>
                        <li>Hosts may deny entry at their discretion.</li>
                    </ul>
                </>
            ),
        },
        {
            id: '9',
            title: 'Payment Failures',
            content: (
                <>
                    <p className="text-cream-dim mb-4">
                        If payment is deducted but ticket is not issued due to technical/network issues:
                    </p>
                    <p className="text-cream-dim mb-4">
                        Auto-refund is triggered within 2–5 business days.
                    </p>
                    <p className="text-cream-dim mb-3">
                        If payment gateway holds funds:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-cream-dim mb-4">
                        <li>Refund timeline depends on the gateway (Razorpay, Paytm, etc.)</li>
                        <li>UpSosh will assist but cannot accelerate gateway timelines.</li>
                    </ul>
                </>
            ),
        },
        {
            id: '10',
            title: 'Host Rules & Host Responsibility',
            content: (
                <>
                    <p className="text-cream-dim mb-4">
                        Hosts must:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-cream-dim mb-4">
                        <li>Honour the cancellation and refund rules on this page</li>
                        <li>Resolve user disputes honestly</li>
                        <li>Respond promptly to refund requests</li>
                        <li>Not impose hidden charges at the venue</li>
                    </ul>
                    <p className="text-cream-dim mb-3">
                        Violations may result in:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-cream-dim">
                        <li>Host bans</li>
                        <li>Removal of events</li>
                        <li>Withheld payouts</li>
                        <li>Legal action under Consumer Protection Act</li>
                    </ul>
                </>
            ),
        },
        {
            id: '11',
            title: 'UpSosh Service Fees',
            content: (
                <>
                    <p className="text-cream-dim mb-4">
                        UpSosh service fees:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-cream-dim mb-4">
                        <li>Are a flat ₹25 per booking, however many tickets it has</li>
                        <li>Are refunded in full when you cancel before the event day</li>
                        <li>Are not refunded when no refund is given (event day or later)</li>
                        <li>Are fully refunded when a Host cancels the event</li>
                    </ul>
                </>
            ),
        },
        {
            id: '12',
            title: 'Refund Processing Times',
            content: (
                <>
                    <p className="text-cream-dim mb-4">
                        Once a refund is approved:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-cream-dim mb-4">
                        <li>3–5 business days for UPI</li>
                        <li>5–7 business days for cards/netbanking</li>
                        <li>Up to 10 business days for wallets</li>
                        <li>7–14 days for chargeback settlements</li>
                    </ul>
                    <p className="text-cream-dim">
                        Delays may occur due to bank processing times.
                    </p>
                </>
            ),
        },
        {
            id: '13',
            title: 'Chargebacks & Disputes',
            content: (
                <>
                    <p className="text-cream-dim mb-4">
                        Fraudulent chargebacks may lead to:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-cream-dim mb-4">
                        <li>Account suspension</li>
                        <li>Blocking of future purchases</li>
                        <li>Legal notice to recover funds</li>
                        <li>Reporting to authorities in case of fraud</li>
                    </ul>
                    <p className="text-cream-dim">
                        UpSosh fully cooperates with banks and law enforcement.
                    </p>
                </>
            ),
        },
        {
            id: '14',
            title: 'Contact & Support',
            content: (
                <>
                    <p className="text-cream-dim mb-4">
                        For refund queries:
                    </p>
                    <ul className="list-none space-y-2 text-cream-dim mb-6">
                        <li><strong>Email:</strong> support@upsosh.app</li>
                        <li><strong>Phone:</strong> +91 8076524225</li>
                        <li><strong>Response Time:</strong> Within 48 hours</li>
                    </ul>
                    <p className="text-cream-dim mb-3">
                        <strong>Grievance Officer (DPDP Act):</strong>
                    </p>
                    <ul className="list-none space-y-2 text-cream-dim">
                        <li>Parrv Luthra</li>
                        <li>Email: support@upsosh.app</li>
                        <li>Address: B-17, GK Enclave-2, New Delhi 110048, India</li>
                    </ul>
                </>
            ),
        },
    ];

    return (
        <div className="min-h-screen bg-white text-gray-900">
            
            <section className="pt-32 pb-16 px-4">
                <div className="container mx-auto max-w-4xl text-center">
                    <h1 className="text-5xl md:text-6xl font-display font-bold mb-6 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                        Refund & Cancellation Policy
                    </h1>
                    <p className="text-xl text-gray-600 mb-4">
                        Last Updated: 21st October 2026
                    </p>
                    <p className="text-lg text-gray-600">
                        This Refund & Cancellation Policy explains how refunds, cancellations, schedule changes, and ticket disputes are handled on UpSosh.
                    </p>
                </div>
            </section>

            
            <section className="pb-20 px-4">
                <div className="container mx-auto max-w-4xl space-y-12">
                    {sections.map((section, index) => (
                        <div
                            key={section.id}
                            className="bg-gray-50 rounded-3xl p-8 border border-gray-200"
                        >
                            <h2 className="text-2xl font-bold mb-4 text-gray-900">
                                {index + 1}. {section.title}
                            </h2>
                            <div className="prose prose-lg max-w-none">
                                {section.content}
                            </div>
                        </div>
                    ))}

                    
                    <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-3xl p-8 border border-purple-500/20">
                        <p className="text-gray-700 text-lg">
                            <strong>Agreement:</strong> By purchasing any ticket, listing events, or accessing our Platform, you ("User", "Attendee", "Host", "Organizer") agree to the terms outlined in this Refund & Cancellation Policy.
                        </p>
                    </div>

                    
                    <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-3xl p-8 text-white text-center">
                        <h3 className="text-2xl font-bold mb-4">Need Help with a Refund?</h3>
                        <p className="mb-6 text-purple-100">
                            Our support team is here to assist you with any refund or cancellation queries.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <a
                                href="mailto:support@upsosh.app"
                                className="px-8 py-3 bg-white text-purple-600 rounded-full font-semibold hover:bg-purple-50 transition-colors"
                            >
                                Email Support
                            </a>
                            <a
                                href="tel:+918076524225"
                                className="px-8 py-3 bg-purple-700 text-white rounded-full font-semibold hover:bg-purple-800 transition-colors"
                            >
                                Call Us
                            </a>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
