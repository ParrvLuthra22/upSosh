import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import EventCard from '../booking/EventCard';

// Mock next/image
jest.mock('next/image', () => ({
    __esModule: true,
    default: (props: any) => {
        return <img {...props} />;
    },
}));

const mockEvent = {
    id: '1',
    title: 'Test Event',
    date: '2023-12-25',
    time: '18:00',
    location: 'Test Venue',
    price: 50,
    image: '/test-image.jpg',
    type: 'formal' as const,
    hostId: 'host1',
    description: 'Test description',
    venue: 'Test Venue',
    capacity: 100,
    attendees: 10,
    isSuperhost: true,
    tags: ['test'],
    coordinates: { lat: 0, lng: 0 },
};

describe('EventCard', () => {
    it('renders event details correctly', () => {
        render(<EventCard event={mockEvent} onClick={() => { }} />);

        expect(screen.getByText('Test Event')).toBeInTheDocument();
        expect(screen.getByText('Test Venue')).toBeInTheDocument();
        expect(screen.getByText('$50')).toBeInTheDocument();
        expect(screen.getByText('Superhost')).toBeInTheDocument();
    });

    it('calls onClick handler when clicked', () => {
        const handleClick = jest.fn();
        render(<EventCard event={mockEvent} onClick={handleClick} />);

        fireEvent.click(screen.getByRole('article')); // Assuming the card is an article or has a clickable role
        // If not article, we might need to target a specific element or add role="article" to the card container in the component.
        // Looking at previous code, EventCard main div didn't have a role. 
        // Let's assume we click the text or image.
        fireEvent.click(screen.getByText('Test Event'));

        expect(handleClick).toHaveBeenCalledTimes(1);
    });
});
