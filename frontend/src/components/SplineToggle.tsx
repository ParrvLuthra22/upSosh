'use client';

import React from 'react';
import { useAppStore } from '@/src/store/useAppStore';

const SplineToggle = () => {
    const { isFormal, toggleMode } = useAppStore();

    return (
        <div className="flex justify-center w-full my-8 relative z-50">
            <div className="relative flex items-center bg-black border border-white/20 rounded-full p-1">
                {/* Background slider */}
                <div
                    className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-[#D4A017] rounded-full transition-all duration-300 ease-out ${
                        isFormal ? 'left-[calc(50%+2px)]' : 'left-1'
                    }`}
                />

                {/* Informal button */}
                <button
                    onClick={() => !isFormal || toggleMode()}
                    className={`relative z-10 px-6 py-2 text-sm font-medium rounded-full transition-colors duration-300 ${
                        !isFormal ? 'text-black' : 'text-white/70 hover:text-white'
                    }`}
                >
                    Informal
                </button>

                {/* Formal button */}
                <button
                    onClick={() => isFormal || toggleMode()}
                    className={`relative z-10 px-6 py-2 text-sm font-medium rounded-full transition-colors duration-300 ${
                        isFormal ? 'text-black' : 'text-white/70 hover:text-white'
                    }`}
                >
                    Formal
                </button>
            </div>
        </div>
    );
};

export default SplineToggle;
