/**
 * Snapchat Scheduler Hook
 * 
 * Provides state and mutations for managing Snapchat scheduled content.
 * Integrates with the backend scheduler API.
 */

import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type {
    SnapchatScheduledContent,
    InsertSnapchatScheduledContent
} from "@shared/schema";

export interface SchedulerStats {
    successCount: number;
    failCount: number;
    pendingCount: number;
    successRate: number;
    queueCount: number;
    errorCount: number;
}

interface StatsResponse {
    success: boolean;
    stats: SchedulerStats;
}

export function useSnapchatScheduler() {
    const { toast } = useToast();

    // Fetch all scheduled posts for the current user
    const {
        data: scheduledPosts = [],
        isLoading,
        error,
        refetch
    } = useQuery<any, any, SnapchatScheduledContent[]>({
        queryKey: ["/api/snapchat/scheduled"],
        select: (data: any) => data.posts || data,
    });

    // Create a new scheduled post
    const schedulePostMutation = useMutation({
        mutationFn: async (post: InsertSnapchatScheduledContent) => {
            const response = await apiRequest("POST", "/api/snapchat/schedule", post);
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/snapchat/scheduled"] });
            toast({
                title: "Success",
                description: "Post scheduled successfully.",
            });
        },
        onError: (err: any) => {
            toast({
                title: "Error",
                description: `Failed to schedule post: ${err.message}`,
                variant: "destructive",
            });
        },
    });

    // Update an existing scheduled post
    const updatePostMutation = useMutation({
        mutationFn: async ({ id, data }: { id: number; data: Partial<InsertSnapchatScheduledContent> }) => {
            const response = await apiRequest("PUT", `/api/snapchat/scheduled/${id}`, data);
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/snapchat/scheduled"] });
            toast({
                title: "Success",
                description: "Scheduled post updated.",
            });
        },
        onError: (err: any) => {
            toast({
                title: "Error",
                description: `Failed to update post: ${err.message}`,
                variant: "destructive",
            });
        },
    });

    // Delete/Cancel a scheduled post
    const deletePostMutation = useMutation({
        mutationFn: async (id: number) => {
            await apiRequest("DELETE", `/api/snapchat/scheduled/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/snapchat/scheduled"] });
            toast({
                title: "Deleted",
                description: "Scheduled post has been cancelled.",
            });
        },
        onError: (err: any) => {
            toast({
                title: "Error",
                description: `Failed to delete post: ${err.message}`,
                variant: "destructive",
            });
        },
    });

    // Duplicate a scheduled post
    const duplicatePostMutation = useMutation({
        mutationFn: async (id: number) => {
            const response = await apiRequest("POST", `/api/snapchat/scheduled/${id}/duplicate`);
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/snapchat/scheduled"] });
            toast({
                title: "Duplicated",
                description: "Post duplicated successfully.",
            });
        },
    });

    // Reschedule a post
    const reschedulePostMutation = useMutation({
        mutationFn: async ({ id, scheduledFor }: { id: number; scheduledFor: string | Date }) => {
            const response = await apiRequest("POST", `/api/snapchat/scheduled/${id}/reschedule`, {
                scheduledFor
            });
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/snapchat/scheduled"] });
            toast({
                title: "Rescheduled",
                description: "Post date updated.",
            });
        },
    });

    // Get scheduler stats
    const { data: statsData } = useQuery<StatsResponse>({
        queryKey: ["/api/snapchat/scheduled/stats"],
    });

    const stats = statsData?.stats;

    return {
        scheduledPosts,
        isLoading,
        error,
        refetch,
        schedulePost: schedulePostMutation.mutateAsync,
        updatePost: updatePostMutation.mutateAsync,
        deletePost: deletePostMutation.mutateAsync,
        duplicatePost: duplicatePostMutation.mutateAsync,
        reschedulePost: reschedulePostMutation.mutateAsync,
        stats,
        isProcessing:
            schedulePostMutation.isPending ||
            updatePostMutation.isPending ||
            deletePostMutation.isPending ||
            duplicatePostMutation.isPending ||
            reschedulePostMutation.isPending
    };
}
