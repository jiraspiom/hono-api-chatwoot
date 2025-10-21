import type { ChatwootEvent } from './types.js';

export class ChatwootService {
  private baseURL: string;
  private apiToken: string;

  constructor() {
    this.baseURL = process.env.CHATWOOT_URL || 'https://seu-chatwoot.com';
    this.apiToken = process.env.CHATWOOT_API_TOKEN || 'seu_token_aqui';
  }

  async sendMessage(accountId: number, conversationId: number, content: string): Promise<void> {
    try {
      const response = await fetch(
        `${this.baseURL}/api/v1/accounts/${accountId}/conversations/${conversationId}/messages`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'api_access_token': this.apiToken
          },
          body: JSON.stringify({
            content,
            message_type: 'outgoing'
          })
        }
      );

      if (response.ok) {
        console.log('✅ Mensagem enviada para conversa', conversationId);
      } else {
        console.error('❌ Erro ao enviar mensagem:', response.status, await response.text());
      }
    } catch (error) {
      console.error('❌ Erro ao enviar mensagem:', error);
    }
  }

  async addLabel(accountId: number, conversationId: number, label: string): Promise<void> {
    try {
      const response = await fetch(
        `${this.baseURL}/api/v1/accounts/${accountId}/conversations/${conversationId}/labels`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'api_access_token': this.apiToken
          },
          body: JSON.stringify({
            labels: [label]
          })
        }
      );

      if (response.ok) {
        console.log(`🏷️ Label "${label}" adicionada`);
      }
    } catch (error) {
      console.error('❌ Erro ao adicionar label:', error);
    }
  }
}