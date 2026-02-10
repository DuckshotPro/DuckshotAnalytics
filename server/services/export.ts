
import { SnapchatData } from '../types';
import { generateAudienceSegments } from './audience-segmentation';
import { analyzeCompetitors } from './competitor-analysis';

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

export async function generateReport(data: SnapchatData, options: ExportOptions): Promise<ExportResult> {
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
      reportData = await generatePDFReport(data, options);
      break;
    case 'json':
      reportData = await generateJSONReport(data, options);
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
    rows.push(['Total Views', data.totalViews]);
    rows.push(['Engagement Rate', `${data.engagementRate}%`]);
    rows.push(['']);
  }
  
  if (options.sections.engagement) {
    rows.push(['Engagement Metrics']);
    rows.push(['Date', 'Views', 'Likes', 'Comments', 'Shares']);
    data.engagementHistory.forEach(entry => {
      rows.push([entry.date, entry.views, entry.likes, entry.comments, entry.shares]);
    });
    rows.push(['']);
  }
  
  if (options.sections.content) {
    rows.push(['Top Content']);
    rows.push(['Title', 'Views', 'Engagement Rate', 'Date']);
    data.topContent.forEach(content => {
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
        ['Total Views', data.totalViews],
        ['Engagement Rate', `${data.engagementRate}%`],
        ['Average Daily Views', Math.round(data.totalViews / 30)]
      ]
    };
  }
  
  if (options.sections.engagement) {
    workbook.sheets['Engagement'] = {
      data: [
        ['Date', 'Views', 'Likes', 'Comments', 'Shares', 'Engagement Rate'],
        ...data.engagementHistory.map(entry => [
          entry.date,
          entry.views,
          entry.likes,
          entry.comments,
          entry.shares,
          `${((entry.likes + entry.comments + entry.shares) / entry.views * 100).toFixed(2)}%`
        ])
      ]
    };
  }
  
  if (options.sections.content) {
    workbook.sheets['Top Content'] = {
      data: [
        ['Title', 'Views', 'Engagement Rate', 'Date', 'Type'],
        ...data.topContent.map(content => [
          content.title,
          content.views,
          `${content.engagementRate}%`,
          content.date,
          content.type
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

async function generatePDFReport(data: SnapchatData, options: ExportOptions) {
  const reportData = {
    title: 'Snapchat Analytics Report',
    generatedAt: new Date().toLocaleDateString(),
    dateRange: `${options.dateRange.start} - ${options.dateRange.end}`,
    sections: []
  };
  
  if (options.sections.overview) {
    reportData.sections.push({
      title: 'Overview',
      type: 'overview',
      data: {
        totalFollowers: data.totalFollowers,
        totalViews: data.totalViews,
        engagementRate: data.engagementRate,
        growthRate: data.growthRate
      }
    });
  }
  
  if (options.sections.engagement) {
    reportData.sections.push({
      title: 'Engagement Trends',
      type: 'chart',
      data: data.engagementHistory
    });
  }
  
  if (options.sections.content) {
    reportData.sections.push({
      title: 'Top Performing Content',
      type: 'table',
      data: data.topContent
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
    const competitorData = await analyzeCompetitors(data);
    reportData.sections.push({
      title: 'Competitive Analysis',
      type: 'competitors',
      data: competitorData
    });
  }
  
  return reportData;
}

async function generateJSONReport(data: SnapchatData, options: ExportOptions) {
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
      totalViews: data.totalViews,
      engagementRate: data.engagementRate,
      growthRate: data.growthRate
    };
  }
  
  if (options.sections.engagement) {
    report.engagement = data.engagementHistory;
  }
  
  if (options.sections.content) {
    report.content = data.topContent;
  }
  
  if (options.sections.audience) {
    report.audience = generateAudienceSegments(data);
  }
  
  if (options.sections.competitors) {
    report.competitors = await analyzeCompetitors(data);
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
