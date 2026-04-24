import { Router, Response } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { requireAuth, AuthRequest } from '../middleware/auth';

const router = Router();

let genAI: GoogleGenerativeAI | null = null;

function getGenAI(): GoogleGenerativeAI {
  if (!genAI) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error('GEMINI_API_KEY is not set');
    genAI = new GoogleGenerativeAI(apiKey);
  }
  return genAI;
}

// POST /api/ai/plan — AI event planning (requireAuth)
router.post('/plan', requireAuth, async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const { query, budget, guests, vibe } = req.body;

    if (!budget && !query) {
      return res.status(400).json({ message: 'query or budget is required' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.log('[AI] Gemini API key missing, returning mock plan');
      const budgetNum = Number(budget) || 10000;
      const guestsNum = Number(guests) || 20;
      const profitEstimate = (guestsNum * 500) - budgetNum;

      const mockPlan = `### AI Event Plan (Preview Mode)

**Suggested Venues:**
1. The Loft at Downtown - Industrial chic, fits ${guestsNum} guests. Cost: ₹${(budgetNum * 0.4).toFixed(0)}
2. Skyline Garden - Open air, great views. Cost: ₹${(budgetNum * 0.5).toFixed(0)}

**Budget Breakdown:**
- Venue: ₹${(budgetNum * 0.45).toFixed(0)}
- Food & Drinks: ₹${(budgetNum * 0.3).toFixed(0)}
- Decor & Staff: ₹${(budgetNum * 0.25).toFixed(0)}

**Profitability Analysis:**
- Suggested Ticket Price: ₹500
- Potential Revenue: ₹${(guestsNum * 500).toFixed(0)}
- **Estimated Profit: ₹${profitEstimate.toFixed(0)}** ${profitEstimate > 0 ? '✅ Profitable!' : '⚠️ Tight Budget'}

> **Note:** Configure Gemini API for real-time AI intelligence.`;

      return res.json({ plan: mockPlan });
    }

    const ai = getGenAI();
    const model = ai.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = query
      ? `Act as an expert event planner for India. The user asks: "${query}"\n\nProvide a concise, actionable event plan in Markdown format with venue suggestions, budget breakdown, and profitability analysis. Keep it under 400 words.`
      : `Act as an expert event planner for India. Plan an event with:
- Budget: ₹${budget}
- Guests: ${guests} people
- Vibe/Theme: ${vibe || 'General Party'}

Output in this Markdown format:

### AI Event Plan

**Suggested Venues:**
1. [Venue Name] - [Brief description]. Cost: ₹[Amount]
2. [Venue Name] - [Brief description]. Cost: ₹[Amount]

**Budget Breakdown:**
- Venue: ₹[Amount]
- Food & Drinks: ₹[Amount]
- Decor & Staff: ₹[Amount]

**Profitability Analysis:**
- Suggested Ticket Price: ₹[500-2000]
- Potential Revenue: ₹[Amount]
- **Estimated Profit: ₹[Amount]** [✅ Profitable! or ⚠️ Tight Budget]

Keep it concise and realistic. Do not add filler text before or after the markdown.`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    return res.json({ plan: text });
  } catch (err: any) {
    console.error('[AI] Planning error:', err.message);

    // Return mock plan on Gemini failure
    const mockPlan = `### AI Event Plan (Service Temporarily Unavailable)

We couldn't reach our AI service right now. Here's a general template:

**Suggested Venues:**
1. Local community hall or hotel banquet room
2. Outdoor garden or rooftop venue

**Budget Tips:**
- Allocate 40-50% to venue
- 25-30% to food & beverages
- 20-25% to decor, staff & miscellaneous

**Profitability:** Set ticket price to cover costs with 20-30% margin.

Please try again shortly.`;

    return res.json({ plan: mockPlan });
  }
});

export default router;
