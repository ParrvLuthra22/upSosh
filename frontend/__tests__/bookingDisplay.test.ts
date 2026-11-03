import {
  bookingStatusKey, showQr, bookingTab, amountLabel, noQrNotice,
  buildIcs, escapeIcsText, foldIcsLine, parseEventTime, icsFilename, DEFAULT_EVENT_HOURS,
  type DisplayBooking,
} from '@/lib/bookingDisplay';

const ev = { title: 'Sunday Run Club', date: '2030-03-10T01:00:00.000Z', time: '6:30 AM', venue: 'Lodhi Garden, Gate 2', city: 'Delhi', slug: 'run-club' };
const b = (o: Partial<DisplayBooking> = {}): DisplayBooking => ({ id: 'bk1', status: 'confirmed', paymentStatus: 'paid', totalAmount: 525, guestCount: 1, event: ev, ...o });
const future = { ...ev, date: '2031-01-01T10:00:00.000Z' };
const past = { ...ev, date: '2020-01-01T10:00:00.000Z' };
const now = new Date('2030-06-01T00:00:00Z');

describe('status labels', () => {
  it('knows expired and refunded', () => {
    expect(bookingStatusKey(b({ status: 'expired', paymentStatus: 'unpaid' }))).toBe('expired');
    expect(bookingStatusKey(b({ status: 'refunded', paymentStatus: 'refunded' }))).toBe('refunded');
  });
  it('a refunded payment wins over a status that still says confirmed', () => {
    expect(bookingStatusKey(b({ status: 'confirmed', paymentStatus: 'refunded' }))).toBe('refunded');
  });
  it('is "unavailable" with no event, and falls back to pending for anything unknown', () => {
    expect(bookingStatusKey(b({ event: null }))).toBe('unavailable');
    expect(bookingStatusKey(b({ status: 'weird', paymentStatus: 'unpaid' }))).toBe('pending');
  });
});

describe('QR code rule: confirmed AND paid, nothing else', () => {
  const cases: [string, Partial<DisplayBooking>, boolean][] = [
    ['confirmed + paid', { status: 'confirmed', paymentStatus: 'paid' }, true],
    ['pending + unpaid', { status: 'pending', paymentStatus: 'unpaid' }, false],
    ['pending + failed', { status: 'pending', paymentStatus: 'failed' }, false],
    ['expired + unpaid', { status: 'expired', paymentStatus: 'unpaid' }, false],
    ['refunded status', { status: 'refunded', paymentStatus: 'refunded' }, false],
    ['confirmed but payment refunded', { status: 'confirmed', paymentStatus: 'refunded' }, false],
    ['confirmed but unpaid', { status: 'confirmed', paymentStatus: 'unpaid' }, false],
    ['cancelled + paid', { status: 'cancelled', paymentStatus: 'paid' }, false],
    ['cancelled + refunded', { status: 'cancelled', paymentStatus: 'refunded' }, false],
    ['no event', { event: null }, false],
  ];
  it.each(cases)('%s -> %s', (_name, o, expected) => expect(showQr(b(o))).toBe(expected));

  it('every non-QR booking gets an explanation instead', () => {
    for (const [, o] of cases.filter((c) => !c[2])) {
      if (o.event === null) continue;
      expect(noQrNotice(b(o)).length).toBeGreaterThan(10);
    }
    expect(noQrNotice(b({ status: 'expired', paymentStatus: 'unpaid' }))).toMatch(/expired/);
    expect(noQrNotice(b({ status: 'pending', paymentStatus: 'unpaid' }))).toMatch(/once your payment/);
  });
});

describe('tabs', () => {
  it('puts a live future booking in upcoming and a past one in past', () => {
    expect(bookingTab(b({ event: future }), now)).toBe('upcoming');
    expect(bookingTab(b({ event: past }), now)).toBe('past');
  });
  it('puts expired, refunded and cancelled bookings in the cancelled tab, never upcoming', () => {
    expect(bookingTab(b({ status: 'expired', paymentStatus: 'unpaid', event: future }), now)).toBe('cancelled');
    expect(bookingTab(b({ status: 'refunded', paymentStatus: 'refunded', event: future }), now)).toBe('cancelled');
    expect(bookingTab(b({ status: 'confirmed', paymentStatus: 'refunded', event: future }), now)).toBe('cancelled');
    expect(bookingTab(b({ status: 'cancelled', event: future }), now)).toBe('cancelled');
  });
  it('keeps an unpaid pending hold for a future event under upcoming (without a QR)', () => {
    const hold = b({ status: 'pending', paymentStatus: 'unpaid', event: future });
    expect(bookingTab(hold, now)).toBe('upcoming');
    expect(showQr(hold)).toBe(false);
  });
});

describe('amount line says what happened to the money', () => {
  it('only says "paid" when it was paid', () => {
    expect(amountLabel(b()).text).toBe('₹525 paid');
    expect(amountLabel(b({ status: 'expired', paymentStatus: 'unpaid' })).text).not.toMatch(/\bpaid\b(?!,)/);
    expect(amountLabel(b({ status: 'expired', paymentStatus: 'unpaid' })).text).toMatch(/not paid/);
    expect(amountLabel(b({ status: 'pending', paymentStatus: 'unpaid' })).text).toMatch(/payment pending/);
    expect(amountLabel(b({ status: 'cancelled', paymentStatus: 'refunded' })).text).toBe('₹525 refunded');
    expect(amountLabel(b({ totalAmount: 0 })).text).toBe('Free');
  });
});

describe('.ics export', () => {
  const now = new Date('2030-03-01T08:09:10Z');
  const ics = buildIcs(b({ guestCount: 3 }), now);
  const lines = ics.split('\r\n');

  it('uses CRLF everywhere and ends with a CRLF', () => {
    expect(ics.endsWith('\r\n')).toBe(true);
    expect(ics.replace(/\r\n/g, '')).not.toMatch(/[\r\n]/);
  });
  it('has the required calendar and event properties', () => {
    for (const l of ['BEGIN:VCALENDAR', 'VERSION:2.0', 'BEGIN:VEVENT', 'END:VEVENT', 'END:VCALENDAR']) expect(lines).toContain(l);
    expect(lines.some((l) => l.startsWith('PRODID:'))).toBe(true);
    expect(lines).toContain('UID:bk1@upsosh.app');
    expect(lines).toContain('DTSTAMP:20300301T080910Z');
  });
  it('starts at the event day and time in the event city, and ends two hours later', () => {
    // 2030-03-10T01:00Z is 06:30 on 10 March in India
    expect(lines).toContain('DTSTART:20300310T063000');
    expect(lines).toContain('DTEND:20300310T083000');
    expect(DEFAULT_EVENT_HOURS).toBe(2);
  });
  it('rolls DTEND over midnight correctly', () => {
    const late = buildIcs(b({ event: { ...ev, time: '11:30 PM' } }), now).split('\r\n');
    expect(late).toContain('DTSTART:20300310T233000');
    expect(late).toContain('DTEND:20300311T013000');
  });
  it('uses the day in the event city, not the UTC day', () => {
    // 20:30Z on the 9th is 02:00 on the 10th in India
    const l = buildIcs(b({ event: { ...ev, date: '2030-03-09T20:30:00.000Z', time: '7 PM' } }), now).split('\r\n');
    expect(l).toContain('DTSTART:20300310T190000');
  });
  it('becomes an all-day event when the time cannot be read, instead of inventing one', () => {
    const l = buildIcs(b({ event: { ...ev, time: 'Evening' } }), now).split('\r\n');
    expect(l).toContain('DTSTART;VALUE=DATE:20300310');
    expect(l).toContain('DTEND;VALUE=DATE:20300311');
  });
  it('escapes commas, semicolons, backslashes and newlines in text', () => {
    expect(escapeIcsText('A, B; C\\D\nE')).toBe('A\\, B\; C\\\\D\\nE');
    const text = buildIcs(b({ event: { ...ev, title: 'Rock, Paper; Scissors', venue: 'Hall\nB' } }), now);
    expect(text).toContain('SUMMARY:Rock\\, Paper\; Scissors');
    expect(text).toContain('LOCATION:Hall\\nB\\, Delhi');
  });
  it('mentions the guest count and the event URL', () => {
    expect(ics).toContain('for 3 guests');
    expect(ics).toContain('URL:https://www.upsosh.app/events/run-club');
  });
  it('folds lines longer than 75 octets and keeps them unfoldable', () => {
    const long = buildIcs(b({ event: { ...ev, title: 'x'.repeat(200) } }), now);
    const raw = long.split('\r\n');
    expect(raw.every((l) => new TextEncoder().encode(l).length <= 75)).toBe(true);
    expect(long.replace(/\r\n /g, '')).toContain('SUMMARY:' + 'x'.repeat(200));
  });
  it('never splits a multi-byte character when folding', () => {
    const folded = foldIcsLine('SUMMARY:' + 'é'.repeat(80));
    expect(folded.replace(/\r\n /g, '')).toBe('SUMMARY:' + 'é'.repeat(80));
  });
  it('refuses a booking with no event', () => {
    expect(() => buildIcs(b({ event: null }))).toThrow();
  });
});

describe('parseEventTime', () => {
  it.each([
    ['6:30 AM', [6, 30]], ['7 PM', [19, 0]], ['12:00 AM', [0, 0]], ['12:15 PM', [12, 15]], ['19:00', [19, 0]], ['6:30 a.m.', [6, 30]],
  ])('%s', (raw, expected) => expect(parseEventTime(raw as string)).toEqual(expected));
  it.each(['', 'Evening', '25:00', '13 PM', '7:75 PM', null, undefined])('rejects %p', (raw) => expect(parseEventTime(raw as string)).toBeNull());
});

describe('icsFilename', () => {
  it('is safe and never empty', () => {
    expect(icsFilename('Sunday Run Club @ Lodhi/Garden!')).toBe('Sunday-Run-Club-LodhiGarden.ics');
    expect(icsFilename('???')).toBe('event.ics');
  });
});
