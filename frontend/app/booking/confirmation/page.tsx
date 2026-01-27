import { Suspense } from 'react';
import dynamic from 'next/dynamic';

const ConfirmationContent = dynamic(() => import('./ConfirmationContent'), {
    ssr: false,
    loading: () => <LoadingFallback />
});

function LoadingFallback() {
    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20">
            <div className="max-w-lg w-full bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 text-center border border-gray-200 dark:border-gray-700">
                <div className="space-y-6">
                    <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Loading...
                    </h1>
                </div>
            </div>
        </div>
    );
}

export default function BookingConfirmationPage() {
    return <ConfirmationContent />;
}
