#!/usr/bin/env node
// MCP server (stdio, zero-dep) que dá à Marina as ferramentas da agência FSampaio.
// Cada ferramenta = uma tool MCP; a execução vai pra POST /api/agent/tool no painel
// (fonte única — as MESMAS operações que a interface web usa). O catálogo é buscado
// dinamicamente (GET), então adicionar uma ferramenta no painel já reflete aqui.
import readline from "node:readline";

const BASE = (process.env.FSAMPAIO_URL || "https://fsampaioviagens.com").replace(/\/$/, "");
const SECRET = process.env.AGENT_API_SECRET || "";

async function api(method, body) {
  const r = await fetch(`${BASE}/api/agent/tool`, {
    method,
    headers: { "content-type": "application/json", "x-agent-secret": SECRET },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!r.ok) throw new Error(`FSampaio ${r.status}: ${(await r.text()).slice(0, 200)}`);
  return r.json();
}

let toolsCache = null;
async function listTools() {
  if (!toolsCache) {
    const d = await api("GET");
    toolsCache = (d.tools || []).map((t) => ({
      name: t.name,
      description: t.description,
      inputSchema: t.parameters || { type: "object", properties: {} },
    }));
  }
  return toolsCache;
}

function send(msg) {
  process.stdout.write(JSON.stringify(msg) + "\n");
}

const rl = readline.createInterface({ input: process.stdin });
rl.on("line", async (line) => {
  line = line.trim();
  if (!line) return;
  let req;
  try {
    req = JSON.parse(line);
  } catch {
    return;
  }
  const { id, method, params } = req;
  try {
    if (method === "initialize") {
      send({
        jsonrpc: "2.0",
        id,
        result: {
          protocolVersion: "2024-11-05",
          capabilities: { tools: {} },
          serverInfo: { name: "fsampaio-agencia", version: "1.0.0" },
        },
      });
    } else if (method === "tools/list") {
      send({ jsonrpc: "2.0", id, result: { tools: await listTools() } });
    } else if (method === "tools/call") {
      const { name, arguments: args } = params || {};
      const out = await api("POST", { tool: name, args: args || {} });
      const text = out.ok ? JSON.stringify(out.result ?? null) : `ERRO: ${out.erro || "falha"}`;
      send({ jsonrpc: "2.0", id, result: { content: [{ type: "text", text }], isError: !out.ok } });
    } else if (id !== undefined && method !== "notifications/initialized") {
      send({ jsonrpc: "2.0", id, error: { code: -32601, message: `método ${method} não suportado` } });
    }
  } catch (e) {
    if (id !== undefined) send({ jsonrpc: "2.0", id, error: { code: -32000, message: String(e?.message || e) } });
  }
});
