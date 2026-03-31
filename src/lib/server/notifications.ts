import "server-only";

import { NotificationChannel } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { sendTemplatedEmail } from "@/lib/server/email";

type SupportedTemplateKey =
  | "welcome_member"
  | "outreach_submitted"
  | "membership_active"
  | "billing_renewed"
  | "billing_payment_failed"
  | "billing_cancel_scheduled"
  | "plan_upgraded";

type NotifyUserParams = {
  userId: string;
  templateKey: SupportedTemplateKey;
  payload?: Record<string, string | number | null | undefined>;
  sendEmail?: boolean;
  sendInApp?: boolean;
};

export async function notifyUser({
  userId,
  templateKey,
  payload,
  sendEmail = false,
  sendInApp = true
}: NotifyUserParams) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true }
  });

  if (!user) {
    throw new Error("User not found for notification delivery.");
  }

  if (sendInApp) {
    await prisma.notification.create({
      data: {
        userId,
        channel: NotificationChannel.IN_APP,
        templateKey,
        payloadJson: payload,
        sentAt: new Date()
      }
    });
  }

  if (!sendEmail) {
    return { emailDelivered: false };
  }

  try {
    const result = await sendTemplatedEmail({
      to: user.email,
      templateKey,
      payload
    });

    if (result.delivered) {
      await prisma.notification.create({
        data: {
          userId,
          channel: NotificationChannel.EMAIL,
          templateKey,
          payloadJson: payload,
          sentAt: new Date()
        }
      });
    }

    return {
      emailDelivered: result.delivered
    };
  } catch (error) {
    console.error("Failed to send transactional email", {
      userId,
      templateKey,
      error
    });

    return {
      emailDelivered: false
    };
  }
}
