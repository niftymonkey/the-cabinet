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

# In the cloud there is no credentials file. A token minted by `claude
# setup-token` and set as CLAUDE_CODE_OAUTH_TOKEN on the environment is used
# instead when the file is absent.
CREDENTIALS="${CLAUDE_CREDENTIALS:-$HOME/.claude/.credentials.json}"

if [ -f "$CREDENTIALS" ]; then
  token=$(python3 -c "import json,sys; print(json.load(open(sys.argv[1]))['claudeAiOauth']['accessToken'])" "$CREDENTIALS")
elif [ -n "${CLAUDE_CODE_OAUTH_TOKEN:-}" ]; then
  token="$CLAUDE_CODE_OAUTH_TOKEN"
else
  echo "no credentials file at $CREDENTIALS and CLAUDE_CODE_OAUTH_TOKEN is not set" >&2
  exit 1
fi

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
