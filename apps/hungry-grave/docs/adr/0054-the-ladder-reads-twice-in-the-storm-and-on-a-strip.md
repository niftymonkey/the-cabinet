# The ladder reads twice, in the storm and on a strip

Every line's level is carried by that line's own projectiles, so the player reads the whole ladder by looking at the storm they are already looking at, and a slim strip confirms it with the score and a row of level pips per line. A rung gained lights on both channels. A rung lost shows on the field as that line's projectiles blowing up and on the strip as a pip going dark, so the player sees which line paid.

The two channels exist because gain and loss are not the same reading problem. In every shipped game in the record, gain reads fine off the field: it arrives on a beat the player caused, at the moment the storm was about to change anyway, and DoDonPachi, Raiden, Cave Story and Vampire Survivors all let the projectile carry it. Loss arrives on somebody else's beat, in the densest screen the run has produced, and a single rung subtracted from a dense storm is invisible, which is why every game that handles it well gives it a second channel. Halls of Torment is the shipped proof of the same conclusion reached twice: it launched with the storm as the readout and patched level marks onto the ability icons four months later ([../research/visible-ladder-precedent.md](../research/visible-ladder-precedent.md)).

Three existing rules bind the strip. ADR 0014 binds every colour drawn while the field is live to the field's own ceiling, so the strip announces by count, by shape or by subtraction and never by getting brighter. ADR 0039 already made the field boundary a readout, so a second readout on the same frame has to be told apart from the first. And the rim is the health bar and the hit's second channel (ADR 0003, ADR 0040), so it carries no ladder marks: loading the announcing channel with the ladder would occlude it at the one tick it changes.

One thing is recorded as new ground rather than as precedent. Nothing shipped subtracts score directly on a hit; what ships is a chain or a multiplier visibly collapsing. ADR 0003's score bleed at the floor is therefore ours alone, and it is noted here rather than pushed against.

The strip's exact form is design work. What is ruled is that both channels exist and that neither one is the only reading of a loss.

Ruled by Mark 2026-09-07 in the V1 grill, over the storm alone and over the strip alone.
