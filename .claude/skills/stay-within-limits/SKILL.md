---
name: stay-within-limits
description: Use when long-running or parallel agent work must respect the account's usage limits (the 5-hour session window, the weekly all-models window, and the weekly Fable window) by checking real usage between waves, pausing before the cap with a reserve left for the user, and resuming only when the window is clear.
---

# Stay Within Limits

Keep long-running agent work inside the account's usage windows, and stop early
enough that the user still has usage left to talk to you. Check usage before
launching substantial work and between waves of parallel subagents.

## The three windows

The account has three limits, and every check reads all three:

| Window | What it counts | Resets |
|---|---|---|
| `session` | everything, over a rolling 5 hours | every 5 hours |
| `weekly_all` | everything, over 7 days | weekly |
| `weekly_fable` | Fable-model usage only, over 7 days | weekly |

Fable is the main thread's model. Subagents on Opus, Sonnet or Haiku do not
count against `weekly_fable`; they count against `session` and `weekly_all`.

## The main thread stays lean, always

This is the default, not a fallback. The main thread plans, orchestrates,
reads short results, reviews, and runs the gates. Everything else runs on a
subagent: every dispatch, every piece of research, every asset conversion,
every batch run, every file sweep. A subagent returns the bare minimum the
main thread needs to keep planning, never a file dump. Nothing is read into the
main context that a subagent could summarize. Subagents run on Opus for code
and research and on Sonnet or Haiku for mechanical work; gate agents that carry
no model line inherit the main model and that is accepted.

## Thresholds

Two numbers per window. The reserve exists so the user can still ask questions
after a pause; hitting 100% takes that away, so 100% is never the stop line.

| Window | Caution | Stop |
|---|---|---|
| `session` | 75% | 85% |
| `weekly_all` | 75% | 85% |
| `weekly_fable` | 85% | 95% |

- **Below caution:** run normally.
- **Caution on `session` or `weekly_all`:** finish the wave in flight, launch
  no new wave, and check again before anything else.
- **Caution on `weekly_fable`:** the main thread is already lean, so what is
  left to spend is its own turns. Make the stop a clean handover: finish the
  wave in flight, then write the handoff so a resume on another main model can
  continue mid-push; make each later wave bigger so planning and read-back
  happen less often; spawn gate agents with an Opus model override for the rest
  of the push; defer any new research or design reading to the next wave's
  packet; and tell the user the three numbers so they can resume on Opus early
  if they prefer.
- **Stop on any window:** launch nothing new. Schedule a self-contained resume
  for when that window resets. If the stopped window is `weekly_fable` and the
  other two are healthy, also tell the user the work can continue sooner on a
  different main model: `claude --model claude-opus-5 --resume <session>`.

The thresholds are the user's guardrail and can be tightened by them at any
time; do not loosen them.

## Core loop

1. Run the usage check (below). Refuse to start a wave if any window is at or
   above its stop line.
2. Run a bounded wave of work. Default to at most 3 parallel subagents unless
   the user or host gives a different throttle.
3. Wait for the wave to finish. Do not interrupt in-flight subagents just to
   save budget; that usually loses work.
4. Check usage again. Apply the caution and stop rules above.
5. On resume, re-check the real windows before continuing. Do not trust elapsed
   wall-clock time alone.

## Usage check

Run the script beside this skill. It reads the same endpoint Claude Code's own
`/usage` screen reads, using the local login, and prints one JSON object:

```sh
~/.claude/skills/stay-within-limits/usage.sh
```

```json
{"session":{"percent":4,"resets_at":"..."},
 "weekly_all":{"percent":14,"resets_at":"..."},
 "weekly_fable":{"percent":26,"resets_at":"..."}}
```

A window the account does not have is `null`; treat a null window as absent,
never as zero. If the script fails (no network, expired login), treat the check
as failed and do not launch a wave until a check succeeds.

`ccusage` is not a substitute: it estimates cost from local logs and knows
nothing about the account's real percentages or the Fable window.

## Pausing and resuming

When a wake/resume tool is available, schedule a wakeup for:

```txt
min(3600, secondsUntilWindowResets)
```

If the runtime clamps wake delays to 60-3600 seconds, chain wakeups for longer
waits. Each wakeup re-runs the usage check, reschedules if still over the stop
line, and continues only when every window is below its caution line.

Make wake prompts self-contained. Include:

- The remaining plan.
- The check-then-reschedule rule and the threshold table.
- The exact usage command.
- The window that caused the pause and its `resets_at`.
- The next verification steps.
- The next wave's handoff packets (scope, verification commands, stop
  conditions) if delegation will resume.

## Choosing the wait mechanism

- Use a wake/resume tool when the agent needs instructions attached to the
  future resume.
- Use a background sleep or watcher for fixed timers and things a process can
  observe directly.
- Use cron or recurring schedules only for recurring fresh-session work.

Avoid short-interval polling for things the host will notify you about, such as
background task or subagent completion. For budget pauses, a prompt-cache miss
after a long sleep is acceptable; preserving the limit matters more.

## Reporting

If you pause, tell the user which window crossed its stop line, the three
observed percentages, when that window resets, when the next check is
scheduled, and what work remains. Keep enough state in the wake prompt that the
next turn can resume without relying on conversation momentum.
