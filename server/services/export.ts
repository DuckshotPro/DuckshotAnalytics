
import { SnapchatData } from '../types';
import { generateAudienceSegments } from './audience-segmentation';
import { generateCompetitorAnalysis } from './competitor-analysis';

export interface ExportOptions {
  format: 'pdf' | 'csv' | 'excel' | 'json';
  dateRange: {
    start: string;
    end: string;
  };
  includeCharts: boolean;
  sections: {
    overview: boolean;
    engagement: boolean;
    audience: boolean;
    content: boolean;
    competitors: boolean;
    recommendations: boolean;
  };
  customBranding?: {
    logo?: string;
    colors?: {
      primary: string;
      secondary: string;
    };
  };
}

export interface ExportResult {
  filename: string;
  url: string;
  size: number;
  generatedAt: string;
  format: string;
}

export async function generateReport(data: SnapchatData, userId: number, options: ExportOptions): Promise<ExportResult> {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `snapchat-analytics-${timestamp}.${options.format}`;
  
  let reportData: any;
  
  switch (options.format) {
    case 'csv':
      reportData = await generateCSVReport(data, options);
      break;
    case 'excel':
      reportData = await generateExcelReport(data, options);
      break;
    case 'pdf':
      reportData = await generatePDFReport(data, userId, options);
      break;
    case 'json':
      reportData = await generateJSONReport(data, userId, options);
      break;
    default:
      throw new Error(`Unsupported format: ${options.format}`);
  }
  
  // In a real implementation, you would save the file and return a download URL
  const fileUrl = `/api/exports/${filename}`;
  
  return {
    filename,
    url: fileUrl,
    size: JSON.stringify(reportData).length,
    generatedAt: new Date().toISOString(),
    format: options.format
  };
}

async function generateCSVReport(data: SnapchatData, options: ExportOptions) {
  const rows = [];
  
  if (options.sections.overview) {
    rows.push(['Overview']);
    rows.push(['Total Followers', data.totalFollowers]);
    rows.push(['Total Views', data.totalStoryViews]);
    rows.push(['Engagement Rate', `${data.engagementRate}%`]);
    rows.push(['']);
  }
  
  if (options.sections.engagement && data.content.length > 0) {
    rows.push(['Engagement Metrics']);
    rows.push(['Date', 'Views', 'Likes', 'Comments', 'Shares']);
    // Use content data as engagement history fallback
    data.content.forEach((entry: any) => {
      rows.push([entry.date || 'N/A', entry.views || 0, entry.likes || 0, entry.comments || 0, entry.shares || 0]);
    });
    rows.push(['']);
  }
  
  if (options.sections.content) {
    rows.push(['Top Content']);
    rows.push(['Title', 'Views', 'Engagement Rate', 'Date']);
    data.content.forEach((content: any) => {
      rows.push([content.title, content.views, `${content.engagementRate}%`, content.date]);
    });
    rows.push(['']);
  }
  
  if (options.sections.audience) {
    const segments = generateAudienceSegments(data);
    rows.push(['Audience Segments']);
    rows.push(['Segment Name', 'Size', 'Percentage', 'Engagement Rate']);
    segments.segments.forEach(segment => {
      rows.push([segment.name, segment.size, `${segment.percentage}%`, `${segment.avgEngagementRate}%`]);
    });
  }
  
  return rows;
}

async function generateExcelReport(data: SnapchatData, options: ExportOptions) {
  const workbook = {
    sheets: {} as any
  };
  
  if (options.sections.overview) {
    workbook.sheets['Overview'] = {
      data: [
        ['Metric', 'Value'],
        ['Total Followers', data.totalFollowers],
        ['Total Views', data.totalStoryViews],
        ['Engagement Rate', `${data.engagementRate}%`],
        ['Average Daily Views', Math.round(data.totalStoryViews / 30)]
      ]
    };
  }
  
  if (options.sections.engagement) {
    workbook.sheets['Engagement'] = {
      data: [
        ['Date', 'Views', 'Likes', 'Comments', 'Shares', 'Engagement Rate'],
        ...data.content.map((entry: any) => [
          entry.date || 'N/A',
          entry.views || 0,
          entry.likes || 0,
          entry.comments || 0,
          entry.shares || 0,
          `${(((entry.likes || 0) + (entry.comments || 0) + (entry.shares || 0)) / (entry.views || 1) * 100).toFixed(2)}%`
        ])
      ]
    };
  }
  
  if (options.sections.content) {
    workbook.sheets['Top Content'] = {
      data: [
        ['Title', 'Views', 'Engagement Rate', 'Date', 'Type'],
        ...data.content.map((content: any) => [
          content.title || 'Untitled',
          content.views || 0,
          `${content.engagementRate || 0}%`,
          content.date || 'N/A',
          content.type || 'Story'
        ])
      ]
    };
  }
  
  if (options.sections.audience) {
    const segments = generateAudienceSegments(data);
    workbook.sheets['Audience'] = {
      data: [
        ['Segment', 'Size', 'Percentage', 'Avg Engagement', 'Growth Trend'],
        ...segments.segments.map(segment => [
          segment.name,
          segment.size,
          segment.percentage,
          segment.avgEngagementRate,
          segment.growthTrend
        ])
      ]
    };
  }
  
  return workbook;
}

async function generatePDFReport(data: SnapchatData, userId: number, options: ExportOptions) {
  const reportData = {
    title: 'Snapchat Analytics Report',
    generatedAt: new Date().toLocaleDateString(),
    dateRange: `${options.dateRange.start} - ${options.dateRange.end}`,
    sections: [] as any[]
  };
  
  if (options.sections.overview) {
    reportData.sections.push({
      title: 'Overview',
      type: 'overview',
      data: {
        totalFollowers: data.totalFollowers,
        totalViews: data.totalStoryViews,
        engagementRate: data.engagementRate,
        growthRate: data.followerGrowth
      }
    });
  }
  
  if (options.sections.engagement) {
    reportData.sections.push({
      title: 'Engagement Trends',
      type: 'chart',
      data: data.content
    });
  }
  
  if (options.sections.content) {
    reportData.sections.push({
      title: 'Top Performing Content',
      type: 'table',
      data: data.content
    });
  }
  
  if (options.sections.audience) {
    const segments = generateAudienceSegments(data);
    reportData.sections.push({
      title: 'Audience Analysis',
      type: 'segments',
      data: segments
    });
  }
  
  if (options.sections.competitors) {
    const competitorData = await generateCompetitorAnalysis(userId);
    reportData.sections.push({
      title: 'Competitive Analysis',
      type: 'competitors',
      data: competitorData
    });
  }
  
  return reportData;
}

async function generateJSONReport(data: SnapchatData, userId: number, options: ExportOptions) {
  const report: any = {
    metadata: {
      generatedAt: new Date().toISOString(),
      dateRange: options.dateRange,
      includedSections: Object.keys(options.sections).filter(key => options.sections[key as keyof typeof options.sections])
    }
  };
  
  if (options.sections.overview) {
    report.overview = {
      totalFollowers: data.totalFollowers,
      totalViews: data.totalStoryViews,
      engagementRate: data.engagementRate,
      growthRate: data.followerGrowth
    };
  }
  
  if (options.sections.engagement) {
    report.engagement = data.content;
  }
  
  if (options.sections.content) {
    report.content = data.content;
  }
  
  if (options.sections.audience) {
    report.audience = generateAudienceSegments(data);
  }
  
  if (options.sections.competitors) {
    report.competitors = await generateCompetitorAnalysis(userId);
  }
  
  return report;
}

export function getAvailableFormats(): string[] {
  return ['pdf', 'csv', 'excel', 'json'];
}

export function validateExportOptions(options: ExportOptions): string[] {
  const errors: string[] = [];
  
  if (!options.format || !getAvailableFormats().includes(options.format)) {
    errors.push('Invalid export format');
  }
  
  if (!options.dateRange || !options.dateRange.start || !options.dateRange.end) {
    errors.push('Date range is required');
  }
  
  if (new Date(options.dateRange.start) > new Date(options.dateRange.end)) {
    errors.push('Start date must be before end date');
  }
  
  const hasAnySectionSelected = Object.values(options.sections).some(Boolean);
  if (!hasAnySectionSelected) {
    errors.push('At least one section must be selected');
  }
  
  return errors;
}
