import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useSubscription } from "@/hooks/use-subscription";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { PremiumBadge } from "@/components/common/PremiumBadge";
import { toast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Loader2, CreditCard, BellRing, BellOff, Lock, Shield } from "lucide-react";
import { Link } from "wouter";

export default function SettingsPage() {
  const { user } = useAuth();
  const { isPremium, expiresAt, upgradeMutation, cancelSubscriptionMutation } = useSubscription();
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [autoBackups, setAutoBackups] = useState(isPremium);
  const [dataRetention, setDataRetention] = useState(isPremium ? "90days" : "30days");

  if (!user) return null;

  const formatDate = (date: Date | null) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleDeleteAccount = async () => {
    if (window.confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      toast({
        title: "Feature Not Available",
        description: "Account deletion is not implemented in this demo.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground mt-1">Manage your account and preferences</p>
        </div>
        <div className="mt-4 md:mt-0">
          {isPremium ? (
            <div className="flex items-center gap-3">
              <PremiumBadge isPremium={true} />
              <Button 
                variant="outline" 
                className="text-destructive border-destructive hover:bg-destructive/10"
                onClick={() => cancelSubscriptionMutation.mutate()}
                disabled={cancelSubscriptionMutation.isPending}
              >
                {cancelSubscriptionMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Cancel Premium
              </Button>
            </div>
          ) : (
            {/* Correct route to pricing page */}
            <Link href="/pricing-page">
              <Button className="bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white">
                <CreditCard className="mr-2 h-4 w-4" /> 
                Upgrade to Premium
              </Button>
            </Link>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="md:col-span-8 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
              <CardDescription>Update your account details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input id="username" value={user.username} disabled />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input id="email" placeholder="Enter your email" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input id="password" type="password" value="••••••••" disabled />
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="absolute right-1 top-1"
                    onClick={() => toast({
                      title: "Feature Not Available",
                      description: "Password change is not implemented in this demo."
                    })}
                  >
                    Change
                  </Button>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full sm:w-auto" onClick={() => toast({ title: "Changes saved" })}>Save Changes</Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Snapchat Integration</CardTitle>
              <CardDescription>Manage your Snapchat account connection</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="font-medium">Connection Status</div>
                  <div className="text-sm text-muted-foreground">
                    {user.snapchatClientId ? "Connected" : "Not connected"}
                  </div>
                </div>
                {user.snapchatClientId ? (
                  <Button 
                    variant="outline" 
                    onClick={() => toast({
                      title: "Feature Not Available",
                      description: "Disconnecting Snapchat account is not implemented in this demo."
                    })}
                  >
                    Disconnect
                  </Button>
                ) : (
                  <Link href="/connect">
                    <Button>Connect Account</Button>
                  </Link>
                )}
              </div>
              {user.snapchatClientId && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="font-medium">Data Refresh Rate</div>
                    <div className="text-sm text-muted-foreground">
                      {isPremium ? "Every 15 minutes" : "Every 24 hours"}
                      {!isPremium && (
                        <span className="ml-2 text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded">
                          Premium feature
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="font-medium">Data Retention</div>
                    <div className="text-sm text-muted-foreground">
                      <select 
                        value={dataRetention}
                        onChange={(e) => {
                          if (e.target.value === "90days" && !isPremium) {
                            toast({
                              title: "Premium Required",
                              description: "Upgrade to premium for extended data retention",
                              variant: "destructive",
                            });
                            return;
                          }
                          setDataRetention(e.target.value);
                        }}
                        className="border rounded p-1"
                      >
                        <option value="30days">30 days</option>
                        <option value="90days" disabled={!isPremium}>90 days (Premium)</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>Manage your notification preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="font-medium">Email Notifications</div>
                  <div className="text-sm text-muted-foreground">Receive analytics reports and updates</div>
                </div>
                <Switch 
                  checked={emailNotifications} 
                  onCheckedChange={setEmailNotifications} 
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="font-medium">Push Notifications</div>
                  <div className="text-sm text-muted-foreground">Get alerts for significant changes</div>
                </div>
                <Switch 
                  checked={pushNotifications} 
                  onCheckedChange={setPushNotifications} 
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="font-medium">Weekly Performance Report</div>
                  <div className="text-sm text-muted-foreground">
                    Get a weekly summary of your analytics
                    {!isPremium && (
                      <span className="ml-2 text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded">
                        Premium feature
                      </span>
                    )}
                  </div>
                </div>
                <Switch 
                  checked={isPremium}
                  disabled={!isPremium}
                  onCheckedChange={() => {
                    if (!isPremium) {
                      toast({
                        title: "Premium Required",
                        description: "Upgrade to premium to enable this feature",
                        variant: "destructive",
                      });
                    }
                  }}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-4 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Subscription</CardTitle>
              <CardDescription>Manage your subscription plan</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="font-medium">Current Plan</div>
                <div className="flex items-center">
                  {isPremium ? (
                    <div className="text-amber-500 font-semibold flex items-center">
                      Premium Plan <PremiumBadge isPremium className="ml-2" />
                    </div>
                  ) : (
                    <div>Free Plan</div>
                  )}
                </div>
              </div>
              {isPremium && (
                <div className="space-y-2">
                  <div className="font-medium">Renewal Date</div>
                  <div>{formatDate(expiresAt)}</div>
                </div>
              )}
              <div className="pt-2">
                {isPremium ? (
                  <Button 
                    variant="outline" 
                    className="w-full" 
                    onClick={() => cancelSubscriptionMutation.mutate()}
                    disabled={cancelSubscriptionMutation.isPending}
                  >
                    {cancelSubscriptionMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Cancel Subscription
                  </Button>
                ) : (
                  {/* Correct route to pricing page */}
                  <Link href="/pricing-page">
                    <Button className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white">
                      Upgrade to Premium
                    </Button>
                  </Link>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Privacy & Security</CardTitle>
              <CardDescription>Manage your privacy settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="font-medium flex items-center">
                    <Shield className="mr-2 h-4 w-4" /> Two-Factor Authentication
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {isPremium ? "Available" : "Premium Feature"}
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  disabled={!isPremium}
                  onClick={() => {
                    if (!isPremium) {
                      toast({
                        title: "Premium Required",
                        description: "Upgrade to premium to enable two-factor authentication",
                        variant: "destructive",
                      });
                    } else {
                      toast({
                        title: "Feature Not Available",
                        description: "Two-factor authentication is not implemented in this demo.",
                      });
                    }
                  }}
                >
                  {isPremium ? "Enable" : "Upgrade"}
                </Button>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="font-medium flex items-center">
                    <Lock className="mr-2 h-4 w-4" /> Automatic Backups
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {isPremium ? "Available" : "Premium Feature"}
                  </div>
                </div>
                <Switch 
                  checked={autoBackups}
                  disabled={!isPremium}
                  onCheckedChange={(checked) => {
                    if (!isPremium) {
                      toast({
                        title: "Premium Required",
                        description: "Upgrade to premium to enable automatic backups",
                        variant: "destructive",
                      });
                    } else {
                      setAutoBackups(checked);
                    }
                  }}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border-destructive">
            <CardHeader>
              <CardTitle className="text-destructive">Danger Zone</CardTitle>
              <CardDescription>Irreversible account actions</CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                variant="destructive" 
                className="w-full"
                onClick={handleDeleteAccount}
              >
                Delete Account
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}