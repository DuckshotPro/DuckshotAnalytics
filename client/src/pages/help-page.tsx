import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from "@/components/ui/accordion";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "wouter";
import { Search, Mail, MessageSquare, FileText, MapPin, HelpCircle } from "lucide-react";

export default function HelpPage() {
  return (
    <div className="container max-w-4xl py-10 space-y-10">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold purple-gradient-text">How Can We Help?</h1>
        <p className="text-xl text-muted-foreground">
          Find answers, get support, and resolve issues
        </p>
        <div className="relative max-w-xl mx-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input 
            className="dark-input pl-10" 
            placeholder="Search for help topics, FAQs, or features..." 
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="dark-card hover:border-primary/50 transition-all">
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="mr-2 h-5 w-5 text-primary" /> Documentation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Comprehensive guides and reference materials for using DuckShot Analytics
            </p>
            <Button variant="outline" className="w-full">Browse Documentation</Button>
          </CardContent>
        </Card>
        
        <Card className="dark-card hover:border-primary/50 transition-all">
          <CardHeader>
            <CardTitle className="flex items-center">
              <MessageSquare className="mr-2 h-5 w-5 text-primary" /> Live Chat
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Connect with our support team in real-time for immediate assistance
            </p>
            <Button variant="outline" className="w-full">Start Chat</Button>
          </CardContent>
        </Card>
        
        <Card className="dark-card hover:border-primary/50 transition-all">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Mail className="mr-2 h-5 w-5 text-primary" /> Email Support
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Send us an email for non-urgent issues or complex questions
            </p>
            <Button variant="outline" className="w-full">Contact Support</Button>
          </CardContent>
        </Card>
      </div>

      <Card className="dark-card">
        <CardHeader>
          <CardTitle>Frequently Asked Questions</CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger>What is DuckShot Analytics?</AccordionTrigger>
              <AccordionContent>
                DuckShot Analytics is a powerful analytics platform designed specifically for Snapchat content creators. It transforms your complex social media data into intuitive, engaging insights through advanced AI-powered analysis and user-friendly interfaces. Our platform helps you understand your audience, optimize your content strategy, and grow your presence on Snapchat.
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-2">
              <AccordionTrigger>How do I connect my Snapchat account?</AccordionTrigger>
              <AccordionContent>
                To connect your Snapchat account, go to the "Connect Account" page and click on "Connect with Snapchat." You'll be redirected to Snapchat's authentication page where you'll need to log in and authorize DuckShot Analytics to access your analytics data. Once you've granted permission, you'll be redirected back to our platform, and your data will begin syncing automatically.
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-3">
              <AccordionTrigger>What's the difference between free and premium plans?</AccordionTrigger>
              <AccordionContent>
                <p>Our free plan includes basic analytics features like audience demographics, content performance metrics, and simple visualizations. The premium plan offers:</p>
                <ul className="list-disc pl-6 mt-2 space-y-1">
                  <li>Advanced AI-powered insights and recommendations</li>
                  <li>Detailed audience segmentation</li>
                  <li>Competitor analysis</li>
                  <li>Content strategy planning tools</li>
                  <li>Advanced data export options</li>
                  <li>Priority customer support</li>
                </ul>
                <p className="mt-2">Visit our <Link href="/pricing-page" className="text-primary hover:underline">Pricing Page</Link> for a detailed comparison.</p>
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-4">
              <AccordionTrigger>Is my data secure with DuckShot Analytics?</AccordionTrigger>
              <AccordionContent>
                Yes, data security is our top priority. We use industry-standard encryption to protect your data both in transit and at rest. We never sell your personal information to third parties, and we only access the Snapchat data that you explicitly grant us permission to use. You can review and adjust your privacy settings at any time from the Data Management page, and you can request complete deletion of your data whenever you wish.
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-5">
              <AccordionTrigger>How often is my Snapchat data updated?</AccordionTrigger>
              <AccordionContent>
                For free accounts, data is refreshed once every 24 hours. Premium accounts enjoy more frequent updates, with data refreshed every 6 hours. You can also manually trigger a refresh at any time from the dashboard, with premium users having priority in the refresh queue.
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-6">
              <AccordionTrigger>Can I export my analytics data?</AccordionTrigger>
              <AccordionContent>
                Yes, you can export your analytics data in various formats including CSV, Excel, and PDF. Free users can export basic reports, while premium users have access to advanced custom reports with more detailed metrics and visualizations. Look for the export button in the top-right corner of any analytics page.
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-7">
              <AccordionTrigger>How do I cancel my subscription?</AccordionTrigger>
              <AccordionContent>
                You can cancel your premium subscription at any time from the Settings page. Click on "Subscription" and then "Cancel Subscription." Your premium features will remain active until the end of your current billing period. After that, your account will automatically revert to the free tier without any data loss, though you'll lose access to premium features.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="dark-card">
          <CardHeader>
            <CardTitle className="flex items-center">
              <MapPin className="mr-2 h-5 w-5 text-primary" /> Getting Started
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              New to DuckShot Analytics? Follow these steps to get started:
            </p>
            <ol className="list-decimal pl-6 space-y-2">
              <li>Create an account or sign in</li>
              <li>Connect your Snapchat account</li>
              <li>Complete your profile information</li>
              <li>Set your analytics preferences</li>
              <li>Explore your dashboard</li>
            </ol>
            <Button variant="outline" className="w-full mt-2">View Quick Start Guide</Button>
          </CardContent>
        </Card>
        
        <Card className="dark-card">
          <CardHeader>
            <CardTitle className="flex items-center">
              <HelpCircle className="mr-2 h-5 w-5 text-primary" /> Troubleshooting
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Common issues and their solutions:
            </p>
            <ul className="space-y-2">
              <li className="border-b border-border pb-2">
                <span className="font-medium">Connection issues with Snapchat</span>
                <p className="text-xs text-muted-foreground">Try reconnecting your account or check Snapchat's API status</p>
              </li>
              <li className="border-b border-border pb-2">
                <span className="font-medium">Data not updating</span>
                <p className="text-xs text-muted-foreground">Ensure your permissions are set correctly and try a manual refresh</p>
              </li>
              <li className="border-b border-border pb-2">
                <span className="font-medium">Payment or subscription issues</span>
                <p className="text-xs text-muted-foreground">Verify your payment information or contact our billing department</p>
              </li>
            </ul>
            <Button variant="outline" className="w-full mt-2">View Full Troubleshooting Guide</Button>
          </CardContent>
        </Card>
      </div>

      <Card className="dark-card bg-secondary/50">
        <CardContent className="p-6 text-center space-y-4">
          <h3 className="text-xl font-medium">Still need help?</h3>
          <p className="text-muted-foreground">
            Our support team is available 24/7 to assist you with any questions or issues.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-4">
            <Button className="purple-pink-gradient-bg hover:opacity-90">Contact Support</Button>
            <Button variant="outline">Submit a Feature Request</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}