import { defaultForm, tomorrowIST, buildPayload, missingFields, missingSummary, formatTime12 } from '@/lib/createEvent';

describe('defaults', () => {
  it('tomorrow in IST, 6:00 PM, free, 20 spots, Meetup', () => {
    const f = defaultForm(new Date('2026-11-04T10:00:00Z'));
    expect(f).toMatchObject({ date: '2026-11-05', time: '18:00', isFree: true, capacity: 20, category: 'Meetup', image: '', title: '', location: '' });
  });
  it('uses the Indian date, not UTC: 20:00 UTC on the 4th is already the 5th in IST', () => {
    expect(tomorrowIST(new Date('2026-11-04T20:00:00Z'))).toBe('2026-11-06');
    expect(tomorrowIST(new Date('2026-12-31T19:00:00Z'))).toBe('2027-01-02'); // year rollover
  });
  it('formats 24h times', () => {
    expect(formatTime12('18:00')).toBe('6:00 PM');
    expect(formatTime12('00:05')).toBe('12:05 AM');
    expect(formatTime12('12:30')).toBe('12:30 PM');
  });
});

describe('payload is exactly what the previous page sent', () => {
  const base = { ...defaultForm(new Date('2026-11-04T10:00:00Z')), title: 'Sunday Run', description: 'Easy pace', location: 'Lodhi Garden', included: 'Chai\n\n Ticket ' };

  it('free + live', () => {
    expect(buildPayload(base, false)).toEqual({
      title: 'Sunday Run', description: 'Easy pace', included: ['Chai', 'Ticket'], category: 'Meetup', type: 'Meetup',
      date: '2026-11-05', time: '18:00', venue: 'Lodhi Garden', capacity: 20, price: 0, isFree: true, image: '', status: 'live',
    });
  });
  it('paid + draft', () => {
    const p = buildPayload({ ...base, isFree: false, price: 500, image: 'https://images.unsplash.com/x' }, true);
    expect(p).toMatchObject({ price: 500, isFree: false, status: 'draft', image: 'https://images.unsplash.com/x' });
    expect(Object.keys(p).sort()).toEqual(
      ['capacity', 'category', 'date', 'description', 'image', 'included', 'isFree', 'price', 'status', 'time', 'title', 'type', 'venue'],
    );
    expect(p).not.toHaveProperty('location');
  });
  it('a free event never carries a leftover price', () => {
    expect(buildPayload({ ...base, isFree: true, price: 900 }, false).price).toBe(0);
  });
});

describe('required fields', () => {
  it('title, date and location', () => {
    expect(missingFields({ title: ' ', date: '', location: '' })).toEqual(['title', 'date', 'location']);
    expect(missingFields({ title: 'x', date: '2026-11-05', location: 'y' })).toEqual([]);
  });
  it('says what is missing', () => {
    expect(missingSummary(['title'])).toBe('Add event name to continue');
    expect(missingSummary(['title', 'location'])).toBe('Add event name and location to continue');
    expect(missingSummary(['title', 'date', 'location'])).toBe('Add event name, date and location to continue');
    expect(missingSummary([])).toBe('');
  });
});

// WCAG AA (4.5:1 for normal text) for the colour pairs the new page relies on.
describe('contrast', () => {
  const lum = (hex: string) => {
    const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  const ratio = (a: string, b: string) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
  // cream-dim is cream at 55% over the background.
  const mix = (fg: string, bg: string, a: number) => '#' + [1, 3, 5].map((i) => Math.round(parseInt(fg.slice(i, i + 2), 16) * a + parseInt(bg.slice(i, i + 2), 16) * (1 - a)).toString(16).padStart(2, '0')).join('');
  const VOID = '#0A0A0B', SURFACE = '#13131B', LIME = '#D4FF3F', CREAM = '#F4F1EA', CORAL = '#FF6F61';

  it('void text on the lime buttons', () => expect(ratio(VOID, LIME)).toBeGreaterThanOrEqual(4.5));
  it('cream text on void and surface', () => { expect(ratio(CREAM, VOID)).toBeGreaterThanOrEqual(4.5); expect(ratio(CREAM, SURFACE)).toBeGreaterThanOrEqual(4.5); });
  it('dim text (labels, placeholders, row values)', () => {
    expect(ratio(mix(CREAM, VOID, 0.55), VOID)).toBeGreaterThanOrEqual(4.5);
    expect(ratio(mix(CREAM, SURFACE, 0.55), SURFACE)).toBeGreaterThanOrEqual(4.5);
  });
  it('error text', () => { expect(ratio(CORAL, VOID)).toBeGreaterThanOrEqual(4.5); expect(ratio(CORAL, SURFACE)).toBeGreaterThanOrEqual(4.5); });
  it('white on lime would fail (why the old button was changed)', () => expect(ratio('#FFFFFF', LIME)).toBeLessThan(4.5));
});
