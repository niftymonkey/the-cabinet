# TypeScript stays on 6.x until typescript-eslint supports 7

TypeScript 7.0 is the latest release and this repository deliberately stays on the 6.x line. Every
other tool in the catalog tracks its latest version.

TypeScript 7.0 is the Go port, and it ships with no programmatic compiler API at all. Any tool
needing to read the type checker therefore cannot run on it. typescript-eslint is one of those
tools: installing TypeScript 7 alongside it does not produce a warning, it produces a hard crash,
and `eslint` refuses to start with "typescript-eslint does not support TS 7.0". Its maintainers have
said there is nothing they can do until TypeScript ships the new API, expected in 7.1.

## Considered options

TypeScript documents a side-by-side arrangement using npm aliases, where `@typescript/native`
provides `tsc` at version 7 and `typescript` resolves to `@typescript/typescript6` so tooling still
finds a 6.x API. This was built and tested, and it does work cleanly: no unmet peer warnings, and
type-aware linting keeps full type information.

It was rejected anyway. It means two compilers in the tree, and the linter type-checking against a
different compiler than `tsc` uses. The only benefit on offer is faster full builds, which is worth
nothing on a repository this size. The arrangement is also non-obvious enough that every future
reader has to work out why `tsc6` exists.

## Consequences

Revisit when TypeScript 7.1 ships its API and typescript-eslint declares support. Until then a
`typescript` bump past 6.x fails loudly rather than silently, so the pin defends itself.
