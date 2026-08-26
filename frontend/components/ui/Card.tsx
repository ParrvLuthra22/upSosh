'use client';

import { forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

export const cardVariants = cva('rounded-2xl border transition-colors', {
  variants: {
    surface: {
      base: 'bg-surface border-border',
      raised: 'bg-surface-2 border-border-strong',
    },
    interactive: {
      true: 'hover:bg-surface-2 hover:border-border-strong cursor-pointer',
      false: '',
    },
    padding: {
      none: 'p-0',
      sm: 'p-4',
      md: 'p-5',
      lg: 'p-6',
    },
  },
  defaultVariants: {
    surface: 'base',
    interactive: false,
    padding: 'md',
  },
});

type CardProps = React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof cardVariants>;

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, surface, interactive, padding, ...props }, ref) => (
    <div ref={ref} className={cn(cardVariants({ surface, interactive, padding }), className)} {...props} />
  ),
);

Card.displayName = 'Card';
export default Card;
