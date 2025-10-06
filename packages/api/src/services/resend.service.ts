import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendVerificationEmail(email: string, token: string) {
  const html = `
    <div style="font-family:Arial,sans-serif;padding:24px;background:#f9f9f9;">
      <h2 style="color:#333;">Verify your email</h2>
      <p>Click the button below to verify your email address:</p>
      <a href="${process.env.CLIENT_URL}/auth/verify-email?token=${token}" style="display:inline-block;padding:12px 24px;background:#2563eb;color:#fff;border-radius:6px;text-decoration:none;font-weight:bold;">Verify Email</a>
      <p style="margin-top:24px;font-size:12px;color:#888;">If you did not request this, you can ignore this email.</p>
    </div>
  `;
  return resend.emails.send({
    from: 'noreply@localprosites.com',
    to: email,
    subject: 'Verify your email',
    html,
  });
}

export async function sendPasswordResetEmail(email: string, token: string) {
  const html = `
    <div style="font-family:Arial,sans-serif;padding:24px;background:#f9f9f9;">
      <h2 style="color:#333;">Reset your password</h2>
      <p>Click the button below to reset your password:</p>
      <a href="${process.env.CLIENT_URL}/auth/reset-password?token=${token}" style="display:inline-block;padding:12px 24px;background:#16a34a;color:#fff;border-radius:6px;text-decoration:none;font-weight:bold;">Reset Password</a>
      <p style="margin-top:24px;font-size:12px;color:#888;">If you did not request this, you can ignore this email.</p>
    </div>
  `;
  return resend.emails.send({
    from: 'noreply@localprosites.com',
    to: email,
    subject: 'Password reset request',
    html,
  });
}
