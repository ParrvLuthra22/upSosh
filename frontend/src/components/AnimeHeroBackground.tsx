'use client';

import React, { useEffect, useRef } from 'react';
import anime from 'animejs';

const AnimeHeroBackground = () => {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!containerRef.current) return;

        const initAnime = () => {
            // Standard import for animejs v3
            // const anime = animeModule.default || animeModule;

            // Create grid of elements
            const gridContainer = containerRef.current!;
            gridContainer.innerHTML = '';
            const width = gridContainer.clientWidth;
            const height = gridContainer.clientHeight;
            const columns = Math.floor(width / 50);
            const rows = Math.floor(height / 50);
            const total = columns * rows;

            for (let i = 0; i < total; i++) {
                const el = document.createElement('div');
                el.classList.add('anime-grid-item');
                el.style.width = '40px';
                el.style.height = '40px';
                el.style.margin = '5px';
                el.style.backgroundColor = 'rgba(59, 130, 246, 0.1)'; // Light blue tint
                el.style.borderRadius = '50%';
                gridContainer.appendChild(el);
            }

            // Animation
            anime({
                targets: '.anime-grid-item',
                scale: [
                    { value: 0.1, easing: 'easeOutSine', duration: 500 },
                    { value: 1, easing: 'easeInOutQuad', duration: 1200 }
                ],
                delay: anime.stagger(200, { grid: [columns, rows], from: 'center' }),
                loop: true,
                direction: 'alternate',
                backgroundColor: [
                    { value: 'rgba(59, 130, 246, 0.1)', duration: 500 },
                    { value: 'rgba(59, 130, 246, 0.6)', duration: 1200 } // Pulse to brighter blue
                ]
            });
        };

        initAnime();

        return () => {
            // Cleanup if possible, though animejs removal is tricky with dynamic import scope
            // For now, we just clear the container on unmount/re-run effectively by the innerHTML reset above
        };
    }, []);

    return (
        <div
            ref={containerRef}
            className="w-full h-full flex flex-wrap justify-center items-center overflow-hidden"
            style={{ perspective: '1000px' }}
        />
    );
};

export default AnimeHeroBackground;
