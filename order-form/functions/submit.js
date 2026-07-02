import { EmailMessage } from "cloudflare:email";

export async function onRequestPost({ request, env }) {
  try {
    const body = await request.json();
    const {
      customer   = '—',
      phone      = '—',
      email      = '—',
      items      = [],
      pickupDate = '—',
      pickupTime = '—',
      total      = '—',
    } = body;

    const itemRows = items.map(item => `
      <tr>
        <td style="padding: 6px 0; font-size: 14px; color: #111827;">${item}</td>
      </tr>
    `).join('');

    const emailHtml = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #92400e; padding: 20px 24px; border-radius: 8px 8px 0 0;">
          <h2 style="color: white; margin: 0; font-size: 20px;">New Order — Burnett's Butcher Shop</h2>
          <p style="color: #fde68a; margin: 4px 0 0; font-size: 14px;">Online Order Form Submission</p>
        </div>
        <div style="background: #f9fafb; padding: 24px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
          <table style="width: 100%; border-collapse: collapse;">

            <tr><td colspan="2" style="padding: 8px 0 4px; font-size: 11px; font-weight: 700; text-transform: uppercase; color: #9ca3af; letter-spacing: 0.05em;">Pickup</td></tr>
            <tr>
              <td style="padding: 6px 0; font-size: 14px; color: #6b7280; width: 140px;">Date</td>
              <td style="padding: 6px 0; font-size: 14px; color: #111827; font-weight: 600;">${pickupDate}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; font-size: 14px; color: #6b7280;">Time</td>
              <td style="padding: 6px 0; font-size: 14px; color: #111827; font-weight: 600;">${pickupTime}</td>
            </tr>

            <tr><td colspan="2" style="padding: 16px 0 4px; font-size: 11px; font-weight: 700; text-transform: uppercase; color: #9ca3af; letter-spacing: 0.05em; border-top: 1px solid #e5e7eb;">Items Ordered</td></tr>
            ${itemRows}
            <tr>
              <td style="padding: 10px 0 4px; font-size: 14px; color: #6b7280; font-weight: 700;">Order Total</td>
              <td style="padding: 10px 0 4px; font-size: 14px; color: #111827; font-weight: 700;">${total}</td>
            </tr>

            <tr><td colspan="2" style="padding: 16px 0 4px; font-size: 11px; font-weight: 700; text-transform: uppercase; color: #9ca3af; letter-spacing: 0.05em; border-top: 1px solid #e5e7eb;">Customer</td></tr>
            <tr>
              <td style="padding: 6px 0; font-size: 14px; color: #6b7280;">Name</td>
              <td style="padding: 6px 0; font-size: 14px; color: #111827; font-weight: 600;">${customer}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; font-size: 14px; color: #6b7280;">Phone</td>
              <td style="padding: 6px 0; font-size: 14px; color: #111827; font-weight: 600;"><a href="tel:${phone}" style="color: #92400e;">${phone}</a></td>
            </tr>
            <tr>
              <td style="padding: 6px 0; font-size: 14px; color: #6b7280;">Email</td>
              <td style="padding: 6px 0; font-size: 14px; color: #111827; font-weight: 600;"><a href="mailto:${email}" style="color: #92400e;">${email}</a></td>
            </tr>

          </table>
          <div style="margin-top: 24px; padding: 16px; background: #fffbeb; border-radius: 8px; border: 1px solid #fde68a;">
            <p style="margin: 0; font-size: 13px; color: #92400e;">Reply directly to this email to reach the customer.</p>
          </div>
        </div>
      </div>
    `;

    const subject = `New Order — ${customer} | Pickup ${pickupDate} at ${pickupTime} | ${total}`;

    const rawEmail = [
      `MIME-Version: 1.0`,
      `From: Burnett's Orders <orders@barriewebautomation.com>`,
      `To: ${env.NOTIFY_EMAIL}`,
      `Reply-To: ${email}`,
      `Subject: ${subject}`,
      `Content-Type: text/html; charset=UTF-8`,
      ``,
      emailHtml,
    ].join('\r\n');

    const message = new EmailMessage(
      'orders@barriewebautomation.com',
      env.NOTIFY_EMAIL,
      rawEmail
    );

    await env.EMAIL.send(message);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (err) {
    console.error('Submit error:', err);
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
