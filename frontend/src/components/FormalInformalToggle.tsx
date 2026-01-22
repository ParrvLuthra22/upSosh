'use client';

import React from 'react';
import { useAppStore } from '@/src/store/useAppStore';

const FormalInformalToggle = () => {
    const { isFormal, toggleMode } = useAppStore();

    return (
        <div className="flex justify-center w-full my-8">
            <div className="relative flex items-center bg-neutral-100 dark:bg-neutral-900 rounded-full p-1 border border-border">
                {/* Background slider */}
                <div
                    className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-background border border-border rounded-full shadow-sm transition-all duration-300 ease-editorial ${isFormal ? 'left-[calc(50%+2px)]' : 'left-1'
                        }`}
                />

                {/* Informal button */}
                <button
                    onClick={() => !isFormal || toggleMode()}
                    className={`relative z-10 px-8 py-2 rounded-full text-sm font-medium transition-colors duration-300 ${!isFormal ? 'text-foreground' : 'text-foreground/50 hover:text-foreground/80'
                        }`}
                >
                    Informal
                </button>

                {/* Formal button */}
                <button
                    onClick={() => isFormal || toggleMode()}
                    className={`relative z-10 px-8 py-2 rounded-full text-sm font-medium transition-colors duration-300 ${isFormal ? 'text-foreground' : 'text-foreground/50 hover:text-foreground/80'
                        }`}
                >
                    Formal
                </button>
            </div>
        </div>
    );
};

export default FormalInformalToggle;
