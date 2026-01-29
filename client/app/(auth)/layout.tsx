import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Authentication | Startup Benefits',
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-900">
      <div className="absolute inset-0 bg-grid-white/[0.02] bg-grid" />
      <div className="relative">
        {children}
      </div>
    </div>
  );
}