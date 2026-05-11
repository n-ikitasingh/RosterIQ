// RosterIQ inference orchestration layer.
// Generates SQL reasoning, analytics summaries, and visualization plans.

const corsHeaders = {
"Access-Control-Allow-Origin": "*",
"Access-Control-Allow-Headers":
"authorization, x-client-info, apikey, content-type",
};

interface ColumnDef {
name: string;
type: string;
}

interface DatasetCtx {
table: string;
name: string;
columns: ColumnDef[];
}

interface MemoryCtx {
recent: { q: string; sql?: string }[];
facts: string[];
}

const SYSTEM = `
You are RosterIQ, a senior AI analytics orchestration agent.

Convert natural-language analytics questions into a single, safe DuckDB SQL query against the supplied dataset, then generate structured reasoning and visualization guidance.

Rules:

* Use ONLY the supplied table and columns.
* Never invent columns.
* Output ONE SELECT statement only.
* No DDL/DML operations.
* No destructive SQL.
* Prefer GROUP BY + aggregates for trends, comparisons, and breakdowns.
* Limit to 50 rows when the response is a ranked list.
* Always alias aggregates.
* Choose chartType from:

  * bar
  * line
  * area
  * pie
  * table
  * kpi
* xKey should represent categorical or temporal dimensions.
* yKeys should represent numeric metrics.
* Use chartType "kpi" for single-value analytical responses.

Your goal is to behave like an intelligent analytics copilot with strong reasoning visibility and trustworthy query generation.
`;

const TOOL = {
type: "function" as const,
function: {
name: "answer_with_sql",
description:
"Generate SQL, reasoning summary, insights, and visualization planning.",
parameters: {
type: "object",
properties: {
sql: {
type: "string",
description: "Single DuckDB SELECT statement",
},
explanation: {
type: "string",
description:
"Brief explanation of how the query answers the question",
},
summary: {
type: "string",
description:
"Short business-level summary of what the result represents",
},
insights: {
type: "array",
items: { type: "string" },
description:
"2-3 intelligent insights inferred from the analytical intent",
},
chartType: {
type: "string",
enum: ["bar", "line", "area", "pie", "table", "kpi"],
},
xKey: {
type: "string",
description: "Dimension column for charting",
},
yKeys: {
type: "array",
items: { type: "string" },
description: "Metric columns for visualization",
},
confidence: {
type: "number",
description:
"Confidence score between 0 and 1 representing query reliability",
},
assumptions: {
type: "array",
items: { type: "string" },
description:
"Assumptions made while interpreting the user request",
},
},
required: [
"sql",
"explanation",
"summary",
"chartType",
"confidence",
],
additionalProperties: false,
},
},
};
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { question, dataset, memory } = (await req.json()) as {
      question: string;
      dataset: DatasetCtx;
      memory?: MemoryCtx;
    };

    const API_KEY = Deno.env.get("AI_GATEWAY_KEY");

    if (!API_KEY) {
      throw new Error("AI_GATEWAY_KEY not configured");
    }

    const schema = dataset.columns
      .map((c) => `  ${c.name} ${c.type}`)
      .join("\n");

    const recent = (memory?.recent || [])
      .slice(0, 3)
      .map(
        (r) => `
Q: ${r.q}
SQL: ${r.sql ?? ""}
`
      )
      .join("\n---\n");

    const facts = (memory?.facts || [])
      .map((f) => `- ${f}`)
      .join("\n");

    const userMsg = `
Dataset: ${dataset.name}

Table: ${dataset.table}

Schema:
${schema}

Semantic memory:
${facts || "(none)"}

Recent analytical episodes:
${recent || "(none)"}

User question:
${question}
`;

    const resp = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            {
              role: "system",
              content: SYSTEM,
            },
            {
              role: "user",
              content: userMsg,
            },
          ],
          tools: [TOOL],
          tool_choice: {
            type: "function",
            function: {
              name: "answer_with_sql",
            },
          },
        }),
      }
    );

    if (!resp.ok) {
      if (resp.status === 429) {
        return new Response(
          JSON.stringify({
            error:
              "Inference rate limit exceeded. Please retry in a moment.",
          }),
          {
            status: 429,
            headers: {
              ...corsHeaders,
              "Content-Type": "application/json",
            },
          }
        );
      }

      if (resp.status === 402) {
        return new Response(
          JSON.stringify({
            error:
              "Inference credits exhausted. Please add additional usage credits.",
          }),
          {
            status: 402,
            headers: {
              ...corsHeaders,
              "Content-Type": "application/json",
            },
          }
        );
      }

      const errorText = await resp.text();

      console.error(
        "Inference gateway error:",
        resp.status,
        errorText
      );

      return new Response(
        JSON.stringify({
          error: `Inference gateway error ${resp.status}`,
        }),
        {
          status: 500,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const data = await resp.json();

    const call =
      data.choices?.[0]?.message?.tool_calls?.[0];

    if (!call) {
      throw new Error(
        "Inference engine returned no structured response"
      );
    }

    const args = JSON.parse(call.function.arguments);

    return new Response(JSON.stringify(args), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    });
  } catch (e) {
    console.error("RosterIQ inference error:", e);

    return new Response(
      JSON.stringify({
        error:
          e instanceof Error ? e.message : String(e),
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});
