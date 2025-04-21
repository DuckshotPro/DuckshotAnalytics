import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Mail, MessageSquare, Phone, MapPin, Send, Clock, CheckCircle } from "lucide-react";

export default function ContactPage() {
  const [formSubmitted, setFormSubmitted] = useState(false);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would send data to the server
    setFormSubmitted(true);
  };
  
  return (
    <div className="container max-w-6xl py-10 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold purple-gradient-text">Contact Us</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Get in touch with our team for support, feedback, or partnership opportunities
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="col-span-1 lg:col-span-2">
          <Card className="dark-card h-full">
            <CardHeader>
              <CardTitle>Send Us a Message</CardTitle>
              <CardDescription>
                Fill out the form below and we'll get back to you as soon as possible
              </CardDescription>
            </CardHeader>
            <CardContent>
              {formSubmitted ? (
                <div className="flex flex-col items-center justify-center space-y-4 py-12">
                  <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                    <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="text-xl font-medium text-center">Message Sent Successfully!</h3>
                  <p className="text-center text-muted-foreground max-w-md">
                    Thank you for reaching out. A member of our team will respond to your inquiry within 24-48 hours.
                  </p>
                  <Button 
                    variant="outline" 
                    onClick={() => setFormSubmitted(false)}
                    className="mt-4"
                  >
                    Send Another Message
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name">Name</Label>
                      <Input id="name" className="dark-input" placeholder="Your name" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" className="dark-input" placeholder="your.email@example.com" required />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone (Optional)</Label>
                      <Input id="phone" className="dark-input" placeholder="Your phone number" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="subject">Subject</Label>
                      <Select>
                        <SelectTrigger id="subject" className="dark-input">
                          <SelectValue placeholder="Select a subject" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="general">General Inquiry</SelectItem>
                          <SelectItem value="support">Technical Support</SelectItem>
                          <SelectItem value="billing">Billing Question</SelectItem>
                          <SelectItem value="feedback">Feedback</SelectItem>
                          <SelectItem value="partnership">Partnership Opportunity</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="message">Message</Label>
                    <Textarea 
                      id="message" 
                      className="dark-input" 
                      placeholder="Please provide as much detail as possible..." 
                      rows={6}
                      required
                    />
                  </div>
                  
                  <div className="flex justify-end">
                    <Button type="submit" className="purple-pink-gradient-bg hover:opacity-90">
                      <Send className="h-4 w-4 mr-2" /> Send Message
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
        
        <div className="col-span-1">
          <div className="space-y-6">
            <Card className="dark-card">
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
                <CardDescription>
                  Different ways to reach our team
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-start space-x-3">
                  <Mail className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <h3 className="font-medium">Email</h3>
                    <p className="text-sm text-muted-foreground">support@duckshotanalytics.com</p>
                    <p className="text-sm text-muted-foreground">sales@duckshotanalytics.com</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <Phone className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <h3 className="font-medium">Phone</h3>
                    <p className="text-sm text-muted-foreground">+1 (555) 123-4567</p>
                    <p className="text-sm text-muted-foreground">Monday - Friday, 9AM - 5PM PST</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <MessageSquare className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <h3 className="font-medium">Live Chat</h3>
                    <p className="text-sm text-muted-foreground">Available 24/7 for premium members</p>
                    <p className="text-sm text-muted-foreground">9AM - 5PM PST for free accounts</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <MapPin className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <h3 className="font-medium">Headquarters</h3>
                    <p className="text-sm text-muted-foreground">123 Analytics Way</p>
                    <p className="text-sm text-muted-foreground">San Francisco, CA 94105</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="dark-card">
              <CardHeader>
                <CardTitle>Response Times</CardTitle>
                <CardDescription>
                  When you can expect to hear from us
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between border-b border-border pb-2">
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 text-primary mr-2" />
                    <span className="text-sm">Email Support</span>
                  </div>
                  <span className="text-sm">24-48 hours</span>
                </div>
                
                <div className="flex items-center justify-between border-b border-border pb-2">
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 text-primary mr-2" />
                    <span className="text-sm">Live Chat</span>
                  </div>
                  <span className="text-sm">Immediate</span>
                </div>
                
                <div className="flex items-center justify-between border-b border-border pb-2">
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 text-primary mr-2" />
                    <span className="text-sm">Phone Support</span>
                  </div>
                  <span className="text-sm">Business hours</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 text-primary mr-2" />
                    <span className="text-sm">Premium Support</span>
                  </div>
                  <span className="text-sm text-green-500">Priority</span>
                </div>
              </CardContent>
              <CardFooter>
                <p className="text-xs text-muted-foreground">
                  Premium members receive priority support with expedited response times.
                </p>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
      
      <Card className="dark-card">
        <CardHeader>
          <CardTitle>Frequently Asked Questions</CardTitle>
          <CardDescription>
            Quick answers to common questions
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
          <div className="space-y-2">
            <h3 className="font-medium">How do I upgrade to a premium plan?</h3>
            <p className="text-sm text-muted-foreground">
              You can upgrade from your account settings page. Click on "Subscription" and select the premium plan that fits your needs.
            </p>
          </div>
          
          <div className="space-y-2">
            <h3 className="font-medium">Can I cancel my subscription at any time?</h3>
            <p className="text-sm text-muted-foreground">
              Yes, you can cancel your subscription anytime from your account settings. Your premium features will remain active until the end of your billing period.
            </p>
          </div>
          
          <div className="space-y-2">
            <h3 className="font-medium">How secure is my Snapchat data?</h3>
            <p className="text-sm text-muted-foreground">
              We use industry-standard encryption and security practices. Your data is stored securely and never shared with third parties without your consent.
            </p>
          </div>
          
          <div className="space-y-2">
            <h3 className="font-medium">Do you offer educational discounts?</h3>
            <p className="text-sm text-muted-foreground">
              Yes, we offer special pricing for educational institutions and student content creators. Contact our sales team for more information.
            </p>
          </div>
        </CardContent>
        <CardFooter className="border-t pt-6">
          <Button variant="outline" className="w-full" onClick={() => window.location.href = "/help-page"}>
            View All FAQs
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}