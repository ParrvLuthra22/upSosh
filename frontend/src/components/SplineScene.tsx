'use client';

import React, { useState, useEffect, Suspense } from 'react';

const Spline = React.lazy(() => import('@splinetool/react-spline'));

interface SplineSceneProps extends React.ComponentProps<typeof Spline> {
    scene: string;
    className?: string;
}

const SplineScene: React.FC<SplineSceneProps> = ({ scene, className, ...props }) => {
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
            const timeout = setTimeout(() => setShouldLoad(true), 1000);
            return () => clearTimeout(timeout);
        }
    }, []);

    return (
        <div className={`relative w-full h-full ${className}`}>
            {shouldLoad && (
                <Suspense
                    fallback={
                        <div className="flex items-center justify-center w-full h-full bg-surface/50 animate-pulse rounded-3xl">
                            <span className="text-text-muted text-sm">Loading 3D Scene...</span>
                        </div>
                    }
                >
                    <Spline scene={scene} {...props} />
                </Suspense>
            )}
            {!shouldLoad && (
                <div className="flex items-center justify-center w-full h-full bg-surface/50 rounded-3xl">
                    <span className="text-text-muted text-sm">Waiting for idle...</span>
                </div>
            )}
        </div>
    );
};

export default SplineScene;
