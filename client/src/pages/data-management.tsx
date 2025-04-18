/**
 * Data Management Page
 * 
 * This page allows users to manage their data privacy settings and exercise their data rights
 * including data access, export, and deletion options. It implements data minimization
 * principles and provides clear user controls as required by privacy regulations.
 */

import React, { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Download, AlertTriangle, Info } from "lucide-react";

export default function DataManagementPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Data collection preferences
  const [dataPreferences, setDataPreferences] = useState({
    allowEngagementAnalysis: true,
    allowDemographicCollection: true,
    allowLocationData: false,
    allowContentAnalysis: true,
  });

  // Toggle the data collection preferences
  const handleTogglePreference = (preference: string) => {
    setDataPreferences(prev => ({
      ...prev,
      [preference]: !prev[preference as keyof typeof prev]
    }));
  };

  // Save data preferences mutation
  const savePreferencesMutation = useMutation({
    mutationFn: async (preferences: typeof dataPreferences) => {
      const res = await apiRequest("POST", "/api/user/data-preferences", preferences);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Preferences saved",
        description: "Your data collection preferences have been updated.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to save preferences",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Handle export data
  const handleExportData = async () => {
    try {
      setIsExporting(true);
      const res = await apiRequest("GET", "/api/user/export-data");
      const blob = await res.blob();
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      a.download = "your-snapchat-data.json";
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "Data exported",
        description: "Your data has been exported successfully.",
      });
    } catch (error) {
      toast({
        title: "Export failed",
        description: "There was an error exporting your data.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  // Delete account mutation
  const deleteAccountMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/user/delete-account");
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Account deleted",
        description: "Your account and all associated data have been permanently deleted.",
      });
      queryClient.clear();
      navigate("/");
    },
    onError: (error: Error) => {
      toast({
        title: "Deletion failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Handle save preferences
  const handleSavePreferences = () => {
    savePreferencesMutation.mutate(dataPreferences);
  };

  // Handle account deletion
  const handleDeleteAccount = () => {
    setShowDeleteDialog(false);
    deleteAccountMutation.mutate();
  };

  if (!user) {
    navigate("/auth");
    return null;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-1 container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-6">Data Privacy & Management</h1>
        <p className="text-muted-foreground mb-8 max-w-3xl">
          We respect your privacy and give you control over your data. Use this page to manage what data 
          we collect and exercise your data rights under privacy regulations like GDPR and CCPA.
        </p>
        
        <div className="grid gap-8 md:grid-cols-12">
          <div className="md:col-span-8 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Data Collection Preferences</CardTitle>
                <CardDescription>
                  Control what types of data we collect and process
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between py-2">
                  <div>
                    <Label htmlFor="engagement-analytics" className="font-medium">
                      Engagement Analytics
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Collect data about views, likes, and shares on your content
                    </p>
                  </div>
                  <Switch
                    id="engagement-analytics"
                    checked={dataPreferences.allowEngagementAnalysis}
                    onCheckedChange={() => handleTogglePreference('allowEngagementAnalysis')}
                  />
                </div>
                
                <div className="flex items-center justify-between py-2">
                  <div>
                    <Label htmlFor="demographic-data" className="font-medium">
                      Demographic Data
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Collect anonymous age ranges and gender data of your audience
                    </p>
                  </div>
                  <Switch
                    id="demographic-data"
                    checked={dataPreferences.allowDemographicCollection}
                    onCheckedChange={() => handleTogglePreference('allowDemographicCollection')}
                  />
                </div>
                
                <div className="flex items-center justify-between py-2">
                  <div>
                    <Label htmlFor="location-data" className="font-medium">
                      Location Data
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Collect region and country data of your audience (never precise locations)
                    </p>
                  </div>
                  <Switch
                    id="location-data"
                    checked={dataPreferences.allowLocationData}
                    onCheckedChange={() => handleTogglePreference('allowLocationData')}
                  />
                </div>
                
                <div className="flex items-center justify-between py-2">
                  <div>
                    <Label htmlFor="content-analysis" className="font-medium">
                      Content Analysis
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Analyze your content to provide insights and recommendations
                    </p>
                  </div>
                  <Switch
                    id="content-analysis"
                    checked={dataPreferences.allowContentAnalysis}
                    onCheckedChange={() => handleTogglePreference('allowContentAnalysis')}
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  onClick={handleSavePreferences}
                  disabled={savePreferencesMutation.isPending}
                >
                  {savePreferencesMutation.isPending ? "Saving..." : "Save Preferences"}
                </Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Your Data Rights</CardTitle>
                <CardDescription>
                  Request access, download, or delete your data
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert className="bg-primary/10 border-primary/20">
                  <Info className="h-4 w-4" />
                  <AlertTitle>Data Minimization</AlertTitle>
                  <AlertDescription>
                    We only collect the minimum data necessary to provide you with analytics insights.
                    Your data is stored securely and never shared with third parties without your consent.
                  </AlertDescription>
                </Alert>
                
                <div className="grid gap-4 md:grid-cols-2">
                  <Button 
                    variant="outline" 
                    className="w-full" 
                    onClick={handleExportData}
                    disabled={isExporting}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    {isExporting ? "Preparing Export..." : "Export Your Data"}
                  </Button>
                  
                  <Button 
                    variant="destructive" 
                    className="w-full" 
                    onClick={() => setShowDeleteDialog(true)}
                    disabled={deleteAccountMutation.isPending}
                  >
                    <AlertTriangle className="mr-2 h-4 w-4" />
                    {deleteAccountMutation.isPending ? "Deleting..." : "Delete Account & Data"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="md:col-span-4">
            <Card>
              <CardHeader>
                <CardTitle>Data FAQ</CardTitle>
                <CardDescription>
                  Common questions about your data
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="item-1">
                    <AccordionTrigger>What data do you collect?</AccordionTrigger>
                    <AccordionContent>
                      We collect analytics data from your Snapchat account including follower counts, 
                      engagement metrics, and content performance statistics. We only collect what's 
                      necessary to provide meaningful insights.
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="item-2">
                    <AccordionTrigger>How is my data protected?</AccordionTrigger>
                    <AccordionContent>
                      We use industry-standard encryption and security protocols to protect your data. 
                      Your Snapchat API credentials are stored in encrypted format, and all data transfers 
                      use secure HTTPS connections.
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="item-3">
                    <AccordionTrigger>Who can access my data?</AccordionTrigger>
                    <AccordionContent>
                      Only you can access your data through your account. Our system administrators have 
                      limited access for maintenance and troubleshooting purposes only. We never sell or 
                      share your data with third parties.
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="item-4">
                    <AccordionTrigger>What happens when I delete my account?</AccordionTrigger>
                    <AccordionContent>
                      When you delete your account, all your personal data and Snapchat analytics are 
                      permanently removed from our systems within 30 days. Backup data may take up to 90 
                      days to be fully purged.
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      
      <Footer />
      
      {/* Delete Account Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Account & Data</DialogTitle>
            <DialogDescription>
              This action cannot be undone. It will permanently delete your account and all associated data.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Warning</AlertTitle>
              <AlertDescription>
                Deleting your account will remove all your analytics history, settings, and subscription status.
                You'll need to create a new account if you want to use DuckShots SnapAlytics again.
              </AlertDescription>
            </Alert>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteAccount}
              disabled={deleteAccountMutation.isPending}
            >
              {deleteAccountMutation.isPending ? "Deleting..." : "Yes, Delete Everything"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}