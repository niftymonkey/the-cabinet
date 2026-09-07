#!/usr/bin/env bash
# Prints the account's live usage limits as one JSON object, read from the same
# endpoint Claude Code's own /usage screen reads. The token is the local login's
# OAuth access token; Claude Code refreshes it, this script only reads it.
#
# Output shape:
#   {"session":{"percent":4,"resets_at":"..."},
#    "weekly_all":{"percent":14,"resets_at":"..."},
#    "weekly_fable":{"percent":26,"resets_at":"..."}}
# A window the account does not have is reported as null.
set -euo pipefail

CREDENTIALS="${CLAUDE_CREDENTIALS:-$HOME/.claude/.credentials.json}"

token=$(python3 -c "import json,sys; print(json.load(open(sys.argv[1]))['claudeAiOauth']['accessToken'])" "$CREDENTIALS")

curl -sf \
  -H "Authorization: Bearer $token" \
  -H "anthropic-beta: oauth-2025-04-20" \
  -H "Accept: application/json" \
  https://api.anthropic.com/api/oauth/usage \
| python3 -c '
import json, sys
d = json.load(sys.stdin)
out = {"session": None, "weekly_all": None, "weekly_fable": None}
for lim in d.get("limits", []):
    row = {"percent": lim.get("percent"), "resets_at": lim.get("resets_at")}
    kind = lim.get("kind")
    if kind == "session":
        out["session"] = row
    elif kind == "weekly_all":
        out["weekly_all"] = row
    elif kind == "weekly_scoped":
        scope = (lim.get("scope") or {}).get("model") or {}
        if (scope.get("display_name") or "").lower() == "fable":
            out["weekly_fable"] = row
print(json.dumps(out))
'
