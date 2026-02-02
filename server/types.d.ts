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
  followers: any[];
  demographics: any[];
  content: any[];
  totalViews: number;
  growthRate: number;
  engagementHistory: {
    date: string;
    views: number;
    likes: number;
    comments: number;
    shares: number;
  }[];
  topContent: {
    title: string;
    views: number;
    engagementRate: number;
    date: string;
    type: string;
  }[];
}