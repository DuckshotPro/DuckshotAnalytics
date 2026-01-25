import { ArrowUp, ArrowDown } from "lucide-react";
import { cn, formatNumber, formatPercentage, getGrowthColor } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: number;
  change: number;
  icon: React.ReactNode;
  iconBgColor: string;
}

export function StatCard({ title, value, change, icon, iconBgColor }: StatCardProps) {
  const isPositive = change >= 0;
  const formattedValue = formatNumber(value);
  const formattedChange = formatPercentage(Math.abs(change));
  
  return (
    <div className="snap-card p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-muted-foreground text-sm">{title}</p>
          <h3 className="text-2xl font-bold text-foreground">{formattedValue}</h3>
          <div className={cn("flex items-center text-sm mt-1", getGrowthColor(change))}>
            {isPositive ? (
              <ArrowUp className="w-3 h-3 mr-1" aria-hidden="true" />
            ) : (
              <ArrowDown className="w-3 h-3 mr-1" aria-hidden="true" />
            )}
            <span className="sr-only">
              {isPositive ? "Increased by" : "Decreased by"}
            </span>
            <span>{formattedChange}</span>
          </div>
        </div>
        <div
          className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center",
            iconBgColor
          )}
          aria-hidden="true"
        >
          {icon}
        </div>
      </div>
    </div>
  );
}
