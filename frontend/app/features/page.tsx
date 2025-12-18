'use client';

import React from 'react';
import Link from 'next/link';

export default function FeaturesPage() {
    const features = [
        {
            title: 'Smart Discovery',
            description: 'Our AI-powered recommendation engine learns your preferences to suggest events you\'ll actually love.',
            gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        },
        {
            title: 'Instant Booking',
            description: 'Secure your spot in seconds with our seamless one-click booking system. No more waiting in queues.',
            gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        },
        {
            title: 'Verified Hosts',
            description: 'Every host is vetted to ensure safety and quality. Look for the Superhost badge for top-tier experiences.',
            gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
        },
        {
            title: 'Social Connections',
            description: 'See who\'s attending, connect with like-minded people, and build your social circle effortlessly.',
            gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
        },
        {
            title: 'Seamless Payments',
            description: 'Pay securely with multiple payment options. Track all your bookings and receipts in one place.',
            gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
        },
        {
            title: 'Real-time Updates',
            description: 'Get instant notifications about event changes, new messages, and exclusive offers.',
            gradient: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
        },
    ];

    return (
        <div className="min-h-screen pt-32 pb-16 px-4 bg-white dark:bg-[#0a0a0a] transition-colors">
            {/* Hero Section */}
            <div className="max-w-7xl mx-auto mb-16 text-center">
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6" style={{ 
                    background: 'linear-gradient(to right, #8b5cf6, #ec4899, #f59e0b)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text'
                }}>
                    Features that Empower You
                </h1>
                <p className="text-xl md:text-2xl mb-4 text-gray-600 dark:text-gray-400">
                    Experience a new way to discover, book, and host events.
                </p>
                <p className="text-lg text-gray-500 dark:text-gray-500">
                    Built for the modern socialite.
                </p>
            </div>

            {/* Features Grid */}
            <div className="max-w-7xl mx-auto mb-20">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {features.map((feature, index) => (
                        <div
                            key={index}
                            className="p-8 rounded-2xl transition-all duration-300 hover:scale-105 bg-gray-50 dark:bg-[#1a1a1a] border-2 border-gray-200 dark:border-[#2a2a2a]"
                            onMouseEnter={(e) => {
                                e.currentTarget.style.borderColor = '#8b5cf6';
                                e.currentTarget.style.boxShadow = '0 20px 60px rgba(139, 92, 246, 0.3)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.classList.contains('dark') 
                                    ? e.currentTarget.style.borderColor = '#2a2a2a'
                                    : e.currentTarget.style.borderColor = 'rgb(229, 231, 235)';
                                e.currentTarget.style.boxShadow = 'none';
                            }}
                        >
                            {/* Gradient Icon Circle */}
                            <div 
                                className="w-16 h-16 rounded-full mb-6"
                                style={{
                                    background: feature.gradient,
                                    boxShadow: '0 8px 20px rgba(139, 92, 246, 0.4)',
                                }}
                            />
                            
                            <h3 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white">
                                {feature.title}
                            </h3>
                            <p className="text-base leading-relaxed text-gray-600 dark:text-gray-400">
                                {feature.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>

            {/* CTA Section */}
            <div className="max-w-4xl mx-auto">
                <div 
                    className="p-12 rounded-3xl text-center bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 border border-purple-200 dark:border-purple-800/50"
                >
                    <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900 dark:text-white">
                        Ready to Switch Up?
                    </h2>
                    <p className="text-lg md:text-xl mb-8 text-gray-700 dark:text-gray-300">
                        Join thousands of users who are already experiencing the future of event discovery.
                    </p>
                    <Link 
                        href="/"
                        className="inline-block px-10 py-4 rounded-full font-bold text-lg transition-all duration-300"
                        style={{
                            backgroundColor: '#8b5cf6',
                            color: '#ffffff',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#7c3aed';
                            e.currentTarget.style.transform = 'scale(1.05)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = '#8b5cf6';
                            e.currentTarget.style.transform = 'scale(1)';
                        }}
                    >
                        Get Started Now
                    </Link>
                </div>
            </div>
        </div>
    );
}
