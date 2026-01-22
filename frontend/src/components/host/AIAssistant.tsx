'use client';

import React, { useState } from 'react';

const AIAssistant = () => {
    const [input, setInput] = useState({
        budget: '',
        guests: '',
        vibe: '',
    });
    const [response, setResponse] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleAskAI = async () => {
        setIsLoading(true);
        setResponse(null);
        try {
            const token = localStorage.getItem('token');
            const apiUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';

            const res = await fetch(`${apiUrl}/api/ai/plan`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token && { 'Authorization': `Bearer ${token}` }),
                },
                body: JSON.stringify({
                    budget: input.budget,
                    guests: input.guests,
                    vibe: input.vibe
                })
            });

            const data = await res.json();

            if (!res.ok) {
                if (data.detail === 'GEMINI_API_KEY missing') {
                    setResponse(`
### ⚠️ AI Configuration Missing
Please ask the administrator to add the **GEMINI_API_KEY** to the backend environment variables.
                    `);
                } else {
                    throw new Error(data.error || 'Failed to generate plan');
                }
            } else {
                setResponse(data.plan);
            }
        } catch (error) {
            console.error('AI Error:', error);
            setResponse(`
### ❌ AI Error
Failed to connect to the AI planner. Please try again later.
            `);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="glass-panel p-8 rounded-3xl h-full flex flex-col">
            <div className="mb-6">
                <h2 className="text-3xl font-heading font-bold text-text-primary flex items-center gap-3">
                    <span className="text-4xl"></span> AI Event Planner
                </h2>
                <p className="text-text-muted mt-2">
                    Not sure where to start? Let our AI agent help you plan the perfect event within your budget.
                </p>
            </div>

            <div className="space-y-4 flex-grow">
                <div>
                    <label className="text-sm font-medium text-text-secondary">Total Budget (₹)</label>
                    <input
                        type="number"
                        value={input.budget}
                        onChange={(e) => setInput({ ...input, budget: e.target.value })}
                        className="w-full p-3 rounded-xl bg-white border-none text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-secondary mt-1"
                        placeholder="5000"
                    />
                </div>
                <div>
                    <label className="text-sm font-medium text-text-secondary">Estimated Guests</label>
                    <input
                        type="number"
                        value={input.guests}
                        onChange={(e) => setInput({ ...input, guests: e.target.value })}
                        className="w-full p-3 rounded-xl bg-white border-none text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-secondary mt-1"
                        placeholder="100"
                    />
                </div>
                <div>
                    <label className="text-sm font-medium text-text-secondary">Vibe / Theme</label>
                    <input
                        type="text"
                        value={input.vibe}
                        onChange={(e) => setInput({ ...input, vibe: e.target.value })}
                        className="w-full p-3 rounded-xl bg-white border-none text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-secondary mt-1"
                        placeholder="e.g., Cyberpunk Rave, Professional Mixer"
                    />
                </div>

                <button
                    onClick={handleAskAI}
                    disabled={isLoading || !input.budget}
                    className="w-full py-4 bg-gradient-to-r from-secondary to-primary text-white font-bold rounded-xl hover:opacity-90 transition-all shadow-lg shadow-secondary/25 disabled:opacity-50 mt-4"
                >
                    {isLoading ? 'Analyzing...' : 'Ask AI Agent'}
                </button>
            </div>

            {response && (
                <div className="mt-8 p-6 bg-surface-highlight/50 rounded-2xl border border-white/10 animate-fade-in">
                    <div className="prose prose-invert max-w-none">
                        <div dangerouslySetInnerHTML={{ __html: response.replace(/\n/g, '<br/>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/### (.*)/g, '<h3 class="text-lg font-bold text-secondary mb-2">$1</h3>') }} />
                    </div>
                </div>
            )}
        </div>
    );
};

export default AIAssistant;
