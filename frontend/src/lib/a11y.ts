import { useEffect } from 'react';

/**
 * Hook to trap focus within a container when active.
 * @param ref React ref to the container element
 * @param isActive Boolean indicating if the trap should be active
 */
export const useFocusTrap = (ref: React.RefObject<HTMLElement | null>, isActive: boolean) => {
    useEffect(() => {
        if (!isActive || !ref.current) return;

        const focusableElements = ref.current.querySelectorAll(
            'a[href], button, textarea, input[type="text"], input[type="radio"], input[type="checkbox"], select'
        );
        const firstElement = focusableElements[0] as HTMLElement;
        const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

        const handleTab = (e: KeyboardEvent) => {
            if (e.key === 'Tab') {
                if (e.shiftKey) {
                    if (document.activeElement === firstElement) {
                        e.preventDefault();
                        lastElement.focus();
                    }
                } else {
                    if (document.activeElement === lastElement) {
                        e.preventDefault();
                        firstElement.focus();
                    }
                }
            }
        };

        ref.current.addEventListener('keydown', handleTab);

        // Focus the first element when activated
        if (firstElement) {
            firstElement.focus();
        }

        return () => {
            ref.current?.removeEventListener('keydown', handleTab);
        };
    }, [isActive, ref]);
};

/**
 * Hook to handle Escape key press.
 * @param handler Function to call when Escape is pressed
 * @param isActive Boolean indicating if the listener should be active
 */
export const useEscapeKey = (handler: () => void, isActive: boolean = true) => {
    useEffect(() => {
        if (!isActive) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                handler();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handler, isActive]);
};
