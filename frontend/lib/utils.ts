import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatINR(amount: number): string {
  return `₹${amount.toLocaleString('en-IN')}`;
}

// The `price === 'Free' ? 0 : price` pattern for a field typed `number | 'Free'`.
export function unitPrice(price: number | 'Free'): number {
  return price === 'Free' ? 0 : price;
}
