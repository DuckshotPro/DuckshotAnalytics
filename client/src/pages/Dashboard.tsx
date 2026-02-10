import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { AudienceGrowthChart } from "@/components/dashboard/AudienceGrowthChart";
import { DemographicsChart } from "@/components/dashboard/DemographicsChart";
import { ContentTable } from "@/components/dashboard/ContentTable";
import { StatCard } from "@/components/dashboard/StatCard";
import { PremiumFeature } from "@/components/dashboard/PremiumFeature";
import { AdSection } from "@/components/dashboard/AdSection";
import { UpgradePrompt } from "@/components/dashboard/UpgradePrompt";
import { CompetitorAnalysis } from "@/components/dashboard/CompetitorAnalysis";
import { useAuth } from "@/hooks/use-auth";
import { useSnapchatData } from "@/hooks/use-snapchat-data";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { formatDateWithTime } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { RefreshCw, Users, Eye, Heart, CheckCircle } from "lucide-react";

export default function Dashboard() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const { 
    isConnected, 
    isLoading, 
    audienceGrowthData, 
    demographicsData, 
    contentItems, 
    stats,
    lastUpdated,
    refreshData 
  } = useSnapchatData();
  
  const [timeRange, setTimeRange] = useState("30");
  
  useEffect(() => {
    // If user is not authenticated, redirect to home
    if (!user) {
      navigate("/");
      return;
    }
    
    // If not connected to Snapchat, redirect to connect page
    if (user && !isConnected) {
      navigate("/connect");
    }
  }, [user, isConnected, navigate]);
  
  // Protected route handles authentication check now
  // Just check if Snapchat is connected
  if (!isConnected) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Connect Your Snapchat Account</h1>
            <p className="mb-4">Please connect your Snapchat account to view your analytics dashboard.</p>
            <Button onClick={() => navigate('/connect')}>Connect Account</Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }
  
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-6">
        {/* Dashboard Header */}
        <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Analytics Dashboard</h1>
            {isLoading ? (
              <Skeleton className="h-5 w-40 mt-1" />
            ) : (
              <p className="text-muted-foreground">
                Last updated: {lastUpdated ? formatDateWithTime(lastUpdated) : "Never"}
              </p>
            )}
          </div>
          <div className="flex space-x-3 mt-4 md:mt-0">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-[180px] bg-white">
                <SelectValue placeholder="Select time range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 90 days</SelectItem>
              </SelectContent>
            </Select>
            <Button 
              variant="outline" 
              className="bg-white"
              onClick={() => refreshData.mutate()}
              disabled={refreshData.isPending}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              {refreshData.isPending ? "Refreshing..." : "Refresh"}
            </Button>
          </div>
        </div>
        
        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {isLoading ? (
            <>
              <Skeleton className="h-32" />
              <Skeleton className="h-32" />
              <Skeleton className="h-32" />
              <Skeleton className="h-32" />
            </>
          ) : (
            <>
              <StatCard
                title="Followers"
                value={stats.followers}
                change={stats.followerGrowth}
                icon={<Users className="text-primary" />}
                iconBgColor="bg-primary/20"
              />
              <StatCard
                title="Story Views"
                value={stats.storyViews}
                change={stats.storyViewsGrowth}
                icon={<Eye className="text-blue-500" />}
                iconBgColor="bg-blue-100"
              />
              <StatCard
                title="Engagement Rate"
                value={stats.engagementRate}
                change={stats.engagementRateChange}
                icon={<Heart className="text-red-500" />}
                iconBgColor="bg-red-100"
              />
              <StatCard
                title="Completion Rate"
                value={stats.completionRate}
                change={stats.completionRateChange}
                icon={<CheckCircle className="text-green-500" />}
                iconBgColor="bg-green-100"
              />
            </>
          )}
        </div>
        
        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {isLoading ? (
            <>
              <Skeleton className="h-64 lg:col-span-2" />
              <Skeleton className="h-64" />
            </>
          ) : (
            <>
              <div className="lg:col-span-2">
                <AudienceGrowthChart data={audienceGrowthData} />
              </div>
              <DemographicsChart data={demographicsData} />
            </>
          )}
        </div>
        
        {/* Content Performance */}
        {isLoading ? (
          <Skeleton className="h-96 mb-6" />
        ) : (
          <ContentTable items={contentItems} />
        )}
        
        {/* Premium Features & Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <PremiumFeature />
          <CompetitorAnalysis />
        </div>
        
        {/* Ad Section */}
        <div className="mb-6">
          <AdSection />
        </div>
        
        {/* Upgrade Prompt */}
        <UpgradePrompt />
      </main>
      
      <Footer />
    </div>
  );
}
