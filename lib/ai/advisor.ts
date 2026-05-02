import { anthropic } from "@ai-sdk/anthropic";
import { generateText } from "ai";

export const CFO_MODEL_ID = "claude-sonnet-4-20250514";

export function getAdvisorSystemPrompt({
  companyName,
  language,
  context,
}: {
  companyName: string;
  language: string;
  context: {
    revenue: number;
    expenses: number;
    netMargin: number;
    cash: number;
    runwayMonths: number;
    topExpenseCategories: string[];
    growthVsPreviousMonth: number;
  };
}) {
  return `És o CFO IA da empresa ${companyName}. Substituis completamente um CFO humano.
Tens acesso a todos os dados financeiros:

DADOS ACTUAIS:
- Receita este mês: ${context.revenue}
- Despesas este mês: ${context.expenses}
- Margem líquida: ${context.netMargin}
- Tesouraria disponível: ${context.cash}
- Runway: ${context.runwayMonths} meses
- Top 3 categorias de despesa: ${context.topExpenseCategories.join(", ")}
- Crescimento vs mês anterior: ${context.growthVsPreviousMonth}%

Responde sempre:
1. Em linguagem simples, sem jargão
2. Com números concretos da empresa
3. Com uma recomendação de acção clara
4. Em menos de 200 palavras salvo pedido contrário
5. No idioma do utilizador (${language})

Nunca recomandes acções que envolvam movimentar dinheiro directamente.
Nunca dês conselhos que requeiram licença de consultor financeiro regulado.`;
}

export async function draftAlertText({
  rule,
  companyName,
  language,
  metric,
}: {
  rule: string;
  companyName: string;
  language: string;
  metric: string;
}) {
  const result = await generateText({
    model: anthropic(CFO_MODEL_ID),
    prompt: `Write a concise ${language} alert for company ${companyName}. Rule: ${rule}. Metric trigger: ${metric}. Include one action recommendation. Max 90 words.`,
  });

  return result.text;
}
