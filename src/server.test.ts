import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { beforeAll, describe, expect, it } from "vitest";
import { createServer, loadGuides } from "./server.js";

let client: Client;

beforeAll(async () => {
  const [clientSide, serverSide] = InMemoryTransport.createLinkedPair();
  client = new Client({ name: "test", version: "1.0.0" });
  await Promise.all([createServer().connect(serverSide), client.connect(clientSide)]);
});

const textOf = (result: Awaited<ReturnType<Client["callTool"]>>) =>
  (result.content as { type: string; text: string }[]).map((c) => c.text).join("");

describe("MCP server", () => {
  it("lists its tools", async () => {
    const { tools } = await client.listTools();
    expect(tools.map((t) => t.name).sort()).toEqual(["naija_guide", "naira_amount", "nigeria_phone_info", "nigeria_states"]);
  });

  it("normalises phone numbers and flags invalid ones", async () => {
    const ok = await client.callTool({ name: "nigeria_phone_info", arguments: { phone: "0803 123 4567" } });
    expect(JSON.parse(textOf(ok))).toMatchObject({ e164: "+2348031234567", local: "0803 123 4567", originalNetwork: "MTN" });
    const bad = await client.callTool({ name: "nigeria_phone_info", arguments: { phone: "12345" } });
    expect(bad.isError).toBe(true);
  });

  it("looks up states and filters by zone", async () => {
    const one = await client.callTool({ name: "nigeria_states", arguments: { query: "FCT" } });
    expect(JSON.parse(textOf(one))).toMatchObject({ capital: "Abuja", iso: "NG-FC" });
    const zone = await client.callTool({ name: "nigeria_states", arguments: { zone: "South East" } });
    expect(JSON.parse(textOf(zone))).toHaveLength(5);
  });

  it("parses naira into kobo", async () => {
    const res = await client.callTool({ name: "naira_amount", arguments: { amount: "₦1,000" } });
    expect(JSON.parse(textOf(res))).toMatchObject({ kobo: 100000, vatKobo: 7500 });
  });

  it("serves every skill as a guide tool and as a resource", async () => {
    const guides = loadGuides();
    expect(guides.length).toBe(6);
    const { resources } = await client.listResources();
    expect(resources.map((r) => r.uri).sort()).toEqual(guides.map((g) => `naija://guides/${g.name}`).sort());

    const res = await client.callTool({ name: "naija_guide", arguments: { topic: "paystack-payments" } });
    expect(textOf(res)).toContain("x-paystack-signature");
    const read = await client.readResource({ uri: "naija://guides/naira-money" });
    expect((read.contents[0] as { text: string }).text).toContain("kobo");
  });

  it("every guide has a name matching its folder and a description", () => {
    for (const g of loadGuides()) {
      expect(g.body).toMatch(new RegExp(`^---\\nname: ${g.name}\\n`, "m"));
      expect(g.description.length).toBeGreaterThan(40);
    }
  });
});
