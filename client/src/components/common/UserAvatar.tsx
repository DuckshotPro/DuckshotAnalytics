import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface UserAvatarProps {
  username: string;
  className?: string;
}

export function UserAvatar({ username, className }: UserAvatarProps) {
  const getInitials = (name: string) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <Avatar className={cn("bg-foreground", className)}>
      <AvatarFallback className="text-white text-sm font-bold">
        {getInitials(username)}
      </AvatarFallback>
    </Avatar>
  );
}
