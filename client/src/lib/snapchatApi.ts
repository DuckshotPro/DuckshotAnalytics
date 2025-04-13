import { SnapchatCredentials } from "@shared/schema";

export interface SnapchatData {
  totalFollowers: number;
  followerGrowth: number;
  totalStoryViews: number;
  storyViewsGrowth: number;
  engagementRate: number;
  engagementRateChange: number;
  completionRate: number;
  completionRateChange: number;
  lastUpdated: string;
  followers: { date: string; count: number }[];
  demographics: { ageRange: string; percentage: number }[];
  content: {
    id: string;
    title: string;
    date: string;
    views: number;
    completion: number;
    screenshots: number;
    shares: number;
  }[];
}

export async function fetchSnapchatData(credentials: SnapchatCredentials): Promise<SnapchatData> {
  try {
    const response = await fetch("/api/snapchat/data", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error fetching Snapchat data: ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching Snapchat data:", error);
    throw error;
  }
}

export async function refreshSnapchatData(): Promise<void> {
  try {
    const response = await fetch("/api/snapchat/refresh", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error refreshing Snapchat data: ${errorText}`);
    }
  } catch (error) {
    console.error("Error refreshing Snapchat data:", error);
    throw error;
  }
}

export async function connectSnapchat(credentials: SnapchatCredentials): Promise<void> {
  try {
    const response = await fetch("/api/snapchat/connect", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
      credentials: "include",
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error connecting Snapchat account: ${errorText}`);
    }
  } catch (error) {
    console.error("Error connecting Snapchat account:", error);
    throw error;
  }
}
