# The prototype boundary

Everything built to learn from is a prototype: one self-contained folder under `src/prototypes/<name>` plus one registry entry, behind a `#/prototypes/<name>` hash route, removable by deleting the folder and its entry. The base app statically imports no prototype code and reaches one only through the registry's dynamic import.

The default route serves the game, and the prototype list moves behind `#/prototypes` (ruled by Mark 2026-08-19). This supersedes entry 11.1's letter, that the base app's only screen lists the prototypes, and keeps its spirit: the deployed URL is a playtester's first tap, and the game still starts from the blank scaffold rather than from prototype code.

The game's own landing is its title screen, and a run starts from there (ruled by Mark 2026-08-20). Reaching a playable run with no navigation at all is still wanted, because a playtester following a link should not have to find the start, but a title screen is something the finished game has and the tracer is not the place to trade it away for one tap. The mechanism is deliberately unnamed: a deep link that skips the title, a playtest build that opens straight into a run, or something else. Revisit when the playtest link goes out.

Nothing is ever lifted out of a prototype and no prototype is ever extended into the game; a prototype exists to teach what is possible, what feels right, and what is missing, and the real game is built fresh. The working rules live in the repo's feature playbook.

Decision log entry 11.
