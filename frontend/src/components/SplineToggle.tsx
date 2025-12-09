'use client';

import React from 'react';
import { useAppStore } from '@/src/store/useAppStore';
import { useTheme } from '@/contexts/ThemeContext';

const SplineToggle = () => {
    const { isFormal, toggleMode } = useAppStore();
    const { theme } = useTheme();

    return (
        <div className="flex justify-center w-full mt-8 mb-8 relative z-50">
            <button
                onClick={toggleMode}
                className={`
                    relative w-[280px] h-[80px] rounded-full p-2 transition-all duration-500
                    border border-white/20 backdrop-blur-xl shadow-2xl
                    ${isFormal
                        ? 'bg-slate-900/80 shadow-slate-900/50'
                        : 'bg-gradient-to-r from-cyan-500/80 to-blue-600/80 shadow-cyan-500/50'
                    }
                `}
            >
                {/* Sliding Pill */}
                <div
                    className={`
                        absolute top-2 bottom-2 w-[130px] rounded-full shadow-lg transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]
                        flex items-center justify-center overflow-hidden
                        ${isFormal ? 'left-2 bg-slate-800 text-white' : 'left-[142px] bg-white text-blue-600'}
                    `}
                >
                    <span className="font-bold text-lg tracking-wide uppercase">
                        {isFormal ? 'Formal' : 'Party'}
                    </span>

                    {/* Glossy Effect */}
                    <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent pointer-events-none" />
                </div>

                {/* Labels under the switch area */}
                <div className="absolute inset-0 flex justify-between items-center px-10 pointer-events-none">
                    <span className={`font-medium transition-colors duration-300 ${!isFormal ? 'text-white/50' : 'text-transparent'}`}>
                        Formal
                    </span>
                    <span className={`font-medium transition-colors duration-300 ${isFormal ? 'text-white/50' : 'text-transparent'}`}>
                        Party
                    </span>
                </div>
            </button>
        </div>
    );
};

export default SplineToggle;
