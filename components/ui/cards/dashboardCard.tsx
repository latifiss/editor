'use client';

import { FC } from "react";
import { cn } from "@/lib/utils";

type DashboardCardProps = {
  title: string;
  count: number;
  color?: string;
};

export const DashboardCard: FC<DashboardCardProps> = ({
  title,
  count,
  color = "bg-blue-500", 
}) => {
  return (
    <div className="flex flex-col justify-between p-4 rounded-xl border border-[#e0e0e0] dark:border-neutral-700 bg-[#fcfcfc] dark:bg-neutral-800 transition-colors h-28">
      <div className="flex items-center gap-2 text-sm font-semibold text-gray-600 dark:text-gray-400">
        <span className={cn("w-3 h-3 rounded-full", color)}></span>
        {title}
      </div>
      <div className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-2">
        {count}
      </div>
    </div>
  );
};
