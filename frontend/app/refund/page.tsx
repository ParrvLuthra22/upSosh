'use client';

import React from 'react';

export default function RefundPage() {
    const sections = [
        {
            id: '1',
            title: 'General Policy Principles',
            content: (
                <>
                    <ul className="list-disc pl-6 space-y-2 text-text-secondary">
                        <li>All refunds are governed primarily by the Host's refund policy, as displayed on the event page.</li>
                        <li>UpSosh acts only as a ticketing and discovery platform, not an event organizer.</li>
                        <li>Users must review the Host's refund conditions before booking.</li>
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
                    <p className="text-text-secondary mb-4">
                        If a User cancels their booking:
                    </p>
                    <p className="text-text-secondary mb-3">
                        ✔ Refund eligibility depends entirely on the Host's policy.
                    </p>
                    <p className="text-text-secondary mb-3">
                        Hosts may choose one of the following for their event:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-text-secondary mb-4">
                        <li><strong>No Refunds</strong></li>
                        <li><strong>Partial Refunds</strong> (e.g., 50% refund up to 24 hours before)</li>
                        <li><strong>Full Refunds</strong> (within a specific time frame)</li>
                        <li><strong>Replacement/Reschedule Only</strong></li>
                    </ul>
                    <p className="text-text-secondary mb-3">
                        The Host's chosen policy will be clearly shown on the event page and during checkout.
                    </p>
                    <p className="text-text-secondary">
                        ⚠️ If the Host has selected "No Refund", UpSosh cannot override this rule.
                    </p>
                </>
            ),
        },
        {
            id: '3',
            title: 'Host-Initiated Cancellations',
            content: (
                <>
                    <p className="text-text-secondary mb-4">
                        If the Host cancels the event for any reason:
                    </p>
                    <p className="text-text-secondary mb-3">
                        ✅ Users will receive:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-text-secondary mb-4">
                        <li>100% refund of the ticket price, AND</li>
                        <li>Refund of UpSosh service fees, AND</li>
                        <li>Refund of applicable taxes</li>
                    </ul>
                    <p className="text-text-secondary">
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
                    <p className="text-text-secondary mb-4">
                        If the Host changes:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-text-secondary mb-4">
                        <li>Event date</li>
                        <li>Event time</li>
                        <li>Venue</li>
                        <li>Major part of event content</li>
                    </ul>
                    <p className="text-text-secondary mb-3">
                        Users will be notified and given the choice to:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-text-secondary mb-4">
                        <li>Accept the updated event, OR</li>
                        <li>Request a full refund (irrespective of Host policy)</li>
                    </ul>
                    <p className="text-text-secondary">
                        This ensures fairness and meets Consumer Protection norms.
                    </p>
                </>
            ),
        },
        {
            id: '5',
            title: 'Partial Event Completion',
            content: (
                <>
                    <p className="text-text-secondary mb-4">
                        If an event:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-text-secondary mb-4">
                        <li>Starts late</li>
                        <li>Ends early</li>
                        <li>Has reduced capacity</li>
                        <li>Experiences technical delays</li>
                    </ul>
                    <p className="text-text-secondary mb-3">
                        Refunds depend on:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-text-secondary mb-4">
                        <li>✅ The Host's refund rules</li>
                        <li>✅ The extent of disruption</li>
                    </ul>
                    <p className="text-text-secondary">
                        UpSosh may mediate disputes but final decisions rest with the Host, unless the Host's actions violate UpSosh's guidelines.
                    </p>
                </>
            ),
        },
        {
            id: '6',
            title: 'No-Shows (User Does Not Attend)',
            content: (
                <>
                    <p className="text-text-secondary mb-4">
                        If the User does not attend an event:
                    </p>
                    <p className="text-text-secondary mb-3">
                        ❌ No refund will be provided
                    </p>
                    <p className="text-text-secondary">
                        unless the Host's policy explicitly allows for it. This is standard across all ticketing platforms.
                    </p>
                </>
            ),
        },
        {
            id: '7',
            title: 'Force Majeure Events',
            content: (
                <>
                    <p className="text-text-secondary mb-4">
                        Refunds apply differently when events are impacted by:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-text-secondary mb-4">
                        <li>Weather conditions</li>
                        <li>Government restrictions</li>
                        <li>Natural disasters</li>
                        <li>Public safety issues</li>
                        <li>Venue breakdowns</li>
                        <li>National emergencies</li>
                    </ul>
                    <p className="text-text-secondary mb-3">
                        ✅ If the event is fully cancelled → Users receive 100% refund.
                    </p>
                    <p className="text-text-secondary mb-3">
                        ✅ If the event is rescheduled → Users may choose:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-text-secondary">
                        <li>Refund</li>
                        <li>Attend new date</li>
                    </ul>
                </>
            ),
        },
        {
            id: '8',
            title: 'Ticket Misuse, Fraud, or Duplication',
            content: (
                <>
                    <p className="text-text-secondary mb-4">
                        UpSosh is not responsible for issues caused by ticket misuse, including:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-text-secondary mb-4">
                        <li>Sharing screenshots</li>
                        <li>Duplicate QR codes</li>
                        <li>Unauthorized resale</li>
                        <li>Fake tickets generated by Users</li>
                    </ul>
                    <p className="text-text-secondary mb-3">
                        In such cases:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-text-secondary">
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
                    <p className="text-text-secondary mb-4">
                        If payment is deducted but ticket is not issued due to technical/network issues:
                    </p>
                    <p className="text-text-secondary mb-4">
                        Auto-refund is triggered within 2–5 business days.
                    </p>
                    <p className="text-text-secondary mb-3">
                        If payment gateway holds funds:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-text-secondary mb-4">
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
                    <p className="text-text-secondary mb-4">
                        Hosts must:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-text-secondary mb-4">
                        <li>Clearly define their refund policy</li>
                        <li>Resolve user disputes honestly</li>
                        <li>Respond promptly to refund requests</li>
                        <li>Not impose hidden charges at the venue</li>
                    </ul>
                    <p className="text-text-secondary mb-3">
                        Violations may result in:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-text-secondary">
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
                    <p className="text-text-secondary mb-4">
                        UpSosh service fees:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-text-secondary mb-4">
                        <li>May be non-refundable for user-initiated cancellations</li>
                        <li>Are fully refundable for Host-initiated cancellations</li>
                    </ul>
                    <p className="text-text-secondary">
                        This will be stated during checkout.
                    </p>
                </>
            ),
        },
        {
            id: '12',
            title: 'Refund Processing Times',
            content: (
                <>
                    <p className="text-text-secondary mb-4">
                        Once a refund is approved:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-text-secondary mb-4">
                        <li>3–5 business days for UPI</li>
                        <li>5–7 business days for cards/netbanking</li>
                        <li>Up to 10 business days for wallets</li>
                        <li>7–14 days for chargeback settlements</li>
                    </ul>
                    <p className="text-text-secondary">
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
                    <p className="text-text-secondary mb-4">
                        Fraudulent chargebacks may lead to:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-text-secondary mb-4">
                        <li>Account suspension</li>
                        <li>Blocking of future purchases</li>
                        <li>Legal notice to recover funds</li>
                        <li>Reporting to authorities in case of fraud</li>
                    </ul>
                    <p className="text-text-secondary">
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
                    <p className="text-text-secondary mb-4">
                        For refund queries:
                    </p>
                    <ul className="list-none space-y-2 text-text-secondary mb-6">
                        <li><strong>Email:</strong> support@upsosh.app</li>
                        <li><strong>Phone:</strong> +91 8076524225</li>
                        <li><strong>Response Time:</strong> Within 48 hours</li>
                    </ul>
                    <p className="text-text-secondary mb-3">
                        <strong>Grievance Officer (DPDP Act):</strong>
                    </p>
                    <ul className="list-none space-y-2 text-text-secondary">
                        <li>Parrv Luthra</li>
                        <li>Email: support@upsosh.app</li>
                        <li>Address: B-17, GK Enclave-2, New Delhi 110048, India</li>
                    </ul>
                </>
            ),
        },
    ];

    return (
        <div className="min-h-screen bg-white dark:bg-[#0a0a0a] text-gray-900 dark:text-white">
            
            <section className="pt-32 pb-16 px-4">
                <div className="container mx-auto max-w-4xl text-center">
                    <h1 className="text-5xl md:text-6xl font-heading font-bold mb-6 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                        Refund & Cancellation Policy
                    </h1>
                    <p className="text-xl text-gray-600 dark:text-gray-400 mb-4">
                        Last Updated: 24th November 2025
                    </p>
                    <p className="text-lg text-gray-600 dark:text-gray-400">
                        This Refund & Cancellation Policy explains how refunds, cancellations, schedule changes, and ticket disputes are handled on UpSosh.
                    </p>
                </div>
            </section>

            
            <section className="pb-20 px-4">
                <div className="container mx-auto max-w-4xl space-y-12">
                    {sections.map((section, index) => (
                        <div
                            key={section.id}
                            className="bg-gray-50 dark:bg-gray-900/50 rounded-3xl p-8 border border-gray-200 dark:border-gray-800"
                        >
                            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
                                {index + 1}. {section.title}
                            </h2>
                            <div className="prose prose-lg dark:prose-invert max-w-none">
                                {section.content}
                            </div>
                        </div>
                    ))}

                    
                    <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-3xl p-8 border border-purple-500/20">
                        <p className="text-gray-700 dark:text-gray-300 text-lg">
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
