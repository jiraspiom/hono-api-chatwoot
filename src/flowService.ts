import { ChatwootService } from "./chatwootService";
import { UserSession, ChatwootEvent, FlowResponse } from "./types";

export class FlowService {
  private readonly userSessions = new Map<string, UserSession>();
  private readonly chatwootService = new ChatwootService();

  async processMessage(event: ChatwootEvent): Promise<void> {
    const userMessage = event.message.content.toLowerCase().trim();
    const contactId = event.message.sender.id;
    const accountId = event.account.id;
    const conversationId = event.conversation.id;

    const sessionKey = `${accountId}_${contactId}`;
    let userSession = this.userSessions.get(sessionKey) || {
      stage: 'welcome',
      data: {},
      lastInteraction: Date.now(),
      conversationId
    };

    console.log(`👤 ${sessionKey} (${userSession.stage}): "${userMessage}"`);

    const response = this.processFlow(userSession, userMessage);
    
    userSession.stage = response.nextStage;
    userSession.data = { ...userSession.data, ...response.sessionData };
    userSession.lastInteraction = Date.now();
    
    this.userSessions.set(sessionKey, userSession);

    if (response.message) {
      await this.chatwootService.sendMessage(accountId, conversationId, response.message);
    }

    if (response.label) {
      await this.chatwootService.addLabel(accountId, conversationId, response.label);
    }

    this.cleanOldSessions();
  }

  private processFlow(session: UserSession, userMessage: string): FlowResponse {
    const stages: Record<string, (session: UserSession, userMessage: string) => FlowResponse> = {
      welcome: this.welcomeStage.bind(this),
      main_menu: this.mainMenuStage.bind(this),
      suporte_tecnico: this.suporteTecnicoStage.bind(this),
      vendas: this.vendasStage.bind(this),
      reclamacao: this.reclamacaoStage.bind(this),
      finalizar: this.finalizarStage.bind(this),
      suporte_acao: this.suporteAcaoStage.bind(this),
      vendas_acao: this.vendasAcaoStage.bind(this)
    };

    const handler = stages[session.stage] || this.welcomeStage;
    return handler(session, userMessage);
  }

  private welcomeStage(): FlowResponse {
    const message = `👋 Olá! Sou seu assistente virtual. 

Como posso ajudar você hoje?

1️⃣ *Suporte Técnico*
2️⃣ *Informações sobre Vendas* 
3️⃣ *Reclamações*
4️⃣ *Falar com humano*

Por favor, digite o número da opção desejada:`;

    return {
      message,
      nextStage: 'main_menu'
    };
  }

  private mainMenuStage(_session: UserSession, userMessage: string): FlowResponse {
    const options: Record<string, { next: string; label: string }> = {
      '1': { next: 'suporte_tecnico', label: 'suporte-tecnico' },
      '2': { next: 'vendas', label: 'vendas' },
      '3': { next: 'reclamacao', label: 'reclamacao' },
      '4': { next: 'finalizar', label: 'atendimento-humano' },
      'menu': { next: 'welcome', label: 'volta-menu' }
    };

    const selected = options[userMessage];
    
    if (selected) {
      const stageMessages: Record<string, string> = {
        'suporte_tecnico': '🔧 *Suporte Técnico*\n\nQual problema você está enfrentando?\n\n• Internet lenta\n• Dispositivo não conecta\n• Outro problema',
        'vendas': '💰 *Vendas*\n\nSobre qual produto você gostaria de informações?\n\n• Plano Básico\n• Plano Premium\n• Promoções',
        'reclamacao': '📝 *Reclamações*\n\nPor favor, descreva sua reclamação:',
        'finalizar': '👨‍💼 Transferindo para um de nossos atendentes...\nAguarde um momento por favor!',
        'welcome': '🔁 Retornando ao menu principal...'
      };

      return {
        message: stageMessages[selected.next],
        nextStage: selected.next,
        label: selected.label
      };
    }

    return {
      message: '❌ Opção inválida. Por favor, digite 1, 2, 3 ou 4:',
      nextStage: 'main_menu'
    };
  }

  private suporteTecnicoStage(session: UserSession, userMessage: string): FlowResponse {
    const message = `📋 Anotado: "${userMessage}"

Nossos técnicos já foram informados sobre seu problema.

Gostaria de:
1️⃣ *Abrir um chamado técnico*
2️⃣ *Voltar ao menu anterior*
3️⃣ *Falar com humano*`;
    
    return {
      message,
      nextStage: 'suporte_acao',
      sessionData: { ...session.data, problema: userMessage }
    };
  }

  private suporteAcaoStage(_session: UserSession, userMessage: string): FlowResponse {
    const options: Record<string, FlowResponse> = {
      '1': { 
        message: `✅ Chamado técnico aberto! Protocolo: #T${Date.now().toString().slice(-6)}`, 
        nextStage: 'finalizar', 
        label: 'chamado-tecnico' 
      },
      '2': { 
        message: '↩️ Voltando ao menu...', 
        nextStage: 'welcome' 
      },
      '3': { 
        message: '👨‍💼 Transferindo para atendente...', 
        nextStage: 'finalizar', 
        label: 'atendimento-humano' 
      }
    };

    return options[userMessage] || {
      message: '❌ Opção inválida. Digite 1, 2 ou 3:',
      nextStage: 'suporte_acao'
    };
  }

  private vendasStage(session: UserSession, userMessage: string): FlowResponse {
    const message = `💼 Interesse em: "${userMessage}"

Em breve nosso time de vendas entrará em contato com mais informações!

Deseja:
1️⃣ *Receber mais informações por email*
2️⃣ *Agendar uma demonstração* 
3️⃣ *Voltar ao menu*`;
    
    return {
      message,
      nextStage: 'vendas_acao',
      sessionData: { ...session.data, interesse: userMessage },
      label: 'lead-vendas'
    };
  }

  private vendasAcaoStage(_session: UserSession, userMessage: string): FlowResponse {
    const options: Record<string, FlowResponse> = {
      '1': { 
        message: '📧 Informações enviadas para seu email!', 
        nextStage: 'finalizar', 
        label: 'lead-email' 
      },
      '2': { 
        message: '📅 Demonstração agendada! Entraremos em contato.', 
        nextStage: 'finalizar', 
        label: 'demonstracao-agendada' 
      },
      '3': { 
        message: '↩️ Voltando ao menu...', 
        nextStage: 'welcome' 
      }
    };

    return options[userMessage] || {
      message: '❌ Opção inválida. Digite 1, 2 ou 3:',
      nextStage: 'vendas_acao'
    };
  }

  private reclamacaoStage(session: UserSession, userMessage: string): FlowResponse {
    const protocolo = Math.random().toString(36).substring(2, 11).toUpperCase();
    const message = `📄 Sua reclamação foi registrada:
"${userMessage}"

Protocolo: #${protocolo}

Nosso time entrará em contato em até 24h.`;
    
    return {
      message,
      nextStage: 'finalizar',
      sessionData: { ...session.data, reclamacao: userMessage },
      label: 'reclamacao-aberta'
    };
  }

  private finalizarStage(): FlowResponse {
    return {
      message: 'Obrigado por entrar em contato! Se precisar de mais alguma coisa, é só digitar "menu"',
      nextStage: 'welcome'
    };
  }

  private cleanOldSessions(): void {
    const now = Date.now();
    const THIRTY_MINUTES = 30 * 60 * 1000;
    let cleaned = 0;
    
    for (const [key, session] of Array.from(this.userSessions.entries())) {
      if (now - session.lastInteraction > THIRTY_MINUTES) {
        this.userSessions.delete(key);
        cleaned++;
      }
    }
    
    if (cleaned > 0) {
      console.log(`🧹 Limpas ${cleaned} sessões expiradas`);
    }
  }

  getSessions() {
    return Array.from(this.userSessions.entries()).map(([key, session]) => ({
      user: key,
      stage: session.stage,
      lastInteraction: new Date(session.lastInteraction).toISOString(),
      data: session.data
    }));
  }

  clearSessions() {
    const count = this.userSessions.size;
    this.userSessions.clear();
    return count;
  }
}