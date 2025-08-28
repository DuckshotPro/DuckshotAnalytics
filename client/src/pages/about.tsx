import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AboutPage() {
  return (
    <div className="container max-w-3xl py-10 space-y-6">
      <h1 className="text-3xl font-bold">About DuckShot Analytics</h1>
      <Card className="dark-card">
        <CardHeader>
          <CardTitle>Our Mission</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            DuckShot Analytics helps creators and brands understand and grow their Snapchat presence through actionable insights and an intuitive dashboard.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

