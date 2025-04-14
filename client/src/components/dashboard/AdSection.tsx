import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";

export function AdSection() {
  const { user } = useAuth();
  const isPremium = user?.subscription === "premium";
  
  if (isPremium) {
    return null;
  }
  
  return (
    <div className="snap-card p-4">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-bold text-foreground">Sponsored</h3>
        <span className="text-xs text-muted-foreground">Ad</span>
      </div>
      <div className="bg-muted p-4 rounded-lg flex flex-col items-center text-center">
        <div className="w-16 h-16 bg-primary rounded-full mb-3 flex items-center justify-center">
          <AlertCircle className="h-8 w-8 text-primary-foreground" />
        </div>
        <h4 className="font-medium text-foreground mb-2">Boost Your Snapchat Presence</h4>
        <p className="text-sm text-muted-foreground mb-3">Learn how to grow your audience with our proven strategies</p>
        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground text-sm">
          Learn More
        </Button>
      </div>
    </div>
  );
}
