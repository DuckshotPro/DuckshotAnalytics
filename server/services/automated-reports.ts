/**
 * Automated Report Generation Service
 * 
 * Handles batch generation of user reports including:
 * - Weekly summary reports
 * - Monthly performance reports
 * - Custom scheduled reports
 */

import { storage } from "../storage";
import { generateAiInsight } from "./gemini";
import { User } from "@shared/schema";

export interface ReportData {
  userId: number;
  reportType: "weekly" | "monthly" | "custom";
  data: any;
  generatedAt: Date;
}

export async function generateAutomatedReport(user: User, reportType: "weekly" | "monthly" = "weekly"): Promise<ReportData> {
  try {
    // Get user's Snapchat data for the report period
    const userData = await storage.getLatestSnapchatData(user.id);
    
    if (!userData) {
      throw new Error("No Snapchat data available for report generation");
    }

    // Generate AI insights for the report period
    const insights = await generateAiInsight(userData.data);
    
    // Type-safe data extraction
    const data = userData.data as any;
    
    // Calculate report metrics
    const reportData = {
      userId: user.id,
      reportType,
      data: {
        summary: {
          totalFollowers: data.totalFollowers || 0,
          followerGrowth: data.followerGrowth || 0,
          totalStoryViews: data.totalStoryViews || 0,
          engagementRate: data.engagementRate || 0,
        },
        insights: insights,
        period: {
          start: getReportPeriodStart(reportType),
          end: new Date(),
        },
        topContent: data.content?.slice(0, 5) || [],
        demographics: data.demographics || [],
      },
      generatedAt: new Date(),
    };

    return reportData;
  } catch (error) {
    console.error("Error generating automated report:", error);
    throw new Error(`Failed to generate ${reportType} report: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function generateWeeklyReports(): Promise<void> {
  try {
    // Get all premium users (simplified for now)
    const users = await storage.getAllUsers();
    const premiumUsers = users.filter(u => u.subscription === "premium");
    
    for (const user of premiumUsers) {
      try {
        const report = await generateAutomatedReport(user, "weekly");
        
        // Log report generation (storage will be enhanced with job tracking)
        console.log(`Weekly report generated for user ${user.id}`, report);
      } catch (error) {
        console.error(`Failed to generate weekly report for user ${user.id}:`, error);
      }
    }
  } catch (error) {
    console.error("Error in batch weekly report generation:", error);
  }
}

function getReportPeriodStart(reportType: "weekly" | "monthly"): Date {
  const now = new Date();
  if (reportType === "weekly") {
    const weekAgo = new Date(now);
    weekAgo.setDate(now.getDate() - 7);
    return weekAgo;
  } else {
    const monthAgo = new Date(now);
    monthAgo.setMonth(now.getMonth() - 1);
    return monthAgo;
  }
}