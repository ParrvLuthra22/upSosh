'use client';

import { forwardRef, ReactNode } from 'react';
import { motion } from 'framer-motion';
import { cva, type VariantProps } from 'class-variance-authority';
import { IconCheck } from '@tabler/icons-react';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 font-sans font-medium select-none disabled:opacity-40 disabled:cursor-not-allowed transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime/40 relative',
  {
    variants: {
      variant: {
        primary: 'bg-lime text-void font-semibold hover:bg-lime/90',
        secondary: 'bg-surface-2 text-cream border border-border hover:bg-cream/5',
        ghost: 'text-cream-dim hover:text-cream hover:bg-cream/5',
        danger: 'border border-coral text-coral hover:bg-coral/10',
      },
      size: {
        sm: 'h-9 px-4 text-[13px] rounded-lg',
        md: 'h-11 px-6 text-[14px] rounded-xl',
        lg: 'h-13 px-8 text-[15px] rounded-xl',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  },
);

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & {
    isLoading?: boolean;
    isSuccess?: boolean;
    leftIcon?: ReactNode;
    rightIcon?: ReactNode;
    href?: string;
  };

const SpinnerIcon = () => (
  <svg
    className="animate-spin h-4 w-4 absolute"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
  >
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
    />
  </svg>
);

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      isLoading,
      isSuccess,
      leftIcon,
      rightIcon,
      children,
      href,
      disabled,
      onClick,
      ...props
    },
    ref,
  ) => {
    const classes = cn(buttonVariants({ variant, size }), className);

    const content = (
      <>
        {isLoading && <SpinnerIcon />}
        {isSuccess ? (
          <IconCheck size={16} className="text-lime" />
        ) : (
          <span className={cn('inline-flex items-center gap-2', isLoading && 'opacity-0')}>
            {leftIcon}
            {children}
            {rightIcon}
          </span>
        )}
      </>
    );

    if (href) {
      return (
        <motion.a
          href={href}
          className={classes}
          whileTap={{ scale: 0.97 }}
          transition={{ duration: 0.1 }}
        >
          {content}
        </motion.a>
      );
    }

    return (
      <motion.button
        ref={ref}
        className={classes}
        disabled={isLoading || disabled}
        whileTap={{ scale: 0.97 }}
        transition={{ duration: 0.1 }}
        onClick={onClick}
        {...(props as React.ComponentPropsWithoutRef<typeof motion.button>)}
      >
        {content}
      </motion.button>
    );
  },
);

Button.displayName = 'Button';
export default Button;
