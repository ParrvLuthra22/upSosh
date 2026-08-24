import { useEffect } from 'react';

export const useFocusTrap = (ref: React.RefObject<HTMLElement | null>, isActive: boolean) => {
    useEffect(() => {
        const node = ref.current;
        if (!isActive || !node) return;

        const focusableElements = node.querySelectorAll(
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

        node.addEventListener('keydown', handleTab);


        if (firstElement) {
            firstElement.focus();
        }

        return () => {
            node.removeEventListener('keydown', handleTab);
        };
    }, [isActive, ref]);
};

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
