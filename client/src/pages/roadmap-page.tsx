import { useState } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Clock, 
  Calendar, 
  CheckCircle2, 
  CircleDot, 
  Star, 
  ThumbsUp, 
  MessageSquare, 
  ArrowUpRight,
  Code2,
  BarChart,
  BrainCircuit,
  Shield
} from "lucide-react";

// Feature status types
type FeatureStatus = "planned" | "in-progress" | "completed" | "considering";

// Feature interface
interface Feature {
  id: number;
  title: string;
  description: string;
  status: FeatureStatus;
  category: string;
  votes: number;
  comments: number;
  estimatedCompletion?: string;
  completedDate?: string;
  isPremium: boolean;
}

// Feature data
const features: Feature[] = [
  {
    id: 1,
    title: "AI-Powered Content Recommendations",
    description: "Get personalized content recommendations based on your audience engagement patterns and trending topics.",
    status: "in-progress",
    category: "AI & Machine Learning",
    votes: 457,
    comments: 83,
    estimatedCompletion: "Q2 2025",
    isPremium: true
  },
  {
    id: 2,
    title: "Advanced Audience Segmentation",
    description: "Segment your audience by demographics, behavior, content preferences, and engagement levels for more targeted analysis.",
    status: "completed",
    category: "Analytics",
    votes: 382,
    comments: 65,
    completedDate: "July 2025",
    isPremium: true
  },
  {
    id: 3,
    title: "Dark Mode",
    description: "A dark theme option for the dashboard to reduce eye strain and provide a modern look.",
    status: "completed",
    category: "User Interface",
    votes: 289,
    comments: 47,
    completedDate: "April 2025",
    isPremium: false
  },
  {
    id: 4,
    title: "Comprehensive Export Options",
    description: "Export your analytics data in various formats including PDF, CSV, Excel, and Google Sheets integration.",
    status: "in-progress",
    category: "Data Management",
    votes: 275,
    comments: 41,
    estimatedCompletion: "Q3 2025",
    isPremium: false
  },
  {
    id: 5,
    title: "Competitor Analysis",
    description: "Compare your performance metrics with similar content creators to identify growth opportunities.",
    status: "completed",
    category: "Analytics",
    votes: 512,
    comments: 92,
    completedDate: "July 2025",
    isPremium: true
  },
  {
    id: 6,
    title: "Enhanced Data Visualization",
    description: "More advanced chart types and interactive visualization options for better data analysis.",
    status: "completed",
    category: "User Interface",
    votes: 347,
    comments: 58,
    completedDate: "July 2025",
    isPremium: false
  },
  {
    id: 7,
    title: "Content Calendar Integration",
    description: "Plan and schedule your content directly from the analytics dashboard based on predicted performance.",
    status: "considering",
    category: "Integrations",
    votes: 298,
    comments: 43,
    isPremium: true
  },
  {
    id: 8,
    title: "Automated Insights Reports",
    description: "Scheduled email reports with key insights and performance metrics delivered to your inbox.",
    status: "completed",
    category: "Automation",
    votes: 327,
    comments: 39,
    completedDate: "July 2025",
    isPremium: false
  },
  {
    id: 9,
    title: "Multi-Platform Analytics",
    description: "Expand analytics to include other social media platforms for cross-platform performance comparison.",
    status: "considering",
    category: "Integrations",
    votes: 654,
    comments: 127,
    isPremium: true
  },
  {
    id: 10,
    title: "Advanced API Access",
    description: "Developer API for accessing your analytics data programmatically and integrating with custom tools.",
    status: "planned",
    category: "Developer Tools",
    votes: 218,
    comments: 31,
    estimatedCompletion: "Q1 2026",
    isPremium: true
  },
  {
    id: 11,
    title: "Comprehensive Data Privacy Controls",
    description: "Enhanced privacy settings with granular consent controls for managing how your data is used.",
    status: "completed",
    category: "Data Privacy",
    votes: 376,
    comments: 59,
    completedDate: "April 2025",
    isPremium: false
  },
  {
    id: 12,
    title: "Performance Benchmarks",
    description: "Industry and category benchmarks to help you gauge your performance against standards.",
    status: "completed",
    category: "Analytics",
    votes: 287,
    comments: 45,
    completedDate: "July 2025",
    isPremium: true
  }
];

// Feature card component
function FeatureCard({ feature }: { feature: Feature }) {
  const getStatusBadge = (status: FeatureStatus) => {
    switch (status) {
      case "planned":
        return <Badge className="bg-blue-500 hover:bg-blue-600"><Calendar className="h-3 w-3 mr-1" /> Planned</Badge>;
      case "in-progress":
        return <Badge className="bg-amber-500 hover:bg-amber-600"><CircleDot className="h-3 w-3 mr-1" /> In Progress</Badge>;
      case "completed":
        return <Badge className="bg-green-500 hover:bg-green-600"><CheckCircle2 className="h-3 w-3 mr-1" /> Completed</Badge>;
      case "considering":
        return <Badge className="bg-purple-500 hover:bg-purple-600"><Clock className="h-3 w-3 mr-1" /> Considering</Badge>;
      default:
        return null;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "AI & Machine Learning":
        return <BrainCircuit className="h-4 w-4 text-primary" />;
      case "Analytics":
        return <BarChart className="h-4 w-4 text-primary" />;
      case "User Interface":
        return <Code2 className="h-4 w-4 text-primary" />;
      case "Data Management":
      case "Data Privacy":
        return <Shield className="h-4 w-4 text-primary" />;
      default:
        return <ArrowUpRight className="h-4 w-4 text-primary" />;
    }
  };

  return (
    <Card className="dark-card h-full flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            {getCategoryIcon(feature.category)}
            <span className="text-xs text-muted-foreground">{feature.category}</span>
          </div>
          {getStatusBadge(feature.status)}
        </div>
        <CardTitle className="text-lg mt-2">
          {feature.title}
          {feature.isPremium && (
            <span className="ml-2 text-xs bg-gradient-to-r from-amber-400 to-amber-600 text-black px-1.5 py-0.5 rounded-sm">
              PREMIUM
            </span>
          )}
        </CardTitle>
        <CardDescription className="line-clamp-2">
          {feature.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-2 flex-grow">
        {feature.status === "completed" ? (
          <p className="text-xs flex items-center text-muted-foreground">
            <CheckCircle2 className="h-3 w-3 mr-1 text-green-500" /> 
            Completed in {feature.completedDate}
          </p>
        ) : feature.status === "considering" ? (
          <p className="text-xs flex items-center text-muted-foreground">
            <Clock className="h-3 w-3 mr-1" /> 
            Under consideration
          </p>
        ) : (
          <p className="text-xs flex items-center text-muted-foreground">
            <Calendar className="h-3 w-3 mr-1" /> 
            Estimated: {feature.estimatedCompletion}
          </p>
        )}
      </CardContent>
      <CardFooter className="pt-2 border-t flex justify-between">
        <div className="flex items-center space-x-3">
          <button className="flex items-center text-xs text-muted-foreground hover:text-primary">
            <ThumbsUp className="h-3 w-3 mr-1" /> {feature.votes}
          </button>
          <button className="flex items-center text-xs text-muted-foreground hover:text-primary">
            <MessageSquare className="h-3 w-3 mr-1" /> {feature.comments}
          </button>
        </div>
        <Button variant="outline" size="sm" className="text-xs">
          Details
        </Button>
      </CardFooter>
    </Card>
  );
}

export default function RoadmapPage() {
  const [activeTab, setActiveTab] = useState<string>("all");
  
  // Filter features based on tab
  const filteredFeatures = features.filter(feature => {
    if (activeTab === "all") return true;
    if (activeTab === "completed") return feature.status === "completed";
    if (activeTab === "in-progress") return feature.status === "in-progress";
    if (activeTab === "planned") return feature.status === "planned";
    if (activeTab === "considering") return feature.status === "considering";
    return true;
  });

  return (
    <div className="container max-w-6xl py-10 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold purple-gradient-text">Product Roadmap</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Explore upcoming features, provide feedback, and stay updated on our development plans
        </p>
      </div>

      <Card className="dark-card">
        <CardHeader>
          <CardTitle>Q2-Q4 2025 Development Plan</CardTitle>
          <CardDescription>
            Our roadmap is shaped by user feedback and market trends. Priorities may shift based on community needs.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid grid-cols-5 w-full">
              <TabsTrigger value="all" className="flex items-center">
                <Star className="h-4 w-4 mr-2" /> All Features
              </TabsTrigger>
              <TabsTrigger value="in-progress" className="flex items-center">
                <CircleDot className="h-4 w-4 mr-2" /> In Progress
              </TabsTrigger>
              <TabsTrigger value="planned" className="flex items-center">
                <Calendar className="h-4 w-4 mr-2" /> Planned
              </TabsTrigger>
              <TabsTrigger value="considering" className="flex items-center">
                <Clock className="h-4 w-4 mr-2" /> Considering
              </TabsTrigger>
              <TabsTrigger value="completed" className="flex items-center">
                <CheckCircle2 className="h-4 w-4 mr-2" /> Completed
              </TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredFeatures.map(feature => (
                  <FeatureCard key={feature.id} feature={feature} />
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="dark-card">
          <CardHeader>
            <CardTitle>Development Priorities</CardTitle>
            <CardDescription>
              How we decide what to build next
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm">
              Our roadmap is driven by a combination of user feedback, strategic objectives, and technical feasibility. Here's how we prioritize:
            </p>
            <ol className="list-decimal pl-6 space-y-2 text-sm">
              <li><strong>User Impact:</strong> Features that benefit the most users or solve critical pain points</li>
              <li><strong>Competitive Advantage:</strong> Capabilities that differentiate DuckShot Analytics in the market</li>
              <li><strong>Technical Foundation:</strong> Infrastructure improvements that enable future innovations</li>
              <li><strong>Community Requests:</strong> Features with high vote counts and engagement from our user community</li>
            </ol>
          </CardContent>
        </Card>

        <Card className="dark-card">
          <CardHeader>
            <CardTitle>Suggest a Feature</CardTitle>
            <CardDescription>
              We'd love to hear your ideas
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm">
              Have a feature suggestion that would improve DuckShot Analytics? We encourage our users to contribute ideas that could enhance the platform.
            </p>
            <p className="text-sm">
              The most popular feature requests are regularly reviewed by our product team and may be added to our roadmap.
            </p>
          </CardContent>
          <CardFooter>
            <Button className="purple-pink-gradient-bg hover:opacity-90 w-full">Submit Feature Request</Button>
          </CardFooter>
        </Card>
      </div>

      <Card className="dark-card bg-secondary/30">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-medium">Stay Updated</h3>
              <p className="text-muted-foreground">
                Subscribe to our newsletter to receive updates on new features and improvements.
              </p>
            </div>
            <Button className="purple-pink-gradient-bg hover:opacity-90">
              Subscribe to Updates
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}