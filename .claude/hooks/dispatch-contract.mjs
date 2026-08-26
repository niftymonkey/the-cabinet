/**
 * PreToolUse gate: a code-writing dispatch prompt must point the coding agent
 * at docs/agents/feature-playbook.md (section "The dispatch contract").
 */

const AGENT_TOOL_NAMES = new Set(['Agent', 'Task']);

/**
 * The dispatches that carry no code and therefore owe no contract.
 *
 * The list names what is exempt rather than what is caught, because a type this
 * file has never heard of is far more likely to be a new coding agent than a new
 * read-only one, and the cost of asking a review dispatch for a marker is one
 * line while the cost of missing a coding dispatch is the whole gate.
 */
const NON_CODING_SUBAGENT_TYPES = new Set([
  'explore',
  'plan',
  'claude-code-guide',
  'statusline-setup',
  'gate-game-design',
  'gate-product-vision',
  'gate-tech-architecture',
]);

/**
 * The playbook's own path, not its bare filename.
 *
 * The contract is that the agent reads this file, so the prompt has to name the
 * place it lives.
 */
const PLAYBOOK_POINTER = 'docs/agents/feature-playbook.md';
/**
 * The escape hatch, which must open only on its own line.
 *
 * A mid-sentence mention is not a declaration: a coding prompt that quotes the
 * marker while explaining the rule would otherwise walk straight through the
 * gate.
 */
const NON_CODING_MARKER = /^[ \t]*Non-coding dispatch:/m;

const DENY_REASON =
  'This looks like a code-writing dispatch. The dispatch contract ' +
  '(docs/agents/feature-playbook.md, section "The dispatch contract") requires ' +
  'the prompt to instruct the agent to read docs/agents/feature-playbook.md and ' +
  'follow it, and to carry: the definition in observable terms, the verification ' +
  'steps with actors, the seams under test, the module boundaries, and the ' +
  'planned test list. If this is not a code-writing dispatch, restate the prompt ' +
  'with a line starting "Non-coding dispatch:" plus the reason.';

async function readStdin() {
  let raw = '';
  for await (const chunk of process.stdin) {
    raw += chunk;
  }
  return raw;
}

/**
 * The Agent tool matches a subagent type without regard to case or separator,
 * so the gate has to compare the same way or a spelling walks around it.
 */
function normalizeSubagentType(subagentType) {
  return subagentType.toLowerCase().replace(/[_ ]/g, '-');
}

function isCodeWritingDispatch(toolName, toolInput) {
  if (!AGENT_TOOL_NAMES.has(toolName)) {
    return false;
  }
  const subagentType = toolInput.subagent_type;
  if (typeof subagentType !== 'string') {
    return true;
  }
  return !NON_CODING_SUBAGENT_TYPES.has(normalizeSubagentType(subagentType));
}

function promptCarriesContract(prompt) {
  return prompt.includes(PLAYBOOK_POINTER) || NON_CODING_MARKER.test(prompt);
}

function shouldDeny(payload) {
  if (payload === null || typeof payload !== 'object') {
    return false;
  }
  if (payload.hook_event_name !== 'PreToolUse') {
    return false;
  }
  const toolInput = payload.tool_input;
  if (toolInput === null || typeof toolInput !== 'object') {
    return false;
  }
  if (!isCodeWritingDispatch(payload.tool_name, toolInput)) {
    return false;
  }
  if (typeof toolInput.prompt !== 'string') {
    return false;
  }
  return !promptCarriesContract(toolInput.prompt);
}

function emitDeny() {
  const output = {
    hookSpecificOutput: {
      hookEventName: 'PreToolUse',
      permissionDecision: 'deny',
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
// The exit code is set rather than forced, because process.exit() can cut off a
// denial that stdout has not finished writing, and a half-written denial is read
// as no denial at all.
try {
  await main();
  process.exitCode = 0;
} catch {
  process.exitCode = 0;
}
