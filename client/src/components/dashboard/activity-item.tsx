import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface ActivityItemProps {
  icon: LucideIcon;
  iconBgColor: string;
  iconColor: string;
  title: string;
  subtitle: string;
  timestamp: Date;
  className?: string;
}

export function ActivityItem({
  icon: Icon,
  iconBgColor,
  iconColor,
  title,
  subtitle,
  timestamp,
  className,
}: ActivityItemProps) {
  return (
    <div className={cn("p-4", className)}>
      <div className="flex space-x-3">
        <div className="flex-shrink-0">
          <div className={cn("h-8 w-8 rounded-full flex items-center justify-center", iconBgColor)}>
            <Icon className={cn("text-sm", iconColor)} />
          </div>
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-slate-900 dark:text-white">
            {title}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
            {subtitle}
          </p>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
            {formatDistanceToNow(timestamp, { addSuffix: true })}
          </p>
        </div>
      </div>
    </div>
  );
}

export default ActivityItem;
