'use client';

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Button } from './Button';

interface EmptyStateAction {
  label: string;
  href?: string;
  onClick?: () => void;
}

interface EmptyStateProps {
  icon?: ReactNode;
  heading: string;
  description?: string;
  action?: EmptyStateAction;
  className?: string;
  headingClassName?: string;
  descriptionClassName?: string;
}

export function EmptyState({
  icon,
  heading,
  description,
  action,
  className,
  headingClassName,
  descriptionClassName,
}: EmptyStateProps) {
  return (
    <div className={cn('py-28 flex flex-col items-center text-center', className)}>
      {icon && <div className="mb-5">{icon}</div>}
      <p className={cn('font-display text-[32px] text-cream mb-3', headingClassName)}>{heading}</p>
      {description && (
        <p className={cn('font-sans text-[15px] text-cream-dim mb-8 max-w-sm', descriptionClassName)}>
          {description}
        </p>
      )}
      {action && (
        <Button
          variant="primary"
          shape="pill"
          href={action.href}
          onClick={action.onClick}
        >
          {action.label}
        </Button>
      )}
    </div>
  );
}

export default EmptyState;
