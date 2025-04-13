import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { CheckIcon } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useSubscription } from "@/hooks/use-subscription";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

export default function PricingPage() {
  const { user } = useAuth();
  const { isPremium, upgradeToSubscription, cancelSubscription } = useSubscription();
  const { toast } = useToast();
  const [, navigate] = useLocation();

  const handleUpgrade = async () => {
    try {
      if (!user) {
        navigate("/auth");
        return;
      }
      
      await upgradeToSubscription("premium");
      
      toast({
        title: "Upgraded to Premium",
        description: "You have successfully upgraded to the Premium plan.",
      });
    } catch (error) {
      toast({
        title: "Upgrade Failed",
        description: "Failed to upgrade to Premium. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCancel = async () => {
    try {
      await cancelSubscription();
      
      toast({
        title: "Subscription Cancelled",
        description: "Your Premium subscription has been cancelled. You will remain on Premium until the end of your billing period.",
      });
    } catch (error) {
      toast({
        title: "Cancellation Failed",
        description: "Failed to cancel subscription. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-1">
        <section className="py-12 md:py-20 bg-gradient-to-b from-primary/10 to-background">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
              Choose the Right Plan for You
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              Get access to powerful analytics tools and take your Snapchat content to the next level.
            </p>
          </div>
        </section>
        
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              {/* Free Plan */}
              <div className="border border-border rounded-lg overflow-hidden bg-white">
                <div className="p-6 md:p-8">
                  <div className="mb-6">
                    <h3 className="text-xl font-semibold">Free</h3>
                    <div className="mt-2 flex items-baseline">
                      <span className="text-4xl font-bold">$0</span>
                      <span className="ml-1 text-muted-foreground">/month</span>
                    </div>
                    <p className="mt-4 text-muted-foreground">Perfect for getting started with basic analytics</p>
                  </div>
                  
                  <ul className="space-y-3 mb-8">
                    <li className="flex items-start">
                      <CheckIcon className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Audience growth tracking</span>
                    </li>
                    <li className="flex items-start">
                      <CheckIcon className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Basic demographic insights</span>
                    </li>
                    <li className="flex items-start">
                      <CheckIcon className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Content performance metrics</span>
                    </li>
                    <li className="flex items-start">
                      <CheckIcon className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Ad-supported experience</span>
                    </li>
                  </ul>
                  
                  {user && isPremium ? (
                    <Button 
                      variant="outline" 
                      className="w-full" 
                      onClick={handleCancel}
                    >
                      Downgrade to Free
                    </Button>
                  ) : (
                    <Button 
                      variant="outline" 
                      className="w-full" 
                      disabled={!user || !isPremium}
                    >
                      Current Plan
                    </Button>
                  )}
                </div>
              </div>
              
              {/* Premium Plan */}
              <div className="border-2 border-primary rounded-lg overflow-hidden bg-white">
                <div className="bg-primary/10 p-2 text-center">
                  <span className="text-xs font-semibold uppercase tracking-wider">Recommended</span>
                </div>
                <div className="p-6 md:p-8">
                  <div className="mb-6">
                    <h3 className="text-xl font-semibold">Premium</h3>
                    <div className="mt-2 flex items-baseline">
                      <span className="text-4xl font-bold">$14.99</span>
                      <span className="ml-1 text-muted-foreground">/month</span>
                    </div>
                    <p className="mt-4 text-muted-foreground">Advanced analytics and AI-powered insights</p>
                  </div>
                  
                  <ul className="space-y-3 mb-8">
                    <li className="flex items-start">
                      <CheckIcon className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span><strong>Everything in Free</strong></span>
                    </li>
                    <li className="flex items-start">
                      <CheckIcon className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span><strong>AI-powered content recommendations</strong></span>
                    </li>
                    <li className="flex items-start">
                      <CheckIcon className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Advanced audience insights</span>
                    </li>
                    <li className="flex items-start">
                      <CheckIcon className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Ad-free experience</span>
                    </li>
                    <li className="flex items-start">
                      <CheckIcon className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Priority support</span>
                    </li>
                  </ul>
                  
                  {user && isPremium ? (
                    <Button 
                      variant="outline" 
                      className="w-full"
                      disabled
                    >
                      Current Plan
                    </Button>
                  ) : (
                    <Button 
                      className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                      onClick={handleUpgrade}
                    >
                      {user ? "Upgrade to Premium" : "Sign Up for Premium"}
                    </Button>
                  )}
                </div>
              </div>
            </div>
            
            <div className="mt-16 max-w-3xl mx-auto text-center">
              <h3 className="text-2xl font-semibold mb-4">Frequently Asked Questions</h3>
              <div className="space-y-8 text-left">
                <div>
                  <h4 className="text-lg font-medium mb-2">How does the Premium plan work?</h4>
                  <p className="text-muted-foreground">Premium gives you access to all features including AI-powered insights and recommendations. Your subscription will renew monthly until cancelled.</p>
                </div>
                <div>
                  <h4 className="text-lg font-medium mb-2">Can I cancel my subscription anytime?</h4>
                  <p className="text-muted-foreground">Yes, you can cancel your Premium subscription at any time. You'll continue to have Premium access until the end of your current billing period.</p>
                </div>
                <div>
                  <h4 className="text-lg font-medium mb-2">How do I connect my Snapchat account?</h4>
                  <p className="text-muted-foreground">After signing up, go to the Connect page and enter your Snapchat API credentials. We'll guide you through the process of generating these credentials if needed.</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}