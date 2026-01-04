import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface SkipLinkProps {
  targetId?: string;
  className?: string;
}

export function SkipLink({ targetId = "main-content", className }: SkipLinkProps) {
  return (
    <Button
      asChild
      variant="default"
      className={cn(
        "absolute left-4 top-4 z-[100] -translate-y-[150%] transition-transform focus:translate-y-0",
        className
      )}
    >
      <a href={`#${targetId}`}>Skip to main content</a>
    </Button>
  );
}
