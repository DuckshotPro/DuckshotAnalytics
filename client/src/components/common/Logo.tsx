import { cn } from "@/lib/utils";

interface LogoProps {
  size?: "small" | "medium" | "large";
  withText?: boolean;
  className?: string;
}

export function Logo({ size = "medium", withText = true, className }: LogoProps) {
  const sizeClasses = {
    small: "w-8 h-8 text-sm",
    medium: "w-10 h-10 text-base",
    large: "w-20 h-20 text-3xl",
  };

  return (
    <div className={cn("flex items-center space-x-2", className)}>
      <div className={cn("bg-primary rounded-full flex items-center justify-center float-animation", sizeClasses[size])}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-white"
        >
          <path d="M8 13s4-4 6-2c0 0 0 3 2 3s4-2 4-2" />
          <path d="M5.9 17.2C4 16.2 2 15.3 2 14c0-1.8 3-8 3-8s.5 6 2 8" />
          <path d="M18 10.4c1.9 1 3.9 1.9 3.9 3.2 0 1.8-3 8-3 8s-.5-6-2-8" />
        </svg>
      </div>
      {withText && (
        <div>
          <h1 className={cn("font-bold", size === "large" ? "text-2xl" : "text-xl", "text-foreground")}>
            <span className="text-primary">Duck</span>Shots <span className="font-normal">SnapAlytics</span>
          </h1>
        </div>
      )}
    </div>
  );
}
