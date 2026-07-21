import axios from "axios";
import { prisma } from "@/lib/db";

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

export async function sendCampaignNotification(campaign) {
  try {
    const subscribers = await prisma.newsletterSubscriber.findMany({
      where: { active: true },
    });

    if (subscribers.length === 0) return;

    const subject = `Urgent Campaign: ${campaign.title} - HH Foundation`;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://phhfoundation.org";
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #f1f1f1; border-radius: 12px; background-color: #ffffff;">
        <div style="text-align: center; margin-bottom: 24px;">
          <span style="font-size: 24px; font-weight: bold; color: #2563eb;">HH Foundation</span>
        </div>
        <h2 style="color: #1f2937; margin-bottom: 12px; font-size: 20px;">New Urgent Campaign Launched</h2>
        <p style="font-size: 15px; line-height: 1.6; color: #4b5563;">
          We have just launched a new campaign: <strong>${campaign.title}</strong>.
        </p>
        <p style="font-size: 15px; line-height: 1.6; color: #4b5563;">
          ${campaign.description}
        </p>
        <div style="background-color: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 18px; margin: 24px 0; text-align: center;">
          <p style="margin: 0 0 14px 0; font-size: 15px; color: #1e40af; font-weight: bold;">
            Help us reach our fundraising goal of ₦${campaign.targetAmount.toLocaleString()}
          </p>
          <a href="${appUrl}/donate?campaignId=${campaign.id}" 
             style="display: inline-block; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; background-color: #2563eb; box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.2);">
            Support Campaign
          </a>
        </div>
        <p style="font-size: 12px; color: #9ca3af; text-align: center; margin-top: 30px; border-top: 1px solid #f3f4f6; padding-top: 12px;">
          You received this email because you subscribed to the HH Foundation newsletter.
        </p>
      </div>
    `;

    for (const sub of subscribers) {
      try {
        await sendEmail({
          to: sub.email,
          subject,
          html: htmlContent,
        });
      } catch (err) {
        console.error(`Failed to send campaign notification to ${sub.email}:`, err);
      }
    }
  } catch (error) {
    console.error("Failed to execute sendCampaignNotification:", error);
  }
}

export async function sendEventNotification(event) {
  try {
    const subscribers = await prisma.newsletterSubscriber.findMany({
      where: { active: true },
    });

    if (subscribers.length === 0) return;

    const subject = `Upcoming Event: ${event.title} - HH Foundation`;
    const formattedDate = new Date(event.date).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://phhfoundation.org";
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #f1f1f1; border-radius: 12px; background-color: #ffffff;">
        <div style="text-align: center; margin-bottom: 24px;">
          <span style="font-size: 24px; font-weight: bold; color: #2563eb;">HH Foundation</span>
        </div>
        <h2 style="color: #1f2937; margin-bottom: 12px; font-size: 20px;">New Event Announcement</h2>
        <p style="font-size: 15px; line-height: 1.6; color: #4b5563;">
          We would love for you to join us at our upcoming event: <strong>${event.title}</strong>.
        </p>
        <p style="font-size: 15px; line-height: 1.6; color: #4b5563;">
          ${event.description}
        </p>
        <div style="background-color: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 18px; margin: 24px 0;">
          <h3 style="margin-top: 0; color: #1e40af; font-size: 15px; border-bottom: 1px solid #bfdbfe; padding-bottom: 6px;">Event Details</h3>
          <table style="width: 100%; font-size: 14px; color: #111827; border-collapse: collapse; margin-top: 8px;">
            <tr>
              <td style="padding: 6px 0; color: #6b7280; width: 110px;">Date & Time:</td>
              <td style="padding: 6px 0; font-weight: bold;">${formattedDate}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #6b7280;">Venue:</td>
              <td style="padding: 6px 0; font-weight: bold;">${event.venue}</td>
            </tr>
          </table>
          ${
            event.registrationRequired
              ? `
            <div style="margin-top: 16px; text-align: center;">
              <a href="${appUrl}/events" 
                 style="display: inline-block; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-weight: bold; background-color: #2563eb;">
                Register/RSVP Now
              </a>
            </div>
            `
              : ""
          }
        </div>
        <p style="font-size: 12px; color: #9ca3af; text-align: center; margin-top: 30px; border-top: 1px solid #f3f4f6; padding-top: 12px;">
          You received this email because you subscribed to the HH Foundation newsletter.
        </p>
      </div>
    `;

    for (const sub of subscribers) {
      try {
        await sendEmail({
          to: sub.email,
          subject,
          html: htmlContent,
        });
      } catch (err) {
        console.error(`Failed to send event notification to ${sub.email}:`, err);
      }
    }
  } catch (error) {
    console.error("Failed to execute sendEventNotification:", error);
  }
}

export async function sendBlogNotification(post) {
  try {
    const subscribers = await prisma.newsletterSubscriber.findMany({
      where: { active: true },
    });

    if (subscribers.length === 0) return;

    const subject = `New Article: ${post.title} - HH Foundation`;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://phhfoundation.org";
    const cleanContent = post.content.replace(/<[^>]*>/g, "");
    const previewText = cleanContent.length > 250 ? cleanContent.slice(0, 250) + "..." : cleanContent;

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #f1f1f1; border-radius: 12px; background-color: #ffffff;">
        <div style="text-align: center; margin-bottom: 24px;">
          <span style="font-size: 24px; font-weight: bold; color: #2563eb;">HH Foundation</span>
        </div>
        <span style="display: inline-block; background-color: #eff6ff; color: #1e40af; font-size: 11px; font-weight: bold; padding: 4px 8px; border-radius: 4px; text-transform: uppercase; margin-bottom: 12px;">
          ${post.category}
        </span>
        <h2 style="color: #1f2937; margin-top: 0; margin-bottom: 12px; font-size: 20px; line-height: 1.4;">${post.title}</h2>
        <p style="font-size: 15px; line-height: 1.6; color: #4b5563;">
          ${previewText}
        </p>
        <div style="margin: 24px 0; text-align: center;">
          <a href="${appUrl}/blog/${post.slug}" 
             style="display: inline-block; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; background-color: #2563eb; box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.2);">
            Read Full Article
          </a>
        </div>
        <p style="font-size: 12px; color: #9ca3af; text-align: center; margin-top: 30px; border-top: 1px solid #f3f4f6; padding-top: 12px;">
          You received this email because you subscribed to the HH Foundation newsletter.
        </p>
      </div>
    `;

    for (const sub of subscribers) {
      try {
        await sendEmail({
          to: sub.email,
          subject,
          html: htmlContent,
        });
      } catch (err) {
        console.error(`Failed to send blog notification to ${sub.email}:`, err);
      }
    }
  } catch (error) {
    console.error("Failed to execute sendBlogNotification:", error);
  }
}
