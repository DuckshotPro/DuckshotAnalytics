import { useState } from "react";
import { useLocation } from "wouter";
import { Logo } from "@/components/common/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { insertSnapchatCredentialsSchema } from "@shared/schema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ConsentDialog } from "@/components/consent-dialog";

export default function ConnectAccount() {
  const { connectSnapchatMutation, user } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [showConsentDialog, setShowConsentDialog] = useState(false);
  const [pendingCredentials, setPendingCredentials] = useState<{
    snapchatClientId: string;
    snapchatApiKey: string;
  } | null>(null);

  // Extend the schema to validate inputs
  const connectFormSchema = insertSnapchatCredentialsSchema.extend({
    snapchatClientId: z.string().min(1, "Client ID is required"),
    snapchatApiKey: z.string().min(1, "API Key is required"),
  });

  const form = useForm<z.infer<typeof connectFormSchema>>({
    resolver: zodResolver(connectFormSchema),
    defaultValues: {
      snapchatClientId: "",
      snapchatApiKey: "",
    },
  });

  const handleConfirmConsent = async () => {
    if (!pendingCredentials) return;
    
    try {
      // Connect with consent = true
      await connectSnapchatMutation.mutateAsync({
        ...pendingCredentials,
        dataConsent: true,
        consentDate: new Date().toISOString(),
        privacyPolicyVersion: "1.0" // Current version of our privacy policy
      });
      
      toast({
        title: "Account connected",
        description: "Your Snapchat account has been successfully connected.",
      });
      
      navigate("/dashboard");
    } catch (error) {
      // Error is already handled by the mutation
      console.error(error);
    } finally {
      setPendingCredentials(null);
      setShowConsentDialog(false);
    }
  };

  const handleDeclineConsent = () => {
    setPendingCredentials(null);
    setShowConsentDialog(false);
    toast({
      title: "Connection cancelled",
      description: "You must provide consent to use this application with your Snapchat account.",
      variant: "destructive"
    });
  };

  const onSubmit = async (data: z.infer<typeof connectFormSchema>) => {
    // Store credentials and show consent dialog
    setPendingCredentials({
      snapchatClientId: data.snapchatClientId,
      snapchatApiKey: data.snapchatApiKey
    });
    setShowConsentDialog(true);
  };

  // If already connected, redirect to dashboard
  if (user?.snapchatClientId && user?.snapchatApiKey) {
    navigate("/dashboard");
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Redirecting to dashboard...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto">
          <CardContent className="p-6 md:p-8">
            <div className="text-center mb-8">
              <Logo size="large" className="mx-auto mb-6" />
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">Connect Your Snapchat Account</h2>
              <p className="text-muted-foreground">Enter your Snapchat API credentials to start analyzing your data and unlock powerful insights.</p>
            </div>
            
            <form onSubmit={form.handleSubmit(onSubmit)} className="max-w-md mx-auto space-y-6">
              <div className="space-y-2">
                <Label htmlFor="snapchatClientId">Client ID</Label>
                <Input 
                  id="snapchatClientId"
                  type="text" 
                  placeholder="Enter your Snapchat Client ID"
                  {...form.register("snapchatClientId")}
                />
                {form.formState.errors.snapchatClientId && (
                  <p className="text-sm text-destructive">{form.formState.errors.snapchatClientId.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="snapchatApiKey">API Secret Key</Label>
                <Input 
                  id="snapchatApiKey"
                  type="password" 
                  placeholder="Enter your Snapchat API Secret Key"
                  {...form.register("snapchatApiKey")}
                />
                {form.formState.errors.snapchatApiKey && (
                  <p className="text-sm text-destructive">{form.formState.errors.snapchatApiKey.message}</p>
                )}
                <p className="text-xs text-muted-foreground mt-1">Your data is securely stored and never shared with third parties.</p>
              </div>
              
              <Button 
                type="submit" 
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                disabled={connectSnapchatMutation.isPending}
              >
                {connectSnapchatMutation.isPending ? "Connecting..." : "Connect Account"}
              </Button>
              
              <div className="text-center text-sm text-muted-foreground mt-6 pt-6 border-t border-border">
                <p>Don't have API credentials? <a href="https://developers.snapchat.com/" className="text-primary font-medium hover:underline" target="_blank" rel="noreferrer">Learn how to get them</a></p>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
      
      <Footer />
      
      {/* Consent Dialog */}
      <ConsentDialog
        open={showConsentDialog}
        onOpenChange={setShowConsentDialog}
        onConfirm={handleConfirmConsent}
        onDecline={handleDeclineConsent}
        providerName="Snapchat"
      />
    </div>
  );
}
