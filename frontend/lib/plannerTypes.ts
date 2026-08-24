/**
 * lib/plannerTypes.ts
 * ────────────────────
 * Shape of an AI-generated event plan, returned by POST /api/ai/plan.
 *
 * Extracted from lib/mockPlannerResult.ts, which also held a fabricated
 * sample plan used as a silent fallback whenever the real call failed. That
 * fallback was removed (see app/planner/page.tsx's handleGenerate) — a
 * failure now surfaces as an error, not a fake result with no indication
 * it wasn't real. This file keeps only the type, which describes real API
 * responses too.
 */

export interface BudgetItem {
  item: string;
  cost: number;
  note: string;
  color: string;
}

export interface VenueSuggestion {
  name: string;
  address: string;
  neighbourhood: string;
  capacity: number;
  price: number | 'Free';
  why: string;
  tags: string[];
  rating: number;
}

export interface ScheduleItem {
  time: string;
  title: string;
  description: string;
}

export interface PricingData {
  suggested: number;
  min: number;
  max: number;
  capacity: number;
  totalCost: number;
  platformFeePct: number;
}

export interface MarketingPlan {
  caption: string;
  hashtags: string[];
  bestPostTime: string;
  bestPlatform: string;
}

export interface PlannerSummary {
  eventName: string;
  totalCost: number;
  capacity: number;
  riskLevel: 'Low' | 'Medium' | 'High';
}

export interface PlannerResult {
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
    items: BudgetItem[];
    total: number;
  };
  venues: VenueSuggestion[];
  schedule: ScheduleItem[];
  pricing: PricingData;
  marketing: MarketingPlan;
  summary: PlannerSummary;
}
