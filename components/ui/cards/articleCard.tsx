'use client';

import { FC } from "react";
import { cn } from "@/lib/utils";

type ArticleStatus = "published" | "draft" | "scheduled";

type ArticleCardProps = {
  category: string;
  content: string;
  status: ArticleStatus;
  date: string; 
};

const statusStyles: Record<ArticleStatus, string> = {
  published: "bg-blue-600/5 text-blue-500 font-bold px-2 py-1 rounded-xl",
  draft: "bg-yellow-500/10 text-yellow-500 font-bold px-2 py-1 rounded-xl",
  scheduled: "bg-purple-500/10 text-purple-500 font-bold px-2 py-1 rounded-xl",
};

export const ArticleCard: FC<ArticleCardProps> = ({
  category,
  content,
  status,
  date,
}) => {
  return (
    <div className="w-[310px] border border-[#e0e0e0] dark:border-neutral-700 rounded-xl p-3 bg-[#fcfcfc] dark:bg-neutral-800 transition-colors">
      <div className="text-sm text-gray-500 dark:text-gray-400 font-semibold mb-1">
        {category}
      </div>

      <div className="text-gray-900 dark:text-gray-100 font-semibold mb-3">
        {content}
      </div>

      <div className="flex items-center justify-between text-sm">
        <span className={cn(statusStyles[status])}>{status.toUpperCase()}</span>
        <span className="text-gray-500 dark:text-gray-400">{date}</span>
      </div>
    </div>
  );
};
