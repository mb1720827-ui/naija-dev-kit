import { readdirSync, readFileSync } from "node:fs";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { formatNaira, nairaToKobo, vatOn } from "./naira.js";
import { formatPhoneLocal, normalizePhone, phoneNetwork } from "./phone.js";
import { findState, STATES, type Zone } from "./states.js";

// The skills folder sits next to src/ and dist/, so this works from source and from the published package.
const SKILLS_DIR = new URL("../skills/", import.meta.url);

interface Guide {
  name: string;
  description: string;
  body: string;
}

export function loadGuides(): Guide[] {
  return readdirSync(SKILLS_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => {
      const body = readFileSync(new URL(`${d.name}/SKILL.md`, SKILLS_DIR), "utf8");
      const description = /^description:\s*(.+)$/m.exec(body)?.[1]?.trim() ?? "";
      return { name: d.name, description, body };
    });
}

const text = (value: unknown) => ({
  content: [{ type: "text" as const, text: typeof value === "string" ? value : JSON.stringify(value, null, 2) }],
});
const error = (message: string) => ({ ...text(message), isError: true });

export function createServer(): McpServer {
  const server = new McpServer({ name: "naija-dev-kit", version: "0.1.0" });
  const guides = loadGuides();

  server.registerTool(
    "nigeria_phone_info",
    {
      title: "Nigerian phone number info",
      description:
        "Normalises a Nigerian mobile number to E.164 (+234...) for storage, gives the local display format, and the network the number was originally issued on (a hint only: ported numbers differ).",
      inputSchema: { phone: z.string().max(40).describe("The number as the user typed it, e.g. 0803 123 4567") },
    },
    async ({ phone }) => {
      const e164 = normalizePhone(phone);
      if (!e164) return error(`"${phone}" isn't a valid Nigerian mobile number.`);
      return text({
        e164,
        local: formatPhoneLocal(phone),
        originalNetwork: phoneNetwork(phone) ?? "unknown",
        note: "Because of number portability, ask the user for their current network before sending airtime or data.",
      });
    },
  );

  server.registerTool(
    "nigeria_states",
    {
      title: "Nigerian states",
      description:
        "Looks up a Nigerian state or the FCT by name, ISO code or alias, or lists all 37 with capital, geopolitical zone and ISO 3166-2 code.",
      inputSchema: {
        query: z.string().max(60).optional().describe('A state name, ISO code ("NG-LA") or "FCT". Leave empty to list all.'),
        zone: z
          .enum(["North Central", "North East", "North West", "South East", "South South", "South West"])
          .optional()
          .describe("Only list states in this geopolitical zone."),
      },
    },
    async ({ query, zone }) => {
      if (query) {
        const state = findState(query);
        return state ? text(state) : error(`No Nigerian state matches "${query}".`);
      }
      return text(zone ? STATES.filter((s) => s.zone === (zone as Zone)) : STATES);
    },
  );

  server.registerTool(
    "naira_amount",
    {
      title: "Naira amount",
      description:
        "Parses a naira amount as written by a person (₦1,250.50, N1250) into whole kobo for storage, with its display format and 7.5% VAT.",
      inputSchema: { amount: z.string().max(30).describe('For example "₦1,250.50"') },
    },
    async ({ amount }) => {
      const kobo = nairaToKobo(amount);
      if (kobo === null) return error(`"${amount}" isn't a valid naira amount (use at most 2 decimal places).`);
      return text({ kobo, formatted: formatNaira(kobo), vatKobo: vatOn(kobo), vatFormatted: formatNaira(vatOn(kobo)) });
    },
  );

  server.registerTool(
    "naija_guide",
    {
      title: "Naija Dev Kit guide",
      description: `Returns a practical guide for building Nigerian apps correctly. Topics: ${guides.map((g) => g.name).join(", ")}.`,
      inputSchema: { topic: z.enum(guides.map((g) => g.name) as [string, ...string[]]) },
    },
    async ({ topic }) => text(guides.find((g) => g.name === topic)!.body),
  );

  for (const guide of guides) {
    server.registerResource(
      guide.name,
      `naija://guides/${guide.name}`,
      { title: guide.name, description: guide.description, mimeType: "text/markdown" },
      async (uri) => ({ contents: [{ uri: uri.href, mimeType: "text/markdown", text: guide.body }] }),
    );
  }

  return server;
}
