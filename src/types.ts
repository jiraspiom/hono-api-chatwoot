export interface ChatwootEvent {
  event: string;
  id?: number;
  conversation: {
    id: number;
    inbox_id: number;
    contact_inbox: {
      inbox_id: number;
    };
  };
  message: {
    id: number;
    content: string;
    message_type: 'incoming' | 'outgoing';
    content_type: string;
    content_attributes: Record<string, any>;
    created_at: number;
    private: boolean;
    source_id: string | null;
    sender: {
      id: number;
      name: string;
      email: string;
    };
  };
  account: {
    id: number;
  };
}

export interface UserSession {
  stage: string;
  data: Record<string, any>;
  lastInteraction: number;
  conversationId?: number;
}

export interface FlowResponse {
  message?: string;
  nextStage: string;
  sessionData?: Record<string, any>;
  label?: string;
}