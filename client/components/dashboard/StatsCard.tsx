'use client';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  gradient?: string;
  change?: string;
}

export default function StatsCard({ title, value, icon, gradient, change }: StatsCardProps) {
  return (
    <div className="glass-effect p-6 rounded-xl">
      <div className="flex items-center justify-between mb-2">
        <p className="text-gray-400 text-sm">{title}</p>
        {icon && <div className="text-purple-400">{icon}</div>}
      </div>
      <p className="text-3xl font-bold text-white">{value}</p>
      {change && <p className="text-sm text-green-400 mt-2">{change}</p>}
    </div>
  );
}
