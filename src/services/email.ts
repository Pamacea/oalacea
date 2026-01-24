export interface EmailOptions {
  to: string
  subject: string
  html: string
}

export async function sendEmail({ to, subject, html }: EmailOptions): Promise<void> {
  if (!process.env.SMTP_HOST) {
    console.warn("Email service not configured. Skipping email send.")
    return
  }

  throw new Error("Email service not implemented")
}
