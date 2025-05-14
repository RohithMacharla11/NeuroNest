// This file is machine-generated - edit at your own risk.

'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating gratitude and reflection prompts.
 *
 * The flow takes no input and returns a string containing an AI-generated prompt for gratitude and reflection.
 * This allows users to gain deeper insights into their experiences and cultivate thankfulness.
 *
 * @interface GenerateReflectionPromptOutput - The output of the generateReflectionPrompt flow.
 * @function generateReflectionPrompt - The function to call to generate a reflection prompt.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateReflectionPromptOutputSchema = z.object({
  prompt: z.string().describe('A prompt for gratitude and reflection.'),
});
export type GenerateReflectionPromptOutput = z.infer<typeof GenerateReflectionPromptOutputSchema>;

export async function generateReflectionPrompt(): Promise<GenerateReflectionPromptOutput> {
  return generateReflectionPromptFlow();
}

const prompt = ai.definePrompt({
  name: 'reflectionPrompt',
  output: {schema: GenerateReflectionPromptOutputSchema},
  prompt: `You are an AI assistant designed to provide gratitude and reflection prompts to users.

  Your goal is to help users gain deeper insights into their experiences and cultivate a sense of thankfulness.

  Generate a single prompt that encourages the user to reflect on positive aspects of their life or recent experiences.
  The prompt should be open-ended and encourage thoughtful responses.

  Example prompts:
  - What is something you are grateful for today and why?
  - Describe a recent challenge you overcame and what you learned from it.
  - What is a small act of kindness you witnessed or experienced recently?
  - What are three things you appreciate about yourself?
  - Reflect on a moment today where you felt joy or contentment.
  - What is a goal you are working towards and what progress have you made recently?
  - Think about a person who has had a positive impact on your life. What qualities do you appreciate about them?`,
});

const generateReflectionPromptFlow = ai.defineFlow(
  {
    name: 'generateReflectionPromptFlow',
    outputSchema: GenerateReflectionPromptOutputSchema,
  },
  async () => {
    const {output} = await prompt({});
    return output!;
  }
);

