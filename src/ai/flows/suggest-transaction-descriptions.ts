'use server';

/**
 * @fileOverview An AI agent that suggests transaction descriptions based on the transaction amount and associated accounts.
 *
 * - suggestTransactionDescriptions - A function that suggests transaction descriptions.
 * - SuggestTransactionDescriptionsInput - The input type for the suggestTransactionDescriptions function.
 * - SuggestTransactionDescriptionsOutput - The return type for the suggestTransactionDescriptions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestTransactionDescriptionsInputSchema = z.object({
  transactionAmount: z.number().describe('The amount of the transaction.'),
  accountDebited: z.string().describe('The account being debited.'),
  accountCredited: z.string().describe('The account being credited.'),
});
export type SuggestTransactionDescriptionsInput = z.infer<
  typeof SuggestTransactionDescriptionsInputSchema
>;

const SuggestTransactionDescriptionsOutputSchema = z.object({
  suggestedDescription: z
    .string()
    .describe('A suggested description for the transaction.'),
});
export type SuggestTransactionDescriptionsOutput = z.infer<
  typeof SuggestTransactionDescriptionsOutputSchema
>;

export async function suggestTransactionDescriptions(
  input: SuggestTransactionDescriptionsInput
): Promise<SuggestTransactionDescriptionsOutput> {
  return suggestTransactionDescriptionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestTransactionDescriptionsPrompt',
  input: {schema: SuggestTransactionDescriptionsInputSchema},
  output: {schema: SuggestTransactionDescriptionsOutputSchema},
  prompt: `You are an expert bookkeeper assisting with manual transaction entry.
Based on the transaction amount, the account debited, and the account credited, suggest a concise and accurate description for the transaction.

Transaction Amount: {{{transactionAmount}}}
Account Debited: {{{accountDebited}}}
Account Credited: {{{accountCredited}}}

Suggested Description:`, // The prompt should guide the model to provide a useful description
});

const suggestTransactionDescriptionsFlow = ai.defineFlow(
  {
    name: 'suggestTransactionDescriptionsFlow',
    inputSchema: SuggestTransactionDescriptionsInputSchema,
    outputSchema: SuggestTransactionDescriptionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
