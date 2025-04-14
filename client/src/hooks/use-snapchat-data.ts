import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";

export function useSnapchatData() {
  const { user } = useAuth();
  const isConnected = !!(user?.snapchatClientId && user?.snapchatApiKey);
  
  const { data, isLoading, error } = useQuery({
    queryKey: ["/api/snapchat/data"],
    enabled: isConnected,
  });
  
  const refreshData = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/snapchat/refresh", {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/snapchat/data"] });
    },
  });
  
  // Prepare formatted data for charts
  const audienceGrowthData = data?.followers?.map((point: any) => ({
    date: point.date,
    followers: point.count
  })) || [];
  
  const demographicsData = data?.demographics?.map((demo: any) => ({
    name: demo.ageRange,
    value: demo.percentage,
    color: getColorForDemographic(demo.ageRange)
  })) || [];
  
  const contentItems = data?.content?.map((item: any) => ({
    id: item.id,
    title: item.title,
    date: new Date(item.date),
    views: item.views,
    completion: item.completion,
    screenshots: item.screenshots,
    shares: item.shares
  })) || [];
  
  const stats = {
    followers: data?.totalFollowers || 0,
    followerGrowth: data?.followerGrowth || 0,
    storyViews: data?.totalStoryViews || 0,
    storyViewsGrowth: data?.storyViewsGrowth || 0,
    engagementRate: data?.engagementRate || 0,
    engagementRateChange: data?.engagementRateChange || 0,
    completionRate: data?.completionRate || 0,
    completionRateChange: data?.completionRateChange || 0,
  };
  
  const lastUpdated = data?.lastUpdated ? new Date(data.lastUpdated) : null;
  
  return {
    isConnected,
    isLoading,
    error,
    refreshData,
    audienceGrowthData,
    demographicsData,
    contentItems,
    stats,
    lastUpdated
  };
}

function getColorForDemographic(ageRange: string): string {
  const colors: Record<string, string> = {
    '13-17': '#FFFC00', // Primary yellow
    '18-24': '#FFFC00',
    '25-34': '#7D4EFF', // Purple
    '35-44': '#FF8A00', // Orange
    '45+': '#00C6FF',   // Blue
  };
  
  return colors[ageRange] || '#AAAAAA';
}
