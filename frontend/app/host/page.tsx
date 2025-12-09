'use client';

import React from 'react';
import HostEventForm from '@/src/components/host/HostEventForm';
import AIAssistant from '@/src/components/host/AIAssistant';

export default function HostPage() {
    return (
        <div className="min-h-screen pt-24 pb-12 px-4 md:px-8">
            <div className="container mx-auto">
                <div className="text-center mb-12">
                    <h1 className="text-5xl font-heading font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
                        Host Your Next Big Thing
                    </h1>
                    <p className="text-xl text-text-muted max-w-2xl mx-auto">
                        Create memorable experiences for your community. Use our AI tools to plan, budget, and launch your event in minutes.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                    {/* Left Column: Event Creation Form */}
                    <div className="w-full">
                        <HostEventForm />
                    </div>

                    {/* Right Column: AI Assistant */}
                    <div className="w-full sticky top-24">
                        <AIAssistant />
                    </div>
                </div>
            </div>
        </div>
    );
}
