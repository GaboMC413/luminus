import {
  sendEventRegistrationEmail as sendPlatformEventRegistrationEmail,
  sendContactNotificationEmail as sendPlatformContactNotificationEmail,
  ContactNotificationPayload,
} from "../../platform/lib/mails/sender";

export { ContactNotificationPayload };

export interface EventRegistrationEmailPayload {
  firstName: string;
  lastName?: string;
  email: string;
  eventTitle: string;
  eventCoverUrl?: string | null;
  eventDate?: string | null;
  timeText?: string | null;
  speakerName?: string | null;
  youtubeUrl?: string | null;
  eventSlug?: string | null;
}

export async function sendEventRegistrationEmail(data: EventRegistrationEmailPayload) {
  return sendPlatformEventRegistrationEmail(data.email, {
    firstName: data.firstName,
    eventTitle: data.eventTitle,
    eventCoverUrl: data.eventCoverUrl,
    eventDate: data.eventDate,
    timeText: data.timeText,
    speakerName: data.speakerName,
    youtubeUrl: data.youtubeUrl,
    eventSlug: data.eventSlug,
  });
}

export async function sendContactNotificationEmail(data: ContactNotificationPayload) {
  return sendPlatformContactNotificationEmail(data);
}
