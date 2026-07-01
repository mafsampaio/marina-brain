# marina-brain — o agente Hermes da FSampaio Viagens

Distribuição Hermes da **Marina**, a consultora da FSampaio Viagens. É o "segundo cérebro" dela: personalidade (SOUL), modelo, skills e a conexão MCP com o painel.

Marina **conversa** (WhatsApp/Telegram, cérebro `gpt-5.5`/codex — $0 na assinatura) e **opera a agência de verdade** chamando as ferramentas do painel `fsampaioviagens.com` via MCP (`/api/agent/tool` — a mesma fonte única que a interface web usa).

```
Telegram/WhatsApp ⇄ Hermes-Marina (este perfil) ─MCP→ painel FSampaio ─→ Postgres
```

## Instalar (na VPS, como o usuário do Hermes da Marina)

```bash
hermes profile install github.com/mafsampaio/marina-brain --alias
# preencher o .env do profile:
#   FSAMPAIO_URL=https://fsampaioviagens.com
#   AGENT_API_SECRET=<o WHATSAPP_WEBHOOK_SECRET do painel>
```

O modelo (`gpt-5.5` via `openai-codex`) usa a credencial **pooled** do Hermes — se o `openai-codex` já está logado no host, a Marina já pensa. Grok como fallback: `hermes fallback add xai-oauth`.

## Testar
```bash
marina chat            # conversa local
marina -z "resumo do dia"   # one-shot
```

## Canais
Telegram (bot `@fsampaiobot`) e, quando pronto, WhatsApp — configurados no gateway do profile.

## Arquivos
- `SOUL.md` — personalidade + regras (planejamento é interno pra Fernanda).
- `config.yaml` — modelo gpt-5.5/codex.
- `mcp.json` + `marina-mcp.mjs` — as ferramentas da agência (via a API do painel).
- `skills/fsampaio-agencia/` — como operar a agência.
- `.env.EXAMPLE` — variáveis a preencher (segredos nunca versionados).
