import nodemailer from "nodemailer";

export async function sendResetEmail(email: string, resetLink: string) {
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = Number(process.env.SMTP_PORT || 587);
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  const smtpFrom = process.env.SMTP_FROM || "Xeno CRM <noreply@xeno.ai>";

  const emailText = `You requested a password reset. Click the following link to reset your password:\n\n${resetLink}\n\nThis link is valid for 1 hour.`;
  const emailHtml = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e4e4e7; border-radius: 12px; background-color: #ffffff;">
      <h2 style="color: #4f46e5; margin-bottom: 20px;">Password Reset Request</h2>
      <p style="color: #3f3f46; font-size: 16px; line-height: 1.5;">You requested a password reset for your Xeno AI CRM account. Click the button below to set a new password:</p>
      <div style="margin: 30px 0; text-align: center;">
        <a href="${resetLink}" style="background-color: #4f46e5; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; display: inline-block;">Reset Password</a>
      </div>
      <p style="color: #71717a; font-size: 14px; line-height: 1.5;">If the button above does not work, copy and paste the link below into your browser:</p>
      <p style="background-color: #f4f4f5; padding: 12px; border-radius: 8px; font-size: 13px; font-family: monospace; word-break: break-all; color: #18181b;">${resetLink}</p>
      <p style="color: #71717a; font-size: 12px; margin-top: 30px; border-t: 1px solid #e4e4e7; padding-top: 15px;">If you did not request a password reset, you can safely ignore this email.</p>
    </div>
  `;

  console.log("\n==================================================");
  console.log(`[MAILER] Sending password reset link to: ${email}`);
  console.log(`[MAILER] Reset link: ${resetLink}`);
  console.log("==================================================\n");

  if (!smtpHost || !smtpUser || !smtpPass) {
    console.log("[MAILER] SMTP environment variables not configured. Logged link to console (Development Mode).");
    return { sent: false, loggedToConsole: true };
  }

  try {
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });

    await transporter.sendMail({
      from: smtpFrom,
      to: email,
      subject: "Reset your Xeno CRM password",
      text: emailText,
      html: emailHtml,
    });

    console.log("[MAILER] Email successfully sent via SMTP.");
    return { sent: true, loggedToConsole: false };
  } catch (error) {
    console.error("[MAILER] Failed to send email via SMTP:", error);
    return { sent: false, loggedToConsole: true, error };
  }
}
