'use client';

import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import {
  IconRosetteDiscountCheck,
  IconStar,
  IconCheck,
} from '@tabler/icons-react';
import { cn } from '@/lib/utils';

type BadgeVariant = 'verified' | 'superhost' | 'confirmed' | 'pending' | 'category';

type BadgeProps = {
  variant: BadgeVariant;
  children: ReactNode;
  className?: string;
};

const variantConfig: Record<
  BadgeVariant,
  { classes: string; icon?: ReactNode }
> = {
  verified: {
    classes: 'bg-lime/15 text-lime border border-lime/30',
    icon: <IconRosetteDiscountCheck size={12} />,
  },
  superhost: {
    classes: 'bg-coral/15 text-coral border border-coral/30',
    icon: <IconStar size={12} />,
  },
  confirmed: {
    classes: 'bg-emerald/15 text-emerald border border-emerald/30',
    icon: <IconCheck size={12} />,
  },
  pending: {
    classes: 'bg-cream/10 text-cream-dim border border-border',
  },
  category: {
    classes:
      'bg-border text-cream-dim font-mono text-[10px] tracking-widest uppercase border-0',
  },
};

export const Badge = ({ variant, children, className }: BadgeProps) => {
  const config = variantConfig[variant];

  return (
    <motion.span
      initial={{ scale: 0.7, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
      className={cn(
        'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium font-mono',
        config.classes,
        className,
      )}
    >
      {config.icon}
      {children}
    </motion.span>
  );
};
