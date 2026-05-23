const LINE_API_URL = "https://api.line.me/v2/bot/message/push";

export type MissYouSenderRole = "me" | "partner";

function getMissYouRecipientUserId(senderRole: MissYouSenderRole) {
  const myUserId = process.env.LINE_MY_USER_ID ?? process.env.LINE_PARTNER_USER_ID;
  const partnerUserId = process.env.LINE_PARTNER_USER_ID ?? process.env.LINE_RECIPIENT_USER_ID;

  if (senderRole === "partner") {
    return myUserId;
  }

  return partnerUserId;
}

export async function sendLineMessage(message: string, senderRole: MissYouSenderRole = "me") {
  const token = process.env.LINE_CHANNEL_ACCESS_TOKEN;
  const recipientUserId = getMissYouRecipientUserId(senderRole);

  if (!token || !recipientUserId) {
    throw new Error(
      "LINE credentials not configured. Set LINE_CHANNEL_ACCESS_TOKEN, LINE_MY_USER_ID, and LINE_PARTNER_USER_ID."
    );
  }

  const body = {
    to: recipientUserId,
    messages: [
      {
        type: "flex",
        altText: message,
        contents: {
          type: "bubble",
          styles: {
            body: { backgroundColor: "#fff0f3" },
          },
          body: {
            type: "box",
            layout: "vertical",
            spacing: "md",
            contents: [
              {
                type: "text",
                text: "💌 มีคนคิดถึงคุณ!",
                weight: "bold",
                size: "xl",
                color: "#e75480",
                align: "center",
              },
              {
                type: "text",
                text: message,
                wrap: true,
                size: "lg",
                color: "#555555",
                align: "center",
              },
              {
                type: "text",
                text: new Date().toLocaleString("th-TH", {
                  timeZone: "Asia/Bangkok",
                  dateStyle: "medium",
                  timeStyle: "short",
                }),
                size: "sm",
                color: "#aaaaaa",
                align: "center",
              },
            ],
          },
        },
      },
    ],
  };

  const res = await fetch(LINE_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`LINE API error: ${err}`);
  }
}
