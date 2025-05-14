import { config } from 'dotenv';
config();

import '@/ai/flows/offline-support.ts';
import '@/ai/flows/analyze-sentiment.ts';
import '@/ai/flows/generate-affirmation.ts';
import '@/ai/flows/generate-therapy-export.ts';
import '@/ai/flows/detect-triggers.ts';
import '@/ai/flows/generate-reflection-prompt.ts';
import '@/ai/flows/generate-chat-response.ts';
