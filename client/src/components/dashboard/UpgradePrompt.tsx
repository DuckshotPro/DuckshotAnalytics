import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { Link } from "wouter";

export function UpgradePrompt() {
  const { user } = useAuth();
  const isPremium = user?.subscription === "premium";
  
  if (isPremium) {
    return null;
  }
  
  return (
    <Card className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6 mb-6 border-0">
      <div className="md:flex items-center justify-between">
        <div className="mb-4 md:mb-0">
          <h3 className="text-xl font-bold mb-2">Unlock Premium Features</h3>
          <p className="text-indigo-100">Get advanced analytics, AI insights, and export capabilities with our premium plan.</p>
        </div>
        <div className="flex space-x-3">
          <Link href="/pricing">
            <Button className="bg-white text-purple-600 hover:bg-gray-100">
              See Plans
            </Button>
          </Link>
          <Link href="/premium-features">
            <Button variant="outline" className="bg-transparent hover:bg-purple-700 border border-white text-white">
              Learn More
            </Button>
          </Link>
        </div>
      </div>
    </Card>
  );
}
