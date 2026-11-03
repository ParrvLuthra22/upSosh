// Uses the real email module (not the manual mock) with only the Resend SDK mocked.
const send = jest.fn().mockResolvedValue({});
jest.mock('resend', () => ({ Resend: jest.fn().mockImplementation(() => ({ emails: { send } })) }));

import { sendBookingConfirmation, sendEventAnnouncement } from '../src/lib/email';

const EVIL = '<img src=x onerror=alert(1)>"\'&';

beforeEach(() => {
  send.mockClear();
  process.env.RESEND_API_KEY = 're_test_key_for_unit_test';
});
afterAll(() => {
  delete process.env.RESEND_API_KEY;
});

describe('AZ-2: user-supplied values are escaped in emails', () => {
  it('booking confirmation escapes every interpolated value', async () => {
    await sendBookingConfirmation({
      guestName: EVIL, guestEmail: 'guest@example.test', eventTitle: EVIL, eventDate: EVIL, eventTime: EVIL,
      eventVenue: EVIL, bookingId: EVIL, totalAmount: 500, qrCode: EVIL, isFree: false,
    });

    const { html, subject } = send.mock.calls[0][0];
    expect(html).not.toContain('<img');
    expect(html).toContain('&lt;img src=x onerror=alert(1)&gt;');
    expect(subject).not.toMatch(/[\r\n]/);
  });

  it('a newline in the title cannot reach the subject header', async () => {
    await sendBookingConfirmation({
      guestName: 'G', guestEmail: 'guest@example.test', eventTitle: 'Title\r\nBcc: someone@example.test',
      eventDate: 'd', eventTime: 't', eventVenue: 'v', bookingId: 'b', totalAmount: 0, qrCode: 'q', isFree: true,
    });
    expect(send.mock.calls[0][0].subject).not.toMatch(/[\r\n]/);
  });

  it('announcement escapes name, title and message (and keeps its subject single-line)', async () => {
    await sendEventAnnouncement({ guestName: EVIL, guestEmail: 'guest@example.test', eventTitle: `${EVIL}\nx`, message: EVIL });

    const { html, subject } = send.mock.calls[0][0];
    expect(html).not.toContain('<img');
    expect(subject).not.toMatch(/[\r\n]/);
  });
});
