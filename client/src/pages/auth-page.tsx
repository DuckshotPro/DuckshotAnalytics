import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Logo } from "@/components/common/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";

const authSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters").max(20, "Username must be less than 20 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type AuthFormValues = z.infer<typeof authSchema>;

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState<string>("login");
  const { loginMutation, registerMutation, user } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();

  // Redirect to home if already logged in
  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  const loginForm = useForm<AuthFormValues>({
    resolver: zodResolver(authSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const registerForm = useForm<AuthFormValues>({
    resolver: zodResolver(authSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const onLoginSubmit = async (data: AuthFormValues) => {
    try {
      await loginMutation.mutateAsync({
        username: data.username,
        password: data.password
      });
      navigate("/dashboard");
    } catch (error) {
      // Error is already handled by the mutation
      console.error(error);
    }
  };

  const onRegisterSubmit = async (data: AuthFormValues) => {
    try {
      await registerMutation.mutateAsync({
        username: data.username,
        password: data.password
      });
      navigate("/dashboard");
    } catch (error) {
      // Error is already handled by the mutation
      console.error(error);
    }
  };

  // If already logged in, show a redirect message
  if (user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Logo size="medium" className="mx-auto mb-4" />
          <p className="text-lg mb-2">You are already logged in!</p>
          <p className="text-muted-foreground mb-4">Redirecting you to the home page...</p>
          <Button onClick={() => navigate('/')} variant="outline">
            Go to Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      {/* Left Column - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center mb-8">
              <Logo size="large" className="mx-auto" />
              <h2 className="text-2xl font-bold mt-4">Welcome to DuckShots SnapAlytics</h2>
              <p className="text-muted-foreground mt-2">
                {activeTab === "login" ? "Sign in to your account" : "Create a new account"}
              </p>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid grid-cols-2 mb-8">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="register">Register</TabsTrigger>
              </TabsList>

              <TabsContent value="login" forceMount style={{ display: activeTab !== "login" ? 'none' : 'block' }}>
                <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-username">Username</Label>
                    <Input
                      id="login-username"
                      type="text"
                      placeholder="Enter your username"
                      {...loginForm.register("username")}
                    />
                    {loginForm.formState.errors.username && (
                      <p className="text-sm text-destructive">{loginForm.formState.errors.username.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="login-password">Password</Label>
                    <Input
                      id="login-password"
                      type="password"
                      placeholder="Enter your password"
                      {...loginForm.register("password")}
                    />
                    {loginForm.formState.errors.password && (
                      <p className="text-sm text-destructive">{loginForm.formState.errors.password.message}</p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                    disabled={loginMutation.isPending}
                  >
                    {loginMutation.isPending ? "Signing in..." : "Sign in"}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="register" forceMount style={{ display: activeTab !== "register" ? 'none' : 'block' }}>
                <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="register-username">Username</Label>
                    <Input
                      id="register-username"
                      type="text"
                      placeholder="Choose a username"
                      {...registerForm.register("username")}
                    />
                    {registerForm.formState.errors.username && (
                      <p className="text-sm text-destructive">{registerForm.formState.errors.username.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-password">Password</Label>
                    <Input
                      id="register-password"
                      type="password"
                      placeholder="Create a password"
                      {...registerForm.register("password")}
                    />
                    {registerForm.formState.errors.password && (
                      <p className="text-sm text-destructive">{registerForm.formState.errors.password.message}</p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                    disabled={registerMutation.isPending}
                  >
                    {registerMutation.isPending ? "Creating account..." : "Create account"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Right Column - Hero */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-r from-primary to-yellow-400 p-12 flex-col justify-center">
        <div className="max-w-lg">
          <h1 className="text-4xl font-bold text-white mb-6">Analyze Your Snapchat Performance</h1>
          <p className="text-xl text-white/90 mb-8">
            Get valuable insights into your Snapchat performance with our comprehensive analytics dashboard.
          </p>
          <div className="space-y-6">
            <div className="flex items-start space-x-3">
              <div className="mt-1 bg-white/20 rounded-full p-1">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                  <path d="M20 6 9 17l-5-5" />
                </svg>
              </div>
              <p className="text-white/90">Track audience growth and engagement</p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="mt-1 bg-white/20 rounded-full p-1">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                  <path d="M20 6 9 17l-5-5" />
                </svg>
              </div>
              <p className="text-white/90">Analyze content performance metrics</p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="mt-1 bg-white/20 rounded-full p-1">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                  <path d="M20 6 9 17l-5-5" />
                </svg>
              </div>
              <p className="text-white/90">Get AI-powered insights with premium subscription</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}