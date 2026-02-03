import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendEmail(options: {
  to: string;
  subject: string;
  html: string;
}): Promise<{ success: boolean; error?: unknown }> {
  // Debug: Log environment variables (without exposing the full key)
  console.log('[Email] Attempting to send email:', {
    hasApiKey: !!process.env.RESEND_API_KEY,
    apiKeyPrefix: process.env.RESEND_API_KEY?.slice(0, 7) + '...',
    fromEmail: process.env.RESEND_FROM_EMAIL || 'noreply@oalacea.fr',
    to: options.to,
    subject: options.subject,
  });

  // Skip email if API key is not configured
  if (!process.env.RESEND_API_KEY) {
    console.error('[Email] RESEND_API_KEY not set, skipping email send');
    return { success: false };
  }

  try {
    const result = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'noreply@oalacea.fr',
      to: options.to,
      subject: options.subject,
      html: options.html,
    });
    console.log('[Email] Sent successfully:', result);
    return { success: true };
  } catch (error) {
    console.error('[Email] Send failed:', error);
    return { success: false, error };
  }
}
