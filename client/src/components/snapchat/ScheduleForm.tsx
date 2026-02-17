/**
 * Snapchat Schedule Form
 * 
 * Comprehensive form for scheduling Snapchat stories.
 * Includes media selection, captioning, scheduling, and recurring options.
 * Uses React Hook Form with Zod validation.
 */

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
    Calendar as CalendarIcon,
    Clock,
    Type,
    Film,
    Image as ImageIcon,
    Repeat,
    Globe,
    Plus,
    ArrowRight,
    Info
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    FormDescription
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from "@/components/ui/card";
import {
    Popover,
    PopoverContent,
    PopoverTrigger
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { useSnapchatScheduler } from "@/hooks/use-snapchat-scheduler";
import { PostPreview } from "./PostPreview";

const recurringSchema = z.object({
    frequency: z.enum(["daily", "weekly", "monthly", "custom"]).optional(),
    interval: z.number().min(1).optional(),
    daysOfWeek: z.array(z.number()).optional(),
    endDate: z.string().optional(),
});

const scheduleFormSchema = z.object({
    caption: z.string().max(250, "Caption must be less than 250 characters").optional(),
    contentType: z.enum(["image", "video"]),
    scheduledFor: z.date({
        required_error: "Please select a date and time for publishing",
    }),
    timezone: z.string().default(Intl.DateTimeFormat().resolvedOptions().timeZone),
    isRecurring: z.boolean().default(false),
    recurringPattern: recurringSchema.optional(),
    mediaUrl: z.string().min(1, "Please upload or select a media file"),
});

type ScheduleFormValues = z.infer<typeof scheduleFormSchema>;

interface ScheduleFormProps {
    initialValues?: Partial<ScheduleFormValues>;
    onSuccess?: () => void;
    onCancel?: () => void;
}

export const ScheduleForm: React.FC<ScheduleFormProps> = ({
    initialValues,
    onSuccess,
    onCancel
}) => {
    const { schedulePost, isProcessing } = useSnapchatScheduler();

    const form = useForm<ScheduleFormValues>({
        resolver: zodResolver(scheduleFormSchema),
        defaultValues: {
            contentType: "image",
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            isRecurring: false,
            scheduledFor: new Date(),
            ...initialValues,
        },
    });

    const onSubmit = async (values: ScheduleFormValues) => {
        try {
            await schedulePost({
                ...values,
                scheduledFor: values.scheduledFor.toISOString(),
            } as any);
            onSuccess?.();
        } catch (error) {
            // Error handled by hook
        }
    };

    const isRecurring = form.watch("isRecurring");
    const captionValue = form.watch("caption") || "";
    const scheduledFor = form.watch("scheduledFor");
    const contentType = form.watch("contentType");
    const mediaUrl = form.watch("mediaUrl");

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8 items-start">
                    {/* Column 1: Content Details */}
                    <div className="space-y-6">
                        <Card className="border-white/5 bg-background/20 backdrop-blur-xl rounded-3xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/5">
                            <CardHeader className="bg-gradient-to-r from-[#9a45ff]/10 to-transparent border-b border-white/5 pb-6">
                                <CardTitle className="text-xl flex items-center gap-2">
                                    <Type className="w-5 h-5 text-purple-400" />
                                    Content Details
                                </CardTitle>
                                <CardDescription>Define how your Snap will look and sound</CardDescription>
                            </CardHeader>
                            <CardContent className="pt-6 space-y-6">
                                {/* Caption */}
                                <FormField
                                    control={form.control}
                                    name="caption"
                                    render={({ field }) => (
                                        <FormItem>
                                            <div className="flex justify-between items-center mb-1">
                                                <FormLabel className="text-sm font-medium">Caption</FormLabel>
                                                <span className={cn(
                                                    "text-[10px] font-mono",
                                                    captionValue.length > 200 ? "text-rose-400" : "text-muted-foreground"
                                                )}>
                                                    {captionValue.length}/250
                                                </span>
                                            </div>
                                            <FormControl>
                                                <Textarea
                                                    placeholder="Add a compelling caption..."
                                                    className="min-h-[120px] bg-white/5 border-white/10 rounded-2xl resize-none focus:ring-purple-500/50 transition-all text-sm leading-relaxed"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Content Type */}
                                <FormField
                                    control={form.control}
                                    name="contentType"
                                    render={({ field }) => (
                                        <FormItem className="space-y-3">
                                            <FormLabel className="text-sm font-medium">Media Type</FormLabel>
                                            <FormControl>
                                                <div className="flex gap-4">
                                                    {[
                                                        { value: "image", label: "Static Photo", icon: ImageIcon },
                                                        { value: "video", label: "Video Story", icon: Film },
                                                    ].map((item) => (
                                                        <div
                                                            key={item.value}
                                                            onClick={() => field.onChange(item.value)}
                                                            className={cn(
                                                                "flex-1 flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all cursor-pointer",
                                                                field.value === item.value
                                                                    ? "bg-purple-500/10 border-purple-500 text-purple-400"
                                                                    : "bg-white/5 border-white/5 text-muted-foreground hover:border-white/20"
                                                            )}
                                                        >
                                                            <item.icon className="w-6 h-6 mb-2" />
                                                            <span className="text-xs font-bold uppercase tracking-wider">{item.label}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Hidden Media URL Field */}
                                <FormField
                                    control={form.control}
                                    name="mediaUrl"
                                    render={({ field }) => (
                                        <FormItem className="hidden">
                                            <FormControl>
                                                <Input {...field} />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                            </CardContent>
                        </Card>
                    </div>

                    {/* Column 2: Live Preview */}
                    <div className="order-first lg:order-none xl:col-span-1 flex justify-center">
                        <div className="sticky top-8">
                            <div className="mb-4 text-center">
                                <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-2">Live Preview</h3>
                                <div className="h-1 w-12 bg-purple-500 mx-auto rounded-full"></div>
                            </div>
                            <PostPreview
                                mediaUrl={mediaUrl}
                                mediaType={contentType}
                                caption={captionValue}
                                scheduledFor={scheduledFor}
                            />
                        </div>
                    </div>

                    {/* Column 3: Scheduling */}
                    <div className="space-y-6">
                        <Card className="border-white/5 bg-background/20 backdrop-blur-xl rounded-3xl shadow-xl overflow-hidden h-fit">
                            <CardHeader className="bg-gradient-to-r from-emerald-500/10 to-transparent border-b border-white/5 pb-6">
                                <CardTitle className="text-xl flex items-center gap-2">
                                    <Clock className="w-5 h-5 text-emerald-400" />
                                    Publishing Schedule
                                </CardTitle>
                                <CardDescription>Control when your content goes live</CardDescription>
                            </CardHeader>
                            <CardContent className="pt-6 space-y-8">
                                {/* Date & Time */}
                                <div className="grid grid-cols-1 gap-6">
                                    <FormField
                                        control={form.control}
                                        name="scheduledFor"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-col">
                                                <FormLabel className="text-sm font-medium mb-1">Pick Date & Time</FormLabel>
                                                <Popover>
                                                    <PopoverTrigger asChild>
                                                        <FormControl>
                                                            <Button
                                                                variant={"outline"}
                                                                className={cn(
                                                                    "w-full h-12 bg-white/5 border-white/10 rounded-2xl text-left justify-start font-normal hover:bg-white/10 transition-all",
                                                                    !field.value && "text-muted-foreground"
                                                                )}
                                                            >
                                                                <CalendarIcon className="mr-3 h-4 w-4 text-emerald-400" />
                                                                {field.value ? (
                                                                    format(field.value, "PPP 'at' h:mm a")
                                                                ) : (
                                                                    <span>Select publish date</span>
                                                                )}
                                                            </Button>
                                                        </FormControl>
                                                    </PopoverTrigger>
                                                    <PopoverContent className="w-auto p-0 border-white/5 bg-background shadow-2xl rounded-2xl" align="start">
                                                        <Calendar
                                                            mode="single"
                                                            selected={field.value}
                                                            onSelect={field.onChange}
                                                            disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                                                            initialFocus
                                                            className="rounded-2xl"
                                                        />
                                                        <div className="p-4 border-t border-white/5 flex items-center gap-2">
                                                            <Clock className="w-4 h-4 text-emerald-400" />
                                                            <span className="text-xs text-muted-foreground mr-auto">Publish Hour (24h)</span>
                                                            <Input
                                                                type="time"
                                                                className="w-32 h-8 text-xs bg-white/5 border-white/10 rounded-lg"
                                                                onChange={(e) => {
                                                                    const [h, m] = e.target.value.split(':');
                                                                    const newDate = new Date(field.value);
                                                                    newDate.setHours(parseInt(h), parseInt(m));
                                                                    field.onChange(newDate);
                                                                }}
                                                                value={format(field.value, "HH:mm")}
                                                            />
                                                        </div>
                                                    </PopoverContent>
                                                </Popover>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    {/* Timezone */}
                                    <FormField
                                        control={form.control}
                                        name="timezone"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-sm font-medium flex items-center gap-2">
                                                    <Globe className="w-3.5 h-3.5 text-blue-400" />
                                                    Timezone
                                                </FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger className="h-10 bg-white/5 border-white/10 rounded-xl text-xs">
                                                            <SelectValue placeholder="Select timezone" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent className="border-white/5 bg-background/95 backdrop-blur-xl rounded-xl">
                                                        <SelectItem value="UTC">UTC (Universal)</SelectItem>
                                                        <SelectItem value="America/New_York">New York (EST)</SelectItem>
                                                        <SelectItem value="America/Chicago">Chicago (CST)</SelectItem>
                                                        <SelectItem value="America/Los_Angeles">Los Angeles (PST)</SelectItem>
                                                        <SelectItem value="Europe/London">London (GMT)</SelectItem>
                                                        <SelectItem value="Asia/Tokyo">Tokyo (JST)</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                {/* Recurring Toggle */}
                                <div className="space-y-4 pt-4 border-t border-white/5">
                                    <FormField
                                        control={form.control}
                                        name="isRecurring"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-row items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 transition-all hover:border-purple-500/20">
                                                <div className="space-y-0.5">
                                                    <FormLabel className="text-sm font-bold flex items-center gap-2">
                                                        <Repeat className="w-4 h-4 text-purple-400" />
                                                        Recurring Post
                                                    </FormLabel>
                                                    <FormDescription className="text-[10px]">Publish this content on a recurring basis</FormDescription>
                                                </div>
                                                <FormControl>
                                                    <Checkbox
                                                        checked={field.value}
                                                        onCheckedChange={field.onChange}
                                                        className="bg-white/10 border-white/20 data-[state=checked]:bg-purple-500"
                                                    />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />

                                    {isRecurring && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            className="space-y-4 pl-2"
                                        >
                                            <div className="space-y-4">
                                                <FormField
                                                    control={form.control}
                                                    name="recurringPattern.frequency"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel className="text-xs text-muted-foreground uppercase tracking-widest font-bold">Frequency</FormLabel>
                                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                                <FormControl>
                                                                    <SelectTrigger className="h-9 bg-white/5 border-white/10 rounded-xl text-xs">
                                                                        <SelectValue placeholder="How often?" />
                                                                    </SelectTrigger>
                                                                </FormControl>
                                                                <SelectContent className="border-white/5 bg-background shadow-2xl">
                                                                    <SelectItem value="daily">Daily</SelectItem>
                                                                    <SelectItem value="weekly">Weekly</SelectItem>
                                                                    <SelectItem value="monthly">Monthly</SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                        </FormItem>
                                                    )}
                                                />

                                                {/* Days of Week - Only show for Weekly */}
                                                {form.watch("recurringPattern.frequency") === "weekly" && (
                                                    <FormField
                                                        control={form.control}
                                                        name="recurringPattern.daysOfWeek"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel className="text-xs text-muted-foreground uppercase tracking-widest font-bold">On These Days</FormLabel>
                                                                <div className="flex justify-between gap-1">
                                                                    {[
                                                                        { l: "S", v: 0 }, { l: "M", v: 1 }, { l: "T", v: 2 },
                                                                        { l: "W", v: 3 }, { l: "T", v: 4 }, { l: "F", v: 5 }, { l: "S", v: 6 }
                                                                    ].map((day) => (
                                                                        <div
                                                                            key={day.v}
                                                                            onClick={() => {
                                                                                const current = field.value || [];
                                                                                const updated = current.includes(day.v)
                                                                                    ? current.filter((d: number) => d !== day.v)
                                                                                    : [...current, day.v];
                                                                                field.onChange(updated.sort());
                                                                            }}
                                                                            className={cn(
                                                                                "w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold cursor-pointer transition-all border",
                                                                                (field.value || []).includes(day.v)
                                                                                    ? "bg-purple-500 border-purple-500 text-white shadow-lg shadow-purple-500/20"
                                                                                    : "bg-white/5 border-white/10 text-muted-foreground hover:bg-white/10 hover:border-white/20"
                                                                            )}
                                                                        >
                                                                            {day.l}
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                )}

                                                {/* End Date */}
                                                <FormField
                                                    control={form.control}
                                                    name="recurringPattern.endDate"
                                                    render={({ field }) => (
                                                        <FormItem className="flex flex-col">
                                                            <FormLabel className="text-xs text-muted-foreground uppercase tracking-widest font-bold">Ends On (Optional)</FormLabel>
                                                            <Popover>
                                                                <PopoverTrigger asChild>
                                                                    <FormControl>
                                                                        <Button
                                                                            variant={"outline"}
                                                                            className={cn(
                                                                                "w-full h-9 bg-white/5 border-white/10 rounded-xl text-left justify-start font-normal text-xs hover:bg-white/10",
                                                                                !field.value && "text-muted-foreground"
                                                                            )}
                                                                        >
                                                                            <CalendarIcon className="mr-2 h-3 w-3" />
                                                                            {field.value ? (
                                                                                format(new Date(field.value), "PPP")
                                                                            ) : (
                                                                                <span>No end date</span>
                                                                            )}
                                                                        </Button>
                                                                    </FormControl>
                                                                </PopoverTrigger>
                                                                <PopoverContent className="w-auto p-0 border-white/5 bg-background shadow-2xl rounded-xl" align="start">
                                                                    <Calendar
                                                                        mode="single"
                                                                        selected={field.value ? new Date(field.value) : undefined}
                                                                        onSelect={(date) => field.onChange(date?.toISOString())}
                                                                        disabled={(date) => date < new Date()}
                                                                        initialFocus
                                                                        className="rounded-xl"
                                                                    />
                                                                </PopoverContent>
                                                            </Popover>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>
                                        </motion.div>
                                    )}
                                </div>

                                {/* Submit Actions */}
                                <div className="flex gap-4 pt-6">
                                    <Button
                                        variant="ghost"
                                        type="button"
                                        onClick={onCancel}
                                        className="flex-1 rounded-2xl border border-white/5 hover:bg-white/5"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={isProcessing}
                                        className="flex-1 bg-gradient-to-r from-[#9a45ff] to-[#ff45d9] hover:opacity-90 rounded-2xl text-white font-bold shadow-xl shadow-purple-500/20 transition-all active:scale-95"
                                    >
                                        {isProcessing ? (
                                            <div className="flex items-center gap-2">
                                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                <span>Processing...</span>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2">
                                                <span>Confirm Schedule</span>
                                                <ArrowRight className="w-4 h-4" />
                                            </div>
                                        )}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </form>
        </Form>
    );
};
