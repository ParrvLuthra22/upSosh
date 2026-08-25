'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { api, Event } from '@/lib/api';

interface MyEventsListProps {
    onEdit: (event: Event) => void;
}

const MyEventsList: React.FC<MyEventsListProps> = ({ onEdit }) => {
    const [myEvents, setMyEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadMyEvents();
    }, []);

    const loadMyEvents = async () => {
        try {
            const userData = localStorage.getItem('userData');
            if (!userData) return;

            const user = JSON.parse(userData);
            const allEvents = await api.getEvents();
            
            
            const userEvents = allEvents.filter((event: Event) => event.hostId === user.id);
            setMyEvents(userEvents);
        } catch (error) {
            console.error('Failed to load events:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (eventId: string) => {
        if (!confirm('Are you sure you want to delete this event?')) return;

        try {
            await api.deleteEvent(eventId);
            alert('Event deleted successfully!');
            loadMyEvents(); 
        } catch (error) {
            console.error('Failed to delete event:', error);
            alert('Failed to delete event');
        }
    };

    if (loading) {
        return (
            <div className="glass-panel p-8 rounded-3xl">
                <p className="text-cream-dim text-center">Loading your events...</p>
            </div>
        );
    }

    if (myEvents.length === 0) {
        return (
            <div className="glass-panel p-8 rounded-3xl">
                <p className="text-cream-dim text-center">
                    You haven't created any events yet. Create your first event above!
                </p>
            </div>
        );
    }

    return (
        <div className="glass-panel p-8 rounded-3xl">
            <h2 className="text-3xl font-display font-bold mb-6 text-cream">My Events</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {myEvents.map((event) => (
                    <div key={event.id} className="relative bg-surface-2 rounded-xl overflow-hidden">
                        <Image
                            src={event.image}
                            alt={event.title}
                            width={400}
                            height={192}
                            sizes="(min-width: 768px) 50vw, 100vw"
                            className="w-full h-48 object-cover"
                        />
                        <div className="p-4 space-y-3">
                            <h3 className="text-xl font-bold text-cream">{event.title}</h3>
                            <div className="text-sm text-cream-dim space-y-1">
                                <p> {event.date} at {event.time}</p>
                                <p> {event.venue}</p>
                                <p> ₹{event.price}</p>
                                <p className="capitalize">
                                     {event.type}
                                    {event.isSuperhost && ' ⭐ Superhost'}
                                </p>
                            </div>
                            <div className="flex gap-2 mt-4">
                                <button
                                    onClick={() => onEdit(event)}
                                    className="flex-1 py-2 px-4 bg-lime text-void rounded-lg hover:opacity-90 transition-opacity"
                                >
                                    ✏️ Edit
                                </button>
                                <button
                                    onClick={() => handleDelete(event.id)}
                                    className="flex-1 py-2 px-4 bg-red-500 text-white rounded-lg hover:opacity-90 transition-opacity"
                                >
                                    🗑️ Delete
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default MyEventsList;
