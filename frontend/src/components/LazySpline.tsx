'use client';

import React, { useState, useEffect, Suspense } from 'react';

// Lazy load the actual SplineScene component (which lazily loads @splinetool/react-spline)
// We can just reuse the existing SplineScene logic or make a new wrapper.
// The plan said "Wraps SplineScene with React.lazy".
// However, SplineScene already has some lazy loading logic inside it (from previous view).
// Let's make LazySpline a wrapper that imports SplineScene dynamically.

const SplineScene = React.lazy(() => import('./SplineScene'));

interface LazySplineProps {
    scene: string;
    className?: string;
}

const LazySpline: React.FC<LazySplineProps> = ({ scene, className }) => {
    const [shouldLoad, setShouldLoad] = useState(false);

    useEffect(() => {
        // Defer loading until the browser is idle
        if ('requestIdleCallback' in window) {
            const handle = window.requestIdleCallback(() => {
                setShouldLoad(true);
            });
            return () => window.cancelIdleCallback(handle);
        } else {
            // Fallback for browsers that don't support requestIdleCallback
            const timeout = setTimeout(() => setShouldLoad(true), 2000); // Delay a bit more to prioritize LCP
            return () => clearTimeout(timeout);
        }
    }, []);

    return (
        <div className={`relative w-full h-full ${className}`}>
            {shouldLoad ? (
                <Suspense
                    fallback={
                        <div className="flex items-center justify-center w-full h-full bg-surface/50 animate-pulse rounded-3xl">
                            <span className="text-text-muted text-sm">Loading 3D Experience...</span>
                        </div>
                    }
                >
                    <SplineScene scene={scene} />
                </Suspense>
            ) : (
                <div className="flex items-center justify-center w-full h-full bg-surface/50 rounded-3xl">
                    {/* Placeholder or nothing */}
                </div>
            )}
        </div>
    );
};

export default LazySpline;
