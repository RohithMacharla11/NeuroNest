'use server';

/**
 * @fileOverview Detects potential emotional triggers from journal entries and warns the user.
 *
 * - detectTriggers - A function that handles the trigger detection process.
 * - DetectTriggersInput - The input type for the detectTriggers function.
 * - DetectTriggersOutput - The return type for the detectTriggers function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DetectTriggersInputSchema = z.object({
  journalEntry: z
    .string()
    .describe('The user journal entry to analyze for potential triggers.'),
});
export type DetectTriggersInput = z.infer<typeof DetectTriggersInputSchema>;

const DetectTriggersOutputSchema = z.object({
  triggersDetected: z
    .boolean()
    .describe('Whether potential emotional triggers were detected.'),
  triggerWords: z
    .array(z.string())
    .describe('List of specific words or phrases that may be triggers.'),
  summary: z
    .string()
    .describe('A brief summary of the potential triggers detected.'),
});
export type DetectTriggersOutput = z.infer<typeof DetectTriggersOutputSchema>;

export async function detectTriggers(input: DetectTriggersInput): Promise<DetectTriggersOutput> {
  return detectTriggersFlow(input);
}

const prompt = ai.definePrompt({
  name: 'detectTriggersPrompt',
  input: {schema: DetectTriggersInputSchema},
  output: {schema: DetectTriggersOutputSchema},
  prompt: `You are a mental health expert who can analyze text for potential emotional triggers.

  Analyze the following journal entry and determine if there are any potential triggers present.

  Journal Entry: {{{journalEntry}}}

  Output a boolean value for whether triggers were detected, a list of trigger words, and a summary of the potential triggers.
  Ensure that the triggerWords contains only actual trigger words, and not the surrounding context.
  If no triggers are detected, return an empty array for triggerWords.
  `,
});

const detectTriggersFlow = ai.defineFlow(
  {
    name: 'detectTriggersFlow',
    inputSchema: DetectTriggersInputSchema,
    outputSchema: DetectTriggersOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
