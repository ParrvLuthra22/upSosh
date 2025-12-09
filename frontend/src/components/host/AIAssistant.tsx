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

    const handleAskAI = () => {
        setIsLoading(true);
        // Simulate AI processing
        setTimeout(() => {
            const budget = Number(input.budget);
            const guests = Number(input.guests);
            const profit = (guests * 50) - budget; // Simple heuristic: $50 ticket price

            const suggestion = `
### 🤖 AI Event Plan

**📍 Suggested Venues:**
1.  **The Loft at Downtown** - Industrial chic, fits ${guests} guests. Cost: $${budget * 0.4}
2.  **Skyline Garden** - Open air, great views. Cost: $${budget * 0.5}

**💰 Budget Breakdown:**
-   Venue: $${budget * 0.45}
-   Catering/Menu: $${budget * 0.3}
-   Marketing & Staff: $${budget * 0.25}

**📈 Profitability Analysis:**
-   Estimated Ticket Price: $50
-   Potential Revenue: $${guests * 50}
-   **Estimated Profit: $${profit}** ${profit > 0 ? '✅ Profitable!' : '⚠️ Tight Budget'}
            `;
            setResponse(suggestion);
            setIsLoading(false);
        }, 1500);
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
                    <label className="text-sm font-medium text-text-secondary">Total Budget ($)</label>
                    <input
                        type="number"
                        value={input.budget}
                        onChange={(e) => setInput({ ...input, budget: e.target.value })}
                        className="w-full p-3 rounded-xl bg-surface-highlight border-none text-text-primary focus:ring-2 focus:ring-secondary mt-1"
                        placeholder="5000"
                    />
                </div>
                <div>
                    <label className="text-sm font-medium text-text-secondary">Estimated Guests</label>
                    <input
                        type="number"
                        value={input.guests}
                        onChange={(e) => setInput({ ...input, guests: e.target.value })}
                        className="w-full p-3 rounded-xl bg-surface-highlight border-none text-text-primary focus:ring-2 focus:ring-secondary mt-1"
                        placeholder="100"
                    />
                </div>
                <div>
                    <label className="text-sm font-medium text-text-secondary">Vibe / Theme</label>
                    <input
                        type="text"
                        value={input.vibe}
                        onChange={(e) => setInput({ ...input, vibe: e.target.value })}
                        className="w-full p-3 rounded-xl bg-surface-highlight border-none text-text-primary focus:ring-2 focus:ring-secondary mt-1"
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
