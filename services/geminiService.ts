
import { GoogleGenAI, Type } from "@google/genai";
import { FacebookCredentials } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Generates a combined prompt for Airtop that handles Login + Task
 * Supports both Credentials and Session Cookies
 */
const withLogin = (creds: FacebookCredentials, taskPrompt: string) => {
  if (!creds.isSet) return taskPrompt;

  if (creds.authMethod === 'cookies' && creds.cookies) {
    return `
      1. Authenticate using these session cookies for facebook.com:
      ${creds.cookies}
      2. Navigate to https://www.facebook.com and confirm the session is active.
      3. Once session is verified, proceed with:
      ${taskPrompt}
    `;
  }

  if (creds.authMethod === 'credentials' && creds.email && creds.password) {
    return `
      1. Navigate to https://www.facebook.com/login.
      2. If you see an email field, fill in "${creds.email}".
      3. Fill the password field with "${creds.password}".
      4. Click 'Log In'. Wait for the dashboard to load.
      5. Once logged in, proceed with the following task:
      ${taskPrompt}
    `;
  }

  return taskPrompt;
};

export const analyzePropertyMedia = async (text: string, base64Image?: string) => {
  const parts: any[] = [
    { text: `You are the Lead Architect of EstateFlow AI. Analyze this property input.
    
    INPUT TEXT:
    ${text}
    
    TASK:
    1. Determine if this is a property listing.
    2. Extract property details (Title, Price in MYR, Location, Specs).
    3. Generate a "Malay" auto-reply for the customer.
    4. Generate a "Facebook Page" high-conversion caption.
    5. Generate a "Messenger Auto-Reply" template.
    
    Return pure JSON.` }
  ];

  if (base64Image) {
    parts.push({
      inlineData: {
        data: base64Image,
        mimeType: "image/jpeg"
      }
    });
  }

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: { parts },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          isPropertyListing: { type: Type.BOOLEAN },
          reply: { type: Type.STRING },
          pagePostCaption: { type: Type.STRING },
          messengerTemplate: { type: Type.STRING },
          title: { type: Type.STRING },
          price: { type: Type.NUMBER },
          location: { type: Type.STRING },
          beds: { type: Type.NUMBER },
          baths: { type: Type.NUMBER },
          sqft: { type: Type.NUMBER },
          description: { type: Type.STRING }
        },
        required: ["isPropertyListing", "reply"]
      }
    }
  });

  return JSON.parse(response.text.trim());
};

export const generateAirtopScript = (data: any, creds: FacebookCredentials) => {
  const task = `
    Navigate to https://www.facebook.com/marketplace/create/item.
    Select 'Property for Sale or Rent'.
    Upload the property image from media assets.
    Set title to "${data.title} @ ${data.location}".
    Set price to "${data.price}".
    Set location to "${data.location}".
    Fill description: "${data.description}. Features: ${data.beds} Beds, ${data.baths} Baths."
    Click 'Next' and 'Publish'.
  `;
  return withLogin(creds, task);
};

export const generatePagePostScript = (caption: string, creds: FacebookCredentials) => {
  const task = `
    Navigate to your Facebook Page timeline.
    Click 'Create Post'.
    Upload the image from assets.
    Paste caption: "${caption}".
    Click 'Post'.
  `;
  return withLogin(creds, task);
};

export const generateMessengerBotScript = (replyTemplate: string, creds: FacebookCredentials) => {
  const task = `
    Navigate to https://www.facebook.com/messages/t/.
    Search for new messages asking about availability.
    Reply with: "${replyTemplate}".
  `;
  return withLogin(creds, task);
};
