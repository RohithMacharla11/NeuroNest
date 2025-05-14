// src/ai/flows/generate-chat-response.ts
'use server';
/**
 * @fileOverview A general-purpose conversational AI agent for the NeuroNest chat.
 *
 * - generateChatResponse - A function that generates a conversational response.
 * - GenerateChatResponseInput - The input type for the generateChatResponse function.
 * - GenerateChatResponseOutput - The return type for the generateChatResponse function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ChatMessageSchema = z.object({
  sender: z.enum(['user', 'ai']),
  text: z.string(),
});

const GenerateChatResponseInputSchema = z.object({
  userInput: z.string().describe("The user's most recent message."),
  chatHistory: z
    .array(ChatMessageSchema)
    .optional()
    .describe(
      'The recent history of the conversation. The last message in the history is the most recent previous message.'
    ),
  aiTone: z
    .string()
    .default('friendly')
    .describe(
      'The desired tone for the AI companion (e.g., friendly, empathetic, motivational, professional, calm).'
    ),
  userLanguage: z
    .string()
    .optional()
    .describe(
      'The detected language of the user. Respond in this language if provided and different from English.'
    ),
});
export type GenerateChatResponseInput = z.infer<typeof GenerateChatResponseInputSchema>;

const GenerateChatResponseOutputSchema = z.object({
  responseText: z.string().describe("The AI's conversational response."),
  suggestedNavigation: z
    .string()
    .optional()
    .describe(
      'An optional URL path if the AI suggests navigating to a specific app page (e.g., "/journal", "/mood-tracker").'
    ),
});
export type GenerateChatResponseOutput = z.infer<typeof GenerateChatResponseOutputSchema>;

export async function generateChatResponse(input: GenerateChatResponseInput): Promise<GenerateChatResponseOutput> {
  return generateChatResponseFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateChatResponsePrompt',
  input: {schema: GenerateChatResponseInputSchema},
  output: {schema: GenerateChatResponseOutputSchema},
  prompt: `You are NeuroNest AI, a {{aiTone}}, empathetic, and supportive companion. Your primary goal is to have a natural, helpful conversation and make the user feel understood.

App Features you can discuss and suggest navigating to:
- Dashboard: "/" (General overview)
- Journal: "/journal" (Writing down thoughts and feelings)
- Mood Tracker: "/mood-tracker" (Logging daily moods)
- Wellness Toolkit: "/wellness" (Main page for wellness tools)
  - Affirmations: "/wellness/affirmations" (Positive statements)
  - Mindfulness Exercises: "/wellness/mindfulness" (Breathing, body scan)
  - Guided Meditations: "/wellness/meditations" (Audio-guided sessions)
- Insights: "/insights" (Viewing emotional trends and reports)
- Settings: "/settings" (Customizing the app)

Current Conversation History (most recent message is last):
{{#if chatHistory}}
  {{#each chatHistory}}
    {{#if (eq sender "user")}}User: {{text}}{{/if}}
    {{#if (eq sender "ai")}}AI: {{text}}{{/if}}
  {{/each}}
{{else}}
  No previous messages in this session. This is the start of the conversation.
{{/if}}

User's latest message: "{{userInput}}"

Instructions:
1.  Respond naturally and conversationally to the user's message, keeping the {{aiTone}} tone in mind.
2.  If the user's message clearly indicates a desire to use a specific app feature listed above (e.g., "I want to write in my journal", "show me my mood history", "I need a meditation for sleep"), acknowledge their request and include the relevant path (e.g., "/journal", "/mood-tracker", "/wellness/meditations") in the 'suggestedNavigation' field of your response. Your text response should also guide them, e.g., "Sure, I can help with that! You can access your journal here."
3.  If the user asks a general question, provide a helpful answer.
4.  If the user is expressing feelings or thoughts, respond empathetically.
5.  Keep responses concise but complete.
6.  If 'userLanguage' is provided and is not 'en' or 'en-US', try to respond in that language. Otherwise, respond in English.
7.  If you are unsure how to respond or if the request is too complex, politely say so.

Your response should be structured as JSON.
If suggesting navigation, your responseText should still be a complete sentence making the suggestion.
Example for navigation:
User: "I want to write my thoughts"
AI Output: { "responseText": "That's a great idea! You can write in your journal. I can take you there.", "suggestedNavigation": "/journal" }

Example for general chat:
User: "How are you today?"
AI Output: { "responseText": "I'm doing well, thanks for asking! I'm here and ready to help with whatever you need. What's on your mind?", "suggestedNavigation": null }
`,
});


const generateChatResponseFlow = ai.defineFlow(
  {
    name: 'generateChatResponseFlow',
    inputSchema: GenerateChatResponseInputSchema,
    outputSchema: GenerateChatResponseOutputSchema,
  },
  async (input) => {
    // Ensure chatHistory is not too long to avoid overly large prompts
    const maxHistoryLength = 5; // Keep last 5 turns (user + ai)
    const recentHistory = input.chatHistory 
      ? input.chatHistory.slice(-maxHistoryLength * 2) 
      : [];

    const {output} = await prompt({...input, chatHistory: recentHistory});
    return output!;
  }
);
