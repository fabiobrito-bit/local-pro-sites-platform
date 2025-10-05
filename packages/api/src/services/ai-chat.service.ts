import Anthropic from '@anthropic-ai/sdk';
import { db } from '../models/db.js';
import {
  chatSessions,
  chatMessages,
  changeRequests,
  websites,
  websiteContent,
  clientProfiles,
} from '../models/schema.js';
import { eq, and, desc } from 'drizzle-orm';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const MODEL = 'claude-sonnet-4-5';

export interface ParsedIntent {
  type: 'hours_update' | 'content_change' | 'logo_update' | 'contact_info' | 'general_query';
  section?: string;
  newContent?: any;
  autoApprovable: boolean;
  priority: 'low' | 'medium' | 'high';
  description: string;
}

export async function createChatSession(clientId: string, websiteId?: string) {
  const [client] = await db
    .select()
    .from(clientProfiles)
    .where(eq(clientProfiles.id, clientId))
    .limit(1);

  let context: Record<string, any> = {
    businessName: client?.businessName,
  };

  if (websiteId) {
    const [website] = await db.select().from(websites).where(eq(websites.id, websiteId)).limit(1);

    const content = await db
      .select()
      .from(websiteContent)
      .where(and(eq(websiteContent.websiteId, websiteId), eq(websiteContent.isPublished, true)));

    context.website = {
      id: website?.id,
      title: website?.title,
      url: website?.url,
      content: content.reduce((acc, c) => ({ ...acc, [c.section]: c.content }), {}),
    };
  }

  const [session] = await db
    .insert(chatSessions)
    .values({
      clientId,
      title: 'Nieuwe chat',
      context,
      status: 'active',
    })
    .returning();

  return session;
}

export async function sendMessage(
  sessionId: string,
  userMessage: string,
  clientId: string,
  websiteId?: string
) {
  // Save user message
  const [userMsg] = await db
    .insert(chatMessages)
    .values({
      sessionId,
      role: 'user',
      content: userMessage,
    })
    .returning();

  // Get session context and history
  const [session] = await db
    .select()
    .from(chatSessions)
    .where(eq(chatSessions.id, sessionId))
    .limit(1);

  const history = await db
    .select()
    .from(chatMessages)
    .where(eq(chatMessages.sessionId, sessionId))
    .orderBy(chatMessages.createdAt)
    .limit(20);

  // Build conversation for Claude
  const messages: Anthropic.MessageParam[] = history
    .filter((m) => m.role !== 'system')
    .map((m) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    }));

  const systemPrompt = `Je bent een behulpzame AI-assistent voor het Local Pro Sites platform. Je helpt klanten met hun website.

Context:
${JSON.stringify(session?.context, null, 2)}

Jouw taken:
1. Beantwoord vragen over de website
2. Verwerk wijzigingsverzoeken voor website content
3. Leg processen uit
4. Escaleer complexe verzoeken naar support

Wanneer een klant een wijziging vraagt (zoals openingstijden, tekst, contactinfo), analyseer het verzoek en geef een gestructureerd antwoord.

Voor wijzigingsverzoeken, formatteer je antwoord als JSON:
{
  "intent": {
    "type": "hours_update" | "content_change" | "logo_update" | "contact_info" | "general_query",
    "section": "hero" | "about" | "services" | "contact" | etc,
    "newContent": { ... },
    "autoApprovable": boolean,
    "priority": "low" | "medium" | "high",
    "description": "beschrijving van wijziging"
  },
  "response": "Je antwoord aan de klant"
}

Voor algemene vragen, antwoord gewoon zonder JSON structuur.

Spreek Nederlands en wees vriendelijk en professioneel.`;

  try {
    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 2000,
      system: systemPrompt,
      messages,
    });

    const assistantMessage = response.content[0].type === 'text' ? response.content[0].text : '';
    const tokenCount = response.usage.input_tokens + response.usage.output_tokens;

    // Try to parse as JSON to detect intent
    let intent: ParsedIntent | null = null;
    let finalResponse = assistantMessage;

    try {
      const parsed = JSON.parse(assistantMessage);
      if (parsed.intent) {
        intent = parsed.intent;
        finalResponse = parsed.response;

        // Create change request if it's a change intent
        if (intent.type !== 'general_query' && websiteId) {
          const [website] = await db
            .select()
            .from(websites)
            .where(eq(websites.id, websiteId))
            .limit(1);

          // Get old content if section specified
          let oldContent = null;
          if (intent.section) {
            const [existingContent] = await db
              .select()
              .from(websiteContent)
              .where(
                and(
                  eq(websiteContent.websiteId, websiteId),
                  eq(websiteContent.section, intent.section)
                )
              )
              .limit(1);

            oldContent = existingContent?.content;
          }

          const [changeRequest] = await db
            .insert(changeRequests)
            .values({
              clientId,
              websiteId,
              requestType: intent.type,
              description: intent.description,
              oldContent,
              newContent: intent.newContent,
              status: intent.autoApprovable ? 'auto_approved' : 'pending',
              priority: intent.priority,
              autoApprovable: intent.autoApprovable,
            })
            .returning();

          finalResponse += `\n\n✅ Wijzigingsverzoek aangemaakt (ID: ${changeRequest.id.slice(0, 8)}). ${
            intent.autoApprovable
              ? 'Deze wijziging wordt automatisch verwerkt.'
              : 'Een admin zal je verzoek beoordelen.'
          }`;

          // Auto-apply if approvable
          if (intent.autoApprovable && intent.section) {
            await applyChangeRequest(changeRequest.id);
          }
        }
      }
    } catch {
      // Not JSON, just a regular response
    }

    // Save assistant message
    const [assistantMsg] = await db
      .insert(chatMessages)
      .values({
        sessionId,
        role: 'assistant',
        content: finalResponse,
        metadata: intent ? { intent } : undefined,
        tokenCount,
      })
      .returning();

    // Update session token count
    await db
      .update(chatSessions)
      .set({
        totalTokens: (session?.totalTokens || 0) + tokenCount,
      })
      .where(eq(chatSessions.id, sessionId));

    return {
      message: assistantMsg,
      intent,
    };
  } catch (error) {
    console.error('Claude API Error:', error);
    throw new Error('Fout bij verwerken van bericht');
  }
}

async function applyChangeRequest(requestId: string) {
  const [request] = await db
    .select()
    .from(changeRequests)
    .where(eq(changeRequests.id, requestId))
    .limit(1);

  if (!request) return;

  // Extract section from metadata or description
  const section = extractSectionFromRequest(request);

  if (!section) {
    await db
      .update(changeRequests)
      .set({ status: 'rejected' })
      .where(eq(changeRequests.id, requestId));
    return;
  }

  // Update or create website content
  await db
    .insert(websiteContent)
    .values({
      websiteId: request.websiteId,
      section,
      contentType: 'json',
      content: request.newContent,
      isPublished: true,
    })
    .onConflictDoUpdate({
      target: [websiteContent.websiteId, websiteContent.section],
      set: {
        content: request.newContent,
        version: db.$count(websiteContent.version) + 1,
        isPublished: true,
      },
    });

  await db
    .update(changeRequests)
    .set({ status: 'completed' })
    .where(eq(changeRequests.id, requestId));
}

function extractSectionFromRequest(request: any): string | null {
  // Logic to extract section from request
  const typeToSection: Record<string, string> = {
    hours_update: 'contact',
    contact_info: 'contact',
    logo_update: 'branding',
  };

  return typeToSection[request.requestType] || 'hero';
}

export async function getChatHistory(sessionId: string) {
  const messages = await db
    .select()
    .from(chatMessages)
    .where(eq(chatMessages.sessionId, sessionId))
    .orderBy(chatMessages.createdAt);

  return messages;
}

export async function getClientChatSessions(clientId: string) {
  const sessions = await db
    .select()
    .from(chatSessions)
    .where(eq(chatSessions.clientId, clientId))
    .orderBy(desc(chatSessions.createdAt))
    .limit(50);

  return sessions;
}

export async function escalateToSupport(sessionId: string, reason: string) {
  await db
    .update(chatSessions)
    .set({ status: 'escalated' })
    .where(eq(chatSessions.id, sessionId));

  // Here you would create a support ticket
  // Implementation in support.service.ts

  return { success: true };
}
