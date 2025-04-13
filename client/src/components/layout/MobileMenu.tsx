import { Link } from "wouter";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetClose } from "@/components/ui/sheet";
import { UserAvatar } from "@/components/common/UserAvatar";
import { PremiumBadge } from "@/components/common/PremiumBadge";
import { Logo } from "@/components/common/Logo";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  isPremium: boolean;
  username: string;
}

export function MobileMenu({ isOpen, onClose, isPremium, username }: MobileMenuProps) {
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
            <Link href="/dashboard">
              <a className="block p-2 hover:bg-muted rounded-md transition-colors">Dashboard</a>
            </Link>
          </SheetClose>
          
          <SheetClose asChild>
            <Link href="/reports">
              <a className="block p-2 hover:bg-muted rounded-md transition-colors">Reports</a>
            </Link>
          </SheetClose>
          
          <SheetClose asChild>
            <Link href="/settings">
              <a className="block p-2 hover:bg-muted rounded-md transition-colors">Settings</a>
            </Link>
          </SheetClose>
          
          <SheetClose asChild>
            <Link href="/support">
              <a className="block p-2 hover:bg-muted rounded-md transition-colors">Support</a>
            </Link>
          </SheetClose>
          
          <div className="pt-4 mt-4 border-t">
            <SheetClose asChild>
              <Link href="/logout">
                <a className="block p-2 text-destructive hover:bg-destructive/10 rounded-md transition-colors">
                  Logout
                </a>
              </Link>
            </SheetClose>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
