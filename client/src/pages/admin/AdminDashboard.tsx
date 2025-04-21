import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { AlertCircle, Users, Activity, Database, Shield, FileText, Settings } from "lucide-react";
import { Link, useLocation } from "wouter";

// Mock admin data for system logs and metrics
const systemLogs = [
  { id: 1, timestamp: "2023-04-21 11:42:24", level: "INFO", message: "User login successful: Duck" },
  { id: 2, timestamp: "2023-04-21 11:42:44", level: "INFO", message: "Snapchat data refreshed for user: Duck" },
  { id: 3, timestamp: "2023-04-21 11:39:08", level: "INFO", message: "Insights generated for user: Duck" },
  { id: 4, timestamp: "2023-04-21 11:38:51", level: "WARNING", message: "Failed login attempt for user: Duck" },
  { id: 5, timestamp: "2023-04-21 11:38:22", level: "WARNING", message: "User registration failed: username already exists" },
];

const userMetrics = [
  { name: "Jan", users: 4, premium: 1 },
  { name: "Feb", users: 8, premium: 2 },
  { name: "Mar", users: 15, premium: 5 },
  { name: "Apr", users: 22, premium: 7 },
];

const apiMetrics = [
  { name: "Jan", requests: 120, failures: 5 },
  { name: "Feb", requests: 250, failures: 8 },
  { name: "Mar", requests: 380, failures: 12 },
  { name: "Apr", requests: 520, failures: 15 },
];

export default function AdminDashboard() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState("overview");
  const [loggingLevel, setLoggingLevel] = useState("info");
  const [dataRetentionDays, setDataRetentionDays] = useState("90");

  // Check if user is admin, redirect if not
  useEffect(() => {
    // This is a placeholder - in a real app you'd check for admin role
    if (!user || user.username !== "Duck") {
      navigate("/");
    }
  }, [user, navigate]);

  // Example query for system status (would come from API)
  const { data: systemStatus } = useQuery({
    queryKey: ["/api/admin/system-status"],
    queryFn: () => Promise.resolve({
      dbStatus: "healthy",
      apiConnections: "operational",
      diskUsage: "26%",
      memory: "42%",
      userCount: 22,
      premiumUsers: 7,
      dailyApiCalls: 520,
      errorRate: "2.8%"
    })
  });

  if (!user) {
    return <div className="flex h-screen items-center justify-center">Redirecting...</div>;
  }

  return (
    <div className="dark-card min-h-screen p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Admin Console</h1>
          <p className="text-muted-foreground">Manage system settings, user data, and monitor performance</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <p className="text-sm font-medium">Logged in as</p>
            <p className="text-sm text-muted-foreground">{user.username} (Administrator)</p>
          </div>
          <div className="purple-pink-gradient-bg rounded-full w-10 h-10 flex items-center justify-center text-white">
            {user.username[0].toUpperCase()}
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <div className="dark-card p-1 rounded-md">
          <TabsList className="grid grid-cols-6 w-full">
            <TabsTrigger value="overview" className="flex items-center">
              <Activity className="mr-2 h-4 w-4" />
              <span>Overview</span>
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center">
              <Users className="mr-2 h-4 w-4" />
              <span>Users</span>
            </TabsTrigger>
            <TabsTrigger value="database" className="flex items-center">
              <Database className="mr-2 h-4 w-4" />
              <span>Database</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center">
              <Shield className="mr-2 h-4 w-4" />
              <span>Security</span>
            </TabsTrigger>
            <TabsTrigger value="logs" className="flex items-center">
              <FileText className="mr-2 h-4 w-4" />
              <span>Logs</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center">
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="dark-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Users</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{systemStatus?.userCount || "Loading..."}</div>
                <p className="text-xs text-muted-foreground">+4 from last week</p>
              </CardContent>
            </Card>
            <Card className="dark-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Premium Users</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{systemStatus?.premiumUsers || "Loading..."}</div>
                <p className="text-xs text-muted-foreground">31.8% conversion rate</p>
              </CardContent>
            </Card>
            <Card className="dark-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">API Calls (24h)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{systemStatus?.dailyApiCalls || "Loading..."}</div>
                <p className="text-xs text-muted-foreground">+12% from yesterday</p>
              </CardContent>
            </Card>
            <Card className="dark-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Error Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{systemStatus?.errorRate || "Loading..."}</div>
                <p className="text-xs text-muted-foreground">-0.4% from last week</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="dark-card">
              <CardHeader>
                <CardTitle>User Growth</CardTitle>
                <CardDescription>Monthly user registrations and premium conversions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={userMetrics}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(100, 100, 100, 0.2)" />
                      <XAxis dataKey="name" stroke="var(--muted-foreground)" />
                      <YAxis stroke="var(--muted-foreground)" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'var(--card)', 
                          borderColor: 'var(--border)',
                          color: 'var(--card-foreground)'
                        }} 
                      />
                      <Bar dataKey="users" fill="var(--primary)" />
                      <Bar dataKey="premium" fill="var(--accent)" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="dark-card">
              <CardHeader>
                <CardTitle>API Performance</CardTitle>
                <CardDescription>Monthly API requests and failure rates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={apiMetrics}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(100, 100, 100, 0.2)" />
                      <XAxis dataKey="name" stroke="var(--muted-foreground)" />
                      <YAxis stroke="var(--muted-foreground)" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'var(--card)', 
                          borderColor: 'var(--border)',
                          color: 'var(--card-foreground)'
                        }} 
                      />
                      <Bar dataKey="requests" fill="var(--primary)" />
                      <Bar dataKey="failures" fill="var(--destructive)" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="dark-card">
            <CardHeader>
              <CardTitle>System Status</CardTitle>
              <CardDescription>Current status of system components</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="flex items-center space-x-2">
                  <div className="h-2.5 w-2.5 rounded-full bg-green-500"></div>
                  <span className="text-sm">Database: {systemStatus?.dbStatus || "Loading..."}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="h-2.5 w-2.5 rounded-full bg-green-500"></div>
                  <span className="text-sm">API: {systemStatus?.apiConnections || "Loading..."}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="h-2.5 w-2.5 rounded-full bg-green-500"></div>
                  <span className="text-sm">Disk: {systemStatus?.diskUsage || "Loading..."}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="h-2.5 w-2.5 rounded-full bg-green-500"></div>
                  <span className="text-sm">Memory: {systemStatus?.memory || "Loading..."}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs" className="space-y-4">
          <Card className="dark-card">
            <CardHeader>
              <CardTitle>System Logs</CardTitle>
              <CardDescription>Recent system activity and events</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative overflow-x-auto rounded-md">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs uppercase bg-secondary text-secondary-foreground">
                    <tr>
                      <th scope="col" className="px-6 py-3">Timestamp</th>
                      <th scope="col" className="px-6 py-3">Level</th>
                      <th scope="col" className="px-6 py-3">Message</th>
                    </tr>
                  </thead>
                  <tbody>
                    {systemLogs.map((log) => (
                      <tr key={log.id} className="border-b border-border">
                        <td className="px-6 py-4">{log.timestamp}</td>
                        <td className="px-6 py-4">
                          <span className={
                            log.level === "WARNING" 
                              ? "text-yellow-400" 
                              : log.level === "ERROR" 
                                ? "text-red-400" 
                                : "text-green-400"
                          }>
                            {log.level}
                          </span>
                        </td>
                        <td className="px-6 py-4">{log.message}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline">Export Logs</Button>
              <Button variant="ghost">Clear Logs</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card className="dark-card">
            <CardHeader>
              <CardTitle>System Settings</CardTitle>
              <CardDescription>Configure system-wide settings and defaults</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="logging-level">Logging Level</Label>
                <Select value={loggingLevel} onValueChange={setLoggingLevel}>
                  <SelectTrigger id="logging-level" className="dark-input">
                    <SelectValue placeholder="Select logging level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="debug">Debug</SelectItem>
                    <SelectItem value="info">Info</SelectItem>
                    <SelectItem value="warning">Warning</SelectItem>
                    <SelectItem value="error">Error</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">Controls the verbosity of system logs</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="data-retention">Data Retention (days)</Label>
                <Input
                  id="data-retention"
                  value={dataRetentionDays}
                  onChange={(e) => setDataRetentionDays(e.target.value)}
                  className="dark-input"
                />
                <p className="text-xs text-muted-foreground">How long to keep system logs and usage metrics</p>
              </div>

              <div className="flex items-center space-x-2">
                <Switch id="maintenance-mode" />
                <Label htmlFor="maintenance-mode">Maintenance Mode</Label>
                <div className="flex-grow"></div>
                <p className="text-xs text-muted-foreground">Put the system in maintenance mode</p>
              </div>

              <div className="flex items-center space-x-2">
                <Switch id="debug-mode" />
                <Label htmlFor="debug-mode">Debug Mode</Label>
                <div className="flex-grow"></div>
                <p className="text-xs text-muted-foreground">Enable verbose debugging output</p>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="purple-pink-gradient-bg hover:opacity-90">Save Changes</Button>
            </CardFooter>
          </Card>

          <Card className="dark-card border-destructive/50">
            <CardHeader className="text-destructive">
              <CardTitle className="flex items-center">
                <AlertCircle className="h-4 w-4 mr-2" />
                Danger Zone
              </CardTitle>
              <CardDescription>Destructive actions that cannot be undone</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-medium">Reset Analytics Data</h4>
                  <p className="text-sm text-muted-foreground">Clears all analytics data while preserving user accounts</p>
                </div>
                <Button variant="outline" className="border-destructive text-destructive hover:bg-destructive/10">
                  Reset Data
                </Button>
              </div>
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-medium">Purge All Logs</h4>
                  <p className="text-sm text-muted-foreground">Permanently deletes all system logs</p>
                </div>
                <Button variant="outline" className="border-destructive text-destructive hover:bg-destructive/10">
                  Purge Logs
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users">
          <Card className="dark-card">
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>View and manage system users</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-center py-8">User management interface under development</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="database">
          <Card className="dark-card">
            <CardHeader>
              <CardTitle>Database Management</CardTitle>
              <CardDescription>Manage database operations and backups</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-center py-8">Database management interface under development</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card className="dark-card">
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>Configure security options and access controls</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-center py-8">Security settings interface under development</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}