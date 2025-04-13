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

export default function ConnectAccount() {
  const { connectSnapchatMutation, user } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();

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

  const onSubmit = async (data: z.infer<typeof connectFormSchema>) => {
    try {
      await connectSnapchatMutation.mutateAsync({
        snapchatClientId: data.snapchatClientId,
        snapchatApiKey: data.snapchatApiKey
      });
      navigate("/dashboard");
    } catch (error) {
      // Error is already handled by the mutation
      console.error(error);
    }
  };

  // If already connected, redirect to dashboard
  if (user?.snapchatClientId && user?.snapchatApiKey) {
    navigate("/dashboard");
    return null;
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
    </div>
  );
}
