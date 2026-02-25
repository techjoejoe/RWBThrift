'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error('Application error:', error);
    }, [error]);

    return (
        <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--off-white)' }}>
            <div className="card p-8 max-w-md w-full text-center space-y-4 animate-scale-in">
                <div className="w-14 h-14 rounded-2xl bg-red-alert-light flex items-center justify-center mx-auto">
                    <AlertTriangle size={28} className="text-red-accent" />
                </div>
                <h2 className="text-xl font-bold text-navy-dark">Something went wrong</h2>
                <p className="text-sm text-gray-400">
                    An unexpected error occurred. This has been logged and we&apos;ll look into it.
                </p>
                {error.message && (
                    <p className="text-xs text-gray-300 bg-gray-50 px-3 py-2 rounded-lg font-mono break-all">
                        {error.message}
                    </p>
                )}
                <button
                    onClick={reset}
                    className="btn btn-primary w-full py-3 mt-2"
                >
                    <RefreshCw size={16} />
                    Try Again
                </button>
            </div>
        </div>
    );
}
