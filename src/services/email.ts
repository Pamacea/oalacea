export async function sendEmail(): Promise<void> {
  if (!process.env.SMTP_HOST) {
    console.warn("Email service not configured. Skipping email send.")
    return
  }

  throw new Error("Email service not implemented")
}
