// src/ai/flows/generate-therapy-export.ts
'use server';

/**
 * @fileOverview Generates a PDF report of emotional trends and insights for sharing with therapists or healthcare providers.
 *
 * - generateTherapyExport - A function that generates the therapy export report.
 * - GenerateTherapyExportInput - The input type for the generateTherapyExport function.
 * - GenerateTherapyExportOutput - The return type for the generateTherapyExport function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateTherapyExportInputSchema = z.object({
  emotionalData: z.string().describe('A JSON string containing emotional data, including mood scores, journal entries, and timestamps.'),
  insightsRequested: z.string().describe('The type of insights requested, such as mood trends, trigger detection, and goal progress.'),
  therapistContext: z.string().optional().describe('Optional context about the user\u2019s therapist to tailor the report.'),
  aiTone: z.string().optional().describe('The tone of the AI such as calm, motivational, friendly or professional.'),
});
export type GenerateTherapyExportInput = z.infer<typeof GenerateTherapyExportInputSchema>;

const GenerateTherapyExportOutputSchema = z.object({
  report: z.string().describe('A PDF report (base64 encoded) containing emotional trends and insights.'),
});
export type GenerateTherapyExportOutput = z.infer<typeof GenerateTherapyExportOutputSchema>;

export async function generateTherapyExport(input: GenerateTherapyExportInput): Promise<GenerateTherapyExportOutput> {
  return generateTherapyExportFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateTherapyExportPrompt',
  input: {schema: GenerateTherapyExportInputSchema},
  output: {schema: GenerateTherapyExportOutputSchema},
  prompt: `You are an AI assistant that analyzes emotional data and generates a PDF report for users to share with their therapist or healthcare provider. The report should contain emotional trends and insights, tailored to the user's needs and preferences. 

  Emotional Data: {{{emotionalData}}}
  Insights Requested: {{{insightsRequested}}}
  Therapist Context: {{{therapistContext}}}
  AI Tone: {{{aiTone}}}
  
  Based on the provided data and context, generate a comprehensive PDF report that includes:
  - An overview of the user's mood trends over time.
  - Identification of potential triggers and patterns.
  - Progress towards emotional goals.
  - Personalized recommendations for improving emotional well-being.

  Ensure the report is well-formatted, easy to understand, and provides actionable insights for the user and their therapist.

  Return the PDF report as a base64 encoded string.
  `,
});

const generateTherapyExportFlow = ai.defineFlow(
  {
    name: 'generateTherapyExportFlow',
    inputSchema: GenerateTherapyExportInputSchema,
    outputSchema: GenerateTherapyExportOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
