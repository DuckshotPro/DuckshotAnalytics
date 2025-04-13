import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { apiRequest } from "@/lib/queryClient";

export function useSubscription() {
  const { user } = useAuth();
  
  const { data: subscriptionDetails, isLoading } = useQuery({
    queryKey: ["/api/subscription"],
    enabled: !!user,
  });
  
  const isPremium = user?.subscription === "premium";
  
  const upgradeToSubscription = async (plan: string) => {
    await apiRequest("POST", "/api/subscription/upgrade", { plan });
  };
  
  const cancelSubscription = async () => {
    await apiRequest("POST", "/api/subscription/cancel", {});
  };
  
  return {
    isPremium,
    isLoading,
    subscriptionDetails,
    upgradeToSubscription,
    cancelSubscription
  };
}
