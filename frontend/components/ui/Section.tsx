'use client';

import { ReactNode, forwardRef } from 'react';

interface SectionProps {
  children: ReactNode;
  className?: string;
  id?: string;
}

const Section = forwardRef<HTMLElement, SectionProps>(
  ({ children, className = '', id }, ref) => {
    return (
      <section id={id} ref={ref} className={`section-padding ${className}`}>
        {children}
      </section>
    );
  }
);

Section.displayName = 'Section';

export default Section;
