'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import HostEventForm from '@/src/components/host/HostEventForm';
import MyEventsList from '@/src/components/host/MyEventsList';
import AIAssistant from '@/src/components/host/AIAssistant';
import { api, Event } from '@/src/lib/api';

export const dynamic = 'force-dynamic';

function HostPageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isLoading, setIsLoading] = useState(true);
    const [isHost, setIsHost] = useState(false);
    const [editingEvent, setEditingEvent] = useState<Event | null>(null);
    const [refreshKey, setRefreshKey] = useState(0);

    useEffect(() => {
        checkHostStatus();
    }, []);

    useEffect(() => {
        
        const editId = searchParams?.get('edit');
        if (editId && isHost) {
            loadEventForEdit(editId);
        }
    }, [searchParams, isHost]);

    const loadEventForEdit = async (eventId: string) => {
        try {
            const events = await api.getEvents();
            const eventToEdit = events.find((e: Event) => e.id === eventId);
            if (eventToEdit) {
                setEditingEvent(eventToEdit);
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        } catch (error) {
            console.error('Failed to load event for editing:', error);
        }
    };

    const checkHostStatus = async () => {
        try {
            
            const storedUser = localStorage.getItem('user');
            const storedUserData = localStorage.getItem('userData');
            
            if (!storedUser && !storedUserData) {
                
                router.push('/login');
                return;
            }

            
            if (storedUserData) {
                try {
                    const userData = JSON.parse(storedUserData);
                    if (userData.isHost) {
                        setIsHost(true);
                        setIsLoading(false);
                        return;
                    } else {
                        
                        setIsHost(false);
                        setIsLoading(false);
                        return;
                    }
                } catch (e) {
                    console.error('Error parsing userData:', e);
                }
            }

            
            try {
                const result = await api.getMe();
                if (result && result.user) {
                    
                    localStorage.setItem('userData', JSON.stringify(result.user));
                    setIsHost(result.user.isHost || false);
                } else {
                    
                    
                    setIsHost(false);
                }
            } catch (apiError) {
                console.error('API error:', apiError);
                
                
                setIsHost(false);
            }
        } catch (error) {
            console.error('Failed to check host status:', error);
            
            const storedUser = localStorage.getItem('user');
            if (!storedUser) {
                router.push('/login');
            } else {
                
                setIsHost(false);
            }
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen pt-24 pb-12 px-4 md:px-8 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-text-secondary">Loading...</p>
                </div>
            </div>
        );
    }

    if (!isHost) {
        return (
            <div className="min-h-screen pt-24 pb-12 px-4 md:px-8">
                <div className="container mx-auto max-w-2xl text-center">
                    <div className="bg-surface rounded-2xl p-8 md:p-12 border border-white/10">
                        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg className="w-10 h-10 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                        </div>
                        <h1 className="text-3xl md:text-4xl font-heading font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
                            Host Mode Required
                        </h1>
                        <p className="text-lg text-text-secondary mb-8">
                            To host events on UpSosh, you need to enable Host Mode in your profile settings.
                        </p>
                        <div className="space-y-4">
                            <button
                                onClick={() => router.push('/profile')}
                                className="w-full px-8 py-4 rounded-full bg-gradient-to-r from-primary to-secondary text-white font-medium hover:opacity-90 transition-opacity shadow-lg"
                            >
                                Go to Profile & Enable Host Mode
                            </button>
                            <button
                                onClick={() => router.push('/')}
                                className="w-full px-8 py-4 rounded-full border border-white/10 text-text-secondary hover:bg-white/5 transition-colors"
                            >
                                Back to Home
                            </button>
                        </div>
                        <div className="mt-8 p-4 bg-primary/5 rounded-xl border border-primary/20">
                            <h3 className="font-semibold text-primary mb-2">How to enable Host Mode:</h3>
                            <ol className="text-sm text-text-secondary text-left space-y-2">
                                <li>1. Go to your Profile page</li>
                                <li>2. Click "Edit Profile"</li>
                                <li>3. Toggle "Enable Host Mode" switch</li>
                                <li>4. Fill in your host details</li>
                                <li>5. Save your profile</li>
                            </ol>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

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

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start mb-12">
                    
                    <div className="w-full">
                        <HostEventForm 
                            eventToEdit={editingEvent} 
                            onEventSaved={() => {
                                setEditingEvent(null);
                                setRefreshKey(prev => prev + 1);
                            }}
                        />
                        {editingEvent && (
                            <button
                                onClick={() => setEditingEvent(null)}
                                className="w-full mt-4 py-2 px-4 bg-surface-highlight text-text-primary rounded-xl hover:bg-primary hover:text-white transition-all"
                            >
                                Cancel Edit
                            </button>
                        )}
                    </div>

                    
                    <div className="w-full sticky top-24">
                        <AIAssistant />
                    </div>
                </div>

                
                <div className="mt-12">
                    <MyEventsList 
                        key={refreshKey}
                        onEdit={(event) => {
                            setEditingEvent(event);
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                        }} 
                    />
                </div>
            </div>
        </div>
    );
}

export default function HostPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen pt-24 pb-12 px-4 md:px-8 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-text-secondary">Loading...</p>
                </div>
            </div>
        }>
            <HostPageContent />
        </Suspense>
    );
}
