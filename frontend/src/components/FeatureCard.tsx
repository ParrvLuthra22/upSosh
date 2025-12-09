'use client';

import React, { useRef, useState } from 'react';
import gsap from 'gsap';

interface FeatureCardProps {
    title: string;
    description: string;
    icon: React.ReactNode;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ title, description, icon }) => {
    const cardRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const iconRef = useRef<HTMLDivElement>(null);
    const [isHovered, setIsHovered] = useState(false);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!cardRef.current) return;

        const rect = cardRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = ((y - centerY) / centerY) * -10; // Max 10 deg rotation
        const rotateY = ((x - centerX) / centerX) * 10;

        gsap.to(cardRef.current, {
            rotateX: rotateX,
            rotateY: rotateY,
            duration: 0.5,
            ease: 'power2.out',
            transformPerspective: 1000,
        });
    };

    const handleMouseEnter = () => {
        setIsHovered(true);
        gsap.to(iconRef.current, {
            scale: 1.2,
            rotate: 12,
            duration: 0.4,
            ease: 'back.out(1.7)',
        });
        gsap.to(contentRef.current, {
            y: -5,
            duration: 0.3,
        });
    };

    const handleMouseLeave = () => {
        setIsHovered(false);
        gsap.to(cardRef.current, {
            rotateX: 0,
            rotateY: 0,
            duration: 0.5,
            ease: 'power2.out',
        });
        gsap.to(iconRef.current, {
            scale: 1,
            rotate: 0,
            duration: 0.4,
            ease: 'power2.out',
        });
        gsap.to(contentRef.current, {
            y: 0,
            duration: 0.3,
        });
    };

    return (
        <div
            ref={cardRef}
            onMouseMove={handleMouseMove}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            className="relative w-full h-full min-h-[300px] rounded-3xl bg-surface/30 backdrop-blur-md border border-white/10 p-8 overflow-hidden group transition-colors hover:bg-surface/50"
            style={{ transformStyle: 'preserve-3d' }}
        >
            {/* Glow Effect */}
            <div
                className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{ transform: 'translateZ(-1px)' }}
            />

            <div ref={contentRef} className="relative z-10 h-full flex flex-col justify-between">
                <div
                    ref={iconRef}
                    className="w-16 h-16 rounded-2xl bg-surface-highlight flex items-center justify-center text-primary mb-6 shadow-lg shadow-primary/10"
                >
                    {icon}
                </div>

                <div>
                    <h3 className="text-2xl font-heading font-bold text-text-primary mb-3 group-hover:text-primary transition-colors">
                        {title}
                    </h3>
                    <p
                        className={`text-text-secondary leading-relaxed transition-all duration-300 ${isHovered ? 'opacity-100 translate-y-0' : 'opacity-70 translate-y-2'
                            }`}
                    >
                        {description}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default FeatureCard;
