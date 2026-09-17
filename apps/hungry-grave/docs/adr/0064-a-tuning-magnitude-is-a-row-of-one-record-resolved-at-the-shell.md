# A tuning magnitude is a row of one record, resolved at the shell and carried on the run

Every authored magnitude in the core is a compiled constant, so moving one costs a coder, a review and a deploy, and a batch cannot compare two values of it. Not every magnitude wants to move: `caps.ts` says that a capacity is a safety net rather than a tuning knob, and ADR 0056 makes the mob cap, the mob-fire cap and the corpse cap derivations of the stage's own tables.

**A magnitude a batch reading can move, that is neither a derivation nor a safety net, is a row of one typed tuning record, grouped by the module that owns it, resolved once at the shell and carried on the run.** Its one name on every text surface, the command line, the tape header, the report and the comparison alike, is the dotted path its nesting gives it. The default record equals the constants it replaces, value for value. The shell resolves the record once, from a named candidate or from the URL, and passes it inward on the starting condition of ADR 0063; the core never imports a record. The caps ADR 0056 derives are derived per run from the run's own record. Membership is eligibility and not admission: a row exists only where a named sweep reads it, and a fence fails on a row nothing reads.

Two rules already in the repo decide the shape. There are no import-time side effects, and a core module a shell writes into is the dependency rule inverted, so passing inward is what is left. And a number that must exist before it can be measured is data rather than a compiled constant, Mark's ruling of 2026-09-16. The eligibility half is the cited-future rule: a row with no reader is worse than no row, because a candidate could move it and nothing would change.

No magnitude moves when the record lands, and `GOLDEN` holds by arithmetic: a re-pin would mean a value moved. The witness does not fold the record: it is a starting condition, and every consequence of it is already inside the fold through the live state it changes.

Filed by the dispatching session 2026-09-17 under the one-push rule, on the rule above and its two exclusions, and Mark's to overrule on the branch before merge.
