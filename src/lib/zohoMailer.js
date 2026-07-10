import axios from "axios";

export async function getZohoAccessToken() {
  try {
    const response = await axios.post(
      "https://accounts.zoho.com/oauth/v2/token",
      null,
      {
        params: {
          refresh_token: process.env.ZOHO_REFRESH_TOKEN,
          client_id: process.env.ZOHO_CLIENT_ID,
          client_secret: process.env.ZOHO_CLIENT_SECRET,
          grant_type: "refresh_token",
        },
      }
    );

    return response.data.access_token;
  } catch (error) {
    console.error("Zoho token error:", error.response?.data || error.message);
    throw new Error("Failed to retrieve Zoho access token");
  }
}

export async function sendEmail({ to, subject, html }) {
  try {
    const accessToken = await getZohoAccessToken();
    const url = `https://mail.zoho.com/api/accounts/${process.env.ZOHO_MAIL_ACCOUNT_ID}/messages`;

    await axios.post(
      url,
      {
        fromAddress: process.env.ZOHO_FROM_EMAIL,
        toAddress: to,
        subject,
        content: html,
        mailFormat: "html",
      },
      {
        headers: {
          Authorization: `Zoho-oauthtoken ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log(`Email sent successfully to ${to}`);
    return { success: true };
  } catch (err) {
    console.error("Zoho Mail API error:", err.response?.data || err.message);
    return { success: false, error: err.response?.data || err.message };
  }
}

// Pre-defined templates
export function getDonationThankYouHTML({ donorName, amount, campaignTitle, reference }) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #f1f1f1; border-radius: 12px; background-color: #ffffff;">
      <div style="text-align: center; margin-bottom: 24px;">
        <span style="font-size: 24px; font-weight: bold; color: #0d9488;">HH Foundation</span>
      </div>
      <h2 style="color: #1f2937; margin-bottom: 12px;">Dear ${donorName},</h2>
      <p style="font-size: 16px; line-height: 1.6; color: #4b5563;">
        We want to express our deepest gratitude for your generous donation of <strong>₦${amount.toLocaleString()}</strong> to the campaign: <strong>${campaignTitle || "General Fund"}</strong>.
      </p>
      <div style="background-color: #f0fdfa; border: 1px solid #ccfbf1; border-radius: 8px; padding: 16px; margin: 24px 0;">
        <h3 style="margin-top: 0; color: #0f766e; font-size: 15px;">Receipt Details</h3>
        <table style="width: 100%; font-size: 14px; color: #111827; border-collapse: collapse;">
          <tr>
            <td style="padding: 6px 0; color: #6b7280;">Reference:</td>
            <td style="padding: 6px 0; font-family: monospace; font-weight: bold;">${reference}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #6b7280;">Amount:</td>
            <td style="padding: 6px 0; font-weight: bold;">₦${amount.toLocaleString()}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #6b7280;">Date:</td>
            <td style="padding: 6px 0;">${new Date().toLocaleDateString()}</td>
          </tr>
        </table>
      </div>
      <p style="font-size: 16px; line-height: 1.6; color: #4b5563;">
        Your support helps us fund crucial educational scholarships, healthcare supplies, and women's economic skill training. Every single contribution makes a tangible difference in transforming lives.
      </p>
      <p style="font-size: 16px; line-height: 1.6; color: #4b5563; margin-top: 24px;">
        Warmest regards,<br />
        <strong>The HH Foundation Team</strong>
      </p>
    </div>
  `;
}
