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

export const mockPlannerResult: PlannerResult = {
  query: 'A Sunday morning run club for 30 people in South Delhi, budget ₹8,000',

  overview: {
    title: 'South Delhi Sunday Run Club',
    tagline: 'Run together. Start the week right.',
    description:
      'A curated Sunday morning run for 28–32 people across the heritage paths of South Delhi. Beginner-friendly, community-first — ending with chai and the kind of conversation you only have when you\'re slightly out of breath. The format works best with a 5–6 km loop, two pace groups, and a natural gathering point for the post-run wind-down.',
    format: 'Outdoor group run',
    duration: '2 hours',
    attendeesMin: 25,
    attendeesMax: 32,
  },

  budget: {
    total: 8000,
    items: [
      {
        item: 'Venue / Park entry',
        cost: 0,
        note: 'Nehru Park & Lodhi Garden are free — no permits needed for groups under 35',
        color: '#E8E4DC',
      },
      {
        item: 'Water & hydration',
        cost: 1800,
        note: '60 bottles × ₹20 + 4 sachets electrolytes × ₹75',
        color: '#FF5A1F',
      },
      {
        item: 'Post-run chai & snacks',
        cost: 2200,
        note: 'Nearby tapri or pre-arranged with a local canteen (~₹73/head)',
        color: '#F0C96A',
      },
      {
        item: 'Event photographer',
        cost: 2000,
        note: '2-hour booking · reels + stills for Instagram content',
        color: '#1F5F3F',
      },
      {
        item: 'Custom bibs & stickers',
        cost: 800,
        note: '35 units (5 spare) · printed on demand via Printulu',
        color: '#6B6B6B',
      },
      {
        item: 'Buffer / contingency',
        cost: 1200,
        note: '15% safety net for weather, cancellations, last-minute needs',
        color: '#A8A29E',
      },
    ],
  },

  venues: [
    {
      name: 'Nehru Park',
      address: 'Chanakyapuri, New Delhi – 110021',
      neighbourhood: 'Chanakyapuri',
      capacity: 50,
      price: 'Free',
      why: 'Flat 2km loop, wide shaded paths, central water point. Zero cost, zero paperwork for groups under 35. The go-to for South Delhi run clubs.',
      tags: ['Free', 'Shaded', 'Flat loop', 'Parking'],
      rating: 4.8,
    },
    {
      name: 'Lodhi Garden',
      address: 'Lodhi Road, New Delhi – 110003',
      neighbourhood: 'Lodhi Colony',
      capacity: 60,
      price: 'Free',
      why: 'More scenic — Mughal monuments at dawn is something else. Slightly more tourist traffic on Sundays but the inner paths are always quiet before 7am.',
      tags: ['Free', 'Scenic', 'Heritage', 'Instagram-worthy'],
      rating: 4.9,
    },
    {
      name: 'Sanjay Van',
      address: 'Vasant Kunj, New Delhi – 110070',
      neighbourhood: 'Vasant Kunj',
      capacity: 40,
      price: 'Free',
      why: 'Trail running crowd loves this one. More adventurous — uneven terrain, forest cover. Works if your audience skews intermediate runners.',
      tags: ['Free', 'Trail', 'Nature', 'Intermediate'],
      rating: 4.6,
    },
  ],

  schedule: [
    {
      time: '06:30',
      title: 'Arrival & Meet',
      description: 'Gather at the main gate. Distribute bibs, introductions, quick brief from the host. Keep it energetic — first impressions set the tone.',
    },
    {
      time: '06:45',
      title: 'Warm-up & Pace Groups',
      description: 'Dynamic stretching led by the host. Split into two groups: 6–7 min/km (casual) and sub-6 min/km (pushing). No one runs alone.',
    },
    {
      time: '07:00',
      title: '5K Loop',
      description: 'First lap of the route. Pacers at front and back. Music optional — we recommend letting the morning sounds do the work.',
    },
    {
      time: '07:35',
      title: 'Free Run / Extended Lap',
      description: 'Those who want to push do a second lap. Others gather at the checkpoint, catch breath, take photos.',
    },
    {
      time: '08:00',
      title: 'Post-run Chai',
      description: 'The magic part. Walk to the pre-arranged chai spot nearby. Stories, introductions, numbers exchanged. This is why people come back.',
    },
    {
      time: '08:30',
      title: 'Wrap-up',
      description: 'Group photo for stories, reminder of next week\'s event, UpSosh link shared. End on a high.',
    },
  ],

  pricing: {
    suggested: 349,
    min: 149,
    max: 799,
    capacity: 30,
    totalCost: 8000,
    platformFeePct: 10,
  },

  marketing: {
    caption:
      'Sunday, 6:30am, Nehru Park. You could be in bed.\n\nOr you could be running with 30 strangers who are about to become your people.\n\nLimited to 30. Chai included. 📍 South Delhi.',
    hashtags: [
      '#DelhiRunClub',
      '#SundayRun',
      '#RunningCommunity',
      '#SouthDelhi',
      '#MorningRun',
      '#UpSosh',
      '#FitDelhi',
      '#RunWithStrangers',
    ],
    bestPostTime: 'Tue–Thu, 7–9 PM',
    bestPlatform: 'Instagram (Reels + Stories)',
  },

  summary: {
    eventName: 'South Delhi Sunday Run Club',
    totalCost: 8000,
    capacity: 30,
    riskLevel: 'Low',
  },
};
