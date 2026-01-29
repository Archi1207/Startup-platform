'use client';

interface ClaimCardProps {
  claim: any;
  onUpdate?: () => void | Promise<void>;
}

export default function ClaimCard({ claim, onUpdate }: ClaimCardProps) {
  return (
    <div className="glass-effect p-6 rounded-xl">
      <h3 className="text-lg font-semibold text-white mb-2">Claim</h3>
      {/* Add claim details here */}
    </div>
  );
}
