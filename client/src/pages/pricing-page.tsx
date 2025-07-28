import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useSubscription } from "@/hooks/use-subscription";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { AdSection } from "@/components/dashboard/AdSection";
import { toast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { 
  Check, 
  X, 
  CreditCard, 
  Zap, 
  Star, 
  Download, 
  Clock,
  Shield,
  Lock,
  BarChart3,
  Bot,
  HeartHandshake,
  LineChart,
  Rocket,
  Sparkles,
  Users,
  FileText,
  ArrowRight,
  Loader2
} from "lucide-react";
import { Link, useLocation } from "wouter";

export default function PricingPage() {
  const { user } = useAuth();
  const { isPremium, upgradeMutation, cancelSubscriptionMutation } = useSubscription();
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">("monthly");
  const [_, navigate] = useLocation();

  const handleUpgrade = async () => {
    if (!user) {
      navigate("/auth");
      return;
    }

    try {
      await upgradeMutation.mutateAsync({ plan: "premium" });
      toast({
        title: "Subscription Upgraded",
        description: "You now have access to all premium features!",
      });
      navigate("/dashboard");
    } catch (error) {
      toast({
        title: "Upgrade Failed",
        description: "There was an error processing your upgrade. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCancel = async () => {
    if (!isPremium) return;
    
    if (window.confirm("Are you sure you want to cancel your premium subscription? You'll lose access to premium features at the end of your billing period.")) {
      try {
        await cancelSubscriptionMutation.mutateAsync();
        toast({
          title: "Subscription Cancelled",
          description: "Your subscription has been cancelled. You'll have access to premium features until the end of your current billing period.",
        });
      } catch (error) {
        toast({
          title: "Cancellation Failed",
          description: "There was an error cancelling your subscription. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const features = [
    {
      name: "Analytics Dashboard",
      free: "Basic metrics",
      premium: "Comprehensive analytics"
    },
    {
      name: "Data Refresh Rate",
      free: "Once per day",
      premium: "Every 15 minutes"
    },
    {
      name: "Historical Data",
      free: "30 days",
      premium: "90 days"
    },
    {
      name: "Audience Insights",
      free: "Basic demographics",
      premium: "Advanced segmentation"
    },
    {
      name: "Content Analytics",
      free: "10 most recent items",
      premium: "Full content history"
    },
    {
      name: "Exportable Reports",
      free: false,
      premium: true
    },
    {
      name: "Report Formats",
      free: "None",
      premium: "PDF, CSV, Excel, PPT"
    },
    {
      name: "Custom Date Ranges",
      free: false,
      premium: true
    },
    {
      name: "AI-Powered Insights",
      free: "1 basic insight",
      premium: "Unlimited advanced insights"
    },
    {
      name: "Competitor Analysis",
      free: false,
      premium: true
    },
    {
      name: "Growth Predictions",
      free: false,
      premium: true
    },
    {
      name: "Content Recommendations",
      free: "1 basic recommendation",
      premium: "Advanced AI recommendations"
    },
    {
      name: "Support Response Time",
      free: "72 hours",
      premium: "24 hours"
    },
    {
      name: "Priority Support",
      free: false,
      premium: true
    },
    {
      name: "Video Support Calls",
      free: false,
      premium: true
    },
    {
      name: "Strategy Consultation",
      free: false,
      premium: "Monthly session"
    },
    {
      name: "Ads-Free Experience",
      free: false,
      premium: true
    }
  ];

  return (
    <div className="container mx-auto py-12 px-4">
      <div className="text-center max-w-3xl mx-auto mb-12">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
          Choose Your Analytics Experience
        </h1>
        <p className="text-xl text-muted-foreground mb-8">
          Get the insights you need to grow your Snapchat presence
        </p>
        
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center space-x-2">
            <span className={billingPeriod === "monthly" ? "font-medium" : "text-muted-foreground"}>
              Monthly
            </span>
            <Switch 
              checked={billingPeriod === "yearly"} 
              onCheckedChange={(checked) => setBillingPeriod(checked ? "yearly" : "monthly")}
            />
            <span className={billingPeriod === "yearly" ? "font-medium" : "text-muted-foreground"}>
              Yearly
            </span>
            {billingPeriod === "yearly" && (
              <Badge variant="outline" className="ml-2 bg-green-50 text-green-700 hover:bg-green-50">
                Save 20%
              </Badge>
            )}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Free Plan */}
          <Card className="flex flex-col h-full border-2">
            <CardHeader className="pb-8">
              <CardTitle className="text-2xl">Free</CardTitle>
              <CardDescription className="text-lg">Basic analytics for beginners</CardDescription>
              <div className="mt-4">
                <span className="text-4xl font-bold">$0</span>
                <span className="text-muted-foreground ml-1">forever</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 flex-grow">
              <div className="space-y-2">
                <div className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                  <span>Basic dashboard access</span>
                </div>
                <div className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                  <span>30-day data retention</span>
                </div>
                <div className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                  <span>Basic audience demographics</span>
                </div>
                <div className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                  <span>Daily data refresh</span>
                </div>
                <div className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                  <span>Email support (72h response)</span>
                </div>
                <div className="flex items-center text-muted-foreground">
                  <Check className="h-5 w-5 mr-2 flex-shrink-0" />
                  <span>Ad-supported experience</span>
                </div>
              </div>
              
              <div className="border-t pt-4 mt-4">
                <h4 className="font-medium mb-2">Limitations:</h4>
                <div className="space-y-2">
                  <div className="flex items-center text-muted-foreground">
                    <X className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
                    <span>No report exports</span>
                  </div>
                  <div className="flex items-center text-muted-foreground">
                    <X className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
                    <span>Limited historical data</span>
                  </div>
                  <div className="flex items-center text-muted-foreground">
                    <X className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
                    <span>No AI content recommendations</span>
                  </div>
                  <div className="flex items-center text-muted-foreground">
                    <X className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
                    <span>No custom date ranges</span>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              {user ? (
                isPremium ? (
                  <Button variant="outline" className="w-full" onClick={handleCancel}>
                    {cancelSubscriptionMutation.isPending && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Downgrade to Free
                  </Button>
                ) : (
                  <Button variant="outline" className="w-full" disabled>
                    Current Plan
                  </Button>
                )
              ) : (
                <Link href="/auth" className="w-full">
                  <Button variant="outline" className="w-full">
                    <ArrowRight className="mr-2 h-4 w-4" /> Get Started
                  </Button>
                </Link>
              )}
            </CardFooter>
          </Card>
          
          {/* Premium Plan */}
          <Card className="flex flex-col h-full border-2 border-amber-200 bg-gradient-to-b from-amber-50 to-white relative overflow-hidden">
            <div className="absolute top-0 right-0">
              <div className="bg-amber-500 text-white px-4 py-1 transform rotate-45 translate-x-[40%] translate-y-[30%] text-xs font-bold">
                POPULAR
              </div>
            </div>
            <CardHeader className="pb-8">
              <CardTitle className="text-2xl flex items-center">
                Premium <Sparkles className="h-5 w-5 text-amber-500 ml-2" />
              </CardTitle>
              <CardDescription className="text-lg">Advanced analytics & AI insights</CardDescription>
              <div className="mt-4">
                <span className="text-4xl font-bold">
                  ${billingPeriod === "monthly" ? "19.99" : "191.90"}
                </span>
                <span className="text-muted-foreground ml-1">
                  /{billingPeriod === "monthly" ? "month" : "year"}
                </span>
                {billingPeriod === "yearly" && (
                  <div className="text-green-600 text-sm font-medium mt-1">
                    Save ${19.99 * 12 - 191.90} with annual billing
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4 flex-grow">
              <div className="space-y-2">
                <div className="flex items-start">
                  <Check className="h-5 w-5 text-amber-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span><strong className="text-amber-700">All Free features</strong>, plus:</span>
                </div>
                <div className="flex items-center">
                  <Check className="h-5 w-5 text-amber-500 mr-2 flex-shrink-0" />
                  <span>AI-powered insights & recommendations</span>
                </div>
                <div className="flex items-center">
                  <Check className="h-5 w-5 text-amber-500 mr-2 flex-shrink-0" />
                  <span>90-day data history</span>
                </div>
                <div className="flex items-center">
                  <Check className="h-5 w-5 text-amber-500 mr-2 flex-shrink-0" />
                  <span>Data refreshed every 15 minutes</span>
                </div>
                <div className="flex items-center">
                  <Check className="h-5 w-5 text-amber-500 mr-2 flex-shrink-0" />
                  <span>Export reports (PDF, Excel, CSV)</span>
                </div>
                <div className="flex items-center">
                  <Check className="h-5 w-5 text-amber-500 mr-2 flex-shrink-0" />
                  <span>Custom date ranges & filtering</span>
                </div>
                <div className="flex items-center">
                  <Check className="h-5 w-5 text-amber-500 mr-2 flex-shrink-0" />
                  <span>Competitor analysis</span>
                </div>
                <div className="flex items-center">
                  <Check className="h-5 w-5 text-amber-500 mr-2 flex-shrink-0" />
                  <span>Growth prediction algorithms</span>
                </div>
                <div className="flex items-center">
                  <Check className="h-5 w-5 text-amber-500 mr-2 flex-shrink-0" />
                  <span>Priority support (24h response)</span>
                </div>
                <div className="flex items-center">
                  <Check className="h-5 w-5 text-amber-500 mr-2 flex-shrink-0" />
                  <span>Monthly strategy consultation</span>
                </div>
                <div className="flex items-center">
                  <Check className="h-5 w-5 text-amber-500 mr-2 flex-shrink-0" />
                  <span>Ad-free experience</span>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              {user ? (
                isPremium ? (
                  <Button variant="outline" className="w-full" disabled>
                    Current Plan
                  </Button>
                ) : (
                  <Button 
                    onClick={handleUpgrade}
                    disabled={upgradeMutation.isPending}
                    className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white"
                  >
                    {upgradeMutation.isPending && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Upgrade to Premium
                  </Button>
                )
              ) : (
                <Link href="/auth" className="w-full">
                  <Button 
                    className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white"
                  >
                    <Zap className="mr-2 h-4 w-4" /> Get Premium
                  </Button>
                </Link>
              )}
            </CardFooter>
          </Card>
        </div>
      </div>

      <div className="max-w-5xl mx-auto mt-16">
        <h2 className="text-2xl font-bold text-center mb-8">Features Comparison</h2>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="text-left p-4 border-b-2">Feature</th>
                <th className="text-center p-4 border-b-2 w-1/4">Free</th>
                <th className="text-center p-4 border-b-2 w-1/4 bg-amber-50">Premium</th>
              </tr>
            </thead>
            <tbody>
              {features.map((feature, index) => (
                <tr key={index} className={index % 2 === 0 ? "bg-gray-50" : ""}>
                  <td className="p-4 border-b">{feature.name}</td>
                  <td className="text-center p-4 border-b">
                    {typeof feature.free === "boolean" ? (
                      feature.free ? (
                        <Check className="h-5 w-5 text-green-500 mx-auto" />
                      ) : (
                        <X className="h-5 w-5 text-gray-300 mx-auto" />
                      )
                    ) : (
                      <span>{feature.free}</span>
                    )}
                  </td>
                  <td className="text-center p-4 border-b bg-amber-50">
                    {typeof feature.premium === "boolean" ? (
                      feature.premium ? (
                        <Check className="h-5 w-5 text-amber-500 mx-auto" />
                      ) : (
                        <X className="h-5 w-5 text-gray-300 mx-auto" />
                      )
                    ) : (
                      <span className="font-medium">{feature.premium}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="max-w-5xl mx-auto mt-16">
        <h2 className="text-2xl font-bold text-center mb-4">Why Go Premium?</h2>
        <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
          Unlock the full potential of your Snapchat analytics with these premium features
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 border rounded-lg bg-white">
            <div className="h-12 w-12 bg-amber-100 rounded-lg flex items-center justify-center mb-4">
              <Bot className="h-6 w-6 text-amber-600" />
            </div>
            <h3 className="text-lg font-medium mb-2">AI-Powered Insights</h3>
            <p className="text-muted-foreground">
              Get personalized recommendations and insights powered by advanced AI algorithms to optimize your content strategy.
            </p>
          </div>
          
          <div className="p-6 border rounded-lg bg-white">
            <div className="h-12 w-12 bg-amber-100 rounded-lg flex items-center justify-center mb-4">
              <BarChart3 className="h-6 w-6 text-amber-600" />
            </div>
            <h3 className="text-lg font-medium mb-2">Advanced Analytics</h3>
            <p className="text-muted-foreground">
              Access comprehensive metrics, historical data, and in-depth audience segmentation to better understand your performance.
            </p>
          </div>
          
          <div className="p-6 border rounded-lg bg-white">
            <div className="h-12 w-12 bg-amber-100 rounded-lg flex items-center justify-center mb-4">
              <FileText className="h-6 w-6 text-amber-600" />
            </div>
            <h3 className="text-lg font-medium mb-2">Professional Reports</h3>
            <p className="text-muted-foreground">
              Generate and export beautiful, detailed reports in multiple formats to share with your team or clients.
            </p>
          </div>
          
          <div className="p-6 border rounded-lg bg-white">
            <div className="h-12 w-12 bg-amber-100 rounded-lg flex items-center justify-center mb-4">
              <Users className="h-6 w-6 text-amber-600" />
            </div>
            <h3 className="text-lg font-medium mb-2">Competitor Analysis</h3>
            <p className="text-muted-foreground">
              Benchmark your performance against competitors and identify opportunities to stand out in your niche.
            </p>
          </div>
          
          <div className="p-6 border rounded-lg bg-white">
            <div className="h-12 w-12 bg-amber-100 rounded-lg flex items-center justify-center mb-4">
              <LineChart className="h-6 w-6 text-amber-600" />
            </div>
            <h3 className="text-lg font-medium mb-2">Growth Predictions</h3>
            <p className="text-muted-foreground">
              See where your account is headed with AI-powered growth forecasts and trend predictions.
            </p>
          </div>
          
          <div className="p-6 border rounded-lg bg-white">
            <div className="h-12 w-12 bg-amber-100 rounded-lg flex items-center justify-center mb-4">
              <HeartHandshake className="h-6 w-6 text-amber-600" />
            </div>
            <h3 className="text-lg font-medium mb-2">Priority Support</h3>
            <p className="text-muted-foreground">
              Get faster responses and personalized strategy consultations from our expert support team.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-16 max-w-3xl mx-auto text-center">
        <h2 className="text-2xl font-bold mb-4">Frequently Asked Questions</h2>
        
        <Accordion type="single" collapsible className="w-full text-left">
          <AccordionItem value="item-1">
            <AccordionTrigger>Can I cancel my premium subscription at any time?</AccordionTrigger>
            <AccordionContent>
              Yes, you can cancel your premium subscription at any time. Your premium features will remain active until the end of your current billing period.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-2">
            <AccordionTrigger>What happens to my data if I downgrade to the free plan?</AccordionTrigger>
            <AccordionContent>
              When you downgrade, you'll lose access to premium features and extended data history. Your data older than 30 days will no longer be accessible, but it isn't deleted - if you upgrade again, you'll regain access.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-3">
            <AccordionTrigger>Is there a refund policy?</AccordionTrigger>
            <AccordionContent>
              We offer a 14-day money-back guarantee if you're not satisfied with your premium subscription. Contact our support team for assistance with refunds.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-4">
            <AccordionTrigger>Can I switch between monthly and yearly billing?</AccordionTrigger>
            <AccordionContent>
              Yes, you can switch between monthly and yearly billing at any time. If you switch from monthly to yearly, you'll be charged the yearly rate immediately. If you switch from yearly to monthly, the change will take effect at your next renewal date.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-5">
            <AccordionTrigger>Do you offer educational or non-profit discounts?</AccordionTrigger>
            <AccordionContent>
              Yes, we offer special pricing for educational institutions and non-profit organizations. Please contact our support team with verification documents to apply for these discounts.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      <div className="mt-16 py-12 bg-amber-50 rounded-lg max-w-5xl mx-auto">
        <div className="text-center max-w-2xl mx-auto px-4">
          <h2 className="text-2xl font-bold mb-3">Ready to boost your Snapchat strategy?</h2>
          <p className="text-muted-foreground mb-8">
            Get access to premium features, AI-powered insights, and priority support to take your Snapchat analytics to the next level.
          </p>
          {user ? (
            isPremium ? (
              <div className="flex flex-col items-center space-y-4">
                <div className="bg-white p-3 rounded-md inline-flex items-center space-x-2">
                  <Check className="h-5 w-5 text-green-500" />
                  <span className="font-medium">You're already on Premium</span>
                </div>
                <Link href="/dashboard">
                  <Button variant="outline">Go to Dashboard</Button>
                </Link>
              </div>
            ) : (
              <Button 
                onClick={handleUpgrade}
                disabled={upgradeMutation.isPending}
                size="lg"
                className="bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white"
              >
                {upgradeMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Upgrade Now
              </Button>
            )
          ) : (
            <Link href="/auth">
              <Link to="/auth">
              <Button 
                size="lg"
                className="bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white cursor-pointer"
              >
                Get Started
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Banner for Free Plan Users */}
      {user && !isPremium && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-md py-3 px-4 z-50">
          <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between">
            <div className="mb-3 sm:mb-0 text-center sm:text-left">
              <p className="font-medium">You're currently on the Free plan</p>
              <p className="text-sm text-muted-foreground">Upgrade to unlock premium features and AI insights</p>
            </div>
            <Button 
              onClick={handleUpgrade}
              disabled={upgradeMutation.isPending}
              className="w-full sm:w-auto bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white"
            >
              {upgradeMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Upgrade to Premium
            </Button>
          </div>
        </div>
      )}
      
      {/* Ad Section for Free Users */}
      {user && !isPremium && (
        <div className="mt-16 max-w-5xl mx-auto">
          <AdSection />
        </div>
      )}
    </div>
  );
}

// Import missing components
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";