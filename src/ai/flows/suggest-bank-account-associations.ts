'use server';

/**
 * @fileOverview This file defines a Genkit flow for suggesting bank account associations
 *  during bank statement import based on previous associations and ledger balances.
 *
 * - suggestBankAccountAssociations - The main function to trigger the flow.
 * - SuggestBankAccountAssociationsInput - The input type for the function.
 * - SuggestBankAccountAssociationsOutput - The output type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestBankAccountAssociationsInputSchema = z.object({
  transactionDescription: z.string().describe('Description of the bank transaction.'),
  transactionAmount: z.number().describe('Amount of the bank transaction.'),
  previousAssociations: z.array(
    z.object({
      description: z.string(),
      account: z.string(),
    })
  ).describe('List of previous transaction descriptions and associated accounts.'),
  currentLedgerBalances: z.record(z.string(), z.number()).describe('Current balances for each ledger account.'),
});
export type SuggestBankAccountAssociationsInput = z.infer<typeof SuggestBankAccountAssociationsInputSchema>;

const SuggestBankAccountAssociationsOutputSchema = z.object({
  suggestedAccount: z.string().describe('Suggested chart of account category for the transaction.'),
  confidenceScore: z.number().describe('Confidence score (0-1) for the suggested account.'),
  reasoning: z.string().describe('Explanation for the suggested account.'),
});
export type SuggestBankAccountAssociationsOutput = z.infer<typeof SuggestBankAccountAssociationsOutputSchema>;

export async function suggestBankAccountAssociations(input: SuggestBankAccountAssociationsInput): Promise<SuggestBankAccountAssociationsOutput> {
  return suggestBankAccountAssociationsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestBankAccountAssociationsPrompt',
  input: {schema: SuggestBankAccountAssociationsInputSchema},
  output: {schema: SuggestBankAccountAssociationsOutputSchema},
  prompt: `You are an expert accounting assistant helping to categorize bank transactions.

  Based on the transaction description, amount, previous associations, and current ledger balances, suggest the most appropriate chart of account category for the transaction.

  Transaction Description: {{{transactionDescription}}}
  Transaction Amount: {{{transactionAmount}}}

  Previous Associations:
  {{#each previousAssociations}}
  - Description: {{{description}}}, Account: {{{account}}}
  {{/each}}

  Current Ledger Balances:
  {{#each currentLedgerBalances}}
  - Account: {{{@key}}}, Balance: {{{this}}}
  {{/each}}

  Reason your suggestion clearly and concisely. Provide a confidence score between 0 and 1 (0 being least confident, 1 being most confident).

  Ensure your response conforms to the following JSON schema:
  {{json schema=SuggestBankAccountAssociationsOutputSchema}}
  `,
});

const suggestBankAccountAssociationsFlow = ai.defineFlow(
  {
    name: 'suggestBankAccountAssociationsFlow',
    inputSchema: SuggestBankAccountAssociationsInputSchema,
    outputSchema: SuggestBankAccountAssociationsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
