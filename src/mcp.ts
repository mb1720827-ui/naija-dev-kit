#!/usr/bin/env node
// MCP server over stdio. Run with: npx -y naija-dev-kit-mcp (or the "mcp" config in the README).
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createServer } from "./server.js";

await createServer().connect(new StdioServerTransport());
