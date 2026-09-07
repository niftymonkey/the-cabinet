# Cloud dry run for the V1 push

This is a checklist for one cloud session. It proves that every tool the push needs works from the cloud environment `hungry-grave`, with one simple command each. It is not the push. Do nothing beyond these steps. Do not read the other files in this folder; they describe the push, which starts after this dry run passes.

Rules for the session: run every step even if an earlier one fails. Record each step in `apps/hungry-grave/docs/push/dry-run-results.md` as it completes, one line per step, in the form `N. PASS` or `N. FAIL`, then the command, then the key output on the next line (versions, counts, error text). Never print a secret. Never write to any file outside `apps/hungry-grave/docs/push/dry-run-results.md`, `apps/hungry-grave/scripts/store-smoke.mjs`, `apps/hungry-grave/package.json` and the lockfile, and `/tmp`. No em dashes in anything you write.

## Steps

1. **Tools.** Run `check-tools`, then `node --version`, `pnpm --version`, `vercel --version`, `coderabbit --version`, `ffmpeg -version | head -1`, `convert -version | head -1`. Node must be 22.18 or newer, pnpm 10.26.2. If `coderabbit` is not on PATH, look in `~/.local/bin` and `/root/.local/bin` and record where it is.
2. **Repo.** From the repo root: `pnpm install --frozen-lockfile`, then `pnpm verify`. Record the last ten lines of output.
3. **Store.** From `apps/hungry-grave`: `pnpm add @neondatabase/serverless @vercel/blob`. Then write `apps/hungry-grave/scripts/store-smoke.mjs` that, using `DATABASE_URL` and `BLOB_READ_WRITE_TOKEN` from the environment: creates a table `dry_run_smoke` with one text column, inserts one row, reads it back, drops the table; then gzips a 200 KB random buffer, uploads it with `put('dry-run/<timestamp>.gz', bytes, { access: 'private' })`, reads it back with `get(url, { access: 'private', useCache: false })`, compares the bytes, and deletes the blob with `del(url)`. Run it with `node scripts/store-smoke.mjs`. Record: row round trip OK or the error, blob bytes equal or the error.
4. **CodeRabbit.** From the repo root, with the store commit from step 3 not yet made, commit it first: `git add -A apps/hungry-grave/package.json pnpm-lock.yaml apps/hungry-grave/scripts/store-smoke.mjs` and `git commit -m "chore(hungry-grave): add the store clients and a store smoke script"`. Then run `coderabbit review --agent --base main -t committed --api-key "$CODERABBIT_API_KEY"`. Record whether it produced a review and how many findings. Do not act on the findings.
5. **Discord.** Run `curl -s -o /dev/null -w "%{http_code}" -H "Content-Type: application/json" -d '{"content":"Hungry Grave dry run: hello from the cloud"}' "$DISCORD_WEBHOOK_URL"`. A 204 is a pass.
6. **GitHub tickets.** Run `gh issue view 82 --json number,title,state`. Then `gh issue comment 82 --body "Cloud dry run: gh can write from the cloud. This comment is deleted by the same run."` and capture the comment URL it prints. Then delete that comment: take the numeric id at the end of the URL and run `gh api -X DELETE repos/niftymonkey/the-cabinet/issues/comments/<id>`. Record read OK, write OK, delete OK.
7. **itch.io.** Run these three, in order, and record the game id, the first upload id, and the byte count downloaded:
   `curl -s https://0x72.itch.io/dungeontileset-ii/data.json | jq .id`
   `curl -s "https://itch.io/api/1/$ITCH_API_KEY/game/<id>/uploads" | jq '.uploads[0].id'`
   `curl -s "https://itch.io/api/1/$ITCH_API_KEY/upload/<upload id>/download" | jq -r .url` then `curl -sL -o /tmp/itch-test.bin "<that url>"` and `wc -c /tmp/itch-test.bin`.
8. **Kenney.** Run `curl -sL https://kenney.nl/assets/pixel-shmup | grep -o 'https://kenney.nl/media/pages/assets/[^"]*\.zip' | head -1`, download that zip to `/tmp/kenney.zip`, and run `unzip -l /tmp/kenney.zip | grep -i license`. A listed license file is a pass.
9. **Vercel.** Run `vercel whoami --token "$VERCEL_TOKEN"`. Then from `apps/hungry-grave`: `vercel link --yes --project hungry-grave --scope team_rDwpau77qippLMDxVoyeq5Ev --token "$VERCEL_TOKEN"` and `vercel env ls --token "$VERCEL_TOKEN" | head -5`. No deploy in the dry run. Record the account name and whether the link succeeded.
10. **Usage script.** Run `bash .claude/skills/stay-within-limits/usage.sh` and record its output or error text verbatim. It is expected to fail in the cloud; the failure text is the point.
11. **Git.** Commit the results file: `git add apps/hungry-grave/docs/push/dry-run-results.md` and `git commit -m "docs(hungry-grave): cloud dry run results"`. Then `git push origin hungry-grave-v1`. Record the push output's last line.

## Done

When step 11 is pushed, send one more Discord message through the same webhook: `Hungry Grave dry run finished: <count> of 11 passed. Results are on the branch.` Then stop.
