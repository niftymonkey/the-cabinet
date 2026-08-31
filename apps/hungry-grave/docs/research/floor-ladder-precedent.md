# The floor ladder's precedent: graduated loss before death

Design research brief. Evidence only, no recommendation. Gathered 2026-08-31 while grilling the belch thread, when the question arose whether ADR 0003's floor ladder (score bleeds first, then weapon levels, only then death) is a shipped pattern or an invented risk.

## The ladder is a shipped, beloved pattern

Stripping power on the way to death, instead of dying outright, is catalogued as its own trope with a long shipped history ([Breakable Power-Up, TV Tropes](https://tvtropes.org/pmwiki/pmwiki.php/Main/BreakablePowerUp)). Mario's power ladder (fire, big, small, dead) is the household case. [Ghosts 'n Goblins](https://en.wikipedia.org/wiki/Ghosts_%27n_Goblins) is the purest one: every hit knocks Arthur's armor down a stage until he is in his boxers, and only the hit after that kills him.

The score-bleed rung has an almost exact match in Sonic's rings: while the player holds rings, a hit scatters all of them and never kills; only an empty-handed hit is fatal. The rings are simultaneously score and the death buffer, which is the same double duty this game's score plays at the floor.

None of these systems is documented as a fun failure. They are the canon of "death is never abrupt," which is the property ADR 0003 names.

## The documented failure is the inverse, and this game does not do it

The genre's named anti-pattern is [Gradius Syndrome, also called Powerup Syndrome](https://shmup.fandom.com/wiki/Powerup_Syndrome): power is lost *after* death, the player respawns weak, and the stage still expects a fully powered ship, producing a spiral widely described as unwinnable ([YMMV/Gradius, TV Tropes](https://tvtropes.org/pmwiki/pmwiki.php/YMMV/Gradius), [Power Loss, Gradius Syndrome, and the Value of a Bad Run, Mother Shmupper](https://www.mothershmupper.com/power-loss-gradius-syndrome-and-the-value-of-a-bad-run/)). The criticism is precise: the failure is not losing power, it is the mismatch between the state the player respawns in and the state the content expects.

The floor ladder strips before death, in place, mid-run, with field state intact. That is the documented fix for Gradius Syndrome, not an instance of it.

## The one watch item the failure literature does hand us

The spiral risk transfers in a milder form: drops are priced in kills, a stripped storm kills slower, so recovery is slowest exactly when the player is weakest. The 2026-08-31 birthright ruling (skull stream alone as start and floor target) thins the floor further. Whether a stripped player can climb back is measurable in tape and should be read there, not assumed either way.

## Sources

- [Breakable Power-Up, TV Tropes](https://tvtropes.org/pmwiki/pmwiki.php/Main/BreakablePowerUp)
- [Ghosts 'n Goblins, Wikipedia](https://en.wikipedia.org/wiki/Ghosts_%27n_Goblins)
- [Ultimate Ghosts 'n Goblins, Wikipedia](https://en.wikipedia.org/wiki/Ultimate_Ghosts_%27n_Goblins) (the graduated multi-hit armor variant)
- [Powerup Syndrome, Shoot Em Up wiki](https://shmup.fandom.com/wiki/Powerup_Syndrome)
- [YMMV/Gradius, TV Tropes](https://tvtropes.org/pmwiki/pmwiki.php/YMMV/Gradius)
- [Power Loss, Gradius Syndrome, and the Value of a Bad Run, Mother Shmupper](https://www.mothershmupper.com/power-loss-gradius-syndrome-and-the-value-of-a-bad-run/)

### Confidence notes

- TV Tropes and the Shoot Em Up wiki are community catalogues, reliable for "this pattern shipped in these games," not developer statement.
- The Gradius Syndrome criticism is community consensus across multiple independent writeups, not a single source's opinion.
