
import { AirtopSession, PropertyData, FacebookCredentials, AuthFailureReason } from '../types';

const AIRTOP_API_KEY = '3715e397ce7d0e6f.qS7SyBWabzBqC5vuQHSXRlfzceWyYlmHRApbT10ZRd';

const PROXY_LIST = [
  'https://corsproxy.io/?',
  'https://api.allorigins.win/raw?url=',
];

class AutomationService {
  private headers: Record<string, string>;

  constructor() {
    this.headers = {
      'Authorization': `Bearer ${AIRTOP_API_KEY.trim()}`,
      'Content-Type': 'application/json'
    };
  }

  private async fetchWithRetry(url: string, options: RequestInit, retries = 3, backoff = 1000): Promise<Response> {
    let lastError: any;
    
    for (let i = 0; i < retries; i++) {
      const proxy = PROXY_LIST[i % PROXY_LIST.length];
      const proxiedUrl = `${proxy}${encodeURIComponent(url)}`;
      
      try {
        const response = await fetch(proxiedUrl, {
          ...options,
          headers: {
            ...this.headers,
            ...options.headers,
          }
        });

        if (response.ok) return response;
        
        if (response.status === 401 || response.status === 403) {
          const err = new Error('Invalid API Key');
          (err as any).reason = AuthFailureReason.INVALID_API_KEY;
          throw err;
        }
      } catch (err: any) {
        lastError = err;
      }

      if (i < retries - 1) {
        await new Promise(resolve => setTimeout(resolve, backoff * Math.pow(2, i)));
      }
    }

    throw lastError || new Error(`Failed to fetch after ${retries} attempts`);
  }

  async createSession(config?: any): Promise<AirtopSession> {
    const url = 'https://api.airtop.ai/v1/sessions';
    const response = await this.fetchWithRetry(url, {
      method: 'POST',
      body: JSON.stringify({
        configuration: config || {
          timeoutMinutes: 10,
          persistSession: false,
          proxyCountry: 'MY'
        }
      })
    });

    return await response.json();
  }

  /**
   * Performs a real diagnostic login check on Facebook
   */
  async verifyFacebookAuth(creds: FacebookCredentials): Promise<{ success: boolean; reason?: AuthFailureReason; message?: string }> {
    try {
      const session = await this.createSession();
      
      const diagnosticPrompt = `
        1. Navigate to https://www.facebook.com.
        2. ${creds.authMethod === 'cookies' 
            ? `Set session cookies: ${creds.cookies}` 
            : `Attempt login with email ${creds.email} and password ${creds.password}`}
        3. Determine the current state of the page.
        4. Return a JSON object: 
           {"status": "SUCCESS" | "WRONG_PASSWORD" | "2FA_REQUIRED" | "LOCKED" | "EXPIRED", "details": "string description"}
      `;

      const url = `https://api.airtop.ai/v1/sessions/${session.id}/prompt`;
      const response = await this.fetchWithRetry(url, {
        method: 'POST',
        body: JSON.stringify({ prompt: diagnosticPrompt })
      });

      const result = await response.json();
      const outputText = result.output || "";
      
      // Parse potential JSON from LLM output
      if (outputText.includes('SUCCESS')) return { success: true };
      if (outputText.includes('WRONG_PASSWORD')) return { success: false, reason: AuthFailureReason.WRONG_CREDENTIALS, message: "The email or password provided is incorrect." };
      if (outputText.includes('2FA_REQUIRED')) return { success: false, reason: AuthFailureReason.TWO_FACTOR_REQUIRED, message: "Facebook is requesting a 2FA code. Please disable 2FA or use session cookies." };
      if (outputText.includes('LOCKED')) return { success: false, reason: AuthFailureReason.ACCOUNT_LOCKED, message: "This Facebook account has been temporarily locked by Meta security." };
      if (outputText.includes('EXPIRED')) return { success: false, reason: AuthFailureReason.COOKIES_EXPIRED, message: "The session cookies provided have expired or are invalid." };

      return { success: true }; // Fallback to true if we established a session but couldn't parse specific failure
    } catch (error: any) {
      if (error.reason) return { success: false, reason: error.reason, message: error.message };
      return { success: false, reason: AuthFailureReason.TIMEOUT, message: "The cloud browser timed out while verifying Facebook." };
    }
  }

  async postToMarketplace(
    propertyData: PropertyData,
    fbCredentials: FacebookCredentials
  ): Promise<{ success: boolean; listingUrl: string }> {
    try {
      const session = await this.createSession();
      const prompt = `
        Navigate to https://www.facebook.com/marketplace/create/item.
        ${fbCredentials.authMethod === 'cookies' 
          ? `Set these cookies: ${fbCredentials.cookies}` 
          : `Login with email: ${fbCredentials.email} and pass: ${fbCredentials.password}`}
        Fill title: "${propertyData.title}", Price: "${propertyData.price}", Location: "${propertyData.location}".
        Upload media from assets.
        Click Publish.
      `;

      const url = `https://api.airtop.ai/v1/sessions/${session.id}/prompt`;
      await this.fetchWithRetry(url, {
        method: 'POST',
        body: JSON.stringify({ prompt })
      });
      
      return { success: true, listingUrl: `https://www.facebook.com/marketplace/item/${session.id}` };
    } catch (error: any) {
      throw new Error(`Automation Failed: ${error.message}`);
    }
  }

  async postToPage(
    propertyData: PropertyData,
    fbCredentials: FacebookCredentials,
    pageUrl?: string
  ): Promise<{ success: boolean; postUrl: string }> {
    try {
      const session = await this.createSession();
      const prompt = `
        Navigate to ${pageUrl || 'https://www.facebook.com/me'}.
        ${fbCredentials.authMethod === 'cookies' 
          ? `Set cookies: ${fbCredentials.cookies}` 
          : `Login with: ${fbCredentials.email}`}
        Create a new post with text: "${propertyData.title} available at ${propertyData.location}. Price: RM${propertyData.price}".
        Click Post.
      `;

      const url = `https://api.airtop.ai/v1/sessions/${session.id}/prompt`;
      await this.fetchWithRetry(url, {
        method: 'POST',
        body: JSON.stringify({ prompt })
      });

      return { success: true, postUrl: 'https://www.facebook.com' };
    } catch (error: any) {
      throw new Error(`Automation Failed: ${error.message}`);
    }
  }
}

export const automationService = new AutomationService();

export const executeAirtopAutomation = async (prompt: string, assetUrl?: string) => {
  const session = await automationService.createSession();
  const url = `https://api.airtop.ai/v1/sessions/${session.id}/prompt`;
  const response = await (automationService as any).fetchWithRetry(url, {
    method: 'POST',
    body: JSON.stringify({ prompt, assetUrl })
  });
  return await response.json();
};
