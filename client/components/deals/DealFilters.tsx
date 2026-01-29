'use client';

interface DealFiltersProps {
  onFilterChange?: (filters: any) => void;
}

export default function DealFilters({ onFilterChange }: DealFiltersProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white">Filters</h3>
      {/* Add filters here */}
    </div>
  );
}
