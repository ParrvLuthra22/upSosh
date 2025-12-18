'use client';

import React, { useState } from 'react';
import { api } from '@/src/lib/api';

const HostEventForm = () => {
    const [formData, setFormData] = useState({
        title: '',
        type: 'formal',
        date: '',
        time: '',
        venue: '',
        price: 0,
        description: '',
        image: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30', // Default event image
        menu: [] as string[],
    });
    const [menuItem, setMenuItem] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const addMenuItem = () => {
        if (menuItem.trim()) {
            setFormData((prev) => ({ ...prev, menu: [...prev.menu, menuItem] }));
            setMenuItem('');
        }
    };

    const removeMenuItem = (index: number) => {
        setFormData((prev) => ({ ...prev, menu: prev.menu.filter((_, i) => i !== index) }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            // Mock hostId for now - TODO: Get from auth context
            const eventData = {
                ...formData,
                hostId: 'user-123',
                tags: ['new'],
                isSuperhost: false,
            };
            
            console.log('Submitting event data:', eventData);
            const response = await api.createEvent(eventData as any);
            console.log('Event created successfully:', response);
            alert('Event created successfully!');
            // Reset form
            setFormData({
                title: '',
                type: 'formal',
                date: '',
                time: '',
                venue: '',
                price: 0,
                description: '',
                image: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30',
                menu: [] as string[],
            });
        } catch (error: any) {
            console.error('Failed to create event:', error);
            alert(`Failed to create event: ${error.message || 'Please try again.'}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="glass-panel p-8 rounded-3xl">
            <h2 className="text-3xl font-heading font-bold mb-6 text-text-primary">Create Your Event</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-text-secondary">Event Title</label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            required
                            className="w-full p-3 rounded-xl bg-surface-highlight border-none text-text-primary focus:ring-2 focus:ring-primary"
                            placeholder="e.g., Summer Rooftop Party"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-text-secondary">Event Type</label>
                        <select
                            name="type"
                            value={formData.type}
                            onChange={handleChange}
                            className="w-full p-3 rounded-xl bg-surface-highlight border-none text-text-primary focus:ring-2 focus:ring-primary"
                        >
                            <option value="formal">Formal</option>
                            <option value="informal">Informal</option>
                        </select>
                    </div>
                </div>

                {/* Date & Time */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-text-secondary">Date</label>
                        <input
                            type="date"
                            name="date"
                            value={formData.date}
                            onChange={handleChange}
                            required
                            className="w-full p-3 rounded-xl bg-surface-highlight border-none text-text-primary focus:ring-2 focus:ring-primary"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-text-secondary">Time</label>
                        <input
                            type="time"
                            name="time"
                            value={formData.time}
                            onChange={handleChange}
                            required
                            className="w-full p-3 rounded-xl bg-surface-highlight border-none text-text-primary focus:ring-2 focus:ring-primary"
                        />
                    </div>
                </div>

                {/* Venue & Price */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-text-secondary">Venue</label>
                        <input
                            type="text"
                            name="venue"
                            value={formData.venue}
                            onChange={handleChange}
                            required
                            className="w-full p-3 rounded-xl bg-surface-highlight border-none text-text-primary focus:ring-2 focus:ring-primary"
                            placeholder="e.g., Grand Hotel Ballroom"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-text-secondary">Price ($)</label>
                        <input
                            type="number"
                            name="price"
                            value={formData.price}
                            onChange={handleChange}
                            required
                            min="0"
                            className="w-full p-3 rounded-xl bg-surface-highlight border-none text-text-primary focus:ring-2 focus:ring-primary"
                        />
                    </div>
                </div>

                {/* Description */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-text-secondary">Description</label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        required
                        rows={4}
                        className="w-full p-3 rounded-xl bg-surface-highlight border-none text-text-primary focus:ring-2 focus:ring-primary"
                        placeholder="Tell guests what to expect..."
                    />
                </div>

                {/* Menu Selection */}
                <div className="space-y-4">
                    <label className="text-sm font-medium text-text-secondary">Available Menu</label>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={menuItem}
                            onChange={(e) => setMenuItem(e.target.value)}
                            className="flex-1 p-3 rounded-xl bg-surface-highlight border-none text-text-primary focus:ring-2 focus:ring-primary"
                            placeholder="Add menu item (e.g., Vegan Sliders)"
                        />
                        <button
                            type="button"
                            onClick={addMenuItem}
                            className="px-4 py-2 bg-secondary text-white rounded-xl hover:opacity-90 transition-opacity"
                        >
                            Add
                        </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {formData.menu.map((item, index) => (
                            <span key={index} className="px-3 py-1 bg-surface-highlight rounded-full text-sm text-text-primary flex items-center gap-2">
                                {item}
                                <button
                                    type="button"
                                    onClick={() => removeMenuItem(index)}
                                    className="text-red-500 hover:text-red-400"
                                >
                                    ×
                                </button>
                            </span>
                        ))}
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-4 bg-primary text-white font-bold rounded-xl hover:opacity-90 transition-all shadow-lg shadow-primary/25 disabled:opacity-50"
                >
                    {isSubmitting ? 'Creating Event...' : 'Publish Event'}
                </button>
            </form>
        </div>
    );
};

export default HostEventForm;
