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
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { ConsentDialog } from "@/components/consent-dialog";
import { Link } from "wouter";
import { PasswordInput } from "@/components/ui/password-input";

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
                <PasswordInput
                  id="snapchatApiKey"
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
                isLoading={connectSnapchatMutation.isPending}
              >
                {connectSnapchatMutation.isPending ? "Connecting..." : "Connect Account"}
              </Button>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">Or</span>
                </div>
              </div>

              {/* Initiate OAuth flow if configured on server; otherwise server will 404 */}
              <Button 
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => { window.location.href = '/api/auth/snapchat'; }}
              >
                <svg aria-hidden="true" className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.719-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.097.118.11.222.082.343l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.888-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.357-.631-2.75-1.378l-.748 2.852c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24c6.624 0 11.99-5.367 11.99-11.013C24.007 5.367 18.641.001 12.017.001z"/>
                </svg>
                Connect with Snapchat OAuth
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