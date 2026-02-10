import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PrivacyPolicyPage() {
  return (
    <div className="container max-w-4xl py-10 space-y-6">
      <h1 className="text-3xl font-bold purple-gradient-text">Privacy Policy</h1>
      <p className="text-muted-foreground">Last updated: April 21, 2025</p>

      <Card className="dark-card">
        <CardHeader>
          <CardTitle>1. Introduction</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            DuckShot Analytics ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our web application.
          </p>
          <p>
            Please read this Privacy Policy carefully. By accessing or using our service, you acknowledge that you have read, understood, and agree to be bound by all the terms of this Privacy Policy.
          </p>
        </CardContent>
      </Card>

      <Card className="dark-card">
        <CardHeader>
          <CardTitle>2. Information We Collect</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <h3 className="font-medium">2.1 Personal Information</h3>
          <p>
            We may collect personally identifiable information, such as:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Name and username</li>
            <li>Email address</li>
            <li>Payment information (processed securely through Stripe)</li>
            <li>Snapchat account information (with your explicit consent)</li>
            <li>Profile information</li>
          </ul>

          <h3 className="font-medium mt-4">2.2 Snapchat Data</h3>
          <p>
            With your authorization, we connect to the Snapchat API to retrieve analytics data related to your content, including but not limited to:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Audience demographics</li>
            <li>Content performance metrics</li>
            <li>Engagement statistics</li>
            <li>Geographic information</li>
          </ul>

          <h3 className="font-medium mt-4">2.3 Usage Information</h3>
          <p>
            We automatically collect certain information about your device and how you interact with our service, including:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>IP address</li>
            <li>Browser type</li>
            <li>Device information</li>
            <li>Pages viewed and features used</li>
            <li>Time spent on the platform</li>
          </ul>
        </CardContent>
      </Card>

      <Card className="dark-card">
        <CardHeader>
          <CardTitle>3. How We Use Your Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            We use the information we collect for various purposes, including:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Providing, operating, and maintaining our service</li>
            <li>Improving and personalizing your experience</li>
            <li>Analyzing usage patterns and trends</li>
            <li>Communicating with you about your account or transactions</li>
            <li>Sending you technical notices and updates</li>
            <li>Processing payments and managing subscriptions</li>
            <li>Protecting against fraudulent or unauthorized activity</li>
          </ul>
        </CardContent>
      </Card>

      <Card className="dark-card">
        <CardHeader>
          <CardTitle>4. Data Sharing and Disclosure</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            We may share your information in the following circumstances:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Service Providers:</strong> We may share your information with third-party vendors who provide services on our behalf, such as payment processing and data analytics.</li>
            <li><strong>Legal Requirements:</strong> We may disclose your information if required to do so by law or in response to valid requests by public authorities.</li>
            <li><strong>Business Transfers:</strong> If we are involved in a merger, acquisition, or sale of all or a portion of our assets, your information may be transferred as part of that transaction.</li>
            <li><strong>With Your Consent:</strong> We may share your information with third parties when we have your explicit consent to do so.</li>
          </ul>
          <p className="mt-4">
            We will never sell your personal information to third parties for marketing purposes.
          </p>
        </CardContent>
      </Card>

      <Card className="dark-card">
        <CardHeader>
          <CardTitle>5. Data Security</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            We implement appropriate technical and organizational measures to protect the security of your personal information. However, please be aware that no method of transmission over the Internet or method of electronic storage is 100% secure.
          </p>
          <p>
            We limit access to your information to authorized personnel and contractors who need to know that information in order to operate, develop, or improve our service. These individuals are bound by confidentiality obligations.
          </p>
        </CardContent>
      </Card>

      <Card className="dark-card">
        <CardHeader>
          <CardTitle>6. Your Data Rights and Choices</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            Depending on your location, you may have certain rights regarding your personal information, including:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Access:</strong> You can request a copy of the personal information we hold about you.</li>
            <li><strong>Correction:</strong> You can request that we correct inaccurate or incomplete information.</li>
            <li><strong>Deletion:</strong> You can request that we delete your personal information.</li>
            <li><strong>Restriction:</strong> You can request that we restrict the processing of your information.</li>
            <li><strong>Portability:</strong> You can request a machine-readable copy of your information.</li>
            <li><strong>Objection:</strong> You can object to certain types of processing.</li>
          </ul>
          <p className="mt-4">
            To exercise these rights, please contact us at privacy@duckshotanalytics.com. We will respond to your request within a reasonable timeframe.
          </p>
        </CardContent>
      </Card>

      <Card className="dark-card">
        <CardHeader>
          <CardTitle>7. User Consent Management</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            We provide granular consent controls that allow you to specify exactly how your data may be used. You can adjust these settings at any time from your account's data management page.
          </p>
          <p>
            Our consent management system allows you to control:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Analytics data collection and processing</li>
            <li>Demographic data usage</li>
            <li>Location data processing</li>
            <li>Content analysis</li>
            <li>Third-party data sharing</li>
            <li>Marketing communications</li>
          </ul>
        </CardContent>
      </Card>

      <Card className="dark-card">
        <CardHeader>
          <CardTitle>8. Data Retention</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            We retain your personal information for as long as necessary to provide the services you have requested, or for other essential purposes such as complying with our legal obligations, resolving disputes, and enforcing our agreements.
          </p>
          <p>
            You can request the deletion of your account and associated data at any time. We will process such requests within 30 days, subject to any legal requirements to retain certain information.
          </p>
        </CardContent>
      </Card>

      <Card className="dark-card">
        <CardHeader>
          <CardTitle>9. International Data Transfers</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            Your information may be transferred to and processed in countries other than the country in which you reside. These countries may have data protection laws that are different from the laws of your country.
          </p>
          <p>
            Whenever we transfer your information, we take appropriate safeguards to ensure that your information remains protected in accordance with this Privacy Policy.
          </p>
        </CardContent>
      </Card>

      <Card className="dark-card">
        <CardHeader>
          <CardTitle>10. Changes to This Privacy Policy</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date at the top.
          </p>
          <p>
            You are advised to review this Privacy Policy periodically for any changes. Changes to this Privacy Policy are effective when they are posted on this page.
          </p>
        </CardContent>
      </Card>

      <Card className="dark-card">
        <CardHeader>
          <CardTitle>11. Contact Us</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            If you have any questions or concerns about this Privacy Policy or our data practices, please contact us at privacy@duckshotanalytics.com.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}