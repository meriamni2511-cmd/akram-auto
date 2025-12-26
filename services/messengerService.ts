
import { executeAirtopAutomation } from './automationService';
import { generateMessengerBotScript } from './geminiService';
import { FacebookCredentials } from '../types';

/**
 * Executes a REAL messenger auto-reply session using Airtop cloud browser.
 */
// Added creds parameter to match generateMessengerBotScript requirements
export const runRealMessengerAutoReply = async (replyTemplate: string, creds: FacebookCredentials) => {
  console.log(`[Messenger Agent] Initializing real cloud session to reply to leads...`);
  // Passing creds as the second argument to generateMessengerBotScript
  const prompt = generateMessengerBotScript(replyTemplate, creds);
  return await executeAirtopAutomation(prompt);
};
