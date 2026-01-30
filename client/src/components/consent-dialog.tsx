/**
 * Consent Dialog Component
 * 
 * This component displays a consent dialog that explicitly asks users for their
 * permission to collect and process their data. It includes detailed information
 * about what data is collected, how it's used, and provides options to customize
 * data collection preferences.
 */

import React, { useState } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { LockKeyhole, Shield, Eye, Info } from "lucide-react";

interface ConsentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConsent: () => void;
}

export function ConsentDialog({ isOpen, onClose, onConsent }: ConsentDialogProps) {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  
  // Track user consent preferences
  const [consentPreferences, setConsentPreferences] = useState({
    analyticsConsent: true,
    demographicsConsent: true,
    contentAnalysisConsent: true,
    thirdPartyConsent: false,
    marketingConsent: false,
  });
  
  // Track if the user has actively made a choice
  const [hasInteracted, setHasInteracted] = useState(false);
  
  const handleCheckboxChange = (preference: string) => {
    setConsentPreferences(prev => ({
      ...prev,
      [preference]: !prev[preference as keyof typeof prev]
    }));
    setHasInteracted(true);
  };
  
  const saveConsentMutation = useMutation({
    mutationFn: async (data: {
      consent: boolean;
      preferences: typeof consentPreferences;
      timestamp: string;
    }) => {
      const res = await apiRequest("POST", "/api/user/consent", data);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Consent preferences saved",
        description: "Your privacy preferences have been saved.",
      });
      onConsent();
    },
    onError: (error: Error) => {
      toast({
        title: "Error saving consent",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  const handleAccept = () => {
    saveConsentMutation.mutate({
      consent: true,
      preferences: consentPreferences,
      timestamp: new Date().toISOString(),
    });
  };
  
  const handleDecline = () => {
    // If user declines, we respect their choice
    toast({
      title: "Consent declined",
      description: "You can still use basic features, but analytics functionality will be limited.",
    });
    
    saveConsentMutation.mutate({
      consent: false,
      preferences: {
        analyticsConsent: false,
        demographicsConsent: false,
        contentAnalysisConsent: false,
        thirdPartyConsent: false,
        marketingConsent: false,
      },
      timestamp: new Date().toISOString(),
    });
  };
  
  const handleViewPrivacyPolicy = () => {
    // Open privacy policy in a new tab
    window.open("/privacy-policy", "_blank");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center text-xl">
            <Shield className="mr-2 h-5 w-5 text-primary" aria-hidden="true" />
            Data Collection Consent
          </DialogTitle>
          <DialogDescription>
            We value your privacy and require your explicit consent to collect and process your data
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-2">
          <div className="flex items-start space-x-3 text-sm">
            <LockKeyhole className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" aria-hidden="true" />
            <p>
              DuckShots SnapAlytics requires access to certain data from your Snapchat account to provide 
              analytics insights. We take your privacy seriously and want to be transparent about what 
              information we collect and how we use it.
            </p>
          </div>
          
          <Accordion type="single" collapsible className="w-full border rounded-lg">
            <AccordionItem value="item-1" className="border-none">
              <AccordionTrigger className="px-4 py-2 hover:no-underline hover:bg-muted/50">
                <div className="flex items-center">
                  <Eye className="mr-2 h-4 w-4" aria-hidden="true" />
                  <span>What data do we collect?</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-3 pt-0 text-sm">
                <ul className="list-disc pl-5 space-y-1">
                  <li>Account information (username, display name)</li>
                  <li>Content metrics (views, engagement, interaction rates)</li>
                  <li>Audience demographics (age ranges, regions, interests)</li>
                  <li>Content performance data and statistics</li>
                  <li>Application usage data to improve our service</li>
                </ul>
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-2" className="border-t">
              <AccordionTrigger className="px-4 py-2 hover:no-underline hover:bg-muted/50">
                <div className="flex items-center">
                  <Info className="mr-2 h-4 w-4" aria-hidden="true" />
                  <span>How do we use your data?</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-3 pt-0 text-sm">
                <ul className="list-disc pl-5 space-y-1">
                  <li>To provide analytics insights about your Snapchat content</li>
                  <li>To generate performance reports and recommendations</li>
                  <li>To identify trends and patterns in your content performance</li>
                  <li>To improve our services and user experience</li>
                  <li>For AI-powered analysis (premium tier only)</li>
                </ul>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
          
          <div className="space-y-3 border rounded-lg p-4">
            <h3 className="text-sm font-medium">Customize Your Data Collection Preferences</h3>
            <div className="space-y-2">
              <div className="flex items-start space-x-2">
                <Checkbox 
                  id="analytics" 
                  checked={consentPreferences.analyticsConsent}
                  onCheckedChange={() => handleCheckboxChange('analyticsConsent')}
                />
                <div className="grid gap-1.5 leading-none">
                  <Label htmlFor="analytics" className="text-sm font-medium cursor-pointer">
                    Analytics Data
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Allow collection of performance metrics (views, engagement, etc.)
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-2">
                <Checkbox 
                  id="demographics" 
                  checked={consentPreferences.demographicsConsent}
                  onCheckedChange={() => handleCheckboxChange('demographicsConsent')}
                />
                <div className="grid gap-1.5 leading-none">
                  <Label htmlFor="demographics" className="text-sm font-medium cursor-pointer">
                    Demographic Data
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Allow collection of audience demographics (age ranges, regions)
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-2">
                <Checkbox 
                  id="content-analysis" 
                  checked={consentPreferences.contentAnalysisConsent}
                  onCheckedChange={() => handleCheckboxChange('contentAnalysisConsent')}
                />
                <div className="grid gap-1.5 leading-none">
                  <Label htmlFor="content-analysis" className="text-sm font-medium cursor-pointer">
                    Content Analysis
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Allow analysis of your content to provide insights and recommendations
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-2">
                <Checkbox 
                  id="third-party" 
                  checked={consentPreferences.thirdPartyConsent}
                  onCheckedChange={() => handleCheckboxChange('thirdPartyConsent')}
                />
                <div className="grid gap-1.5 leading-none">
                  <Label htmlFor="third-party" className="text-sm font-medium cursor-pointer">
                    Third-Party Processing
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Allow sharing with trusted third-party services for enhanced analytics (optional)
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-2">
                <Checkbox 
                  id="marketing" 
                  checked={consentPreferences.marketingConsent}
                  onCheckedChange={() => handleCheckboxChange('marketingConsent')}
                />
                <div className="grid gap-1.5 leading-none">
                  <Label htmlFor="marketing" className="text-sm font-medium cursor-pointer">
                    Marketing Communications
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Receive product updates and marketing materials (optional)
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <p className="text-xs text-muted-foreground">
            You can change these preferences at any time in your Data Privacy settings. For more information, 
            please review our{" "}
            <button
              type="button"
              onClick={handleViewPrivacyPolicy}
              className="text-primary underline underline-offset-2 hover:text-primary/80"
            >
              Privacy Policy
            </button>.
          </p>
        </div>
        
        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <Button 
            variant="outline" 
            onClick={handleDecline}
            disabled={saveConsentMutation.isPending}
            isLoading={saveConsentMutation.isPending}
          >
            Decline
          </Button>
          <Button 
            onClick={handleAccept}
            disabled={saveConsentMutation.isPending}
            isLoading={saveConsentMutation.isPending}
            className="gap-1"
          >
            I Consent to Data Collection
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}