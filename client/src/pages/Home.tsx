import { Logo } from "@/components/common/Logo";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { useAuth } from "@/context/AuthContext";

export default function Home() {
  const { user } = useAuth();
  
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-12 md:py-20 bg-gradient-to-b from-primary/10 to-background">
          <div className="container mx-auto px-4 text-center">
            <Logo size="large" className="mx-auto mb-6" />
            <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
              Analyze Your Snapchat Performance
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              Get valuable insights and analytics for your Snapchat content. Understand your audience better and grow your reach.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 max-w-md mx-auto">
              {user ? (
                <Link href="/dashboard">
                  <Button size="lg" className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                    Go to Dashboard
                  </Button>
                </Link>
              ) : (
                <>
                  <Link href="/connect">
                    <Button size="lg" className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                      Connect Your Snapchat
                    </Button>
                  </Link>
                  <Link href="/signup">
                    <Button size="lg" variant="outline" className="w-full">
                      Sign Up Free
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </section>
        
        {/* Features Section */}
        <section className="py-12 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">Powerful Analytics at Your Fingertips</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="snap-card p-6 text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                    <rect width="18" height="18" x="3" y="3" rx="2"></rect><path d="M3 9h18"></path><path d="M9 21V9"></path>
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">Comprehensive Dashboard</h3>
                <p className="text-muted-foreground">View all your key metrics in one place with our intuitive dashboard.</p>
              </div>
              
              <div className="snap-card p-6 text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                    <path d="M3 3v18h18"></path><path d="m19 9-5 5-4-4-3 3"></path>
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">Audience Insights</h3>
                <p className="text-muted-foreground">Understand your audience demographics and engagement patterns.</p>
              </div>
              
              <div className="snap-card p-6 text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                    <path d="M21.21 15.89A10 10 0 1 1 8 2.83"></path><path d="M22 12A10 10 0 0 0 12 2v10z"></path>
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">Content Performance</h3>
                <p className="text-muted-foreground">Track how your content performs and identify what resonates with your audience.</p>
              </div>
            </div>
          </div>
        </section>
        
        {/* Premium Section */}
        <section className="py-12 bg-muted">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div>
                  <span className="inline-block px-3 py-1 bg-accent text-white rounded-full text-sm font-medium mb-4">Premium Feature</span>
                  <h2 className="text-2xl md:text-3xl font-bold mb-4">AI-Powered Insights</h2>
                  <p className="text-muted-foreground mb-6">Upgrade to premium and get AI-generated insights to help you understand your data and improve your content strategy.</p>
                  <Link href="/pricing">
                    <Button className="bg-accent hover:bg-accent/90 text-white">
                      See Premium Plans
                    </Button>
                  </Link>
                </div>
                <div className="snap-card p-6 bg-white">
                  <div className="flex items-start space-x-3 mb-4">
                    <div className="w-10 h-10 bg-accent rounded-md flex items-center justify-center flex-shrink-0">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                        <rect width="18" height="10" x="3" y="11" rx="2"></rect><circle cx="12" cy="5" r="2"></circle><path d="M12 7v4"></path><line x1="8" x2="16" y1="16" y2="16"></line>
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground">Content Recommendations</h4>
                      <p className="text-sm text-muted-foreground mt-1">AI analyzes your top-performing content and provides recommendations for future posts.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3 mb-4">
                    <div className="w-10 h-10 bg-accent rounded-md flex items-center justify-center flex-shrink-0">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                        <path d="m9.06 11.9 8.07-8.06a2.85 2.85 0 1 1 4.03 4.03l-8.06 8.08"></path><path d="M7.07 14.94c-1.66 0-3 1.35-3 3.02 0 1.33-2.5 1.52-2 2.02 1.08 1.1 2.49 2.02 4 2.02 2.2 0 4-1.8 4-4.04a3.01 3.01 0 0 0-3-3.02z"></path>
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground">Audience Growth Strategy</h4>
                      <p className="text-sm text-muted-foreground mt-1">Get personalized strategies to grow your audience based on your specific data.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-accent rounded-md flex items-center justify-center flex-shrink-0">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                        <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"></path>
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground">Trend Analysis</h4>
                      <p className="text-sm text-muted-foreground mt-1">Identify emerging trends in your niche and optimize your content accordingly.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* CTA Section */}
        <section className="py-16 bg-gradient-to-r from-primary to-yellow-400">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-2xl md:text-4xl font-bold text-primary-foreground mb-6">Ready to Boost Your Snapchat Analytics?</h2>
            <p className="text-lg text-primary-foreground/80 mb-8 max-w-2xl mx-auto">
              Join thousands of content creators who use DuckShots SnapAlytics to grow their audience and improve engagement.
            </p>
            <Link href="/connect">
              <Button size="lg" className="bg-white text-primary hover:bg-gray-100">
                Get Started Free
              </Button>
            </Link>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}
