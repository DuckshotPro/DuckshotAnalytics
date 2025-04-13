export async function fetchSnapchatData(clientId: string, apiKey: string): Promise<any> {
  // In a real implementation, this would call the Snapchat API
  // For now, we'll return simulated data
  
  // Validate credentials format first - real API would validate with Snapchat
  if (!clientId || !apiKey) {
    throw new Error("Invalid Snapchat API credentials");
  }
  
  // Example data structure that matches what we'd expect from Snapchat API
  return {
    totalFollowers: 24583,
    followerGrowth: 12.3,
    totalStoryViews: 15942,
    storyViewsGrowth: 8.7,
    engagementRate: 5.2,
    engagementRateChange: -2.1,
    completionRate: 78.3,
    completionRateChange: 3.5,
    lastUpdated: new Date().toISOString(),
    
    // Data for audience growth chart
    followers: generateFollowersData(),
    
    // Data for demographics chart
    demographics: [
      { ageRange: "18-24", percentage: 45 },
      { ageRange: "25-34", percentage: 30 },
      { ageRange: "35-44", percentage: 15 },
      { ageRange: "45+", percentage: 10 },
    ],
    
    // Data for content table
    content: [
      {
        id: "1",
        title: "Summer Party Snap",
        date: "2023-07-24",
        views: 8452,
        completion: 85,
        screenshots: 214,
        shares: 126,
      },
      {
        id: "2",
        title: "Beach Day",
        date: "2023-07-22",
        views: 7128,
        completion: 72,
        screenshots: 178,
        shares: 95,
      },
      {
        id: "3",
        title: "New Product Reveal",
        date: "2023-07-20",
        views: 10872,
        completion: 91,
        screenshots: 356,
        shares: 284,
      },
    ],
  };
}

function generateFollowersData() {
  const data = [];
  const now = new Date();
  const daysBack = 30;
  
  let followers = 21000 + Math.floor(Math.random() * 1000);
  
  for (let i = daysBack; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const dateString = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    
    followers += Math.floor(Math.random() * 200) - 50; // Random increase with occasional small dips
    followers = Math.max(followers, 21000); // Ensure it doesn't go below starting point too much
    
    data.push({
      date: dateString,
      count: followers
    });
  }
  
  return data;
}
