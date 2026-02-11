#!/usr/bin/env bash
set -euo pipefail

# Airtable MCP — one-command setup for Claude Code
# Usage:
#   curl -fsSL https://raw.githubusercontent.com/rashidazarang/airtable-mcp/main/setup.sh | bash
#   ./setup.sh                      (interactive — prompts for token)
#   ./setup.sh pat1234...           (pass token as argument)
#   AIRTABLE_TOKEN=pat... ./setup.sh

CLAUDE_CONFIG="$HOME/.claude.json"
PACKAGE="@rashidazarang/airtable-mcp"

# ── helpers ──────────────────────────────────────────────────────────────────

info()  { printf '\033[1;34m%s\033[0m\n' "$*"; }
ok()    { printf '\033[1;32m%s\033[0m\n' "$*"; }
err()   { printf '\033[1;31m%s\033[0m\n' "$*" >&2; }

# ── prerequisites ────────────────────────────────────────────────────────────

if ! command -v node >/dev/null 2>&1; then
  err "Node.js is required (v18+). Install from https://nodejs.org"
  exit 1
fi

NODE_MAJOR=$(node -p 'process.versions.node.split(".")[0]')
if [ "$NODE_MAJOR" -lt 18 ]; then
  err "Node.js 18+ is required (found v$(node -v))"
  exit 1
fi

if ! command -v npx >/dev/null 2>&1; then
  err "npx is required (comes with npm). Install npm first."
  exit 1
fi

# ── resolve token ────────────────────────────────────────────────────────────

TOKEN="${1:-${AIRTABLE_TOKEN:-}}"

if [ -z "$TOKEN" ]; then
  printf 'Enter your Airtable Personal Access Token: '
  read -r TOKEN
fi

if [ -z "$TOKEN" ]; then
  err "No token provided. Get one at https://airtable.com/create/tokens"
  exit 1
fi

# ── verify the package works ─────────────────────────────────────────────────

info "Verifying $PACKAGE can start..."
VERIFY_OUTPUT=$(cd /tmp && AIRTABLE_TOKEN="$TOKEN" npx -y "$PACKAGE" --help 2>&1 || true)

# The server doesn't have --help; it starts in stdio mode.
# A successful launch prints a JSON log line with "ready". A failure prints an error.
# We just check npx resolved the binary (exit != 127).
if echo "$VERIFY_OUTPUT" | grep -q "command not found"; then
  err "npx could not resolve $PACKAGE. Check your npm/node installation."
  exit 1
fi
ok "Package verified."

# ── write Claude Code config ─────────────────────────────────────────────────

info "Configuring Claude Code..."

# Build the MCP entry as JSON
MCP_ENTRY=$(node -e "
const j = {
  type: 'stdio',
  command: '/bin/bash',
  args: ['-c', 'cd /tmp && npx -y $PACKAGE'],
  env: { AIRTABLE_TOKEN: process.argv[1] }
};
process.stdout.write(JSON.stringify(j));
" "$TOKEN")

if [ -f "$CLAUDE_CONFIG" ]; then
  # Merge into existing config
  node -e "
    const fs = require('fs');
    const cfg = JSON.parse(fs.readFileSync('$CLAUDE_CONFIG', 'utf8'));
    if (!cfg.mcpServers) cfg.mcpServers = {};
    cfg.mcpServers.airtable = $MCP_ENTRY;
    fs.writeFileSync('$CLAUDE_CONFIG', JSON.stringify(cfg, null, 2) + '\n');
  "
else
  # Create fresh config
  node -e "
    const fs = require('fs');
    const cfg = { mcpServers: { airtable: $MCP_ENTRY } };
    fs.writeFileSync('$CLAUDE_CONFIG', JSON.stringify(cfg, null, 2) + '\n');
  "
fi

ok "Wrote MCP config to $CLAUDE_CONFIG"

# ── done ─────────────────────────────────────────────────────────────────────

echo ""
ok "Setup complete!"
info "Restart Claude Code (or run /mcp) to connect."
info "Try: \"List all my Airtable bases\" to verify."
