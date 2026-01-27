import { Router, Request, Response } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';

const router = Router();

let genAI: GoogleGenerativeAI | null = null;

function getGenAI() {
    if (!genAI) {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            throw new Error('GEMINI_API_KEY is not set');
        }
        genAI = new GoogleGenerativeAI(apiKey);
    }
    return genAI;
}

router.post('/plan', async (req: Request, res: Response): Promise<any> => {
    try {
        const { budget, guests, vibe } = req.body;

        if (!budget || !guests) {
            return res.status(400).json({ error: 'Budget and guests are required' });
        }

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            console.log('Gemini API key missing, using mock response');
            
            const profitStr = ((guests * 500) - budget).toFixed(2);
            const profit = parseFloat(profitStr);
            
            const mockPlan = `
### 🤖 AI Event Plan (Preview Mode)

**📍 Suggested Venues:**
1.  **The Loft at Downtown** - Industrial chic, fits ${guests} guests. Cost: ₹${(budget * 0.4).toFixed(2)}
2.  **Skyline Garden** - Open air, great views. Cost: ₹${(budget * 0.5).toFixed(2)}

**💰 Budget Breakdown:**
-   Venue: ₹${(budget * 0.45).toFixed(2)}
-   Food & Drinks: ₹${(budget * 0.3).toFixed(2)}
-   Decor & Staff: ₹${(budget * 0.25).toFixed(2)}

**📈 Profitability Analysis:**
-   Suggested Ticket Price: ₹500
-   Potential Revenue: ₹${(guests * 500).toFixed(2)}
-   **Estimated Profit: ₹${profit}** ${profit > 0 ? '✅ Profitable!' : '⚠️ Tight Budget'}

> **Note:** This is a generated preview. Configure Gemini API for real-time intelligence.
            `;
            
            return res.json({ plan: mockPlan });
        }

        const genAI = getGenAI();
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        const prompt = `
            Act as an expert event planner. Plan an event with these constraints:
            - Budget: ₹${budget}
            - Guests: ${guests} people
            - Vibe/Theme: ${vibe || 'General Party'}

            Output a response in this exact Markdown format:

            ### 🤖 AI Event Plan

            **📍 Suggested Venues:**
            1. [Venue Name] - [Brief Vibe]. Cost: ₹[Amount]
            2. [Venue Name] - [Brief Vibe]. Cost: ₹[Amount]

            **💰 Budget Breakdown:**
            - Venue: ₹[Amount]
            - Food & Drinks: ₹[Amount]
            - Decor & Staff: ₹[Amount]

            **📈 Profitability Analysis:**
            - Suggested Ticket Price: ₹[500-2000 range]
            - Potential Revenue: ₹[Amount]
            - **Estimated Profit: ₹[Amount]** [Use ✅ Profitable! or ⚠️ Tight Budget]

            Keep it concise and realistic for the budget given. 
            Do not add conversational filler before or after the markdown.
        `;

        const result = await model.generateContent(prompt);
        const response = result.response;
        const text = response.text();

        res.json({ plan: text });

    } catch (error: any) {
        console.error('AI Planning Error:', error);
        res.status(500).json({ error: 'Failed to generate plan', details: error.message });
    }
});

export default router;
