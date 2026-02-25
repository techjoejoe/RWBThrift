import Link from 'next/link';

export default function NotFound() {
    return (
        <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--off-white)' }}>
            <div className="card p-8 max-w-md w-full text-center space-y-4 animate-scale-in">
                <p className="text-5xl font-black text-gray-200">404</p>
                <h2 className="text-xl font-bold text-navy-dark">Page Not Found</h2>
                <p className="text-sm text-gray-400">
                    The page you&apos;re looking for doesn&apos;t exist or has been moved.
                </p>
                <Link href="/dashboard" className="btn btn-primary w-full py-3 mt-2 inline-flex items-center justify-center">
                    Go to Dashboard
                </Link>
            </div>
        </div>
    );
}
