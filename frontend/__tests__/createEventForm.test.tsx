import '@testing-library/jest-dom';
import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import CreateEventForm from '@/components/host/create/CreateEventForm';

jest.mock('next/image', () => ({ __esModule: true, default: (p: any) => <img alt={p.alt} src={p.src} /> }));
jest.mock('@/lib/api', () => ({ getApiUrl: () => '' }));
const httpFetch = jest.fn();
jest.mock('@/lib/http', () => ({ httpFetch: (...a: any[]) => httpFetch(...a), describeError: (e: any, f: string) => (e?.message ?? f) }));

const NOW = new Date('2026-11-04T10:00:00Z');
let alertSpy: jest.SpyInstance;
beforeEach(() => { httpFetch.mockReset(); alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {}); });
afterEach(() => alertSpy.mockRestore());

function setup() {
  const onSubmit = jest.fn().mockResolvedValue(undefined);
  render(<CreateEventForm onSubmit={onSubmit} now={NOW} />);
  return onSubmit;
}
const openRow = (name: RegExp | string) => fireEvent.click(screen.getByRole('button', { name }));

async function fillRequired() {
  fireEvent.change(screen.getByLabelText('Event name'), { target: { value: 'Sunday Run Club' } });
  openRow(/add location/i);
  fireEvent.change(screen.getByLabelText('Venue or area'), { target: { value: 'Lodhi Garden' } });
  fireEvent.click(screen.getByRole('button', { name: 'Done' }));
  await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
}

describe('layout and defaults', () => {
  it('starts with tomorrow, 6:00 PM, IST chip, Free, 20, and the gradient cover placeholder', () => {
    setup();
    expect(screen.getByLabelText('Date')).toHaveValue('2026-11-05');
    expect(screen.getByLabelText('Time')).toHaveValue('18:00');
    expect(screen.getByText('IST')).toBeInTheDocument();
    expect(screen.getByText('Free')).toBeInTheDocument();
    expect(screen.getByText('20')).toBeInTheDocument();
    expect(screen.getByTestId('cover-placeholder')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Create event' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Save as draft' })).toBeInTheDocument();
  });
});

describe('validation', () => {
  it('Create with nothing filled says what is missing, sends nothing, and never uses alert()', () => {
    const onSubmit = setup();
    fireEvent.click(screen.getByRole('button', { name: 'Create event' }));
    expect(screen.getAllByRole('alert').map((a) => a.textContent).join(' ')).toContain('Add event name and location to continue');
    expect(onSubmit).not.toHaveBeenCalled();
    expect(alertSpy).not.toHaveBeenCalled();
    expect(screen.getByLabelText('Event name')).toHaveFocus();
  });
  it('Save as draft needs the same three fields', () => {
    const onSubmit = setup();
    fireEvent.click(screen.getByRole('button', { name: 'Save as draft' }));
    expect(onSubmit).not.toHaveBeenCalled();
  });
});

describe('submitting', () => {
  it('sends the payload for a free live event', async () => {
    const onSubmit = setup();
    await fillRequired();
    fireEvent.click(screen.getByRole('button', { name: 'Create event' }));
    await waitFor(() => expect(onSubmit).toHaveBeenCalled());
    expect(onSubmit.mock.calls[0][0]).toMatchObject({
      title: 'Sunday Run Club', venue: 'Lodhi Garden', date: '2026-11-05', time: '18:00',
      isFree: true, price: 0, capacity: 20, type: 'Meetup', category: 'Meetup', status: 'live', included: [],
    });
    expect(onSubmit.mock.calls[0][1]).toBe(false);
  });

  it('Save as draft sends status draft', async () => {
    const onSubmit = setup();
    await fillRequired();
    fireEvent.click(screen.getByRole('button', { name: 'Save as draft' }));
    await waitFor(() => expect(onSubmit).toHaveBeenCalled());
    expect(onSubmit.mock.calls[0][0].status).toBe('draft');
    expect(onSubmit.mock.calls[0][1]).toBe(true);
  });

  it('shows the server error inline with Retry, and Retry resends', async () => {
    const onSubmit = jest.fn().mockRejectedValueOnce(new Error('Description is required')).mockResolvedValue(undefined);
    render(<CreateEventForm onSubmit={onSubmit} now={NOW} />);
    await fillRequired();
    fireEvent.click(screen.getByRole('button', { name: 'Create event' }));
    const alert = await screen.findByText('Description is required');
    expect(alert.closest('[role="alert"]')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Retry' }));
    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(2));
    await waitFor(() => expect(screen.queryByText('Description is required')).toBeNull());
  });

  it('disables the buttons while saving', async () => {
    let release!: () => void;
    const onSubmit = jest.fn(() => new Promise<void>((r) => { release = r; }));
    render(<CreateEventForm onSubmit={onSubmit} now={NOW} />);
    await fillRequired();
    fireEvent.click(screen.getByRole('button', { name: 'Create event' }));
    const busy = await screen.findByRole('button', { name: 'Creating…' });
    expect(busy).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Save as draft' })).toBeDisabled();
    release();
    await waitFor(() => expect(screen.getByRole('button', { name: 'Create event' })).toBeEnabled());
  });
});

describe('modals', () => {
  it('Esc closes without saving; Done saves; backdrop closes without saving', async () => {
    setup();
    openRow(/add location/i);
    fireEvent.change(screen.getByLabelText('Venue or area'), { target: { value: 'Nope' } });
    fireEvent.keyDown(document, { key: 'Escape' });
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    expect(screen.getByText('Add location')).toBeInTheDocument();

    openRow(/add location/i);
    fireEvent.change(screen.getByLabelText('Venue or area'), { target: { value: 'Also nope' } });
    fireEvent.click(screen.getByTestId('modal-backdrop'));
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    expect(screen.getByText('Add location')).toBeInTheDocument();

    openRow(/add location/i);
    fireEvent.change(screen.getByLabelText('Venue or area'), { target: { value: 'Lodhi Garden' } });
    fireEvent.click(screen.getByRole('button', { name: 'Done' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    expect(screen.getByText('Lodhi Garden')).toBeInTheDocument();
  });

  it('is a labelled modal dialog that traps Tab and focuses its field', async () => {
    setup();
    openRow(/add location/i);
    const dialog = screen.getByRole('dialog', { name: 'Location' });
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    const input = within(dialog).getByLabelText('Venue or area');
    expect(input).toHaveFocus();
    const done = within(dialog).getByRole('button', { name: 'Done' });
    done.focus();
    fireEvent.keyDown(done, { key: 'Tab' });
    expect(within(dialog).getByRole('button', { name: 'Close' })).toHaveFocus(); // wrapped to first control
    fireEvent.keyDown(document.activeElement!, { key: 'Tab', shiftKey: true });
    expect(done).toHaveFocus(); // and back
  });

  it('description modal saves the text and the row shows it', async () => {
    setup();
    openRow(/add description/i);
    fireEvent.change(screen.getByLabelText('Tell people what to expect'), { target: { value: 'Easy 5k then chai.' } });
    fireEvent.click(screen.getByRole('button', { name: 'Done' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    expect(screen.getByText('Easy 5k then chai.')).toBeInTheDocument();
  });

  it('has no "Suggest with AI" (no reusable /api/ai/plan helper)', () => {
    setup();
    openRow(/add description/i);
    expect(screen.queryByText(/suggest with ai/i)).toBeNull();
  });

  it('category picker selects and closes', async () => {
    const onSubmit = setup();
    openRow(/^Category/);
    fireEvent.click(screen.getByRole('radio', { name: 'Run Club' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    await fillRequired();
    fireEvent.click(screen.getByRole('button', { name: 'Create event' }));
    await waitFor(() => expect(onSubmit).toHaveBeenCalled());
    expect(onSubmit.mock.calls[0][0]).toMatchObject({ category: 'Run Club', type: 'Run Club' });
  });

  it('tickets: Paid needs a price, shows the ₹25 fee note, and saves paid price', async () => {
    const onSubmit = setup();
    openRow(/^Tickets/);
    expect(screen.getByText(/flat ₹25 platform fee applies per booking/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('radio', { name: 'Paid' }));
    fireEvent.click(screen.getByRole('button', { name: 'Done' }));
    expect(screen.getByRole('alert')).toHaveTextContent(/at least ₹1/); // stays open
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Ticket price (₹)'), { target: { value: '500' } });
    fireEvent.click(screen.getByRole('button', { name: 'Done' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    expect(screen.getByText('₹500')).toBeInTheDocument();
    await fillRequired();
    fireEvent.click(screen.getByRole('button', { name: 'Create event' }));
    await waitFor(() => expect(onSubmit).toHaveBeenCalled());
    expect(onSubmit.mock.calls[0][0]).toMatchObject({ isFree: false, price: 500 });
  });

  it('capacity accepts 2..500 only', async () => {
    setup();
    openRow(/^Capacity/);
    const input = screen.getByLabelText('Maximum guests');
    fireEvent.change(input, { target: { value: '1' } });
    fireEvent.click(screen.getByRole('button', { name: 'Done' }));
    expect(screen.getByRole('alert')).toHaveTextContent(/between 2 and 500/);
    fireEvent.change(input, { target: { value: '60' } });
    fireEvent.click(screen.getByRole('button', { name: 'Done' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    expect(screen.getByText('60')).toBeInTheDocument();
  });

  it("what's included is optional and is sent as one item per line", async () => {
    const onSubmit = setup();
    openRow(/^What's included/);
    fireEvent.change(screen.getByLabelText(/one item per line/i), { target: { value: 'Chai\nTicket' } });
    fireEvent.click(screen.getByRole('button', { name: 'Done' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    await fillRequired();
    fireEvent.click(screen.getByRole('button', { name: 'Create event' }));
    await waitFor(() => expect(onSubmit).toHaveBeenCalled());
    expect(onSubmit.mock.calls[0][0].included).toEqual(['Chai', 'Ticket']);
  });
});

describe('cover image', () => {
  it('paste URL: an unsupported host is an inline error, a Cloudinary/Unsplash URL becomes the cover', () => {
    setup();
    fireEvent.click(screen.getByRole('button', { name: /add image/i }));
    fireEvent.click(screen.getByRole('button', { name: /paste image url/i }));
    fireEvent.change(screen.getByLabelText('Image URL'), { target: { value: 'https://evil.example/x.png' } });
    fireEvent.click(screen.getByRole('button', { name: 'Use this image' }));
    expect(screen.getByRole('alert')).toHaveTextContent(/aren't supported/);
    fireEvent.change(screen.getByLabelText('Image URL'), { target: { value: 'https://images.unsplash.com/photo-1' } });
    fireEvent.click(screen.getByRole('button', { name: 'Use this image' }));
    expect(screen.getByAltText('Event cover')).toHaveAttribute('src', 'https://images.unsplash.com/photo-1');
    expect(screen.queryByTestId('cover-placeholder')).toBeNull();
  });

  it('upload posts the file and uses the returned URL; a failure is shown with Try again', async () => {
    setup();
    const file = new File(['x'], 'c.png', { type: 'image/png' });
    httpFetch.mockResolvedValueOnce({ ok: false, status: 500, json: async () => ({ message: 'Storage down' }) });
    fireEvent.change(screen.getByTestId('cover-file'), { target: { files: [file] } });
    expect(await screen.findByText(/Storage down/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Try again' })).toBeInTheDocument();
    httpFetch.mockResolvedValueOnce({ ok: true, status: 200, json: async () => ({ url: 'https://res.cloudinary.com/x/y.png' }) });
    fireEvent.change(screen.getByTestId('cover-file'), { target: { files: [file] } });
    await waitFor(() => expect(screen.getByAltText('Event cover')).toHaveAttribute('src', 'https://res.cloudinary.com/x/y.png'));
    expect(httpFetch.mock.calls[1][0]).toBe('/api/uploads');
    expect(httpFetch.mock.calls[1][1].body).toBeInstanceOf(FormData);
  });
});
