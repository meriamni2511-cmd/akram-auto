
const BOT_TOKEN = '8591384969:AAGwSMeKJApIoNmoVtJRuRqB_FuKKdpt7vs';
const API_BASE = `https://api.telegram.org/bot${BOT_TOKEN}`;
const PROXY = 'https://corsproxy.io/?';

export interface TelegramUpdate {
  update_id: number;
  message?: {
    message_id: number;
    text?: string;
    chat: { id: number };
    from: { id: number; first_name: string; username?: string };
    photo?: Array<{ file_id: string; width: number; height: number }>;
    caption?: string;
  };
}

class TelegramService {
  private async proxiedFetch(url: string, options: RequestInit = {}): Promise<Response> {
    const proxiedUrl = `${PROXY}${encodeURIComponent(url)}`;
    const response = await fetch(proxiedUrl, options);
    if (!response.ok) {
      throw new Error(`Telegram Request Failed: ${response.status}`);
    }
    return response;
  }

  async getUpdates(offset?: number): Promise<TelegramUpdate[]> {
    try {
      const url = `${API_BASE}/getUpdates?offset=${offset || -1}&limit=10`;
      const response = await this.proxiedFetch(url);
      const data = await response.json();
      
      if (!data.ok) throw new Error('Telegram API failure: ' + (data.description || 'Unknown error'));
      return data.result;
    } catch (error) {
      console.error('Telegram Fetch Error:', error);
      return [];
    }
  }

  async sendMessage(chatId: number, text: string): Promise<boolean> {
    try {
      const response = await this.proxiedFetch(`${API_BASE}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text,
          parse_mode: 'HTML'
        })
      });
      const data = await response.json();
      return data.ok;
    } catch (error) {
      console.error('Send Message Error:', error);
      return false;
    }
  }

  async downloadPhoto(fileId: string): Promise<string | null> {
    try {
      const fileResponse = await this.proxiedFetch(`${API_BASE}/getFile?file_id=${fileId}`);
      const fileData = await fileResponse.json();
      if (!fileData.ok) return null;

      const filePath = fileData.result.file_path;
      const fileUrl = `https://api.telegram.org/file/bot${BOT_TOKEN}/${filePath}`;

      const imageResponse = await this.proxiedFetch(fileUrl);
      const imageBlob = await imageResponse.blob();

      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(imageBlob);
      });
    } catch (error) {
      console.error('Download Error:', error);
      return null;
    }
  }

  async sendChatAction(chatId: number): Promise<void> {
    try {
      await this.proxiedFetch(`${API_BASE}/sendChatAction`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, action: 'typing' })
      });
    } catch (e) {}
  }
}

export const telegramService = new TelegramService();

// Fix: Exporting missing functions required by TelegramIngestor
export const fetchLatestUpdates = (offset?: number) => telegramService.getUpdates(offset);
export const sendTelegramMessage = (chatId: number, text: string) => telegramService.sendMessage(chatId, text);
export const getFileUrl = async (fileId: string) => {
  const response = await fetch(`${PROXY}${encodeURIComponent(`${API_BASE}/getFile?file_id=${fileId}`)}`);
  const data = await response.json();
  if (!data.ok) throw new Error('Failed to get file path');
  return `https://api.telegram.org/file/bot${BOT_TOKEN}/${data.result.file_path}`;
};
export const downloadImageAsBase64 = async (url: string): Promise<string> => {
  const response = await fetch(`${PROXY}${encodeURIComponent(url)}`);
  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};
