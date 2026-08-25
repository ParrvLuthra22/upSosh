import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../src/lib/prisma';
import type { Role, HostStatus, EventStatus } from '@prisma/client';

// Deletion order matters — children before parents, per schema.prisma's
// relations (Booking -> User/Event, Event -> User/Host, HostApplication ->
// User, Upload -> User).
export async function resetDb(): Promise<void> {
  await prisma.booking.deleteMany();
  await prisma.hostApplication.deleteMany();
  await prisma.upload.deleteMany();
  await prisma.event.deleteMany();
  await prisma.host.deleteMany();
  await prisma.user.deleteMany();
}

let counter = 0;
function unique(prefix: string): string {
  counter += 1;
  return `${prefix}-${Date.now()}-${counter}`;
}

export function signToken(userId: string): string {
  return jwt.sign({ userId }, process.env.JWT_SECRET!, { expiresIn: '7d' });
}

export function authHeader(userId: string): { Authorization: string } {
  return { Authorization: `Bearer ${signToken(userId)}` };
}

interface CreateUserOptions {
  role?: Role;
  hostStatus?: HostStatus;
  password?: string;
  email?: string;
}

export async function createUser(options: CreateUserOptions = {}) {
  const plainPassword = options.password ?? 'correct-horse-battery-staple';
  const hashed = await bcrypt.hash(plainPassword, 12);
  const email = options.email ?? `${unique('user')}@example.test`;
  const user = await prisma.user.create({
    data: {
      name: 'Test User',
      email,
      username: unique('user'),
      password: hashed,
      role: options.role ?? 'user',
      hostStatus: options.hostStatus ?? 'none',
    },
  });
  return { user, plainPassword, token: signToken(user.id) };
}

interface CreateEventOptions {
  userId: string;
  price?: number;
  isFree?: boolean;
  capacity?: number;
  attendees?: number;
  status?: EventStatus;
}

export async function createEvent(options: CreateEventOptions) {
  return prisma.event.create({
    data: {
      title: unique('Test Event'),
      type: 'Meetup',
      category: 'Meetup',
      date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      time: '18:00',
      venue: 'Test Venue',
      price: options.price ?? 0,
      isFree: options.isFree ?? (options.price ?? 0) === 0,
      description: 'A test event.',
      image: 'https://example.test/image.jpg',
      capacity: options.capacity ?? 30,
      attendees: options.attendees ?? 0,
      status: options.status ?? 'live',
      userId: options.userId,
    },
  });
}

interface CreateBookingOptions {
  userId: string;
  eventId?: string;
  ticketPrice?: number;
  platformFee?: number;
  totalAmount?: number;
  status?: 'pending' | 'confirmed' | 'cancelled' | 'refunded' | 'expired';
  paymentStatus?: 'unpaid' | 'paid' | 'failed' | 'refunded';
  paymentMethod?: 'razorpay' | 'upi' | 'free' | null;
  paymentId?: string | null;
  razorpayOrderId?: string | null;
}

export async function createBooking(options: CreateBookingOptions) {
  const ticketPrice = options.ticketPrice ?? 5000;
  const platformFee = options.platformFee ?? 25;
  const bookingId = crypto.randomUUID();
  return prisma.booking.create({
    data: {
      id: bookingId,
      userId: options.userId,
      eventId: options.eventId ?? null,
      guestName: 'Test Guest',
      guestEmail: 'guest@example.test',
      guestPhone: '9999999999',
      ticketPrice,
      platformFee,
      totalAmount: options.totalAmount ?? ticketPrice + platformFee,
      status: options.status ?? 'pending',
      paymentStatus: options.paymentStatus ?? 'unpaid',
      paymentMethod: options.paymentMethod ?? null,
      paymentId: options.paymentId ?? null,
      razorpayOrderId: options.razorpayOrderId ?? null,
      qrCode: `UPSOSH-${bookingId}`,
    },
  });
}
