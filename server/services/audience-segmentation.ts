
import { SnapchatData } from '../types';

export interface AudienceSegment {
  id: string;
  name: string;
  criteria: {
    ageRange?: { min: number; max: number };
    gender?: string[];
    location?: string[];
    interests?: string[];
    engagementLevel?: 'high' | 'medium' | 'low';
    followDuration?: 'new' | 'regular' | 'loyal';
  };
  size: number;
  percentage: number;
  avgEngagementRate: number;
  topContent: string[];
  growthTrend: 'increasing' | 'stable' | 'decreasing';
  recommendations: string[];
}

export interface SegmentationAnalysis {
  totalAudience: number;
  segments: AudienceSegment[];
  insights: string[];
  recommendations: string[];
  lastUpdated: string;
}

export function generateAudienceSegments(data: SnapchatData): SegmentationAnalysis {
  const totalFollowers = data.totalFollowers;
  
  // Generate demographic-based segments
  const segments: AudienceSegment[] = [
    {
      id: 'gen-z-engaged',
      name: 'Highly Engaged Gen Z',
      criteria: {
        ageRange: { min: 16, max: 24 },
        engagementLevel: 'high'
      },
      size: Math.floor(totalFollowers * 0.35),
      percentage: 35,
      avgEngagementRate: 8.2,
      topContent: ['Trending challenges', 'Music content', 'Behind-the-scenes'],
      growthTrend: 'increasing',
      recommendations: [
        'Post during peak hours (6-9 PM)',
        'Use trending music and hashtags',
        'Create interactive content with polls'
      ]
    },
    {
      id: 'millennial-casual',
      name: 'Casual Millennial Viewers',
      criteria: {
        ageRange: { min: 25, max: 35 },
        engagementLevel: 'medium'
      },
      size: Math.floor(totalFollowers * 0.28),
      percentage: 28,
      avgEngagementRate: 4.1,
      topContent: ['Lifestyle content', 'Educational posts', 'Product reviews'],
      growthTrend: 'stable',
      recommendations: [
        'Focus on informational content',
        'Share personal experiences',
        'Post during lunch hours and evenings'
      ]
    },
    {
      id: 'loyal-supporters',
      name: 'Loyal Long-term Followers',
      criteria: {
        followDuration: 'loyal',
        engagementLevel: 'high'
      },
      size: Math.floor(totalFollowers * 0.22),
      percentage: 22,
      avgEngagementRate: 12.5,
      topContent: ['Exclusive content', 'Personal updates', 'Community posts'],
      growthTrend: 'stable',
      recommendations: [
        'Reward loyalty with exclusive content',
        'Create subscriber-only content',
        'Engage directly with comments and messages'
      ]
    },
    {
      id: 'new-discoverers',
      name: 'New Content Discoverers',
      criteria: {
        followDuration: 'new',
        engagementLevel: 'medium'
      },
      size: Math.floor(totalFollowers * 0.15),
      percentage: 15,
      avgEngagementRate: 3.8,
      topContent: ['Introduction content', 'Popular posts', 'Highlight reels'],
      growthTrend: 'increasing',
      recommendations: [
        'Create welcoming content for new followers',
        'Highlight your best content',
        'Use clear call-to-actions'
      ]
    }
  ];

  const insights = [
    'Gen Z audience shows highest engagement with video content',
    'Millennials prefer educational and lifestyle content',
    'Loyal followers are your most valuable segment for monetization',
    'New followers need engaging content to convert to regular viewers'
  ];

  const recommendations = [
    'Diversify content to appeal to different age groups',
    'Create segment-specific content calendars',
    'Focus retention strategies on new followers',
    'Leverage loyal followers for user-generated content'
  ];

  return {
    totalAudience: totalFollowers,
    segments,
    insights,
    recommendations,
    lastUpdated: new Date().toISOString()
  };
}

export function getSegmentRecommendations(segment: AudienceSegment): string[] {
  return segment.recommendations;
}

export function analyzeSegmentPerformance(segmentId: string, data: SnapchatData) {
  // Analyze how a specific segment is performing
  const segment = generateAudienceSegments(data).segments.find(s => s.id === segmentId);
  
  if (!segment) {
    throw new Error('Segment not found');
  }

  return {
    segment,
    performance: {
      engagementTrend: segment.growthTrend,
      contentPreferences: segment.topContent,
      optimalPostingTimes: getOptimalPostingTimes(segment),
      competitorComparison: getCompetitorComparison(segment)
    }
  };
}

function getOptimalPostingTimes(segment: AudienceSegment): string[] {
  // Return optimal posting times based on segment characteristics
  if (segment.criteria.ageRange?.max && segment.criteria.ageRange.max <= 24) {
    return ['6:00 PM - 9:00 PM', '12:00 PM - 2:00 PM', '9:00 PM - 11:00 PM'];
  } else {
    return ['12:00 PM - 1:00 PM', '6:00 PM - 8:00 PM', '8:00 AM - 9:00 AM'];
  }
}

function getCompetitorComparison(segment: AudienceSegment) {
  return {
    industryAverage: segment.avgEngagementRate * 0.8,
    yourPerformance: segment.avgEngagementRate,
    ranking: segment.avgEngagementRate > 5 ? 'Above Average' : 'Average'
  };
}
