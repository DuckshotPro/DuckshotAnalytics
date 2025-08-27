import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function FeaturesPage() {
  return (
    <div className="container max-w-4xl py-10 space-y-6">
      <h1 className="text-3xl font-bold">Features</h1>
      <Card className="dark-card">
        <CardHeader>
          <CardTitle>Overview</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            We offer a comprehensive Snapchat analytics suite including audience growth, demographics, content performance, and AI-powered insights. This page will include a detailed breakdown of all features soon.
          </p>
          <div className="flex gap-3">
            <Link href="/pricing-page">
              <Button>See Pricing</Button>
            </Link>
            <Link href="/">
              <Button variant="outline">Back to Home</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

