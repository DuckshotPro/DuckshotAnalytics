
import { storage } from '../storage';
import { generateAiInsight } from './gemini';

export interface CompetitorData {
  id: string;
  name: string;
  category: string;
  followers: number;
  avgEngagementRate: number;
  avgStoryViews: number;
  avgCompletionRate: number;
  contentFrequency: number;
  topContentTypes: string[];
  growthRate: number;
  marketPosition: 'leading' | 'growing' | 'emerging' | 'declining';
}

export interface CompetitorAnalysis {
  userRanking: number;
  totalCompetitors: number;
  competitorData: CompetitorData[];
  insights: {
    marketPosition: string;
    strengthAreas: string[];
    improvementAreas: string[];
    opportunities: string[];
    threats: string[];
  };
  benchmarks: {
    avgEngagementRate: number;
    avgFollowerGrowth: number;
    avgContentFrequency: number;
    topPerformers: CompetitorData[];
  };
  recommendations: string[];
}

// Mock competitor data - in production, this would come from external APIs or databases
const generateMockCompetitors = (userCategory: string, userFollowers: number): CompetitorData[] => {
  const competitors: CompetitorData[] = [];
  const categories = ['lifestyle', 'fashion', 'food', 'fitness', 'entertainment', 'business'];
  const selectedCategory = categories.includes(userCategory.toLowerCase()) ? userCategory.toLowerCase() : 'lifestyle';
  
  // Generate 15-20 mock competitors in similar follower range
  const competitorCount = 15 + Math.floor(Math.random() * 6);
  
  for (let i = 0; i < competitorCount; i++) {
    const followerVariation = 0.3 + Math.random() * 1.4; // 30% to 170% of user's followers
    const baseEngagement = selectedCategory === 'lifestyle' ? 0.045 : 
                          selectedCategory === 'fashion' ? 0.038 :
                          selectedCategory === 'food' ? 0.052 :
                          selectedCategory === 'fitness' ? 0.041 :
                          selectedCategory === 'entertainment' ? 0.048 : 0.035;
    
    competitors.push({
      id: `competitor_${i + 1}`,
      name: `${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)} Creator ${i + 1}`,
      category: selectedCategory,
      followers: Math.floor(userFollowers * followerVariation),
      avgEngagementRate: baseEngagement + (Math.random() - 0.5) * 0.02,
      avgStoryViews: Math.floor(userFollowers * followerVariation * (0.15 + Math.random() * 0.1)),
      avgCompletionRate: 0.65 + Math.random() * 0.25,
      contentFrequency: 3 + Math.floor(Math.random() * 5), // 3-7 posts per week
      topContentTypes: getRandomContentTypes(),
      growthRate: -0.05 + Math.random() * 0.25, // -5% to +20% monthly growth
      marketPosition: getMarketPosition()
    });
  }
  
  return competitors.sort((a, b) => b.avgEngagementRate - a.avgEngagementRate);
};

const getRandomContentTypes = (): string[] => {
  const types = ['Stories', 'Spotlight', 'Bitmoji', 'Lenses', 'Behind-the-scenes', 'Tutorials', 'Challenges'];
  const count = 2 + Math.floor(Math.random() * 3);
  return types.sort(() => 0.5 - Math.random()).slice(0, count);
};

const getMarketPosition = (): 'leading' | 'growing' | 'emerging' | 'declining' => {
  const positions: ('leading' | 'growing' | 'emerging' | 'declining')[] = ['leading', 'growing', 'emerging', 'declining'];
  const weights = [0.15, 0.35, 0.35, 0.15]; // Distribution of market positions
  
  const random = Math.random();
  let cumulative = 0;
  
  for (let i = 0; i < weights.length; i++) {
    cumulative += weights[i];
    if (random <= cumulative) {
      return positions[i];
    }
  }
  
  return 'growing';
};

export async function generateCompetitorAnalysis(userId: number): Promise<CompetitorAnalysis> {
  try {
    // Get user's latest data
    const user = await storage.getUser(userId);
    const snapchatData = await storage.getLatestSnapchatData(userId);
    
    if (!snapchatData || !user) {
      throw new Error('User data not found');
    }
    
    const userData = snapchatData.data as any;
    const userCategory = user.displayName?.includes('fitness') ? 'fitness' :
                        user.displayName?.includes('food') ? 'food' :
                        user.displayName?.includes('fashion') ? 'fashion' : 'lifestyle';
    
    // Generate competitor data
    const competitors = generateMockCompetitors(userCategory, userData.followers || 1000);
    
    // Calculate user's ranking
    const userEngagement = (userData.storyViews || 0) / (userData.followers || 1);
    const userRanking = competitors.filter(c => c.avgEngagementRate > userEngagement).length + 1;
    
    // Calculate benchmarks
    const avgEngagementRate = competitors.reduce((sum, c) => sum + c.avgEngagementRate, 0) / competitors.length;
    const avgFollowerGrowth = competitors.reduce((sum, c) => sum + c.growthRate, 0) / competitors.length;
    const avgContentFrequency = competitors.reduce((sum, c) => sum + c.contentFrequency, 0) / competitors.length;
    
    const topPerformers = competitors.slice(0, 3);
    
    // Analyze strengths and weaknesses
    const userGrowthRate = Math.random() * 0.15; // Mock growth rate
    const userContentFreq = 4 + Math.floor(Math.random() * 3);
    
    const strengthAreas: string[] = [];
    const improvementAreas: string[] = [];
    const opportunities: string[] = [];
    const threats: string[] = [];
    
    // Analyze performance vs competitors
    if (userEngagement > avgEngagementRate) {
      strengthAreas.push('Above-average engagement rate');
    } else {
      improvementAreas.push('Engagement rate below market average');
    }
    
    if (userGrowthRate > avgFollowerGrowth) {
      strengthAreas.push('Strong follower growth momentum');
    } else {
      improvementAreas.push('Growth rate lagging behind competitors');
    }
    
    if (userContentFreq > avgContentFrequency) {
      strengthAreas.push('High content posting frequency');
    } else {
      opportunities.push('Increase content posting frequency');
    }
    
    // Market insights
    const leadingCompetitors = competitors.filter(c => c.marketPosition === 'leading').length;
    const decliningCompetitors = competitors.filter(c => c.marketPosition === 'declining').length;
    
    if (leadingCompetitors > 3) {
      threats.push('Highly competitive market with many established leaders');
    }
    
    if (decliningCompetitors > 2) {
      opportunities.push('Market consolidation opportunity as some competitors decline');
    }
    
    opportunities.push('Leverage trending content types from top performers');
    opportunities.push('Explore untapped content formats in your category');
    
    // Generate AI-powered insights
    const insightPrompt = `Based on competitor analysis data: User ranks ${userRanking} out of ${competitors.length + 1} creators. Market average engagement: ${(avgEngagementRate * 100).toFixed(1)}%. User's category: ${userCategory}. Top performers focus on: ${topPerformers.map(p => p.topContentTypes.join(', ')).join('; ')}.`;
    
    const marketPosition = userRanking <= 3 ? 'Market Leader' :
                          userRanking <= Math.ceil(competitors.length * 0.25) ? 'Top Performer' :
                          userRanking <= Math.ceil(competitors.length * 0.5) ? 'Above Average' :
                          userRanking <= Math.ceil(competitors.length * 0.75) ? 'Below Average' : 'Needs Improvement';
    
    // Generate recommendations
    const recommendations: string[] = [];
    
    if (userRanking > Math.ceil(competitors.length * 0.5)) {
      recommendations.push('Focus on improving engagement rate through more interactive content');
      recommendations.push('Analyze top performers\' content strategies and adapt successful elements');
    }
    
    if (userContentFreq < avgContentFrequency) {
      recommendations.push('Increase posting frequency to match market standards');
    }
    
    recommendations.push('Experiment with trending content types popular among top performers');
    recommendations.push('Consider collaborations with similarly-sized creators for cross-promotion');
    
    return {
      userRanking,
      totalCompetitors: competitors.length + 1,
      competitorData: competitors,
      insights: {
        marketPosition,
        strengthAreas,
        improvementAreas,
        opportunities,
        threats
      },
      benchmarks: {
        avgEngagementRate,
        avgFollowerGrowth,
        avgContentFrequency,
        topPerformers
      },
      recommendations
    };
    
  } catch (error) {
    console.error('Error generating competitor analysis:', error);
    throw error;
  }
}

export function getSegmentRecommendations(segment: any): string[] {
  const recommendations: string[] = [];
  
  if (segment.size < 100) {
    recommendations.push('This segment is small - consider broader targeting strategies');
  }
  
  if (segment.avgEngagement > 0.06) {
    recommendations.push('This is a high-engagement segment - prioritize content for this audience');
  }
  
  if (segment.growthRate > 0.1) {
    recommendations.push('Fast-growing segment - increase content frequency for this group');
  }
  
  recommendations.push('Monitor this segment\'s content preferences for optimization opportunities');
  
  return recommendations;
}
