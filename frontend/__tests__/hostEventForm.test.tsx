import '@testing-library/jest-dom';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

const updateEvent = jest.fn();
const createEvent = jest.fn();
jest.mock('@/lib/api', () => ({
  api: { updateEvent: (...a: unknown[]) => updateEvent(...a), createEvent: (...a: unknown[]) => createEvent(...a) },
  getApiUrl: () => '',
}));
jest.mock('@/store/authStore', () => ({ useAuth: () => ({ user: { id: 'u1' } }) }));
jest.mock('next/image', () => ({ __esModule: true, default: (p: any) => <img alt={p.alt} src={p.src} /> }));

const existing: any = {
  id: 'e1', title: 'Run', type: 'informal', date: '2030-01-01', time: '07:00', venue: 'Park', hostId: 'h', price: 0,
  description: 'Easy pace.', image: 'https://images.unsplash.com/x', tags: [], isSuperhost: false,
  included: ['Chai', 'Ticket'],
};

beforeEach(() => { updateEvent.mockReset().mockResolvedValue({}); createEvent.mockReset().mockResolvedValue({}); window.alert = jest.fn(); });

describe('<HostEventForm /> What\'s included', () => {
  it('prefills the saved list, one item per line, and sends the edited list as an array', async () => {
    const Form = (await import('@/components/host/HostEventForm')).default;
    render(<Form eventToEdit={existing} />);
    const box = screen.getByLabelText(/what.s included/i) as HTMLTextAreaElement;
    expect(box.value).toBe('Chai\nTicket');
    fireEvent.change(box, { target: { name: 'includedText', value: 'Chai\n\n  Medal  \n' } });
    fireEvent.submit(box.closest('form')!);
    await waitFor(() => expect(updateEvent).toHaveBeenCalled());
    const [, payload] = updateEvent.mock.calls[0];
    expect(payload.included).toEqual(['Chai', 'Medal']);
    expect(payload).not.toHaveProperty('includedText');
  });

  it('clearing the box sends an empty list (so the section disappears)', async () => {
    const Form = (await import('@/components/host/HostEventForm')).default;
    render(<Form eventToEdit={existing} />);
    const box = screen.getByLabelText(/what.s included/i);
    fireEvent.change(box, { target: { name: 'includedText', value: '' } });
    fireEvent.submit(box.closest('form')!);
    await waitFor(() => expect(updateEvent).toHaveBeenCalled());
    expect(updateEvent.mock.calls[0][1].included).toEqual([]);
  });
});
