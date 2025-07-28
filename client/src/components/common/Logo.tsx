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
      <div className={cn("purple-pink-gradient-bg rounded-full flex items-center justify-center float-animation purple-glow", sizeClasses[size])}>
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
          {/* Duck silhouette with analytics elements */}
          <path d="M8 5c-2 0-4 2-4 4v2c0 2 2 4 4 4h1c0 1 1 2 2 2h2c1 0 2-1 2-2h1c2 0 4-2 4-4V9c0-2-2-4-4-4" fill="currentColor" stroke="none" />
          <circle cx="14" cy="8" r="1" fill="white" />
          <path d="M7 9h2v6H7z" fill="white" opacity="0.7" />
          <path d="M11 11h2v4h-2z" fill="white" opacity="0.7" />
          <path d="M15 8h2v7h-2z" fill="white" opacity="0.7" />
          <path d="M16 6l2-2m0 0l2 2m-2-2v4" stroke="white" strokeWidth="1" fill="none" />
        </svg>
      </div>
      {withText && (
        <div>
          <h1 className={cn("font-bold", size === "large" ? "text-2xl" : "text-xl", "text-foreground")}>
            <span className="purple-gradient-text">Duck</span><span className="pink-gradient-text">Shot</span> <span className="font-normal">Analytics</span>
          </h1>
        </div>
      )}
    </div>
  );
}
