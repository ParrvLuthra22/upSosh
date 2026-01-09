'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion, useInView, Variants } from 'framer-motion';

type AnimationType = 'fade-up' | 'fade-in' | 'slide-left' | 'slide-right' | 'letter-reveal' | 'word-reveal' | 'scale-in' | 'typewriter';

interface AnimatedTextProps {
  children: string;
  animation?: AnimationType;
  delay?: number;
  duration?: number;
  className?: string;
  as?: 'span' | 'p' | 'h1' | 'h2' | 'h3' | 'div';
  once?: boolean; // Only animate once when in view
  staggerDelay?: number; // For letter/word reveal
}

// Animation variants for different effects
const fadeUpVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const fadeInVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

const slideLeftVariants: Variants = {
  hidden: { opacity: 0, x: -30 },
  visible: { opacity: 1, x: 0 },
};

const slideRightVariants: Variants = {
  hidden: { opacity: 0, x: 30 },
  visible: { opacity: 1, x: 0 },
};

const scaleInVariants: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1 },
};

const letterRevealVariants: Variants = {
  hidden: { opacity: 0, y: 10, filter: 'blur(4px)' },
  visible: { opacity: 1, y: 0, filter: 'blur(0px)' },
};

const getVariants = (type: AnimationType): Variants => {
  switch (type) {
    case 'fade-up':
      return fadeUpVariants;
    case 'fade-in':
      return fadeInVariants;
    case 'slide-left':
      return slideLeftVariants;
    case 'slide-right':
      return slideRightVariants;
    case 'scale-in':
      return scaleInVariants;
    case 'letter-reveal':
    case 'word-reveal':
      return letterRevealVariants;
    default:
      return fadeUpVariants;
  }
};

/**
 * AnimatedText - Premium animated text component using Jersey 10 font
 * 
 * Usage:
 * <AnimatedText animation="fade-up">Switch Up</AnimatedText>
 * <AnimatedText animation="word-reveal" as="h2">Your Experience</AnimatedText>
 * <AnimatedText animation="letter-reveal" staggerDelay={0.03}>PREMIUM</AnimatedText>
 */
export default function AnimatedText({
  children,
  animation = 'fade-up',
  delay = 0,
  duration = 0.6,
  className = '',
  as: Tag = 'span',
  once = true,
  staggerDelay = 0.05,
}: AnimatedTextProps) {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once, margin: '-50px' });
  
  // Base styles for Jersey 10 animated text in mustard
  const baseStyles = 'font-display text-[#D4A017] inline-block';
  
  // Typewriter effect
  if (animation === 'typewriter') {
    return (
      <motion.span
        ref={ref as React.RefObject<HTMLSpanElement>}
        className={`${baseStyles} ${className}`}
        style={{ fontFamily: 'var(--font-jersey)' }}
        initial={{ width: 0 }}
        animate={isInView ? { width: 'auto' } : { width: 0 }}
        transition={{
          duration: duration * 2,
          delay,
          ease: [0.16, 1, 0.3, 1],
        }}
      >
        <span className="overflow-hidden whitespace-nowrap inline-block">
          {children}
        </span>
      </motion.span>
    );
  }

  // Letter-by-letter reveal
  if (animation === 'letter-reveal') {
    const letters = children.split('');
    return (
      <span 
        ref={ref as React.RefObject<HTMLSpanElement>}
        className={`${baseStyles} ${className}`}
        style={{ fontFamily: 'var(--font-jersey)' }}
      >
        {letters.map((letter, index) => (
          <motion.span
            key={index}
            className="inline-block"
            variants={letterRevealVariants}
            initial="hidden"
            animate={isInView ? 'visible' : 'hidden'}
            transition={{
              duration: 0.4,
              delay: delay + index * staggerDelay,
              ease: [0.16, 1, 0.3, 1],
            }}
            style={{ 
              display: letter === ' ' ? 'inline' : 'inline-block',
              minWidth: letter === ' ' ? '0.25em' : 'auto',
            }}
          >
            {letter === ' ' ? '\u00A0' : letter}
          </motion.span>
        ))}
      </span>
    );
  }

  // Word-by-word reveal
  if (animation === 'word-reveal') {
    const words = children.split(' ');
    return (
      <Tag 
        ref={ref as any}
        className={`${baseStyles} ${className}`}
        style={{ fontFamily: 'var(--font-jersey)' }}
      >
        {words.map((word, index) => (
          <motion.span
            key={index}
            className="inline-block mr-[0.25em]"
            variants={letterRevealVariants}
            initial="hidden"
            animate={isInView ? 'visible' : 'hidden'}
            transition={{
              duration: 0.5,
              delay: delay + index * (staggerDelay * 2),
              ease: [0.16, 1, 0.3, 1],
            }}
          >
            {word}
          </motion.span>
        ))}
      </Tag>
    );
  }

  // Standard animations (fade-up, fade-in, slide-left, slide-right, scale-in)
  const variants = getVariants(animation);
  
  const MotionTag = motion[Tag as keyof typeof motion] as any;

  return (
    <MotionTag
      ref={ref}
      className={`${baseStyles} ${className}`}
      style={{ fontFamily: 'var(--font-jersey)' }}
      variants={variants}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      transition={{
        duration,
        delay,
        ease: [0.16, 1, 0.3, 1],
      }}
    >
      {children}
    </MotionTag>
  );
}

/**
 * AnimatedHeadline - For hero sections with mixed static and animated text
 */
export function AnimatedHeadline({
  staticText,
  animatedText,
  animation = 'fade-up',
  delay = 0.3,
  className = '',
}: {
  staticText?: string;
  animatedText: string;
  animation?: AnimationType;
  delay?: number;
  className?: string;
}) {
  return (
    <span className={className}>
      {staticText && <span className="text-white">{staticText} </span>}
      <AnimatedText animation={animation} delay={delay}>
        {animatedText}
      </AnimatedText>
    </span>
  );
}

/**
 * AnimatedCallout - For short emphasis phrases
 */
export function AnimatedCallout({
  children,
  className = '',
  delay = 0,
}: {
  children: string;
  className?: string;
  delay?: number;
}) {
  return (
    <AnimatedText 
      animation="scale-in" 
      delay={delay}
      className={`text-lg md:text-xl ${className}`}
    >
      {children}
    </AnimatedText>
  );
}
