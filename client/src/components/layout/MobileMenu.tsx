import { Link, useLocation } from "wouter";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetClose } from "@/components/ui/sheet";
import { UserAvatar } from "@/components/common/UserAvatar";
import { PremiumBadge } from "@/components/common/PremiumBadge";
import { Logo } from "@/components/common/Logo";
import { useAuth } from "@/hooks/use-auth";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  isPremium: boolean;
  username: string;
}

export function MobileMenu({ isOpen, onClose, isPremium, username }: MobileMenuProps) {
  const { logoutMutation } = useAuth();
  const [, navigate] = useLocation();

  const handleLogout = async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      await logoutMutation.mutateAsync();
      onClose();
      navigate('/auth');
    } catch (error) {
      console.error("Failed to logout:", error);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-[280px] sm:w-[350px]">
        <SheetHeader className="pb-4">
          <SheetTitle>
            <Logo size="small" />
          </SheetTitle>
        </SheetHeader>
        <div className="flex flex-col space-y-4 py-4">
          <div className="flex items-center space-x-3 mb-4 p-2">
            <UserAvatar username={username} />
            <div className="flex flex-col">
              <span className="text-sm font-medium">{username}</span>
              <PremiumBadge isPremium={isPremium} className="mt-1" />
            </div>
          </div>
          
          <SheetClose asChild>
            <Link href="/dashboard" className="block p-2 hover:bg-muted rounded-md transition-colors">
              Dashboard
            </Link>
          </SheetClose>
          
          <SheetClose asChild>
            <Link href="/reports" className="block p-2 hover:bg-muted rounded-md transition-colors">
              Reports
            </Link>
          </SheetClose>
          
          <SheetClose asChild>
            <Link href="/settings" className="block p-2 hover:bg-muted rounded-md transition-colors">
              Settings
            </Link>
          </SheetClose>
          
          {/* Fix broken route: /help -> /help-page to match defined router path */}
          <SheetClose asChild>
            <Link href="/help-page" className="block p-2 hover:bg-muted rounded-md transition-colors">
              Help
            </Link>
          </SheetClose>
          
          <SheetClose asChild>
            <Link href="/data-management" className="block p-2 hover:bg-muted rounded-md transition-colors">
              Data Privacy
            </Link>
          </SheetClose>
          
          <div className="pt-4 mt-4 border-t">
            <SheetClose asChild>
              <button 
                onClick={handleLogout} 
                className="block w-full text-left p-2 text-destructive hover:bg-destructive/10 rounded-md transition-colors"
                disabled={logoutMutation.isPending}
              >
                {logoutMutation.isPending ? "Logging out..." : "Logout"}
              </button>
            </SheetClose>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
