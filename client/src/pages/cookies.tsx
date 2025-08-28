import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function CookiesPage() {
  return (
    <div className="container max-w-3xl py-10 space-y-6">
      <h1 className="text-3xl font-bold">Cookies</h1>
      <Card className="dark-card">
        <CardHeader>
          <CardTitle>Cookie Policy</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            We use cookies to improve your experience, analyze usage, and personalize content. By using this site you consent to cookies.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

