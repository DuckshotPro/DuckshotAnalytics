import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Logo } from "@/components/common/Logo";
import { PremiumBadge } from "@/components/common/PremiumBadge";
import { UserAvatar } from "@/components/common/UserAvatar";
import { useAuth } from "@/hooks/use-auth";
import { MobileMenu } from "@/components/layout/MobileMenu";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { LogOut, Settings, User, Menu, BarChart, Shield, Lock, Calendar } from "lucide-react";

export function Header() {
  const { user, logoutMutation } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [_, setLocation] = useLocation();

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
      setLocation('/auth');
    } catch (error) {
      console.error('Logout failed', error);
    }
  };

  return (
    <header className="dark-header sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link href="/" className="flex items-center space-x-2">
          <Logo size="medium" />
        </Link>

        {user ? (
          <>
            <nav className="hidden md:flex space-x-6 items-center">
              <Link href="/dashboard" className="text-foreground font-medium hover:text-primary transition-colors">
                Dashboard
              </Link>
              <Link href="/reports" className="text-foreground font-medium hover:text-primary transition-colors">
                Reports
              </Link>
              <Link href="/snapchat/scheduler" className="text-foreground font-medium hover:text-primary transition-colors">
                Scheduler
              </Link>
              <Link href="/settings" className="text-foreground font-medium hover:text-primary transition-colors">
                Settings
              </Link>

              <PremiumBadge isPremium={user.subscription === "premium"} />

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0" aria-label="Open user menu">
                    <UserAvatar username={user.username} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <div className="px-2 py-1.5 text-sm font-medium">
                    {user.username}
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard" className="flex cursor-pointer items-center">
                      <BarChart className="mr-2 h-4 w-4" />
                      <span>Dashboard</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/settings" className="flex cursor-pointer items-center">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/data-management" className="flex cursor-pointer items-center">
                      <Shield className="mr-2 h-4 w-4" />
                      <span>Data Privacy</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="text-red-500 focus:text-red-500 cursor-pointer"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </nav>

            <Button
              variant="ghost"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open mobile menu"
            >
              <Menu className="h-6 w-6" />
            </Button>

            <MobileMenu
              isOpen={mobileMenuOpen}
              onClose={() => setMobileMenuOpen(false)}
              isPremium={user.subscription === "premium"}
              username={user.username}
            />
          </>
        ) : (
          <div className="flex items-center space-x-4">
            <Link href="/connect" className="text-foreground font-medium hover:text-primary transition-colors">
              Connect Snapchat
            </Link>
            <Link href="/auth">
              <Button variant="outline" size="sm">
                Log in
              </Button>
            </Link>
            <Link href="/auth">
              <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
                Sign up
              </Button>
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
