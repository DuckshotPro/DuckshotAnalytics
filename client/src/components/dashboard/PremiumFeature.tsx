import { Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { apiRequest } from "@/lib/queryClient";
import { useMutation, useQuery } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Skeleton } from "@/components/ui/skeleton";

interface PremiumFeatureProps {
  showUpgradeButton?: boolean;
}

export function PremiumFeature({ showUpgradeButton = true }: PremiumFeatureProps) {
  const { user } = useAuth();
  const isPremium = user?.subscription === "premium";
  
  const { data: aiInsight, isLoading } = useQuery({
    queryKey: ["/api/insights/latest"],
    enabled: isPremium,
  });
  
  const generateInsight = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/insights/generate", {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/insights/latest"] });
    },
  });

  return (
    <div className="snap-card p-4">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-bold text-foreground">AI-Powered Insights</h3>
        {isPremium && <span className="premium-badge">Premium</span>}
      </div>
      
      <div className="p-4 bg-muted rounded-lg mb-4">
        {isPremium ? (
          <>
            {isLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-[90%]" />
                <Skeleton className="h-4 w-[80%]" />
              </div>
            ) : (
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-accent rounded-md flex items-center justify-center flex-shrink-0">
                  <Bot className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="text-sm text-foreground">
                    {aiInsight?.insight || "No insights available. Generate one now!"}
                  </p>
                </div>
              </div>
            )}
            
            <Button
              className="w-full mt-4 bg-accent hover:bg-accent/90 text-white"
              onClick={() => generateInsight.mutate()}
              disabled={generateInsight.isPending}
            >
              {generateInsight.isPending ? "Generating..." : "Generate New Insight"}
            </Button>
          </>
        ) : (
          <>
            <div className="flex items-start mb-3">
              <div className="w-8 h-8 bg-accent rounded-md flex items-center justify-center flex-shrink-0">
                <Bot className="h-4 w-4 text-white" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-muted-foreground italic">
                  <span className="text-accent font-medium">Upgrade to Premium</span> to get AI-powered insights and content recommendations based on your performance data.
                </p>
              </div>
            </div>
            
            {showUpgradeButton && (
              <Button className="w-full bg-accent hover:bg-accent/90 text-white">
                Upgrade to Premium
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
