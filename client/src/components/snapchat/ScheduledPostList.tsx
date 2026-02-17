/**
 * Snapchat Scheduled Post List
 * 
 * A high-density management interface for visualizing and controlling multiple 
 * scheduled Snapchat stories. Features robust filtering, searching, and batch actions.
 */

import React, { useState } from "react";
import {
    Search,
    Filter,
    MoreVertical,
    Edit2,
    Trash2,
    Copy,
    Calendar,
    Clock,
    ExternalLink,
    ChevronDown,
    CheckCircle2,
    AlertCircle,
    Clock3,
    RefreshCw,
    LayoutGrid,
    List as ListIcon
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
    DropdownMenuLabel
} from "@/components/ui/dropdown-menu";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";
import { useSnapchatScheduler } from "@/hooks/use-snapchat-scheduler";
import { cn } from "@/lib/utils";

export const ScheduledPostList: React.FC = () => {
    const { scheduledPosts, isLoading, deletePost, duplicatePost } = useSnapchatScheduler();
    const [searchTerm, setSearchTerm] = useState("");
    const [viewMode, setViewMode] = useState<"list" | "grid">("list");
    const [statusFilter, setStatusFilter] = useState("all");

    const filteredPosts = scheduledPosts.filter(post => {
        const matchesSearch = (post.caption || "").toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === "all" || post.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "published": return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />;
            case "failed": return <AlertCircle className="w-3.5 h-3.5 text-rose-400" />;
            case "scheduled": return <Clock3 className="w-3.5 h-3.5 text-purple-400" />;
            default: return <RefreshCw className="w-3.5 h-3.5 text-blue-400" />;
        }
    };

    const statusColors: Record<string, string> = {
        scheduled: "bg-purple-500/10 text-purple-400 border-purple-500/30",
        published: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
        failed: "bg-rose-500/10 text-rose-400 border-rose-500/30",
        draft: "bg-blue-500/10 text-blue-400 border-blue-500/30",
    };

    return (
        <div className="space-y-6">
            {/* Control Bar */}
            <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder="Search campaigns, captions, or IDs..."
                        className="pl-10 h-11 bg-white/5 border-white/10 rounded-2xl focus:ring-purple-500/50"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    <Tabs defaultValue="all" className="w-full md:w-auto" onValueChange={setStatusFilter}>
                        <TabsList className="bg-white/5 border border-white/10 p-1 rounded-xl h-11">
                            <TabsTrigger value="all" className="rounded-lg px-4 text-xs font-bold uppercase tracking-widest data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400">All</TabsTrigger>
                            <TabsTrigger value="scheduled" className="rounded-lg px-4 text-xs font-bold uppercase tracking-widest data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400">Active</TabsTrigger>
                            <TabsTrigger value="published" className="rounded-lg px-4 text-xs font-bold uppercase tracking-widest data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-400">Sent</TabsTrigger>
                            <TabsTrigger value="failed" className="rounded-lg px-4 text-xs font-bold uppercase tracking-widest data-[state=active]:bg-rose-500/20 data-[state=active]:text-rose-400">Failed</TabsTrigger>
                        </TabsList>
                    </Tabs>

                    <div className="bg-white/5 border border-white/10 p-1 rounded-xl flex gap-1 h-11">
                        <Button
                            variant="ghost"
                            size="icon"
                            className={cn("h-9 w-9 rounded-lg", viewMode === "list" && "bg-white/10 text-purple-400")}
                            onClick={() => setViewMode("list")}
                        >
                            <ListIcon className="w-4 h-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className={cn("h-9 w-9 rounded-lg", viewMode === "grid" && "bg-white/10 text-purple-400")}
                            onClick={() => setViewMode("grid")}
                        >
                            <LayoutGrid className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </div>

            {/* Post Display Area */}
            {isLoading ? (
                <div className="grid grid-cols-1 gap-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-24 w-full bg-white/5 animate-pulse rounded-2xl border border-white/5" />
                    ))}
                </div>
            ) : filteredPosts.length > 0 ? (
                <div className={cn(
                    "grid gap-4",
                    viewMode === "grid" ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "grid-cols-1"
                )}>
                    <AnimatePresence>
                        {filteredPosts.map((post, idx) => (
                            <motion.div
                                key={post.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                            >
                                {viewMode === "list" ? (
                                    <Card className="border-white/5 bg-background/20 backdrop-blur-xl hover:bg-white/[0.03] transition-all group overflow-hidden rounded-2xl">
                                        <CardContent className="p-0 flex items-center h-24">
                                            <div className="h-full w-2 flex bg-gradient-to-b from-purple-500/50 to-pink-500/50 opacity-0 group-hover:opacity-100 transition-opacity" />

                                            <div className="w-16 h-16 ml-4 rounded-xl bg-black border border-white/5 overflow-hidden flex-shrink-0 relative">
                                                {post.mediaUrl ? (
                                                    <img src={post.mediaUrl} className="w-full h-full object-cover" alt="" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center bg-purple-500/10">
                                                        <Clock className="w-6 h-6 text-purple-400/30" />
                                                    </div>
                                                )}
                                                <div className="absolute top-0.5 right-0.5">
                                                    <Badge className="text-[8px] h-3 px-1 leading-none bg-black/60 font-mono">
                                                        {post.contentType.toUpperCase()}
                                                    </Badge>
                                                </div>
                                            </div>

                                            <div className="flex-1 ml-6 min-w-0 pr-4">
                                                <h4 className="font-bold text-sm truncate pr-12 group-hover:text-purple-400 transition-colors">
                                                    {post.caption || "Untitled Scheduled Story"}
                                                </h4>
                                                <div className="flex items-center gap-4 mt-2">
                                                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-mono">
                                                        <Calendar className="w-3 h-3 text-purple-400" />
                                                        {format(new Date(post.scheduledFor), "MMM d, yyyy")}
                                                    </div>
                                                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-mono">
                                                        <Clock className="w-3 h-3 text-emerald-400" />
                                                        {format(new Date(post.scheduledFor), "h:mm a")}
                                                    </div>
                                                    <Badge variant="outline" className={cn("text-[9px] h-5 font-bold uppercase tracking-tighter gap-1", statusColors[post.status as keyof typeof statusColors])}>
                                                        {getStatusIcon(post.status)}
                                                        {post.status}
                                                    </Badge>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2 pr-6">
                                                <Button variant="ghost" size="icon" className="w-9 h-9 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl">
                                                    <Edit2 className="w-4 h-4" />
                                                </Button>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="w-9 h-9 rounded-xl hover:bg-white/5">
                                                            <MoreVertical className="w-4 h-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="bg-background/95 backdrop-blur-xl border-white/5 rounded-xl min-w-[160px]">
                                                        <DropdownMenuLabel className="text-[9px] uppercase tracking-widest text-muted-foreground">Campaign Tools</DropdownMenuLabel>
                                                        <DropdownMenuSeparator className="bg-white/5" />
                                                        <DropdownMenuItem className="gap-2 cursor-pointer focus:bg-purple-500/10 focus:text-purple-400">
                                                            <ExternalLink className="w-3.5 h-3.5" /> View Asset
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            onClick={() => duplicatePost(post.id)}
                                                            className="gap-2 cursor-pointer focus:bg-purple-500/10 focus:text-purple-400"
                                                        >
                                                            <Copy className="w-3.5 h-3.5" /> Clone Post
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator className="bg-white/5" />
                                                        <DropdownMenuItem
                                                            className="gap-2 cursor-pointer text-rose-400 focus:bg-rose-500/10 focus:text-rose-400"
                                                            onClick={() => deletePost(post.id)}
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5" /> Cancel Schedule
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ) : (
                                    <Card className="border-white/5 bg-background/20 backdrop-blur-xl hover:bg-white/[0.03] transition-all group overflow-hidden rounded-3xl relative">
                                        <div className="aspect-[9/16] bg-black relative border-b border-white/5">
                                            {post.mediaUrl && <img src={post.mediaUrl} className="w-full h-full object-cover" alt="" />}
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-100 transition-opacity" />

                                            <div className="absolute top-4 right-4 flex gap-2">
                                                <Badge className={cn("text-[9px] font-bold uppercase", statusColors[post.status as keyof typeof statusColors])}>
                                                    {post.status}
                                                </Badge>
                                            </div>

                                            <div className="absolute bottom-4 left-4 right-4">
                                                <p className="text-white text-xs font-medium line-clamp-3 drop-shadow-lg leading-relaxed">
                                                    {post.caption || "No caption"}
                                                </p>
                                            </div>
                                        </div>
                                        <CardContent className="p-4 space-y-3">
                                            <div className="flex justify-between items-center">
                                                <div className="space-y-0.5">
                                                    <div className="text-[10px] text-muted-foreground flex items-center gap-1 font-mono">
                                                        <Calendar className="w-2.5 h-2.5" /> {format(new Date(post.scheduledFor), "MMM d")}
                                                    </div>
                                                    <div className="text-sm font-bold font-mono text-purple-400">
                                                        {format(new Date(post.scheduledFor), "h:mm a")}
                                                    </div>
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-9 w-9 bg-white/5 hover:bg-rose-500/20 hover:text-rose-400 rounded-xl"
                                                    onClick={() => deletePost(post.id)}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center p-20 rounded-3xl border-2 border-dashed border-white/5 bg-white/[0.01]">
                    <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6 opacity-30">
                        <Calendar className="w-10 h-10" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">No transmissions scheduled</h3>
                    <p className="text-sm text-muted-foreground text-center max-w-sm mb-8 leading-relaxed">
                        Your future stories will appear here once scheduled. Start by creating a new campaign.
                    </p>
                    <Button className="bg-gradient-to-r from-[#9a45ff] to-[#ff45d9] rounded-2xl h-11 px-8 font-bold shadow-xl shadow-purple-500/20">
                        Primary Ignition: Schedule Post
                    </Button>
                </div>
            )}
        </div>
    );
};
