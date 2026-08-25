import { Router, Response, RequestHandler } from 'express';
import rateLimit from 'express-rate-limit';
import { z } from 'zod';
import OpenAI from 'openai';
import { requireAuth, AuthRequest } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { aiPlanSchema } from '../lib/schemas';

function errorMessage(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}

type AIEventPlanRequestBody = z.infer<typeof aiPlanSchema>;

// Each call pays for a real OpenRouter completion, so this is a per-user
// cost limit, not a generic abuse guard — keyed on the authenticated user
// (requireAuth runs first) rather than IP, so it can't be dodged by
// switching networks and doesn't lump unrelated users on the same NAT/IP
// together.
const aiPlanLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  // No explicit `Request` annotation: express-rate-limit resolves its
  // callback's Request type against its own copy of
  // @types/express-serve-static-core (the same workspace-level duplicate
  // package conflict documented elsewhere in this codebase), so an
  // explicitly-typed parameter here doesn't structurally match. Leaving it
  // unannotated lets TS infer the right type from context instead.
  keyGenerator: (req) => (req as unknown as AuthRequest).user?.id ?? req.ip ?? 'anonymous',
  message: { message: "You've reached the AI planner's limit of 10 requests per hour. Please try again later." },
});

// Mirrors the JSON schema dictated to the model in SYSTEM_PROMPT below —
// the model isn't guaranteed to honor it, so this is a best-effort shape,
// not a validated one.
interface AIEventPlan {
  query: string;
  overview: {
    title: string;
    tagline: string;
    description: string;
    format: string;
    duration: string;
    attendeesMin: number;
    attendeesMax: number;
  };
  budget: {
    total: number;
    items: { item: string; cost: number; note: string; color: string }[];
  };
  venues: {
    name: string;
    address: string;
    neighbourhood: string;
    capacity: number;
    price: number | 'Free';
    why: string;
    tags: string[];
    rating: number;
  }[];
  schedule: { time: string; title: string; description: string }[];
  pricing: {
    suggested: number;
    min: number;
    max: number;
    capacity: number;
    totalCost: number;
    platformFeePct: number;
  };
  marketing: {
    caption: string;
    hashtags: string[];
    bestPostTime: string;
    bestPlatform: string;
  };
  summary: {
    eventName: string;
    totalCost: number;
    capacity: number;
    riskLevel: 'Low' | 'Medium' | 'High';
  };
}

const router = Router();

function getClient(): OpenAI {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error('OPENROUTER_API_KEY is not set');
  return new OpenAI({
    baseURL: 'https://openrouter.ai/api/v1',
    apiKey,
    defaultHeaders: {
      'HTTP-Referer': process.env.FRONTEND_URL || 'https://upsosh.app',
      'X-Title': 'upSosh AI Planner',
    },
  });
}

const SYSTEM_PROMPT = `You are an expert event planner for India, specialising in intimate community micro-events (run clubs, dinner circles, workshops, book clubs, creator meetups).

You always respond with a single valid JSON object — no markdown, no explanation, no code fences. The JSON must exactly match this schema:

{
  "query": "<repeat the user's request>",
  "overview": {
    "title": "<catchy event name>",
    "tagline": "<one punchy line>",
    "description": "<2-3 sentences, concrete and vivid, written for the attendee>",
    "format": "<e.g. Outdoor group run / Dinner / Workshop>",
    "duration": "<e.g. 2 hours>",
    "attendeesMin": <number>,
    "attendeesMax": <number>
  },
  "budget": {
    "total": <total in INR as number>,
    "items": [
      { "item": "<name>", "cost": <INR number>, "note": "<specific vendor/tip>", "color": "<hex color>" }
    ]
  },
  "venues": [
    {
      "name": "<venue name>",
      "address": "<full address>",
      "neighbourhood": "<area name>",
      "capacity": <number>,
      "price": <INR number or "Free">,
      "why": "<2 sentences — why this fits>",
      "tags": ["<tag1>", "<tag2>"],
      "rating": <number between 4.0 and 5.0>
    }
  ],
  "schedule": [
    { "time": "<HH:MM>", "title": "<step title>", "description": "<what happens>" }
  ],
  "pricing": {
    "suggested": <ticket price in INR>,
    "min": <min viable price>,
    "max": <max people would pay>,
    "capacity": <number>,
    "totalCost": <total budget>,
    "platformFeePct": 10
  },
  "marketing": {
    "caption": "<Instagram caption, punchy, 3-5 lines>",
    "hashtags": ["<hashtag1>", "<hashtag2>"],
    "bestPostTime": "<e.g. Tue-Thu, 7-9 PM>",
    "bestPlatform": "<e.g. Instagram (Reels + Stories)>"
  },
  "summary": {
    "eventName": "<same as overview.title>",
    "totalCost": <same as budget.total>,
    "capacity": <attendeesMax>,
    "riskLevel": "<Low | Medium | High>"
  }
}

Rules:
- Use Indian cities, venues, and pricing (INR). Be specific — real venue names, real areas.
- Budget items must sum to approximately the total.
- Use 4-6 budget items with distinct hex colors (muted earthy tones: #E8E4DC, #FF5A1F, #F0C96A, #1F5F3F, #6B6B6B, #A8A29E, #D4FF3F).
- Suggest 2-3 venues that are genuinely appropriate.
- Schedule must have 4-6 time slots.
- Hashtags array must have 6-8 items.
- Never return anything outside the JSON.`;

function buildUserPrompt(body: AIEventPlanRequestBody): string {
  const { type, guestCount, budget, vibes, query } = body;
  if (query) return query;
  const parts = [];
  if (type) parts.push(`Event type: ${type}`);
  if (guestCount) parts.push(`Guests: ${guestCount} people`);
  if (budget) parts.push(`Budget: ₹${budget}`);
  if (vibes?.length) parts.push(`Vibe: ${vibes.join(', ')}`);
  return parts.join('. ');
}

// POST /api/ai/plan — AI event planning (requireAuth, rate-limited)
router.post(
  '/plan',
  requireAuth,
  aiPlanLimiter as unknown as RequestHandler,
  validateBody(aiPlanSchema),
  async (req: AuthRequest, res: Response): Promise<Response> => {
    const userPrompt = buildUserPrompt(req.body as AIEventPlanRequestBody);

    if (!userPrompt.trim()) {
      return res.status(400).json({ message: 'Provide an event type, budget, or description.' });
    }

    if (!process.env.OPENROUTER_API_KEY) {
      console.warn('[AI] OPENROUTER_API_KEY not set — returning mock plan');
      return res.status(503).json({ message: 'AI service not configured. Please set OPENROUTER_API_KEY.' });
    }

    try {
      const client = getClient();

      const completion = await client.chat.completions.create({
        model: 'google/gemini-2.0-flash-001',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.8,
        max_tokens: 2000,
        response_format: { type: 'json_object' },
      });

      const raw = completion.choices[0]?.message?.content ?? '';

      let plan: AIEventPlan;
      try {
        // Strip any accidental markdown fences before parsing
        const cleaned = raw.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();
        plan = JSON.parse(cleaned);
      } catch {
        console.error('[AI] JSON parse failed, raw output:', raw.slice(0, 300));
        return res.status(500).json({ message: 'AI returned invalid JSON. Please try again.' });
      }

      return res.json(plan);
    } catch (err: unknown) {
      console.error('[AI] OpenRouter error:', errorMessage(err));
      return res.status(500).json({ message: 'AI service error. Please try again in a moment.' });
    }
  },
);

export default router;
