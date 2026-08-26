/**
 * PreToolUse gate: a code-writing dispatch prompt must point the coding agent
 * at docs/agents/feature-playbook.md (section "The dispatch contract").
 */

const AGENT_TOOL_NAMES = new Set(["Agent", "Task"]);
const CODE_WRITING_SUBAGENT_TYPES = new Set(["general-purpose", "claude", "fork"]);
const PLAYBOOK_POINTER = "feature-playbook.md";
/**
 * The escape hatch, which must open only on its own line.
 *
 * A mid-sentence mention is not a declaration: a coding prompt that quotes the
 * marker while explaining the rule would otherwise walk straight through the
 * gate.
 */
const NON_CODING_MARKER = /^[ \t]*Non-coding dispatch:/m;

const DENY_REASON =
  "This looks like a code-writing dispatch. The dispatch contract " +
  '(docs/agents/feature-playbook.md, section "The dispatch contract") requires ' +
  "the prompt to instruct the agent to read docs/agents/feature-playbook.md and " +
  "follow it, and to carry: the definition in observable terms, the verification " +
  "steps with actors, the seams under test, the module boundaries, and the " +
  "planned test list. If this is not a code-writing dispatch, restate the prompt " +
  'with a line starting "Non-coding dispatch:" plus the reason.';

async function readStdin() {
  let raw = "";
  for await (const chunk of process.stdin) {
    raw += chunk;
  }
  return raw;
}

function isCodeWritingDispatch(toolName, toolInput) {
  if (!AGENT_TOOL_NAMES.has(toolName)) {
    return false;
  }
  const subagentType = toolInput.subagent_type;
  if (subagentType === undefined) {
    return true;
  }
  return CODE_WRITING_SUBAGENT_TYPES.has(subagentType);
}

function promptCarriesContract(prompt) {
  return prompt.includes(PLAYBOOK_POINTER) || NON_CODING_MARKER.test(prompt);
}

function shouldDeny(payload) {
  if (payload === null || typeof payload !== "object") {
    return false;
  }
  if (payload.hook_event_name !== "PreToolUse") {
    return false;
  }
  const toolInput = payload.tool_input;
  if (toolInput === null || typeof toolInput !== "object") {
    return false;
  }
  if (!isCodeWritingDispatch(payload.tool_name, toolInput)) {
    return false;
  }
  if (typeof toolInput.prompt !== "string") {
    return false;
  }
  return !promptCarriesContract(toolInput.prompt);
}

function emitDeny() {
  const output = {
    hookSpecificOutput: {
      hookEventName: "PreToolUse",
      permissionDecision: "deny",
      permissionDecisionReason: DENY_REASON,
    },
  };
  process.stdout.write(JSON.stringify(output));
}

async function main() {
  const payload = JSON.parse(await readStdin());
  if (shouldDeny(payload)) {
    emitDeny();
  }
}

// A broken hook must never block unrelated work: any failure allows the call.
try {
  await main();
  process.exit(0);
} catch {
  process.exit(0);
}
