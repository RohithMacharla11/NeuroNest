'use server';

/**
 * @fileOverview Implements offline support for core GenAI functionalities.
 *
 * - generateOfflineResponse - A function that generates responses using locally stored data when offline.
 * - OfflineSupportInput - The input type for the generateOfflineResponse function.
 * - OfflineSupportOutput - The return type for the generateOfflineResponse function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const OfflineSupportInputSchema = z.object({
  query: z.string().describe('The user query or request.'),
  cachedData: z.string().optional().describe('Locally stored or cached data relevant to the query.'),
});
export type OfflineSupportInput = z.infer<typeof OfflineSupportInputSchema>;

const OfflineSupportOutputSchema = z.object({
  response: z.string().describe('The generated response based on the query and cached data.'),
});
export type OfflineSupportOutput = z.infer<typeof OfflineSupportOutputSchema>;

export async function generateOfflineResponse(input: OfflineSupportInput): Promise<OfflineSupportOutput> {
  return offlineSupportFlow(input);
}

const prompt = ai.definePrompt({
  name: 'offlineSupportPrompt',
  input: {schema: OfflineSupportInputSchema},
  output: {schema: OfflineSupportOutputSchema},
  prompt: `You are an AI assistant designed to function offline.
  Use the locally stored data to answer the user's query.
  If the data is insufficient, provide a helpful message indicating limited offline capabilities.

  Query: {{{query}}}
  Cached Data: {{{cachedData}}}

  Response:`, // Provide clear instructions for offline behavior
});

const offlineSupportFlow = ai.defineFlow(
  {
    name: 'offlineSupportFlow',
    inputSchema: OfflineSupportInputSchema,
    outputSchema: OfflineSupportOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
