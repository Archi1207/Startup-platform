'use client';

interface ProfileSectionProps {
  user?: any;
}

export default function ProfileSection({ user }: ProfileSectionProps) {
  return (
    <div className="glass-effect p-6 rounded-xl">
      <h2 className="text-2xl font-bold text-white mb-4">Profile</h2>
      {/* Add profile details here */}
    </div>
  );
}
