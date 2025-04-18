/**
 * Consent Dialog Component
 * 
 * This component displays a dialog requesting user consent
 * before connecting their Snapchat account or collecting data.
 */

import React from 'react';
import { useState } from 'react';
import { Link } from 'wouter';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

interface ConsentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  onDecline: () => void;
  providerName: string;
}

export function ConsentDialog({
  open,
  onOpenChange,
  onConfirm,
  onDecline,
  providerName = 'Snapchat'
}: ConsentDialogProps) {
  const [consentGiven, setConsentGiven] = useState(false);

  const handleConfirm = () => {
    if (consentGiven) {
      onConfirm();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Connect {providerName} Account</DialogTitle>
          <DialogDescription>
            Before connecting your {providerName} account, please review and confirm your consent
            to our data collection and usage practices.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <h3 className="font-semibold">Data We'll Access:</h3>
          <ul className="list-disc pl-5 space-y-1">
            <li>Your {providerName} profile information</li>
            <li>Analytics data from your {providerName} account</li>
            <li>Engagement metrics and audience demographics</li>
          </ul>

          <h3 className="font-semibold">How We'll Use This Data:</h3>
          <ul className="list-disc pl-5 space-y-1">
            <li>Display analytics in your dashboard</li>
            <li>Generate insights about your content performance</li>
            <li>Create personalized recommendations</li>
          </ul>

          <div className="flex items-start space-x-2 pt-2">
            <Checkbox
              id="consent"
              checked={consentGiven}
              onCheckedChange={(checked) => setConsentGiven(checked === true)}
            />
            <div className="grid gap-1.5 leading-none">
              <Label
                htmlFor="consent"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                I consent to DuckShots SnapAlytics accessing and processing my {providerName} data as described above
                and in the <Link href="/privacy-policy" className="underline text-primary">Privacy Policy</Link>.
              </Label>
            </div>
          </div>

          <p className="text-sm text-muted-foreground">
            You can withdraw your consent at any time by disconnecting your {providerName} account
            in the Settings page.
          </p>
        </div>

        <DialogFooter className="flex-col sm:flex-row sm:justify-between">
          <Button variant="outline" onClick={onDecline}>
            Decline
          </Button>
          <Button 
            onClick={handleConfirm} 
            disabled={!consentGiven}
            className="mt-2 sm:mt-0"
          >
            Connect Account
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}