# Deploying The Hungry Grave

Vercel project `hungry-grave` in team `nifty-home-base`, id `prj_GVVAlMA1ha7HOeFYpeKVXEMuCgna`. Production alias: https://hungry-grave.vercel.app

The app carries its own gitignored `.vercel` link. The repository root's `.vercel` belongs to Housewarming, so every command below runs from `apps/hungry-grave`.

## The recipe

```
vercel pull --yes --environment production
vercel build --prod --yes
vercel deploy --prebuilt --prod --yes
```

Worked 2026-08-18. Do not re-derive it.

## Why it is shaped this way

Three constraints, each found the hard way:

- **Prebuilt rather than a server-side build.** Installing on Vercel breaks on `vitest: catalog:`. The pnpm catalog protocol resolves locally and the server-side install does not.
- **Run from the app directory rather than the repository root with a Root Directory setting.** In Vercel CLI 58.7.1, a configured rootDirectory plus a subdirectory invocation double-appends the path. The project's Root Directory is deliberately left on AUTO for this reason.
- **Production rather than preview.** Preview URLs sit behind Vercel Authentication, so a playtester on a phone cannot open one. Every playtest deploy is a production deploy.

**Send the alias, never the URL the CLI prints.** `vercel deploy` prints a per-deployment URL of the form `hungry-grave-<hash>-nifty-home-base.vercel.app`, and that one is SSO-gated too even though the deployment's target is production: it answers 302 to `vercel.com/sso-api`, so a playtester's phone gets a login wall. Only https://hungry-grave.vercel.app is reachable. Verified 2026-08-23 on deployment `dpl_56mgbVKoLaj98jD3EquHomzdPFBd` with `curl -sI` against both.

Env-override deploys are blocked by the permission classifier, so do not reach for `-e` flags to work around any of the above.
