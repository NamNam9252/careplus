import { google } from "googleapis";

// Load credentials from process.env
const SCOPES = ["https://www.googleapis.com/auth/calendar"];

// Initialize GoogleAuth client
// Helper to clean the private key
const getPrivateKey = () => {
  const key = process.env.GOOGLE_PRIVATE_KEY;
  if (!key) return undefined;
  
  // If the key is wrapped in quotes, remove them
  let cleanKey = key;
  if (cleanKey.startsWith('"') && cleanKey.endsWith('"')) {
    cleanKey = cleanKey.slice(1, -1);
  }
  
  // Replace literal \n with actual newlines
  return cleanKey.replace(/\\n/g, "\n");
}

const auth = new google.auth.GoogleAuth({
  credentials: {
     client_email: process.env.GOOGLE_CLIENT_EMAIL,
     private_key: getPrivateKey(),
  },
  scopes: SCOPES,
});

const calendar = google.calendar({ version: "v3", auth });

/**
 * Creates a Google Calendar event with a Google Meet link.
 * @param doctorName Name of the doctor
 * @param patientEmail Email of the patient
 * @param doctorEmail Email of the doctor
 * @param startTime Start time of the meeting (Date object)
 * @param endTime End time of the meeting (Date object)
 */
export async function createMeetEvent(
  doctorName: string,
  patientEmail: string,
  doctorEmail: string,
  startTime: Date,
  endTime: Date
) {
  try {
    const event = {
      summary: `Consultation with Dr. ${doctorName}`,
      description: "Online Consultation via CarePlus",
      start: {
        dateTime: startTime.toISOString(),
        timeZone: "UTC", // Ensure UTC to avoid timezone confusion
      },
      end: {
        dateTime: endTime.toISOString(),
        timeZone: "UTC",
      },
      // Invite both doctor and patient - DISABLED due to Service Account restrictions
      // Service accounts cannot invite attendees without Domain-Wide Delegation.
      // We will share the link via the dashboard instead.
      // attendees: [
      //   { email: patientEmail },
      //   { email: doctorEmail },
      // ],
      conferenceData: {
        createRequest: {
          requestId: Math.random().toString(36).substring(7),
          conferenceSolutionKey: { type: "hangoutsMeet" },
        },
      },
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'email', minutes: 24 * 60 },
          { method: 'popup', minutes: 10 },
        ],
      },
    };

    const response = await calendar.events.insert({
      calendarId: "primary", // Uses the Service Account's primary calendar
      requestBody: event,
      conferenceDataVersion: 1, // REQUIRED feature for Meet link generation
    });

    console.log("Google Calendar Event Response:", JSON.stringify(response.data, null, 2));

    return {
      eventId: response.data.id,
      meetLink: response.data.hangoutLink,
    };
  } catch (error) {
    console.error("Error creating Google Meet event:", error);
    throw new Error("Failed to schedule Google Meet");
  }
}

/**
 * Deletes a Google Calendar event.
 * @param eventId The ID of the event to delete
 */
export async function deleteMeetEvent(eventId: string) {
  try {
    await calendar.events.delete({
        calendarId: "primary",
        eventId: eventId
    });
    return true;
  } catch (error) {
    console.error("Error deleting Google Meet event:", error);
    // Don't throw, just return false, as the appointment might still be cancelled locally
    return false;
  }
}
