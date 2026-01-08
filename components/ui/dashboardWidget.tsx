'use client';

import { DashboardCard } from "@/components/ui/cards/dashboardCard";

export default function DashboardWidget() {
  const stats = [
    { title: "Published articles", count: 24, color: "bg-blue-500" },
    { title: "Draft articles", count: 12, color: "bg-yellow-500" },
    { title: "Scheduled articles", count: 5, color: "bg-purple-500" },
    { title: "Archived/Trashed articles", count: 3, color: "bg-red-500" },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {stats.map((item) => (
        <DashboardCard
          key={item.title}
          title={item.title}
          count={item.count}
          color={item.color}
        />
      ))}
    </div>
  );
}
