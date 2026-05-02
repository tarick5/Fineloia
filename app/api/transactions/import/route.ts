import { NextResponse } from "next/server";
import { z } from "zod";
import { anthropic } from "@ai-sdk/anthropic";
import { generateText } from "ai";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ensureOrganizationMember } from "@/lib/auth";
import { parseTransactionsCsv, type ParsedTransactionRow } from "@/lib/csv";

const schema = z.object({
  organizationId: z.string().uuid(),
  csv: z.string().min(1),
});

async function aiCategorizeRows(rows: ParsedTransactionRow[]) {
  const pending = rows.filter((row) => row.category === "General").slice(0, 50);
  if (!pending.length || !process.env.ANTHROPIC_API_KEY) {
    return rows;
  }

  try {
    const prompt = `Return only JSON array. For each item, provide a category from: Revenue, Payroll, Rent, Marketing, Tax, Software, Operations, General. Items: ${JSON.stringify(
      pending.map((row) => ({ description: row.description, amount: row.amount })),
    )}`;

    const result = await generateText({
      model: anthropic("claude-sonnet-4-20250514"),
      prompt,
    });

    const parsed = JSON.parse(result.text) as Array<{ description: string; category: string }>;
    const map = new Map(parsed.map((item) => [item.description, item.category]));

    return rows.map((row) => ({
      ...row,
      category: map.get(row.description) ?? row.category,
    }));
  } catch {
    return rows;
  }
}

export async function POST(request: Request) {
  try {
    const supabase = createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = schema.parse(await request.json());

    await ensureOrganizationMember({
      userId: user.id,
      organizationId: payload.organizationId,
    });

    const parsedRows = parseTransactionsCsv(payload.csv);
    const categorizedRows = await aiCategorizeRows(parsedRows);

    const { data, error } = await supabase
      .from("transactions")
      .insert(
        categorizedRows.map((row) => ({
          organization_id: payload.organizationId,
          date: row.date,
          description: row.description,
          amount: row.amount,
          category: row.category,
          account: row.account,
          currency: row.currency,
          source: "csv_import",
        })),
      )
      .select(
        "id, organization_id, date, description, amount, category, subcategory, account, currency, source, created_at",
      );

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ data: data ?? [] });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unexpected CSV import error.",
      },
      { status: 500 },
    );
  }
}
