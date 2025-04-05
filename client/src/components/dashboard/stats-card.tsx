import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  iconBgColor: string;
  iconColor: string;
  linkText?: string;
  linkHref?: string;
  className?: string;
}

export function StatsCard({
  title,
  value,
  icon: Icon,
  iconBgColor,
  iconColor,
  linkText = "View all",
  linkHref = "#",
  className,
}: StatsCardProps) {
  return (
    <div className={cn("bg-white dark:bg-slate-800 overflow-hidden shadow rounded-lg", className)}>
      <div className="p-5">
        <div className="flex items-center">
          <div className={cn("flex-shrink-0 rounded-md p-3", iconBgColor)}>
            <Icon className={cn("text-xl", iconColor)} />
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-slate-500 dark:text-slate-400 truncate">{title}</dt>
              <dd>
                <div className="text-lg font-semibold text-slate-900 dark:text-white">{value}</div>
              </dd>
            </dl>
          </div>
        </div>
      </div>
      <div className="bg-slate-50 dark:bg-slate-700/50 px-5 py-3">
        <div className="text-sm">
          <a href={linkHref} className="font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300">
            {linkText}
          </a>
        </div>
      </div>
    </div>
  );
}

export default StatsCard;
