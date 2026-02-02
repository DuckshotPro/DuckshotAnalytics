/**
 * Snapchat Scheduler Settings
 * 
 * Management interface for scheduler preferences, account status,
 * and automation configurations. Features account reconnect tools
 * and granular notification settings.
 */

import React from "react";
import {
    Settings,
    Bell,
    Globe,
    Shield,
    RefreshCw,
    LogOut,
    Smartphone,
    CheckCircle2,
    AlertTriangle,
    ExternalLink,
    ChevronRight,
    Database,
    History
} from "lucide-react";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";

export const SchedulerSettings: React.FC = () => {
    const { user } = useAuth();
    const isAccountActive = !!user?.snapchatClientId;

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            {/* Account Status Hero */}
            <Card className="border-white/5 bg-gradient-to-br from-[#1a1625] to-[#0f0c16] rounded-3xl overflow-hidden relative group">
                <div className="absolute inset-0 bg-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                <CardContent className="p-8">
                    <div className="flex flex-col md:flex-row gap-8 items-center">
                        <div className="relative">
                            <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-[#9a45ff] to-[#ff45d9] flex items-center justify-center shadow-2xl shadow-purple-500/20 rotate-3">
                                {isAccountActive ? (
                                    <CheckCircle2 className="w-12 h-12 text-white" />
                                ) : (
                                    <Smartphone className="w-12 h-12 text-white" />
                                )}
                            </div>
                            {isAccountActive && (
                                <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-emerald-500 border-4 border-[#1a1625] flex items-center justify-center">
                                    <CheckCircle2 className="w-4 h-4 text-white" />
                                </div>
                            )}
                        </div>

                        <div className="flex-1 text-center md:text-left">
                            <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                                <h2 className="text-2xl font-black text-white">
                                    {user?.displayName || user?.username || "Snapchat Unconnected"}
                                </h2>
                                {isAccountActive && (
                                    <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 font-bold tracking-widest text-[10px]">
                                        ACTIVE LINK
                                    </Badge>
                                )}
                            </div>
                            <p className="text-sm text-muted-foreground leading-relaxed max-w-md">
                                {isAccountActive
                                    ? "Your account is successfully integrated with DuckShot Pro. All scheduled transmissions are being routed through our secure proxy."
                                    : "Connect your Snapchat Professional account to enable scheduled story posting and advanced analytics routing."}
                            </p>
                        </div>

                        <div className="flex gap-3">
                            <Button
                                variant="outline"
                                className="rounded-2xl border-white/10 bg-white/5 hover:bg-white/10 text-xs font-bold uppercase tracking-widest px-6"
                            >
                                {isAccountActive ? "Refresh Tokens" : "Get Started"}
                            </Button>
                        </div>
                    </div>

                    <div className="mt-8 pt-6 border-t border-white/5 flex flex-wrap gap-6">
                        <div className="flex items-center gap-2">
                            <Shield className="w-4 h-4 text-purple-400" />
                            <span className="text-xs font-medium text-muted-foreground">Encryption: AES-256</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Database className="w-4 h-4 text-emerald-400" />
                            <span className="text-xs font-medium text-muted-foreground">Storage: Cloud Standard</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Smartphone className="w-4 h-4 text-blue-400" />
                            <span className="text-xs font-medium text-muted-foreground">API Version: 2.0.4</span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Localization & Region */}
                <Card className="border-white/5 bg-background/20 backdrop-blur-xl rounded-2xl overflow-hidden">
                    <CardHeader className="border-b border-white/5 pb-4">
                        <CardTitle className="text-base flex items-center gap-2">
                            <Globe className="w-4 h-4 text-blue-400" />
                            Localization
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 space-y-6">
                        <div className="space-y-2">
                            <Label className="text-xs font-bold text-muted-foreground uppercase opacity-60">Default Timezone</Label>
                            <Select defaultValue="America/Chicago">
                                <SelectTrigger className="h-11 bg-white/5 border-white/10 rounded-xl">
                                    <SelectValue placeholder="Select timezone" />
                                </SelectTrigger>
                                <SelectContent className="bg-background/95 border-white/10 rounded-xl">
                                    <SelectItem value="UTC">UTC (Universal)</SelectItem>
                                    <SelectItem value="America/Chicago">Chicago (CST)</SelectItem>
                                    <SelectItem value="America/New_York">New York (EST)</SelectItem>
                                    <SelectItem value="Europe/London">London (GMT)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                            <div className="space-y-0.5">
                                <Label className="text-sm font-bold">Auto-detect Region</Label>
                                <p className="text-[10px] text-muted-foreground">Sync with browser location automatically</p>
                            </div>
                            <Switch defaultChecked />
                        </div>
                    </CardContent>
                </Card>

                {/* System Monitoring */}
                <Card className="border-white/5 bg-background/20 backdrop-blur-xl rounded-2xl overflow-hidden">
                    <CardHeader className="border-b border-white/5 pb-4">
                        <CardTitle className="text-base flex items-center gap-2">
                            <Bell className="w-4 h-4 text-purple-400" />
                            Notifications
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 space-y-4">
                        {[
                            { label: "Publish Success", desc: "Notify me when a story goes live", default: true },
                            { label: "Critical Failures", desc: "Urgent alerts if a transmission fails", default: true },
                            { label: "Daily Summary", desc: "Emailed report of scheduled activities", default: false },
                            { label: "Storage Limit", desc: "Warnings when cloud storage is above 90%", default: true },
                        ].map((pref, i) => (
                            <div key={i} className="flex items-center justify-between py-2">
                                <div className="space-y-0.5">
                                    <Label className="text-sm font-semibold">{pref.label}</Label>
                                    <p className="text-[10px] text-muted-foreground">{pref.desc}</p>
                                </div>
                                <Switch defaultChecked={pref.default} className="data-[state=checked]:bg-purple-500" />
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>

            {/* Advanced Control History */}
            <Card className="border-white/5 bg-background/20 backdrop-blur-xl rounded-2xl overflow-hidden">
                <CardHeader className="border-b border-white/5 pb-4">
                    <CardTitle className="text-base flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <History className="w-4 h-4 text-orange-400" />
                            Audit Logs
                        </div>
                        <Button variant="link" className="text-[10px] text-purple-400 uppercase tracking-widest font-bold h-auto p-0">Download History</Button>
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="divide-y divide-white/5">
                        {[
                            { event: "Token Refreshed", time: "2 hours ago", status: "success" },
                            { event: "Account Linked", time: "3 days ago", status: "success" },
                            { event: "Settings Updated", time: "5 days ago", status: "info" },
                        ].map((log, i) => (
                            <div key={i} className="flex items-center justify-between p-4 hover:bg-white/[0.02] transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className={cn(
                                        "w-2 h-2 rounded-full",
                                        log.status === "success" ? "bg-emerald-500" : "bg-blue-500"
                                    )} />
                                    <span className="text-xs font-medium">{log.event}</span>
                                </div>
                                <span className="text-[10px] font-mono text-muted-foreground">{log.time}</span>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            <div className="flex justify-between items-center py-6 border-t border-white/5">
                <div className="flex items-center gap-2 text-rose-500 cursor-pointer hover:opacity-80 transition-opacity">
                    <LogOut className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-widest">Disconnect Snapchat</span>
                </div>
                <Button className="bg-gradient-to-r from-[#9a45ff] to-[#ff45d9] rounded-2xl px-10 h-11 font-black shadow-xl shadow-purple-500/20">
                    SAVE PREFERENCES
                </Button>
            </div>
        </div>
    );
};
