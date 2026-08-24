import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

function errorMessage(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}
const FROM = 'upSosh <bookings@upsosh.app>';

export interface BookingEmailData {
  guestName: string;
  guestEmail: string;
  eventTitle: string;
  eventDate: string;
  eventTime: string;
  eventVenue: string;
  bookingId: string;
  totalAmount: number;
  qrCode: string;
  isFree: boolean;
}

export async function sendBookingConfirmation(data: BookingEmailData): Promise<void> {
  if (!process.env.RESEND_API_KEY) {
    console.warn('[Email] RESEND_API_KEY not set — skipping booking confirmation email');
    return;
  }

  const subject = data.isFree
    ? `You're in! ${data.eventTitle}`
    : `Booking confirmed — ${data.eventTitle}`;

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${subject}</title>
</head>
<body style="margin:0;padding:0;background:#0A0A0B;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0A0A0B;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#13131B;border-radius:16px;overflow:hidden;border:1px solid #2A2A38;">

          <!-- Header -->
          <tr>
            <td style="padding:32px 40px 24px;border-bottom:1px solid #2A2A38;">
              <p style="margin:0;font-size:22px;font-weight:700;color:#F4F1EA;letter-spacing:-0.5px;">upSosh</p>
            </td>
          </tr>

          <!-- Hero -->
          <tr>
            <td style="padding:32px 40px 0;">
              <p style="margin:0 0 8px;font-size:13px;font-weight:600;color:#D4FF3F;letter-spacing:2px;text-transform:uppercase;">
                ${data.isFree ? "You're going!" : 'Booking confirmed'}
              </p>
              <h1 style="margin:0 0 8px;font-size:28px;font-weight:400;color:#F4F1EA;line-height:1.2;">${data.eventTitle}</h1>
              <p style="margin:0;font-size:15px;color:#8B8B9E;">Hi ${data.guestName}, your spot is locked in.</p>
            </td>
          </tr>

          <!-- Event details -->
          <tr>
            <td style="padding:24px 40px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#0A0A0B;border-radius:12px;border:1px solid #2A2A38;overflow:hidden;">
                <tr>
                  <td style="padding:20px 24px;border-bottom:1px solid #2A2A38;">
                    <p style="margin:0 0 4px;font-size:11px;color:#8B8B9E;letter-spacing:1px;text-transform:uppercase;">Date & Time</p>
                    <p style="margin:0;font-size:15px;color:#F4F1EA;">${data.eventDate} · ${data.eventTime}</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:20px 24px;border-bottom:1px solid #2A2A38;">
                    <p style="margin:0 0 4px;font-size:11px;color:#8B8B9E;letter-spacing:1px;text-transform:uppercase;">Venue</p>
                    <p style="margin:0;font-size:15px;color:#F4F1EA;">${data.eventVenue}</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:20px 24px;border-bottom:1px solid #2A2A38;">
                    <p style="margin:0 0 4px;font-size:11px;color:#8B8B9E;letter-spacing:1px;text-transform:uppercase;">Booking ID</p>
                    <p style="margin:0;font-size:13px;font-family:monospace;color:#D4FF3F;">${data.bookingId}</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:20px 24px;">
                    <p style="margin:0 0 4px;font-size:11px;color:#8B8B9E;letter-spacing:1px;text-transform:uppercase;">Amount paid</p>
                    <p style="margin:0;font-size:20px;font-weight:700;color:#D4FF3F;">
                      ${data.isFree ? 'Free' : `₹${data.totalAmount.toLocaleString('en-IN')}`}
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- QR code note -->
          <tr>
            <td style="padding:0 40px 32px;">
              <p style="margin:0 0 16px;font-size:14px;color:#8B8B9E;line-height:1.6;">
                Show your booking ID at the entrance. Your host will check you in.
                Your QR code: <span style="font-family:monospace;color:#D4FF3F;">${data.qrCode}</span>
              </p>
              <a href="https://upsosh.app/my-bookings"
                 style="display:inline-block;padding:12px 24px;background:#D4FF3F;color:#0A0A0B;border-radius:9999px;font-size:14px;font-weight:600;text-decoration:none;">
                View my bookings
              </a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:24px 40px;border-top:1px solid #2A2A38;">
              <p style="margin:0;font-size:12px;color:#555566;">
                Questions? Reply to this email or contact us at hello@upsosh.app<br/>
                upSosh · The curated platform for micro-events worth showing up to.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  try {
    await resend.emails.send({
      from: FROM,
      to: data.guestEmail,
      subject,
      html,
    });
    console.log(`[Email] Booking confirmation sent to ${data.guestEmail}`);
  } catch (err: unknown) {
    console.error('[Email] Failed to send booking confirmation:', errorMessage(err));
  }
}

export async function sendPasswordResetEmail(email: string, resetUrl: string): Promise<void> {
  if (!process.env.RESEND_API_KEY) {
    console.warn('[Email] RESEND_API_KEY not set — skipping password reset email');
    return;
  }

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Reset your password</title>
</head>
<body style="margin:0;padding:0;background:#0A0A0B;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0A0A0B;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="520" cellpadding="0" cellspacing="0" style="background:#13131B;border-radius:16px;overflow:hidden;border:1px solid #2A2A38;">
          <tr>
            <td style="padding:32px 40px 24px;border-bottom:1px solid #2A2A38;">
              <p style="margin:0;font-size:22px;font-weight:700;color:#F4F1EA;">upSosh</p>
            </td>
          </tr>
          <tr>
            <td style="padding:32px 40px;">
              <h1 style="margin:0 0 12px;font-size:24px;font-weight:400;color:#F4F1EA;">Reset your password</h1>
              <p style="margin:0 0 28px;font-size:15px;color:#8B8B9E;line-height:1.6;">
                Click the button below to set a new password. This link expires in 1 hour.
              </p>
              <a href="${resetUrl}"
                 style="display:inline-block;padding:14px 28px;background:#D4FF3F;color:#0A0A0B;border-radius:9999px;font-size:15px;font-weight:600;text-decoration:none;">
                Reset password
              </a>
              <p style="margin:28px 0 0;font-size:12px;color:#555566;">
                If you didn't request this, ignore this email — your password won't change.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  try {
    await resend.emails.send({
      from: FROM,
      to: email,
      subject: 'Reset your upSosh password',
      html,
    });
    console.log(`[Email] Password reset email sent to ${email}`);
  } catch (err: unknown) {
    console.error('[Email] Failed to send password reset email:', errorMessage(err));
  }
}
