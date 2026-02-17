/**
 * Snapchat Scheduler Page
 * 
 * The central command center for all Snapchat content scheduling activities.
 * Orchestrates multiple sub-components (Calendar, Form, List, Analytics, Settings)
 * into a cohesive, high-performance, and cinematically styled dashboard experience.
 */

import React, { useState } from "react";
import {
    Calendar as CalendarIcon,
    List as ListIcon,
    BarChart3,
    Settings as SettingsIcon,
    Plus,
    Zap,
    LayoutDashboard,
    ArrowRight,
    Sparkles,
    Command
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription
} from "@/components/ui/dialog";
import { SchedulerCalendar } from "@/components/snapchat/SchedulerCalendar";
import { ScheduledPostList } from "@/components/snapchat/ScheduledPostList";
import { SchedulerAnalytics } from "@/components/snapchat/SchedulerAnalytics";
import { SchedulerSettings } from "@/components/snapchat/SchedulerSettings";
import { ScheduleForm } from "@/components/snapchat/ScheduleForm";
import { MediaUploader } from "@/components/snapchat/MediaUploader";
import { StatusBanner } from "@/components/snapchat/StatusBanner";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";

const SnapchatScheduler: React.FC = () => {
    const [location] = useLocation();
    const { user } = useAuth();
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [selectedTab, setSelectedTab] = useState("calendar");
    const [uploadedMedia, setUploadedMedia] = useState<{ url: string; type: "image" | "video" } | null>(null);

    const isAccountActive = !!user?.snapchatClientId;

    const handleUploadComplete = (url: string, type: "image" | "video") => {
        setUploadedMedia({ url, type });
    };

    return (
        <div className="min-h-screen bg-[#0f0c16] text-white p-4 md:p-8 lg:p-12 pb-32">
            {/* Background Atmosphere */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-600/10 blur-[150px] rounded-full" />
                <div className="absolute bottom-[20%] right-[-5%] w-[30%] h-[30%] bg-pink-600/5 blur-[120px] rounded-full" />
            </div>

            <div className="max-w-[1600px] mx-auto space-y-10 relative z-10">
                {/* Header Section */}
                <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
                    <header className="space-y-3">
                        <div className="flex items-center gap-3">
                            <div className="bg-gradient-to-br from-[#9a45ff] to-[#ff45d9] p-2.5 rounded-2xl shadow-lg shadow-purple-500/20">
                                <Zap className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-xs font-black tracking-[0.3em] uppercase text-purple-400 opacity-80">
                                SNAPALYTICS PROTOCOL
                            </span>
                        </div>
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tighter text-white">
                            Content <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#9a45ff] to-[#ff45d9]">Scheduler</span>
                        </h1>
                        <p className="text-muted-foreground text-sm md:text-base max-w-2xl leading-relaxed">
                            Automate your Snapchat stories with precision. Schedule multi-format campaigns across global timezones with real-time success tracking.
                        </p>
                    </header>

                    <div className="flex flex-wrap gap-4">
                        <Button
                            onClick={() => setIsCreateModalOpen(true)}
                            size="lg"
                            className="bg-gradient-to-r from-[#9a45ff] to-[#ff45d9] hover:opacity-90 rounded-2xl px-8 h-14 font-black text-xs uppercase tracking-widest gap-3 shadow-2xl shadow-purple-500/30 transition-all active:scale-95"
                        >
                            <Plus className="w-5 h-5" />
                            New Campaign
                        </Button>
                        <Button
                            variant="outline"
                            className="bg-white/5 border-white/10 hover:bg-white/10 rounded-2xl h-14 px-6 text-xs font-bold uppercase tracking-widest"
                        >
                            <Command className="w-4 h-4 mr-2" />
                            Batch Import
                        </Button>
                    </div>
                </div>

                {!isAccountActive && (
                    <StatusBanner
                        type="warning"
                        message="Snapchat Public Profile is not currently linked. Scheduled posts will remain in 'Draft' state until a verified connection is established."
                        actionText="Connect Account"
                        onAction={() => window.location.href = "/connect"}
                    />
                )}

                {/* Dashboard Navigation */}
                <Tabs defaultValue="calendar" className="w-full" onValueChange={setSelectedTab}>
                    <div className="bg-white/[0.03] backdrop-blur-3xl border border-white/5 p-1.5 rounded-3xl mb-10 overflow-x-auto scrollbar-none flex-shrink-0">
                        <TabsList className="bg-transparent h-14 w-full md:w-auto justify-start border-none">
                            {[
                                { value: "calendar", label: "Monthly Grid", icon: CalendarIcon },
                                { value: "list", label: "Campaign List", icon: ListIcon },
                                { value: "analytics", label: "Performance", icon: BarChart3 },
                                { value: "settings", label: "Configuration", icon: SettingsIcon },
                            ].map((tab) => (
                                <TabsTrigger
                                    key={tab.value}
                                    value={tab.value}
                                    className={cn(
                                        "rounded-2xl px-8 h-full text-xs font-black uppercase tracking-widest gap-3 transition-all",
                                        "data-[state=active]:bg-white/10 data-[state=active]:text-purple-400 data-[state=active]:shadow-xl"
                                    )}
                                >
                                    <tab.icon className="w-4 h-4" />
                                    <span className="hidden md:inline">{tab.label}</span>
                                </TabsTrigger>
                            ))}
                        </TabsList>
                    </div>

                    <AnimatePresence mode="wait">
                        <motion.div
                            key={selectedTab}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3, ease: "easeOut" }}
                            className="min-h-[600px]"
                        >
                            <TabsContent value="calendar" className="mt-0 outline-none">
                                <SchedulerCalendar />
                            </TabsContent>

                            <TabsContent value="list" className="mt-0 outline-none">
                                <ScheduledPostList />
                            </TabsContent>

                            <TabsContent value="analytics" className="mt-0 outline-none">
                                <SchedulerAnalytics />
                            </TabsContent>

                            <TabsContent value="settings" className="mt-0 outline-none">
                                <SchedulerSettings />
                            </TabsContent>
                        </motion.div>
                    </AnimatePresence>
                </Tabs>
            </div>

            {/* Creation Modal */}
            <Dialog open={isCreateModalOpen} onOpenChange={(open) => {
                setIsCreateModalOpen(open);
                if (!open) setUploadedMedia(null);
            }}>
                <DialogContent className="max-w-6xl h-[90vh] bg-[#0f0c16] border-white/5 rounded-[40px] p-0 overflow-hidden backdrop-blur-3xl">
                    <div className="h-full flex flex-col md:flex-row">
                        {/* Static Step Sidebar */}
                        <div className="w-full md:w-80 bg-gradient-to-b from-[#1a1625] to-[#0f0c16] border-r border-white/5 p-8 flex flex-col">
                            <div className="flex items-center gap-3 mb-10">
                                <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
                                    <Plus className="w-5 h-5 text-purple-400" />
                                </div>
                                <h3 className="font-black text-sm uppercase tracking-widest">New Story</h3>
                            </div>

                            <div className="space-y-6 flex-1">
                                {[
                                    { label: "1. Asset Ingestion", status: uploadedMedia ? "complete" : "active" },
                                    { label: "2. Logic & Scheduling", status: uploadedMedia ? "active" : "pending" },
                                    { label: "3. Final Encryption", status: "pending" },
                                ].map((step, i) => (
                                    <div key={i} className="flex gap-4 items-start">
                                        <div className={cn(
                                            "w-6 h-6 rounded-full border-2 flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5",
                                            step.status === "complete" ? "bg-emerald-500 border-emerald-500 text-white" :
                                                step.status === "active" ? "border-purple-500 text-purple-400" :
                                                    "border-white/10 text-muted-foreground"
                                        )}>
                                            {step.status === "complete" ? "✓" : i + 1}
                                        </div>
                                        <div>
                                            <p className={cn(
                                                "text-xs font-bold uppercase tracking-wider",
                                                step.status === "pending" ? "text-muted-foreground opacity-40" : "text-white"
                                            )}>
                                                {step.label}
                                            </p>
                                            {step.status === "active" && (
                                                <p className="text-[10px] text-purple-400 mt-1 font-medium animate-pulse">Required Priority</p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="pt-8 border-t border-white/5">
                                <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Sparkles className="w-4 h-4 text-purple-400" />
                                        <span className="text-[10px] font-bold uppercase text-purple-400">Pro Tip</span>
                                    </div>
                                    <p className="text-[10px] text-muted-foreground leading-relaxed">
                                        Keep videos under 10s for maximum retention rates on the Snapchat Story feed.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Content Area */}
                        <div className="flex-1 overflow-y-auto p-12 scrollbar-thin">
                            <DialogHeader className="mb-10 text-left">
                                <DialogTitle className="text-3xl font-black tracking-tighter">
                                    {uploadedMedia ? "Configure Campaign" : "Select Story Asset"}
                                </DialogTitle>
                                <DialogDescription className="text-muted-foreground">
                                    {uploadedMedia
                                        ? "Asset ready. Configure caption and scheduled launch window."
                                        : "Start by uploading your vertical story asset (9:16)."}
                                </DialogDescription>
                            </DialogHeader>

                            <AnimatePresence mode="wait">
                                {!uploadedMedia ? (
                                    <motion.div
                                        key="step1"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                    >
                                        <MediaUploader onUploadComplete={handleUploadComplete} />
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="step2"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                    >
                                        <ScheduleForm
                                            initialValues={{
                                                mediaUrl: uploadedMedia.url,
                                                contentType: uploadedMedia.type as "image" | "video"
                                            }}
                                            onSuccess={() => setIsCreateModalOpen(false)}
                                            onCancel={() => setUploadedMedia(null)}
                                        />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Bottom Floating Stats (Mobile) */}
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] md:w-auto h-20 bg-background/80 backdrop-blur-2xl border border-white/10 rounded-[30px] flex items-center px-10 gap-12 shadow-2xl z-50 md:hidden overflow-x-auto scrollbar-none">
                <div className="flex-shrink-0 text-center">
                    <p className="text-[8px] uppercase tracking-widest text-muted-foreground mb-1 font-bold">Planned</p>
                    <p className="text-xl font-black text-purple-400">12</p>
                </div>
                <div className="flex-shrink-0 text-center">
                    <p className="text-[8px] uppercase tracking-widest text-muted-foreground mb-1 font-bold">Health</p>
                    <p className="text-xl font-black text-emerald-400">98%</p>
                </div>
                <div className="flex-shrink-0 text-center">
                    <p className="text-[8px] uppercase tracking-widest text-muted-foreground mb-1 font-bold">Limit</p>
                    <p className="text-xl font-black text-blue-400">8/10</p>
                </div>
                <Button onClick={() => setIsCreateModalOpen(true)} size="icon" className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#9a45ff] to-[#ff45d9] flex-shrink-0 shadow-lg shadow-purple-500/20">
                    <Plus className="w-6 h-6 text-white" />
                </Button>
            </div>
        </div>
    );
};

export default SnapchatScheduler;
