import { createServerFn } from "@tanstack/react-start";

export type IntegrationStatus = {
  email: {
    resend: boolean;
    sendgrid: boolean;
    configured: boolean;
  };
  sms: {
    twilioAccountSid: boolean;
    twilioAuthToken: boolean;
    twilioPhoneNumber: boolean;
    twilioMessagingServiceSid: boolean;
    configured: boolean;
  };
};

/**
 * Returns booleans only — never the secret values.
 * Used by the Settings tab and the Content Studio send buttons
 * to decide whether email/SMS dispatch is available.
 */
export const getIntegrationStatus = createServerFn({ method: "GET" }).handler(
  async (): Promise<IntegrationStatus> => {
    const resend = Boolean(process.env.RESEND_API_KEY);
    const sendgrid = Boolean(process.env.SENDGRID_API_KEY);
    const twilioAccountSid = Boolean(process.env.TWILIO_ACCOUNT_SID);
    const twilioAuthToken = Boolean(process.env.TWILIO_AUTH_TOKEN);
    const twilioPhoneNumber = Boolean(process.env.TWILIO_PHONE_NUMBER);
    const twilioMessagingServiceSid = Boolean(process.env.TWILIO_MESSAGING_SERVICE_SID);

    return {
      email: {
        resend,
        sendgrid,
        configured: resend || sendgrid,
      },
      sms: {
        twilioAccountSid,
        twilioAuthToken,
        twilioPhoneNumber,
        twilioMessagingServiceSid,
        // Need SID + token + a sender (phone or messaging service)
        configured:
          twilioAccountSid &&
          twilioAuthToken &&
          (twilioPhoneNumber || twilioMessagingServiceSid),
      },
    };
  },
);
