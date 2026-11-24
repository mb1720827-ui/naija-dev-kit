# Naija Dev Kit

**Teach your AI coding assistant to build Nigerian apps correctly.**

Claude Code, Cursor and other AI assistants write great generic code, but they regularly get the Nigerian parts wrong. They trust the browser with Paystack amounts, skip webhook signature checks, store naira as floats, reject `0803` numbers, miss the FCT in state pickers and ship 5 MB pages to users on expensive data.

Naija Dev Kit fixes that in three ways:

| Part | What it is | For |
|---|---|---|
| **Skills** | Six focused guides your assistant loads automatically when the task needs them | Claude Code (plugin) |
| **MCP server** | The same guides plus lookup tools (phone numbers, states, naira) | Cursor, Claude Desktop, any MCP client |
| **npm library** | Small, tested helpers the guides tell the assistant to use | Any JavaScript/TypeScript project |

## The skills

| Skill | Stops your AI from… |
|---|---|
| `paystack-payments` | …trusting browser-sent amounts, skipping `/transaction/verify`, accepting unsigned webhooks, double-fulfilling orders, hardcoding bank codes |
| `nigerian-phone-numbers` | …storing `0803…`, `+234…` and `234…` as different users, or picking the airtime network from a ported number's prefix |
| `naira-money` | …using floats for money, double-converting kobo, or rounding VAT inconsistently |
| `nigerian-states` | …forgetting the FCT, misspelling states, or saying Lagos State's capital is Lagos |
| `low-bandwidth-ux` | …shipping heavy pages and fragile forms to people paying per megabyte |
| `ndpa-data-protection` | …collecting BVN/NIN "just in case", logging personal data, or skipping account deletion (Nigeria Data Protection Act 2023) |

Try it: install the plugin, then ask your assistant *"Add Paystack checkout to this Next.js app"*. It will initialise the payment on the server, verify it, check the webhook signature and fulfil idempotently.

## Install

### Claude Code (skills)

```
/plugin marketplace add mb1720827-ui/naija-dev-kit
/plugin install naija-dev-kit@naija-dev-kit
```

### Cursor, Claude Desktop or any MCP client

Add this to your MCP config (for Cursor: `.cursor/mcp.json`):

```json
{
  "mcpServers": {
    "naija-dev-kit": { "command": "npx", "args": ["-y", "naija-dev-kit-mcp"] }
  }
}
```

| MCP tool | Does |
|---|---|
| `nigeria_phone_info` | Normalises a number to E.164, gives the local format and the original network |
| `nigeria_states` | Looks up a state or FCT, or lists all 37 (optionally by geopolitical zone) |
| `naira_amount` | Parses "₦1,250.50" into kobo, with display format and VAT |
| `naija_guide` | Returns any of the six guides; they're also exposed as `naija://guides/...` resources |

### npm library

```bash
npm install naija-dev-kit
```

```ts
import { normalizePhone, formatNaira, nairaToKobo, findState, verifyPaystackSignature } from "naija-dev-kit";

normalizePhone("0803 123 4567");   // "+2348031234567"
formatNaira(125050);               // "₦1,250.50"
nairaToKobo("₦1,250.50");          // 125050
findState("FCT")?.capital;         // "Abuja"
verifyPaystackSignature(rawBody, req.headers.get("x-paystack-signature"), process.env.PAYSTACK_SECRET_KEY!);
```

## Accuracy policy

Wrong reference data is worse than none, because an AI will repeat it confidently. So:

- **Only verifiable data ships.** All 37 states and FCT with capitals, zones and ISO codes are covered by tests, including counts per zone.
- **Anything that changes is fetched live, not hardcoded.** Bank codes change with mergers and new licences, so the Paystack skill teaches fetching `GET /bank` instead of shipping a list.
- **Known limits are stated.** Phone prefixes show the original network only (number portability). The 774 LGAs aren't included until they can come from an official source with tests.
- **Rates that can change** (like 7.5% VAT) are parameters, and their guides say when they were last checked.

## Development

```bash
npm install
npm test          # 45 tests: helpers, every guide, and the MCP server end to end
npm run build     # compiles to dist/
```

The MCP tests connect a real MCP client to the server in memory and call every tool.

## Contributing

New skills are welcome: Flutterwave, USSD flows, WhatsApp Business, LGAs from an official source, and more. Each skill is one `skills/<name>/SKILL.md` with a `name` and a `description` that says when to use it. Add a test if it ships data.

## License

MIT
