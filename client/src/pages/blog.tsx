import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function BlogPage() {
  return (
    <div className="container max-w-3xl py-10 space-y-6">
      <h1 className="text-3xl font-bold">Blog</h1>
      <Card className="dark-card">
        <CardHeader>
          <CardTitle>Coming Soon</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            Insights, guides, and updates about Snapchat analytics will be published here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

