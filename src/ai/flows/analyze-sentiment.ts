// 'use server';
/**
 * @fileOverview A real-time sentiment analysis AI agent for journal entries.
 *
 * - analyzeSentiment - A function that analyzes the sentiment of a given text.
 * - AnalyzeSentimentInput - The input type for the analyzeSentiment function.
 * - AnalyzeSentimentOutput - The return type for the analyzeSentiment function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeSentimentInputSchema = z.object({
  text: z
    .string()
    .describe('The text of the journal entry to analyze.'),
});
export type AnalyzeSentimentInput = z.infer<typeof AnalyzeSentimentInputSchema>;

const AnalyzeSentimentOutputSchema = z.object({
  sentiment: z.string().describe('The sentiment of the text (e.g., positive, negative, neutral).'),
  score: z.number().describe('A numerical score representing the sentiment strength (-1 to 1).'),
  emotion: z.string().describe('The primary emotion expressed in the text (e.g., joy, sadness, anger).'),
});
export type AnalyzeSentimentOutput = z.infer<typeof AnalyzeSentimentOutputSchema>;

export async function analyzeSentiment(input: AnalyzeSentimentInput): Promise<AnalyzeSentimentOutput> {
  return analyzeSentimentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeSentimentPrompt',
  input: {schema: AnalyzeSentimentInputSchema},
  output: {schema: AnalyzeSentimentOutputSchema},
  prompt: `You are a sentiment analysis expert. Analyze the following text and determine its sentiment, score, and primary emotion.\n\nText: {{{text}}}\n\nSentiment: (positive, negative, or neutral)\nScore: (a number between -1 and 1, where -1 is very negative and 1 is very positive)\nEmotion: (e.g., joy, sadness, anger, fear, surprise, disgust)`,
});

const analyzeSentimentFlow = ai.defineFlow(
  {
    name: 'analyzeSentimentFlow',
    inputSchema: AnalyzeSentimentInputSchema,
    outputSchema: AnalyzeSentimentOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
