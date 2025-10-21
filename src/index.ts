import { Hono } from 'hono'
import {cors} from 'hono/cors'
import { FlowService } from './flowService';
import type { ChatwootEvent } from './types.js';

const app = new Hono()
// const flowService = new FlowService();

app.get('/', (c) => {
  return c.json({
    status: '✅ Bot Online',
  });
});



// // Middleware CORS para ngrok
// app.use('*', cors());
// app.use('*', async (c, next) => {
//   console.log(`📨 ${c.req.method} ${c.req.path}`);
//   await next();
// });

// // Health check
// app.get('/', (c) => {
//   const memory = process.memoryUsage();
//   return c.json({
//     status: '✅ Bot Online',
//     runtime: 'Bun + Hono + TypeScript',
//     version: Bun.version,
//     memory: `${Math.round(memory.heapUsed / 1024 / 1024)}MB`,
//     uptime: `${Math.round(process.uptime())}s`,
//     sessions: flowService.getSessions().length
//   });
// });

// // Webhook do Chatwoot
// app.post('/webhook', async (c) => {
//   try {
//     const event = await c.req.json() as ChatwootEvent;
    
//     if (event.event === 'message_created' && event.message.message_type === 'incoming') {
//       // Processa em background sem bloquear a resposta
//       flowService.processMessage(event).catch(console.error);
//     }
    
//     return c.text('OK');
//   } catch (error) {
//     console.error('❌ Erro no webhook:', error);
//     return c.text('Erro interno', 500);
//   }
// });

// // Status das sessões
// app.get('/sessions', (c) => {
//   const sessions = flowService.getSessions();
//   return c.json({
//     activeSessions: sessions.length,
//     sessions
//   });
// });

// // Limpar sessões
// app.delete('/sessions', (c) => {
//   const count = flowService.clearSessions();
//   return c.json({
//     message: `🧹 ${count} sessões removidas`,
//     remaining: 0
//   });
// });



export default app
