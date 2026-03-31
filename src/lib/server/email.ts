import "server-only";

import { getAppUrl } from "@/lib/server/stripe";

type EmailTemplateKey =
  | "welcome_member"
  | "outreach_submitted"
  | "membership_active"
  | "billing_renewed"
  | "billing_payment_failed"
  | "billing_cancel_scheduled"
  | "plan_upgraded";

type EmailTemplatePayload = Record<string, string | number | null | undefined>;

type SendEmailInput = {
  to: string;
  subject: string;
  html: string;
  text: string;
  tag?: string;
};

type SendEmailResult = {
  delivered: boolean;
  skipped: boolean;
  provider: string;
};

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function getEmailProvider() {
  const provider = (process.env.EMAIL_PROVIDER ?? "disabled").toLowerCase();
  const apiKey = process.env.EMAIL_PROVIDER_API_KEY;
  const from = process.env.EMAIL_FROM;

  if (!apiKey || apiKey === "replace_me" || !from || from === "no-reply@example.com") {
    return {
      provider: "disabled",
      apiKey: null,
      from: null,
      replyTo: null,
      messageStream: null
    } as const;
  }

  return {
    provider,
    apiKey,
    from,
    replyTo: process.env.EMAIL_REPLY_TO,
    messageStream: process.env.POSTMARK_MESSAGE_STREAM ?? "outbound"
  } as const;
}

function renderTemplate(templateKey: EmailTemplateKey, payload: EmailTemplatePayload) {
  const appUrl = getAppUrl();
  const billingUrl = `${appUrl}/billing`;
  const outreachUrl = `${appUrl}/outreach`;
  const dashboardUrl = `${appUrl}/dashboard`;
  const planName = String(payload.planName ?? "your plan");
  const cycleEnd = String(payload.cycleEnd ?? "your next billing date");
  const opportunity = String(payload.opportunity ?? "your selected opportunity");
  const status = String(payload.status ?? "submitted");

  switch (templateKey) {
    case "welcome_member":
      return {
        subject: "Welcome to Inveniam Sport",
        title: "Your workspace is ready",
        intro:
          "Your account is active. Next steps: finish your dossier, upload football evidence, and get your profile past the outreach threshold.",
        ctaLabel: "Open dashboard",
        ctaHref: dashboardUrl,
        details: [
          "Build a credible player dossier before using introductions.",
          "Upload CV, video evidence, and availability details.",
          "Review curated opportunities and community roundups once you log in."
        ]
      };
    case "outreach_submitted":
      return {
        subject: "Your introduction request is in the queue",
        title: "Outreach request received",
        intro: `Your request for ${opportunity} is now ${status.toLowerCase()}. Credits only burn on delivery, not on drafting or blocked submissions.`,
        ctaLabel: "View outreach",
        ctaHref: outreachUrl,
        details: [
          "If moderation needs edits, you will see the reason in your workspace.",
          "Recipient protections and queue review still apply before delivery.",
          "Keep your dossier current while the request moves through review."
        ]
      };
    case "membership_active":
      return {
        subject: `Your ${planName} membership is active`,
        title: "Membership confirmed",
        intro: `Stripe confirmed your ${planName} membership. Current cycle access is active through ${cycleEnd}.`,
        ctaLabel: "Open billing",
        ctaHref: billingUrl,
        details: [
          "Credits reset on your billing-cycle anniversary.",
          "Plan entitlements and billing status now sync from Stripe webhooks.",
          "Elite access still respects trust controls and fair-use delivery." 
        ]
      };
    case "plan_upgraded":
      return {
        subject: `Your plan has been updated to ${planName}`,
        title: "Plan updated",
        intro: `Your membership has been upgraded to ${planName}. Local access and Stripe billing are now aligned through ${cycleEnd}.`,
        ctaLabel: "Review billing",
        ctaHref: billingUrl,
        details: [
          "Proration behavior is handled by Stripe.",
          "Updated plan entitlements are already reflected in the app.",
          "Your next renewal will follow the Stripe subscription state."
        ]
      };
    case "billing_renewed":
      return {
        subject: `Your ${planName} membership renewed`,
        title: "Renewal processed",
        intro: `Your ${planName} membership successfully renewed. Current access now runs through ${cycleEnd}.`,
        ctaLabel: "Open billing",
        ctaHref: billingUrl,
        details: [
          "Your next credit cycle is available in the member workspace.",
          "Check recent outreach usage before sending additional requests.",
          "Community content and alerts remain included with your plan."
        ]
      };
    case "billing_payment_failed":
      return {
        subject: `Payment issue on your ${planName} membership`,
        title: "Payment needs attention",
        intro: `Stripe could not renew your ${planName} membership. The account may enter a grace period before premium features are restricted.`,
        ctaLabel: "Fix billing",
        ctaHref: billingUrl,
        details: [
          "Update the default payment method in Stripe.",
          "Access should remain available during the grace window if configured.",
          "Resolve the issue quickly to avoid premium feature interruption."
        ]
      };
    case "billing_cancel_scheduled":
      return {
        subject: `Your ${planName} membership will end after this term`,
        title: "Cancellation scheduled",
        intro: `Your membership is set to cancel at the end of the current paid cycle on ${cycleEnd}.`,
        ctaLabel: "Review billing",
        ctaHref: billingUrl,
        details: [
          "You keep access through the end of the paid term.",
          "Profile history and prior activity remain in the account.",
          "You can reverse the change from the Stripe portal before the period ends."
        ]
      };
  }
}

function renderHtmlEmail(input: ReturnType<typeof renderTemplate>) {
  const detailItems = input.details
    .map((detail) => `<li style="margin:0 0 8px;">${escapeHtml(detail)}</li>`)
    .join("");

  return `
    <div style="background:#0b1115;padding:32px 16px;font-family:Arial,sans-serif;color:#f5f0e8;">
      <div style="max-width:640px;margin:0 auto;background:#121b21;border:1px solid rgba(255,255,255,0.08);border-radius:24px;padding:32px;">
        <p style="margin:0 0 12px;color:#d39a57;font-size:12px;letter-spacing:0.12em;text-transform:uppercase;">Inveniam Sport</p>
        <h1 style="margin:0 0 12px;font-size:28px;line-height:1.2;">${escapeHtml(input.title)}</h1>
        <p style="margin:0 0 20px;color:#d0c5b6;font-size:16px;line-height:1.6;">${escapeHtml(input.intro)}</p>
        <a href="${escapeHtml(input.ctaHref)}" style="display:inline-block;padding:12px 18px;border-radius:999px;background:#c96824;color:#fff6ef;text-decoration:none;font-weight:600;">${escapeHtml(input.ctaLabel)}</a>
        <ul style="margin:24px 0 0;padding-left:20px;color:#d0c5b6;line-height:1.6;">${detailItems}</ul>
      </div>
    </div>
  `;
}

function renderTextEmail(input: ReturnType<typeof renderTemplate>) {
  return [
    input.title,
    "",
    input.intro,
    "",
    ...input.details.map((detail) => `- ${detail}`),
    "",
    `${input.ctaLabel}: ${input.ctaHref}`
  ].join("\n");
}

async function sendWithResend(input: SendEmailInput) {
  const config = getEmailProvider();

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from: config.from,
      to: [input.to],
      reply_to: config.replyTo ?? undefined,
      subject: input.subject,
      html: input.html,
      text: input.text,
      tags: input.tag ? [{ name: "template", value: input.tag }] : undefined
    })
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Resend request failed: ${response.status} ${body}`);
  }
}

async function sendWithPostmark(input: SendEmailInput) {
  const config = getEmailProvider();

  const response = await fetch("https://api.postmarkapp.com/email", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "X-Postmark-Server-Token": config.apiKey ?? ""
    },
    body: JSON.stringify({
      From: config.from,
      To: input.to,
      ReplyTo: config.replyTo ?? undefined,
      Subject: input.subject,
      HtmlBody: input.html,
      TextBody: input.text,
      MessageStream: config.messageStream,
      Tag: input.tag
    })
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Postmark request failed: ${response.status} ${body}`);
  }
}

export async function sendTransactionalEmail(input: SendEmailInput): Promise<SendEmailResult> {
  const config = getEmailProvider();

  if (config.provider === "disabled") {
    return {
      delivered: false,
      skipped: true,
      provider: config.provider
    };
  }

  if (config.provider === "resend") {
    await sendWithResend(input);
  } else if (config.provider === "postmark") {
    await sendWithPostmark(input);
  } else {
    throw new Error(`Unsupported email provider: ${config.provider}`);
  }

  return {
    delivered: true,
    skipped: false,
    provider: config.provider
  };
}

export async function sendTemplatedEmail(params: {
  to: string;
  templateKey: EmailTemplateKey;
  payload?: EmailTemplatePayload;
}) {
  const rendered = renderTemplate(params.templateKey, params.payload ?? {});
  return sendTransactionalEmail({
    to: params.to,
    subject: rendered.subject,
    html: renderHtmlEmail(rendered),
    text: renderTextEmail(rendered),
    tag: params.templateKey
  });
}
