import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useSubscription } from "@/hooks/use-subscription";
import { useSnapchatData } from "@/hooks/use-snapchat-data";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { PremiumBadge } from "@/components/common/PremiumBadge";
import { AudienceGrowthChart } from "@/components/dashboard/AudienceGrowthChart";
import { DemographicsChart } from "@/components/dashboard/DemographicsChart";
import { ContentTable } from "@/components/dashboard/ContentTable";
import { Progress } from "@/components/ui/progress";
import { toast } from "@/hooks/use-toast";
import { Loader2, Download, FileDown, Lock, BarChart3, FileText, Calendar } from "lucide-react";
import { Link } from "wouter";

export default function ReportsPage() {
  const { user } = useAuth();
  const { isPremium } = useSubscription();
  const { data, isLoading, error } = useSnapchatData();
  const [selectedReport, setSelectedReport] = useState("performance");
  const [exportFormat, setExportFormat] = useState("pdf");
  const [dateRange, setDateRange] = useState("30days");

  if (!user) return null;

  if (isLoading) {
    return (
      <div className="container mx-auto py-16 flex justify-center items-center">
        <div className="flex flex-col items-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <p className="text-lg text-muted-foreground">Loading your report data...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="container mx-auto py-16 flex justify-center items-center">
        <div className="text-center">
          <p className="text-xl text-destructive mb-4">Failed to load data</p>
          <p className="text-muted-foreground mb-6">We couldn't load your Snapchat data at this time.</p>
          <Link href="/connect">
            <Button>Reconnect Account</Button>
          </Link>
        </div>
      </div>
    );
  }

  const handleDownloadReport = () => {
    if (!isPremium) {
      toast({
        title: "Premium Feature",
        description: "Upgrade to premium to download and export reports",
        variant: "destructive",
      });
      return;
    }
    
    toast({
      title: "Report Downloaded",
      description: `Your ${selectedReport} report has been downloaded as ${exportFormat.toUpperCase()}.`,
    });
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Reports & Analytics</h1>
          <p className="text-muted-foreground mt-1">Comprehensive analysis of your Snapchat performance</p>
        </div>
        <div className="mt-4 md:mt-0 flex items-center gap-3">
          {!isPremium && (
            <div className="bg-amber-50 border border-amber-200 text-amber-700 px-3 py-1.5 rounded-md text-sm flex items-center">
              <Lock className="h-4 w-4 mr-1.5" />
              Some reports are limited in free tier
            </div>
          )}
          {isPremium && <PremiumBadge isPremium />}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-8">
        <div className="md:col-span-8">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle>Report Configuration</CardTitle>
                {isPremium ? (
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                    Full Access
                  </span>
                ) : (
                  <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded">
                    Limited Access
                  </span>
                )}
              </div>
              <CardDescription>Customize and generate detailed reports</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="report-type">Report Type</Label>
                  <Select
                    value={selectedReport}
                    onValueChange={setSelectedReport}
                  >
                    <SelectTrigger id="report-type">
                      <SelectValue placeholder="Select report type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="performance">Performance Overview</SelectItem>
                      <SelectItem value="audience">Audience Analysis</SelectItem>
                      <SelectItem value="content">Content Performance</SelectItem>
                      <SelectItem value="engagement" disabled={!isPremium}>
                        Engagement Metrics {!isPremium && "(Premium)"}
                      </SelectItem>
                      <SelectItem value="conversion" disabled={!isPremium}>
                        Conversion Tracking {!isPremium && "(Premium)"}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date-range">Date Range</Label>
                  <Select
                    value={dateRange}
                    onValueChange={(value) => {
                      if ((value === "90days" || value === "custom") && !isPremium) {
                        toast({
                          title: "Premium Required",
                          description: "Upgrade to premium for extended historical data",
                          variant: "destructive",
                        });
                        return;
                      }
                      setDateRange(value);
                    }}
                  >
                    <SelectTrigger id="date-range">
                      <SelectValue placeholder="Select date range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7days">Last 7 days</SelectItem>
                      <SelectItem value="30days">Last 30 days</SelectItem>
                      <SelectItem value="90days" disabled={!isPremium}>
                        Last 90 days {!isPremium && "(Premium)"}
                      </SelectItem>
                      <SelectItem value="custom" disabled={!isPremium}>
                        Custom Range {!isPremium && "(Premium)"}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="export-format">Export Format</Label>
                  <Select
                    value={exportFormat}
                    onValueChange={setExportFormat}
                    disabled={!isPremium}
                  >
                    <SelectTrigger id="export-format" className={!isPremium ? "opacity-50" : ""}>
                      <SelectValue placeholder="Select format" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pdf">PDF Report</SelectItem>
                      <SelectItem value="xlsx">Excel Spreadsheet</SelectItem>
                      <SelectItem value="csv">CSV File</SelectItem>
                      <SelectItem value="pptx">PowerPoint Presentation</SelectItem>
                    </SelectContent>
                  </Select>
                  {!isPremium && (
                    <p className="text-xs text-amber-600">Premium feature</p>
                  )}
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={handleDownloadReport}
                className={!isPremium ? "opacity-90" : ""}
              >
                <Download className="mr-2 h-4 w-4" />
                Generate & Download Report
              </Button>
              {!isPremium && (
                <div className="ml-4 text-sm text-amber-600 flex items-center">
                  <Lock className="h-4 w-4 mr-1" />
                  Premium feature
                </div>
              )}
            </CardFooter>
          </Card>
        </div>
        <div className="md:col-span-4">
          <Card>
            <CardHeader>
              <CardTitle>Report History</CardTitle>
              <CardDescription>Previously generated reports</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isPremium ? (
                <>
                  <div className="flex items-center justify-between p-2 hover:bg-muted rounded cursor-pointer">
                    <div className="flex items-center">
                      <FileText className="h-4 w-4 mr-2 text-primary" />
                      <span>Monthly Performance</span>
                    </div>
                    <div className="text-xs text-muted-foreground">3 days ago</div>
                  </div>
                  <div className="flex items-center justify-between p-2 hover:bg-muted rounded cursor-pointer">
                    <div className="flex items-center">
                      <BarChart3 className="h-4 w-4 mr-2 text-primary" />
                      <span>Audience Analysis</span>
                    </div>
                    <div className="text-xs text-muted-foreground">1 week ago</div>
                  </div>
                  <div className="flex items-center justify-between p-2 hover:bg-muted rounded cursor-pointer">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-primary" />
                      <span>Q1 Summary</span>
                    </div>
                    <div className="text-xs text-muted-foreground">1 month ago</div>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Lock className="h-8 w-8 text-amber-500 mb-2" />
                  <h3 className="font-medium mb-1">Premium Feature</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Upgrade to premium to access report history and scheduling
                  </p>
                  {/* Correct route to pricing page */}
                  <Link href="/pricing-page">
                    <Button variant="outline" className="w-full">Upgrade Now</Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Tabs defaultValue="overview" className="mb-8">
        <TabsList className="grid grid-cols-2 md:grid-cols-4 lg:w-[600px]">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="audience">Audience</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="advanced" disabled={!isPremium}>Advanced {!isPremium && "🔒"}</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <Card>
              <CardHeader>
                <CardTitle>Follower Growth</CardTitle>
                <CardDescription>Trend over selected period</CardDescription>
              </CardHeader>
              <CardContent>
                <AudienceGrowthChart data={data.followers} />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Key Metrics</CardTitle>
                <CardDescription>Performance summary</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">Engagement Rate</span>
                    <span className="text-sm font-medium">{data.engagementRate.toFixed(1)}%</span>
                  </div>
                  <Progress value={data.engagementRate * 10} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">Completion Rate</span>
                    <span className="text-sm font-medium">{data.completionRate.toFixed(1)}%</span>
                  </div>
                  <Progress value={data.completionRate} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">Story Views</span>
                    <span className="text-sm font-medium">{data.totalStoryViews.toLocaleString()}</span>
                  </div>
                  <Progress value={70} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Performance Recommendations</CardTitle>
                  {!isPremium && (
                    <div className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-md flex items-center">
                      <Lock className="h-3 w-3 mr-1" /> Limited in free tier
                    </div>
                  )}
                </div>
                <CardDescription>AI-powered insights to improve your performance</CardDescription>
              </CardHeader>
              <CardContent>
                {isPremium ? (
                  <div className="space-y-4">
                    <div className="p-3 bg-green-50 border border-green-100 rounded-md">
                      <p className="text-sm font-medium text-green-800 mb-1">Engagement Opportunity</p>
                      <p className="text-sm text-green-700">
                        Your highest engagement is between 6-8pm. Consider posting more content during this timeframe.
                      </p>
                    </div>
                    <div className="p-3 bg-blue-50 border border-blue-100 rounded-md">
                      <p className="text-sm font-medium text-blue-800 mb-1">Content Strategy</p>
                      <p className="text-sm text-blue-700">
                        Behind-the-scenes videos have 2.3x higher completion rates than promotional content. Consider creating more authentic content.
                      </p>
                    </div>
                    <div className="p-3 bg-purple-50 border border-purple-100 rounded-md">
                      <p className="text-sm font-medium text-purple-800 mb-1">Audience Insight</p>
                      <p className="text-sm text-purple-700">
                        Your 18-24 demographic is growing 3x faster than other age groups. Consider creating more content targeted to this segment.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="p-3 bg-green-50 border border-green-100 rounded-md">
                      <p className="text-sm font-medium text-green-800 mb-1">Basic Insight</p>
                      <p className="text-sm text-green-700">
                        Your engagement rate is above average for your follower count.
                      </p>
                    </div>
                    <div className="p-4 bg-gray-50 border border-gray-200 rounded-md text-center">
                      <Lock className="h-5 w-5 mx-auto mb-2 text-gray-400" />
                      <p className="text-sm font-medium text-gray-600 mb-1">Premium Insights Locked</p>
                      <p className="text-sm text-gray-500 mb-3">
                        Upgrade to premium for 3x more detailed AI-powered recommendations.
                      </p>
                      {/* Correct route to pricing page */}
                      <Link href="/pricing-page">
                        <Button variant="outline" size="sm">Upgrade to Premium</Button>
                      </Link>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="audience" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Audience Demographics</CardTitle>
                <CardDescription>Age breakdown of your followers</CardDescription>
              </CardHeader>
              <CardContent className="h-[350px]">
                <DemographicsChart data={data.demographics} />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Geographic Distribution</CardTitle>
                  {!isPremium && (
                    <div className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-md flex items-center">
                      <Lock className="h-3 w-3 mr-1" /> Limited preview
                    </div>
                  )}
                </div>
                <CardDescription>Where your audience is located</CardDescription>
              </CardHeader>
              <CardContent>
                {isPremium ? (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>United States</span>
                      <div className="flex items-center space-x-2">
                        <Progress value={65} className="w-[120px] h-2" />
                        <span className="text-sm">65%</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>United Kingdom</span>
                      <div className="flex items-center space-x-2">
                        <Progress value={12} className="w-[120px] h-2" />
                        <span className="text-sm">12%</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Canada</span>
                      <div className="flex items-center space-x-2">
                        <Progress value={8} className="w-[120px] h-2" />
                        <span className="text-sm">8%</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Australia</span>
                      <div className="flex items-center space-x-2">
                        <Progress value={6} className="w-[120px] h-2" />
                        <span className="text-sm">6%</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Germany</span>
                      <div className="flex items-center space-x-2">
                        <Progress value={4} className="w-[120px] h-2" />
                        <span className="text-sm">4%</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Other Countries</span>
                      <div className="flex items-center space-x-2">
                        <Progress value={5} className="w-[120px] h-2" />
                        <span className="text-sm">5%</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="relative h-[300px]">
                    <div className="blur-sm opacity-60">
                      <div className="flex justify-between items-center mb-4">
                        <span>United States</span>
                        <div className="flex items-center space-x-2">
                          <Progress value={65} className="w-[120px] h-2" />
                          <span className="text-sm">65%</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center mb-4">
                        <span>United Kingdom</span>
                        <div className="flex items-center space-x-2">
                          <Progress value={12} className="w-[120px] h-2" />
                          <span className="text-sm">12%</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Canada</span>
                        <div className="flex items-center space-x-2">
                          <Progress value={8} className="w-[120px] h-2" />
                          <span className="text-sm">8%</span>
                        </div>
                      </div>
                    </div>
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/60">
                      <Lock className="h-12 w-12 text-amber-500 mb-4" />
                      <h3 className="text-lg font-medium mb-2">Premium Feature</h3>
                      <p className="text-sm text-muted-foreground mb-4 text-center max-w-xs">
                        Detailed geographic data is available with premium subscription
                      </p>
                      {/* Correct route to pricing page */}
                      <Link href="/pricing-page">
                        <Button>Upgrade to Premium</Button>
                      </Link>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card className="lg:col-span-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Audience Growth Forecast</CardTitle>
                  {!isPremium && (
                    <div className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-md flex items-center">
                      <Lock className="h-3 w-3 mr-1" /> Premium only
                    </div>
                  )}
                </div>
                <CardDescription>Predicted follower growth based on current trends</CardDescription>
              </CardHeader>
              <CardContent>
                {isPremium ? (
                  <div className="h-[300px] flex items-center justify-center">
                    <p className="text-muted-foreground">Advanced AI-powered growth forecast chart would appear here</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <Lock className="h-12 w-12 text-amber-500 mb-4" />
                    <h3 className="text-lg font-medium mb-2">AI-Powered Predictions</h3>
                    <p className="text-sm text-muted-foreground mb-6 max-w-md">
                      Upgrade to premium to access advanced AI forecasting, helping you predict future growth and optimize your content strategy.
                    </p>
                    {/* Correct route to pricing page */}
                    <Link href="/pricing-page">
                      <Button>Upgrade to Premium</Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="content" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Content Performance</CardTitle>
              <CardDescription>Detailed metrics for your recent content</CardDescription>
            </CardHeader>
            <CardContent>
              <ContentTable items={data.content} />
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" disabled={!isPremium} onClick={() => {
                if (!isPremium) {
                  toast({
                    title: "Premium Feature",
                    description: "Upgrade to premium to export content analytics",
                    variant: "destructive",
                  });
                  return;
                }
                toast({
                  title: "Analytics Exported",
                  description: "Your content analytics have been exported",
                });
              }}>
                <FileDown className="mr-2 h-4 w-4" />
                Export Data
                {!isPremium && <Lock className="ml-2 h-3 w-3" />}
              </Button>
              <div className="text-sm text-muted-foreground">
                Showing {data.content.length} of {isPremium ? "all" : "10"} items
                {!isPremium && " (Upgrade for full history)"}
              </div>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="advanced" className="mt-6">
          {isPremium ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Conversion Tracking</CardTitle>
                  <CardDescription>Link between content and conversions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px] flex items-center justify-center">
                    <p className="text-muted-foreground">Advanced conversion tracking chart would appear here</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Competitor Analysis</CardTitle>
                  <CardDescription>Compare your performance with competitors</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px] flex items-center justify-center">
                    <p className="text-muted-foreground">Competitor comparison chart would appear here</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <Lock className="h-16 w-16 text-amber-500 mb-6" />
              <h2 className="text-2xl font-bold mb-2">Premium Feature</h2>
              <p className="text-muted-foreground mb-8 max-w-lg">
                Advanced analytics including conversion tracking, competitor analysis, 
                and predictive audience insights are available with a Premium subscription.
              </p>
              {/* Correct route to pricing page */}
              <Link href="/pricing-page">
                <Button size="lg">Upgrade to Premium</Button>
              </Link>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}