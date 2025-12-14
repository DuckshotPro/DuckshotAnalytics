/**
 * Email Service
 * 
 * Handles sending verification emails using either Resend or SMTP
 */

import { Resend } from 'resend';
import nodemailer from 'nodemailer';

const useResend = !!process.env.RESEND_API_KEY;
const resend = useResend ? new Resend(process.env.RESEND_API_KEY) : null;

// SMTP transporter for self-hosted email
const smtpTransporter = !useResend ? nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'localhost',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
  auth: process.env.SMTP_USER ? {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  } : undefined,
}) : null;

export interface SendVerificationEmailParams {
  to: string;
  username: string;
  verificationToken: string;
}

/**
 * Send email verification email
 */
export async function sendVerificationEmail({
  to,
  username,
  verificationToken
}: SendVerificationEmailParams) {
  const appUrl = process.env.APP_URL || 'http://localhost:5000';
  const verificationUrl = `${appUrl}/verify-email/${verificationToken}`;
  const fromEmail = process.env.EMAIL_FROM || 'DuckShot Analytics <noreply@duckshotanalytics.com>';

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to DuckShot Analytics!</h1>
        </div>
        
        <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
          <p style="font-size: 16px; margin-bottom: 20px;">Hi <strong>${username}</strong>,</p>
          
          <p style="font-size: 16px; margin-bottom: 20px;">
            Thanks for signing up! Please verify your email address to activate your account and start analyzing your Snapchat performance.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <form action="${appUrl}/verify-email" method="POST" style="display: inline-block;">
              <input type="hidden" name="token" value="${verificationToken}">
              <button type="submit" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                      color: white; 
                      text-decoration: none; 
                      padding: 14px 30px; 
                      border: none;
                      border-radius: 5px; 
                      font-size: 16px; 
                      font-weight: bold;
                      cursor: pointer;
                      display: inline-block;">
                Verify Email Address
              </button>
            </form>
          </div>
          
          <p style="font-size: 14px; color: #666; margin-top: 30px;">
            If the button doesn't work, you can also verify by visiting:<br>
            <a href="${appUrl}/verify-email?t=${verificationToken.substring(0, 8)}..." style="color: #667eea;">${appUrl}/verify-email</a>
            <br><small style="color: #999;">(You'll need to enter the verification code from this email)</small>
          </p>
          
          <p style="font-size: 14px; color: #666; margin-top: 20px; border-top: 1px solid #ddd; padding-top: 20px;">
            This link will expire in 24 hours. If you didn't create an account with DuckShot Analytics, you can safely ignore this email.
          </p>
        </div>
        
        <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
          <p>© ${new Date().getFullYear()} DuckShot Analytics. All rights reserved.</p>
        </div>
      </body>
    </html>
  `;

  try {
    if (useResend && resend) {
      // Use Resend service
      const { data, error } = await resend.emails.send({
        from: fromEmail,
        to: [to],
        subject: 'Verify your email address',
        html: htmlContent,
      });

      if (error) {
        throw new Error(`Failed to send verification email: ${error.message}`);
      }

      return { success: true, data };
    } else if (smtpTransporter) {
      // Use SMTP
      const info = await smtpTransporter.sendMail({
        from: fromEmail,
        to,
        subject: 'Verify your email address',
        html: htmlContent,
      });

      return { success: true, data: info };
    } else {
      throw new Error('No email service configured. Please set either RESEND_API_KEY or SMTP settings.');
    }
  } catch (error) {
    console.error('Error sending verification email:', error);
    throw error;
  }
}
