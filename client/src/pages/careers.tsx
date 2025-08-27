import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function CareersPage() {
  return (
    <div className="container max-w-3xl py-10 space-y-6">
      <h1 className="text-3xl font-bold">Careers</h1>
      <Card className="dark-card">
        <CardHeader>
          <CardTitle>Join Us</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            We are not hiring at the moment. Check back soon for opportunities to help creators grow on Snapchat.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

