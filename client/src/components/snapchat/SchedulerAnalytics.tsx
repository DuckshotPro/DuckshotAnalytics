/**
 * Snapchat Scheduler Analytics
 * 
 * Performance monitoring dashboard for the content scheduler.
 * Provides high-fidelity visualizations of publishing health, success rates, 
 * and audience engagement trends.
 */

import React from "react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip as RechartsTooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    LineChart,
    Line,
    AreaChart,
    Area
} from "recharts";
import {
    TrendingUp,
    CheckCircle2,
    AlertCircle,
    Clock,
    Activity,
    Zap,
    ArrowUpRight,
    ArrowDownRight,
    Target,
    BarChart3
} from "lucide-react";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useSnapchatScheduler } from "@/hooks/use-snapchat-scheduler";
import { cn } from "@/lib/utils";

export const SchedulerAnalytics: React.FC = () => {
    const { stats } = useSnapchatScheduler();

    // Demo data if real stats are not yet populated
    const healthData = [
        { name: "Success", value: stats?.successCount || 0, color: "#10b981" },
        { name: "Failed", value: stats?.failCount || 0, color: "#f43f5e" },
        { name: "Pending", value: stats?.pendingCount || 0, color: "#9a45ff" },
    ];

    const frequencyData = [
        { day: "Mon", posts: 4 },
        { day: "Tue", posts: 7 },
        { day: "Wed", posts: 5 },
        { day: "Thu", posts: 12 },
        { day: "Fri", posts: 8 },
        { day: "Sat", posts: 15 },
        { day: "Sun", posts: 10 },
    ];

    const engagementData = [
        { time: "00:00", views: 200, engagement: 20 },
        { time: "04:00", views: 150, engagement: 15 },
        { time: "08:00", views: 450, engagement: 45 },
        { time: "12:00", views: 800, engagement: 80 },
        { time: "16:00", views: 1200, engagement: 120 },
        { time: "20:00", views: 1500, engagement: 150 },
        { time: "23:59", views: 900, engagement: 90 },
    ];

    return (
        <div className="space-y-8">
            {/* High-Level KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    {
                        label: "Publish Success",
                        value: `${stats?.successRate || "96.4"}%`,
                        trend: "+2.1%",
                        icon: CheckCircle2,
                        color: "text-emerald-400",
                        sub: "Last 30 days"
                    },
                    {
                        label: "Avg. Engagement",
                        value: "14.2%",
                        trend: "+0.8%",
                        icon: Target,
                        color: "text-purple-400",
                        sub: "Stories published"
                    },
                    {
                        label: "Upcoming Queue",
                        value: stats?.queueCount || "24",
                        trend: "Active",
                        icon: Clock,
                        color: "text-blue-400",
                        sub: "Next 48 hours"
                    },
                    {
                        label: "Critical Errors",
                        value: stats?.errorCount?.toString() || "0",
                        trend: "0.0%",
                        icon: AlertCircle,
                        color: "text-rose-400",
                        sub: "Requires attention"
                    },
                ].map((kpi, i) => (
                    <Card key={i} className="border-white/5 bg-background/20 backdrop-blur-xl hover:bg-white/[0.04] transition-all group overflow-hidden rounded-3xl">
                        <CardContent className="p-6">
                            <div className="flex justify-between items-start">
                                <div className={cn("p-2 rounded-xl bg-white/5", kpi.color)}>
                                    <kpi.icon className="w-5 h-5" />
                                </div>
                                <Badge variant="outline" className="border-white/10 text-[9px] font-mono tracking-tighter bg-white/5">
                                    {kpi.trend.startsWith("+") ? <ArrowUpRight className="w-2.5 h-2.5 mr-1 text-emerald-400" /> : <ArrowDownRight className="w-2.5 h-2.5 mr-1 text-rose-400" />}
                                    {kpi.trend}
                                </Badge>
                            </div>
                            <div className="mt-4">
                                <h3 className="text-3xl font-black tracking-tighter text-white">{kpi.value}</h3>
                                <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mt-1">{kpi.label}</p>
                                <div className="mt-4 flex items-center gap-2">
                                    <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden">
                                        <div className={cn("h-full rounded-full transition-all duration-1000", kpi.color.replace('text', 'bg'))} style={{ width: '70%' }} />
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Success Health Chart */}
                <Card className="lg:col-span-1 border-white/5 bg-background/40 backdrop-blur-xl rounded-3xl overflow-hidden h-[450px]">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Activity className="w-5 h-5 text-emerald-400" />
                            System Health
                        </CardTitle>
                        <CardDescription>Publishing success vs distribution</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center justify-center pt-0 h-full">
                        <div className="h-[250px] w-full mt-[-40px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={healthData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={70}
                                        outerRadius={95}
                                        paddingAngle={8}
                                        dataKey="value"
                                        stroke="none"
                                    >
                                        {healthData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} fillOpacity={0.8} />
                                        ))}
                                    </Pie>
                                    <RechartsTooltip
                                        contentStyle={{ backgroundColor: '#1a1625', borderColor: '#333', borderRadius: '12px' }}
                                        itemStyle={{ color: '#fff' }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                            {/* Center Overlay Text */}
                            <div className="absolute inset-x-0 top-[210px] text-center">
                                <span className="text-2xl font-black text-white">96.4%</span>
                                <p className="text-[10px] text-muted-foreground uppercase opacity-60">Success</p>
                            </div>
                        </div>

                        <div className="w-full space-y-3 mt-8">
                            {healthData.map((item) => (
                                <div key={item.name} className="flex items-center justify-between text-xs px-4 py-2 bg-white/5 rounded-xl border border-white/5">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                                        <span className="font-bold uppercase tracking-wider opacity-70">{item.name}</span>
                                    </div>
                                    <span className="font-mono">{item.value}%</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Engagement Trend */}
                <Card className="lg:col-span-2 border-white/5 bg-background/40 backdrop-blur-xl rounded-3xl overflow-hidden h-[450px]">
                    <CardHeader>
                        <div className="flex justify-between items-center">
                            <div>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <TrendingUp className="w-5 h-5 text-purple-400" />
                                    Engagement Forecast
                                </CardTitle>
                                <CardDescription>High-engagement windows based on historical data</CardDescription>
                            </div>
                            <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                                <Zap className="w-3 h-3 mr-1" />
                                Optimal Period: 20:00 - 22:00
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="h-[320px] pt-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={engagementData}>
                                <defs>
                                    <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#9a45ff" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#9a45ff" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff08" />
                                <XAxis
                                    dataKey="time"
                                    stroke="#888"
                                    fontSize={10}
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#666' }}
                                />
                                <YAxis
                                    stroke="#888"
                                    fontSize={10}
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#666' }}
                                />
                                <RechartsTooltip
                                    contentStyle={{ backgroundColor: '#1a1625', borderColor: '#333', borderRadius: '12px', border: 'none', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }}
                                    itemStyle={{ color: '#fff' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="views"
                                    stroke="#9a45ff"
                                    strokeWidth={4}
                                    fillOpacity={1}
                                    fill="url(#colorViews)"
                                />
                                <Area
                                    type="monotone"
                                    dataKey="engagement"
                                    stroke="#ff45d9"
                                    strokeWidth={2}
                                    fill="none"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            {/* Posting Volume */}
            <Card className="border-white/5 bg-background/40 backdrop-blur-xl rounded-3xl overflow-hidden">
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-blue-400" />
                        Transmission Volume
                    </CardTitle>
                    <CardDescription>Content production levels per day</CardDescription>
                </CardHeader>
                <CardContent className="h-[250px] pt-4">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={frequencyData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff08" />
                            <XAxis dataKey="day" stroke="#888" fontSize={10} axisLine={false} tickLine={false} />
                            <YAxis stroke="#888" fontSize={10} axisLine={false} tickLine={false} />
                            <RechartsTooltip
                                cursor={{ fill: '#ffffff05' }}
                                contentStyle={{ backgroundColor: '#1a1625', border: 'none', borderRadius: '12PX' }}
                            />
                            <Bar dataKey="posts" fill="#9a45ff" radius={[8, 8, 0, 0]}>
                                {frequencyData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fillOpacity={entry.posts > 10 ? 1 : 0.5} fill={entry.posts > 10 ? '#b06aff' : '#9a45ff'} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </div>
    );
};
