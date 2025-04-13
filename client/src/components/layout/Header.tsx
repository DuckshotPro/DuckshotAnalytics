import { useState } from "react";
import { Link } from "wouter";
import { Logo } from "@/components/common/Logo";
import { PremiumBadge } from "@/components/common/PremiumBadge";
import { UserAvatar } from "@/components/common/UserAvatar";
import { useAuth } from "@/context/AuthContext";
import { MobileMenu } from "@/components/layout/MobileMenu";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";

export function Header() {
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
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
              <Link href="/settings" className="text-foreground font-medium hover:text-primary transition-colors">
                Settings
              </Link>
              
              <PremiumBadge isPremium={user.subscription === "premium"} />
              <UserAvatar username={user.username} />
            </nav>
            
            <Button 
              variant="ghost" 
              className="md:hidden" 
              onClick={() => setMobileMenuOpen(true)}
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
            <Link href="/login">
              <Button variant="outline" size="sm">
                Log in
              </Button>
            </Link>
            <Link href="/signup">
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
