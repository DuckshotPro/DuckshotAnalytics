
import { defineFlow } from 'genkit';
import { z } from 'zod';

// Helper function to generate follower data
function generateFollowersData(baseFollowers: number, days: number) {
  const data = [];
  const now = new Date();
  let followers = baseFollowers + Math.floor(Math.random() * (baseFollowers * 0.1));

  for (let i = days; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const dateString = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    
    followers += Math.floor(Math.random() * (baseFollowers / 100)) - (baseFollowers / 500);
    followers = Math.max(followers, baseFollowers);
    
    data.push({
      date: dateString,
      count: Math.floor(followers)
    });
  }
  return data;
}

// Helper function to generate content data
function generateContentData(count: number) {
  const content = [];
  const titles = ["Summer Party Snap", "Beach Day", "New Product Reveal", "Q&A Session", "Behind the Scenes"];
  for (let i = 0; i < count; i++) {
    const views = Math.floor(Math.random() * 15000) + 1000;
    const completion = Math.floor(Math.random() * 40) + 60; // 60-100%
    content.push({
      id: (i + 1).toString(),
      title: titles[i % titles.length],
      date: new Date(new Date().setDate(new Date().getDate() - (i * 2))).toISOString().split('T')[0],
      views,
      completion,
      screenshots: Math.floor(views * (Math.random() * 0.05 + 0.01)), // 1-6% of views
      shares: Math.floor(views * (Math.random() * 0.03 + 0.005)), // 0.5-3.5% of views
    });
  }
  return content;
}

export const snapchatDataGeneratorFlow = defineFlow(
  {
    name: 'snapchatDataGenerator',
    inputSchema: z.object({
      scenario: z.enum(['default', 'high-growth', 'low-engagement', 'new-user']).default('default'),
    }),
    outputSchema: z.any(),
  },
  async ({ scenario }) => {
    let config = {
      baseFollowers: 24583,
      followerGrowth: 12.3,
      storyViewsGrowth: 8.7,
      engagementRate: 5.2,
      engagementRateChange: -2.1,
      completionRate: 78.3,
      completionRateChange: 3.5,
      demographics: [
        { ageRange: "18-24", percentage: 45 },
        { ageRange: "25-34", percentage: 30 },
        { ageRange: "35-44", percentage: 15 },
        { ageRange: "45+", percentage: 10 },
      ],
      contentCount: 5,
    };

    switch (scenario) {
      case 'high-growth':
        config.baseFollowers = 50000;
        config.followerGrowth = 25.5;
        config.storyViewsGrowth = 18.2;
        break;
      case 'low-engagement':
        config.engagementRate = 1.5;
        config.engagementRateChange = -5.0;
        break;
      case 'new-user':
        config.baseFollowers = 500;
        config.followerGrowth = 50.0;
        config.contentCount = 2;
        break;
    }

    return {
      totalFollowers: Math.floor(config.baseFollowers * (1 + config.followerGrowth / 100)),
      followerGrowth: config.followerGrowth,
      totalStoryViews: Math.floor(config.baseFollowers * 0.8),
      storyViewsGrowth: config.storyViewsGrowth,
      engagementRate: config.engagementRate,
      engagementRateChange: config.engagementRateChange,
      completionRate: config.completionRate,
      completionRateChange: config.completionRateChange,
      lastUpdated: new Date().toISOString(),
      followers: generateFollowersData(config.baseFollowers, 30),
      demographics: config.demographics,
      content: generateContentData(config.contentCount),
    };
  }
);
