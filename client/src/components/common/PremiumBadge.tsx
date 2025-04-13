import { cn } from "@/lib/utils";

interface PremiumBadgeProps {
  isPremium: boolean;
  className?: string;
}

export function PremiumBadge({ isPremium, className }: PremiumBadgeProps) {
  return (
    <div
      className={cn(
        "flex items-center px-3 py-1 rounded-full",
        isPremium ? "bg-accent text-white" : "bg-muted text-muted-foreground",
        className
      )}
    >
      <span className="text-sm font-medium">{isPremium ? "Premium" : "Free Plan"}</span>
      <span className={cn("ml-2 inline-block w-2 h-2 rounded-full", isPremium ? "bg-white" : "bg-slate-500")}></span>
    </div>
  );
}
