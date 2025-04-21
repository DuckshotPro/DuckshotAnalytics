import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TermsPage() {
  return (
    <div className="container max-w-4xl py-10 space-y-6">
      <h1 className="text-3xl font-bold purple-gradient-text">Terms of Service</h1>
      <p className="text-muted-foreground">Last updated: April 21, 2025</p>

      <Card className="dark-card">
        <CardHeader>
          <CardTitle>1. Acceptance of Terms</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            By accessing or using DuckShot Analytics, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our service.
          </p>
          <p>
            We reserve the right to update or modify these terms at any time without prior notice. Your continued use of the service following any changes constitutes your acceptance of the new terms.
          </p>
        </CardContent>
      </Card>

      <Card className="dark-card">
        <CardHeader>
          <CardTitle>2. Description of Service</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            DuckShot Analytics provides analytics and insights for Snapchat content creators. We help you understand your audience and optimize your content strategy through data visualization and AI-powered recommendations.
          </p>
          <p>
            The service includes both free and premium tiers with different feature sets. Premium features require a paid subscription.
          </p>
        </CardContent>
      </Card>

      <Card className="dark-card">
        <CardHeader>
          <CardTitle>3. User Accounts</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            You must provide accurate, current, and complete information when creating an account. You are responsible for maintaining the confidentiality of your password and for all activities that occur under your account.
          </p>
          <p>
            We reserve the right to terminate accounts that violate our terms of service or that have been inactive for an extended period.
          </p>
        </CardContent>
      </Card>

      <Card className="dark-card">
        <CardHeader>
          <CardTitle>4. API Usage and Limitations</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            Our service connects to the Snapchat API to retrieve your data. Your use of our service is subject to Snapchat's terms of service and API limitations.
          </p>
          <p>
            Free tier accounts may be subject to rate limiting and usage caps. Premium accounts offer higher usage limits and priority API access.
          </p>
        </CardContent>
      </Card>

      <Card className="dark-card">
        <CardHeader>
          <CardTitle>5. Subscription and Billing</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            Premium subscriptions are billed monthly or annually, depending on the plan you select. You can cancel your subscription at any time, but we do not provide refunds for partial subscription periods.
          </p>
          <p>
            We use Stripe as our payment processor. Your payment information is handled securely according to industry standards.
          </p>
        </CardContent>
      </Card>

      <Card className="dark-card">
        <CardHeader>
          <CardTitle>6. Data and Privacy</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            We value your privacy and handle your data in accordance with our Privacy Policy. By using our service, you consent to the collection and processing of your data as described in the Privacy Policy.
          </p>
          <p>
            You maintain ownership of your data, and we will not sell or share your personal information with third parties except as described in our Privacy Policy.
          </p>
        </CardContent>
      </Card>

      <Card className="dark-card">
        <CardHeader>
          <CardTitle>7. Limitation of Liability</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            The service is provided "as is" without warranties of any kind. We do not guarantee that the service will be error-free or uninterrupted.
          </p>
          <p>
            In no event shall DuckShot Analytics be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses.
          </p>
        </CardContent>
      </Card>

      <Card className="dark-card">
        <CardHeader>
          <CardTitle>8. Termination</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            We may terminate or suspend your account and access to the service immediately, without prior notice or liability, for any reason, including without limitation if you breach these Terms of Service.
          </p>
          <p>
            Upon termination, your right to use the service will immediately cease. All provisions of these Terms which by their nature should survive termination shall survive.
          </p>
        </CardContent>
      </Card>

      <Card className="dark-card">
        <CardHeader>
          <CardTitle>9. Governing Law</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            These Terms shall be governed by and construed in accordance with the laws of the United States, without regard to its conflict of law provisions.
          </p>
          <p>
            Any disputes arising under or in connection with these Terms shall be subject to the exclusive jurisdiction of the courts located within the United States.
          </p>
        </CardContent>
      </Card>

      <Card className="dark-card">
        <CardHeader>
          <CardTitle>10. Contact Us</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            If you have any questions about these Terms, please contact us at support@duckshotanalytics.com.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}