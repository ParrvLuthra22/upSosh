'use client';

import { forwardRef, InputHTMLAttributes, ReactNode, useState } from 'react';
import { cn } from '@/lib/utils';

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
  floatLabel?: boolean;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      label,
      error,
      leadingIcon,
      trailingIcon,
      floatLabel,
      onFocus,
      onBlur,
      onChange,
      value,
      defaultValue,
      ...props
    },
    ref,
  ) => {
    const [focused, setFocused] = useState(false);
    const [internalValue, setInternalValue] = useState(defaultValue ?? '');

    const hasValue =
      value !== undefined ? String(value).length > 0 : String(internalValue).length > 0;
    const isFloated = floatLabel && label && (focused || hasValue);

    return (
      <div className="w-full">
        {!floatLabel && label && (
          <label className="block text-[13px] text-cream-dim mb-1.5 font-sans">{label}</label>
        )}
        <div className="relative flex items-center">
          {leadingIcon && (
            <span className="absolute left-4 flex items-center text-cream-faint pointer-events-none z-10">
              {leadingIcon}
            </span>
          )}
          <input
            ref={ref}
            value={value}
            defaultValue={!value ? defaultValue : undefined}
            placeholder={floatLabel && label ? undefined : props.placeholder}
            onFocus={(e) => {
              setFocused(true);
              onFocus?.(e);
            }}
            onBlur={(e) => {
              setFocused(false);
              onBlur?.(e);
            }}
            onChange={(e) => {
              setInternalValue(e.target.value);
              onChange?.(e);
            }}
            className={cn(
              'h-12 w-full bg-surface border border-border rounded-xl px-4 font-sans text-[15px] text-cream placeholder:text-cream-faint transition-all outline-none',
              'focus:border-lime focus:ring-2 focus:ring-lime/20',
              error && 'border-coral ring-2 ring-coral/20',
              leadingIcon && 'pl-10',
              trailingIcon && 'pr-10',
              floatLabel && label && 'pt-5 pb-1',
              className,
            )}
            {...props}
          />
          {floatLabel && label && (
            <label
              className={cn(
                'absolute pointer-events-none transition-all duration-150 text-cream-faint',
                leadingIcon ? 'left-10' : 'left-4',
                isFloated ? 'top-2 text-[11px]' : 'top-3.5 text-[15px]',
              )}
            >
              {label}
            </label>
          )}
          {trailingIcon && (
            <span className="absolute right-4 flex items-center text-cream-faint pointer-events-none z-10">
              {trailingIcon}
            </span>
          )}
        </div>
        {error && <p className="text-[12px] text-coral mt-1.5 font-mono">{error}</p>}
      </div>
    );
  },
);

Input.displayName = 'Input';
