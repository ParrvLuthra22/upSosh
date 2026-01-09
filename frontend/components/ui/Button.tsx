'use client';

import { motion } from 'framer-motion';
import { ReactNode, ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  href?: string;
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  onClick,
  href,
  className = '',
  ...props
}: ButtonProps) {
  // Removed scale from base - using subtle translateY instead
  const baseClasses = 'inline-flex items-center justify-center font-semibold rounded-full';
  const fontStyle = { fontFamily: 'var(--font-roboto-bbh)' };
  
  // Smooth transitions with mustard accents
  const variantClasses = {
    primary: 'bg-[#D4A017] text-black transition-all duration-300 ease-in-out hover:bg-[#E5B020] hover:shadow-[0_4px_20px_rgba(212,160,23,0.25)]',
    secondary: 'border-2 border-[#D4A017] text-[#D4A017] transition-all duration-300 ease-in-out hover:bg-[#D4A017] hover:text-black',
    ghost: 'text-white/60 transition-colors duration-300 ease-in-out hover:text-[#D4A017]',
  };
  
  const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-8 py-4 text-base',
    lg: 'px-10 py-5 text-lg',
  };

  const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;

  // Subtle motion - translateY only, no aggressive scaling
  const hoverAnimation = {
    y: -2,
    transition: { duration: 0.25, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] }
  };
  
  const tapAnimation = {
    y: 0,
    transition: { duration: 0.15, ease: 'easeOut' as const }
  };

  if (href) {
    return (
      <motion.a
        href={href}
        className={classes}
        style={fontStyle}
        whileHover={hoverAnimation}
        whileTap={tapAnimation}
      >
        {children}
      </motion.a>
    );
  }

  return (
    <motion.button
      type={props.type}
      disabled={props.disabled}
      onClick={onClick}
      className={classes}
      style={fontStyle}
      whileHover={hoverAnimation}
      whileTap={tapAnimation}
    >
      {children}
    </motion.button>
  );
}
