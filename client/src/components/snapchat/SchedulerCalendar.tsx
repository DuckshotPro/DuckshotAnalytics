/**
 * Snapchat Scheduler Calendar
 * 
 * A premium, interactive calendar view for visualizing and managing
 * scheduled Snapchat content. Uses glassmorphism and animated transitions.
 */

import React, { useState } from "react";
import {
    format,
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    eachDayOfInterval,
    isSameMonth,
    isSameDay,
    addMonths,
    subMonths,
    isToday
} from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import {
    ChevronLeft,
    ChevronRight,
    Calendar as CalendarIcon,
    Plus,
    Clock,
    MoreVertical,
    Edit2,
    Trash2,
    Copy
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useSnapchatScheduler } from "@/hooks/use-snapchat-scheduler";

interface SchedulerCalendarProps {
    onSelectDate?: (date: Date) => void;
    onEditPost?: (post: any) => void;
}

export const SchedulerCalendar: React.FC<SchedulerCalendarProps> = ({
    onSelectDate,
    onEditPost
}) => {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());
    const { scheduledPosts, deletePost, isLoading } = useSnapchatScheduler();

    const days = eachDayOfInterval({
        start: startOfWeek(startOfMonth(currentMonth)),
        end: endOfWeek(endOfMonth(currentMonth)),
    });

    const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
    const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

    const postsForDay = (date: Date) => {
        return scheduledPosts.filter((post) => isSameDay(new Date(post.scheduledFor), date));
    };

    const statusColors: Record<string, string> = {
        scheduled: "bg-purple-500/20 text-purple-400 border-purple-500/50",
        published: "bg-emerald-500/20 text-emerald-400 border-emerald-500/50",
        failed: "bg-rose-500/20 text-rose-400 border-rose-500/50",
        draft: "bg-blue-500/20 text-blue-400 border-blue-500/50",
    };

    return (
        <div className="space-y-6">
            {/* Calendar Header */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <div className="p-3 rounded-2xl bg-gradient-to-br from-[#9a45ff] to-[#ff45d9] shadow-lg shadow-purple-500/20">
                        <CalendarIcon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                            Content Schedule
                        </h2>
                        <p className="text-sm text-muted-foreground">{format(currentMonth, "MMMM yyyy")}</p>
                    </div>
                </div>

                <div className="flex items-center gap-2 bg-background/50 backdrop-blur-md border border-white/5 p-1 rounded-xl">
                    <Button variant="ghost" size="icon" onClick={prevMonth} className="hover:bg-white/5">
                        <ChevronLeft className="w-5 h-5" />
                    </Button>
                    <Button variant="ghost" className="px-4 font-medium hover:bg-white/5" onClick={() => setCurrentMonth(new Date())}>
                        Today
                    </Button>
                    <Button variant="ghost" size="icon" onClick={nextMonth} className="hover:bg-white/5">
                        <ChevronRight className="w-5 h-5" />
                    </Button>
                </div>
            </div>

            {/* Calendar Grid */}
            <Card className="border-white/5 bg-background/20 backdrop-blur-xl shadow-2xl overflow-hidden rounded-3xl">
                <CardContent className="p-0">
                    <div className="grid grid-cols-7 border-b border-white/5">
                        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                            <div key={day} className="p-4 text-center text-xs font-bold uppercase tracking-widest text-muted-foreground border-r border-white/5">
                                {day}
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-7 grid-rows-5 h-[600px]">
                        {days.map((day, idx) => {
                            const dayPosts = postsForDay(day);
                            const isSelected = isSameDay(day, selectedDate);
                            const isCurrentMonth = isSameMonth(day, currentMonth);
                            const today = isToday(day);

                            return (
                                <div
                                    key={day.toString()}
                                    className={cn(
                                        "relative p-2 border-r border-b border-white/5 transition-all duration-300 group cursor-pointer",
                                        !isCurrentMonth ? "bg-black/20 opacity-30" : "hover:bg-white/[0.02]",
                                        isSelected && "bg-purple-500/5 ring-1 ring-inset ring-purple-500/20"
                                    )}
                                    onClick={() => {
                                        setSelectedDate(day);
                                        onSelectDate?.(day);
                                    }}
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <span className={cn(
                                            "text-sm font-semibold w-8 h-8 flex items-center justify-center rounded-full transition-all",
                                            today ? "bg-gradient-to-br from-[#9a45ff] to-[#ff45d9] text-white shadow-lg" : "text-muted-foreground",
                                            isSelected && !today && "text-purple-400 font-bold scale-110"
                                        )}>
                                            {format(day, "d")}
                                        </span>

                                        {isCurrentMonth && (
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onSelectDate?.(day);
                                                }}
                                            >
                                                <Plus className="h-3 w-3" />
                                            </Button>
                                        )}
                                    </div>

                                    {/* Posts for the day */}
                                    <div className="space-y-1 overflow-y-auto max-h-[80px] scrollbar-none">
                                        {dayPosts.map((post) => (
                                            <div
                                                key={post.id}
                                                className={cn(
                                                    "px-2 py-1 rounded-md text-[10px] truncate border flex items-center gap-1.5 backdrop-blur-sm",
                                                    statusColors[post.status as keyof typeof statusColors] || statusColors.draft
                                                )}
                                            >
                                                {post.contentType === "video" ? <Clock className="w-2.5 h-2.5" /> : null}
                                                {post.caption || "Untitled Post"}
                                            </div>
                                        ))}
                                        {dayPosts.length > 3 && (
                                            <div className="text-[10px] text-muted-foreground pl-1 font-medium italic">
                                                + {dayPosts.length - 3} more
                                            </div>
                                        )}
                                    </div>

                                    {/* Indicator for many posts */}
                                    {dayPosts.length > 0 && (
                                        <div className="absolute bottom-2 right-2 flex gap-0.5">
                                            {Array.from({ length: Math.min(dayPosts.length, 3) }).map((_, i) => (
                                                <div key={i} className="w-1 h-1 rounded-full bg-purple-500" />
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>

            {/* Selected Day Preview (Quick View) */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={selectedDate.toString()}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mt-6"
                >
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                            <Clock className="w-5 h-5 text-purple-400" />
                            Posts for {format(selectedDate, "EEEE, MMMM do")}
                        </h3>
                        <Button size="sm" className="bg-gradient-to-r from-[#9a45ff] to-[#ff45d9] hover:opacity-90 rounded-full px-6 shadow-lg shadow-purple-500/20">
                            <Plus className="w-4 h-4 mr-2" />
                            Schedule Post
                        </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {postsForDay(selectedDate).length > 0 ? (
                            postsForDay(selectedDate).map((post) => (
                                <div
                                    key={post.id}
                                    className="group relative p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-purple-500/30 transition-all"
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <Badge className={cn("text-[10px] px-2 py-0", statusColors[post.status as keyof typeof statusColors])}>
                                            {post.status.toUpperCase()}
                                        </Badge>
                                        <div className="text-xs text-muted-foreground flex items-center gap-1 font-mono uppercase tracking-tighter">
                                            {format(new Date(post.scheduledFor), "h:mm a")}
                                        </div>
                                    </div>

                                    <p className="text-sm font-medium line-clamp-2 mb-3 text-gray-200">
                                        {post.caption || "No caption provided"}
                                    </p>

                                    <div className="flex items-center justify-between pt-3 border-t border-white/5">
                                        <span className="text-[10px] text-muted-foreground uppercase flex items-center gap-1">
                                            {post.contentType === "video" ? "Video Story" : "Image Story"}
                                        </span>
                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg hover:bg-white/5">
                                                <Edit2 className="w-3.5 h-3.5" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-7 w-7 rounded-lg hover:bg-rose-500/20 hover:text-rose-500"
                                                onClick={() => deletePost(post.id)}
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="col-span-full border-2 border-dashed border-white/5 rounded-2xl p-8 flex flex-col items-center justify-center text-muted-foreground bg-white/[0.01]">
                                <CalendarIcon className="w-10 h-10 mb-2 opacity-20" />
                                <p className="text-sm">No content scheduled for this day</p>
                                <Button variant="link" className="text-purple-400 text-xs mt-2" onClick={() => onSelectDate?.(selectedDate)}>
                                    Schedule your first post
                                </Button>
                            </div>
                        )}
                    </div>
                </motion.div>
            </AnimatePresence>
        </div>
    );
};
