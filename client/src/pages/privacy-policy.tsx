/**
 * Privacy Policy Page
 * 
 * This page outlines the privacy policy for DuckShots SnapAlytics,
 * explaining what data is collected, how it's used, and user rights.
 */

import React from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";

export default function PrivacyPolicyPage() {
  return (
    <div className="container mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
      <p className="text-muted-foreground mb-8">
        Last updated: April 18, 2025
      </p>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Introduction</CardTitle>
          <CardDescription>
            Our commitment to your privacy
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-4">
            DuckShots SnapAlytics ("we", "our", or "us") respects your privacy and is committed to protecting your personal data. 
            This privacy policy will inform you about how we look after your personal data when you use our application and tell you about your privacy rights.
          </p>
          <p>
            By using our services, you consent to the collection and use of information in accordance with this policy.
          </p>
        </CardContent>
      </Card>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Data We Collect</CardTitle>
          <CardDescription>
            Information collected through our application
          </CardDescription>
        </CardHeader>
        <CardContent>
          <h3 className="text-lg font-medium mb-2">Account Information</h3>
          <p className="mb-4">
            When you register for an account, we collect your username and a securely hashed version of your password.
            If you choose to log in via Snapchat, we collect your Snapchat OAuth credentials, which include an access token
            and refresh token.
          </p>

          <h3 className="text-lg font-medium mb-2">Snapchat Analytics Data</h3>
          <p className="mb-4">
            With your explicit permission, we collect analytics data from your Snapchat account using the credentials you provide.
            This may include follower counts, engagement metrics, view statistics, and demographic information.
            This data is stored in our database and associated with your account.
          </p>

          <h3 className="text-lg font-medium mb-2">Subscription Information</h3>
          <p>
            If you subscribe to our premium service, we collect and store information about your subscription status,
            including the subscription tier and expiration date.
          </p>
        </CardContent>
      </Card>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>How We Use Your Data</CardTitle>
          <CardDescription>
            Purposes for which we use your personal data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="list-disc pl-5 space-y-2">
            <li>
              <strong>Provide our services:</strong> We use your data to provide you with our analytics services, including processing and displaying your Snapchat analytics data.
            </li>
            <li>
              <strong>Improve our services:</strong> We analyze usage patterns to improve the functionality and user experience of our application.
            </li>
            <li>
              <strong>Generate insights:</strong> For premium subscribers, we use your Snapchat analytics data to generate AI-powered insights about your account performance.
            </li>
            <li>
              <strong>Communicate with you:</strong> We may use your contact information to send you service-related notices and updates.
            </li>
          </ul>
        </CardContent>
      </Card>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Data Security</CardTitle>
          <CardDescription>
            How we protect your personal data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-4">
            We implement appropriate security measures to prevent your personal data from being accidentally lost, used, or accessed in an unauthorized way.
            These measures include:
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li>Password hashing using secure cryptographic methods</li>
            <li>Encrypted storage of OAuth tokens</li>
            <li>Secure HTTPS connections for all data transfers</li>
            <li>Regular security audits and updates</li>
            <li>Limited access to personal data by authorized personnel only</li>
          </ul>
        </CardContent>
      </Card>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Your Data Rights</CardTitle>
          <CardDescription>
            Control over your personal data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-4">
            You have the right to:
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li>Access the personal data we hold about you</li>
            <li>Request correction of your personal data</li>
            <li>Request deletion of your data</li>
            <li>Withdraw your consent at any time (for data processing based on consent)</li>
            <li>Request restriction of processing of your personal data</li>
            <li>Request the transfer of your personal data</li>
            <li>Object to processing of your personal data</li>
          </ul>
          <p className="mt-4">
            To exercise any of these rights, please contact us at privacy@duckshotsanalytics.com
          </p>
        </CardContent>
      </Card>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Data Retention</CardTitle>
          <CardDescription>
            How long we keep your data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>
            We will retain your personal data for as long as necessary to fulfill the purposes we collected it for,
            including for the purposes of satisfying any legal, accounting, or reporting requirements.
            If you delete your account, your personal data will be deleted or anonymized within 30 days.
          </p>
        </CardContent>
      </Card>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Third-Party Sharing</CardTitle>
          <CardDescription>
            How and when we share your data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-4">
            We do not sell or rent your personal data to third parties. We may share your data with:
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li>
              <strong>Snapchat:</strong> To retrieve your analytics data, we interact with Snapchat's API using the credentials you provide.
            </li>
            <li>
              <strong>AI Service Providers:</strong> For premium subscribers, we may use third-party AI services to generate insights from your analytics data.
            </li>
            <li>
              <strong>Payment Processors:</strong> If you subscribe to our premium service, your payment information will be processed by secure third-party payment processors.
            </li>
            <li>
              <strong>Legal Requirements:</strong> We may disclose your information if required to do so by law or in response to valid requests by public authorities.
            </li>
          </ul>
        </CardContent>
      </Card>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Changes to This Policy</CardTitle>
          <CardDescription>
            How we update our privacy policy
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>
            We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page
            and updating the "Last updated" date at the top of this page. You are advised to review this Privacy Policy periodically for any changes.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Contact Us</CardTitle>
          <CardDescription>
            How to reach us with questions about privacy
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>
            If you have any questions about this Privacy Policy, please contact us at privacy@duckshotsanalytics.com
          </p>
        </CardContent>
      </Card>
    </div>
  );
}