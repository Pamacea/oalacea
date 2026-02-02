export async function sendEmail(): Promise<void> {
  if (!process.env.SMTP_HOST) {
    return
  }

  throw new Error("Email service not implemented")
}
