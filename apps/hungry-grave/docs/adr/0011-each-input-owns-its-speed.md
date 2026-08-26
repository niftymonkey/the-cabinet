# Each input owns its speed

The sim's move command is a bare velocity in base-speed units, and each input source owns its own normalization and cap. Touch is uncapped: the grave lands on the drag target every step, times the drag ratio. The keyboard keeps a designated speed as a player setting, 0.75x to 1.5x persisted, plus a hold-to-focus key for fine dodging; focus is multiplicative rather than an absolute shared speed, its factor a tuning number, and on touch focus is nothing, because drag precision is the fine control. Capping one input to another's feel is the dont-build: the touch layer once capped drag at keyboard speed for fairness, and that cap was the input lag felt on device.

The range supersedes the original 0.5x to 2.0x, narrowed on 2026-08-20 on evidence raised by the 3b game design gate. A 4x range collides with the focus key at both ends: at 2.0x, focus returns exactly the default speed and stops being a precision tool, and at 0.5x, normal speed already equals what the genre calls focused. The collision is the whole of the argument. Absolute focus, where focus resolves to one shared speed for everyone, was rejected as two changes rather than one, and it still wants a narrower low end anyway. A note for anyone re-deriving this: the gate's claim that Touhou gives every character the same focused speed did not survive checking, focused speed varies per character from Mountain of Faith onward, and the ruling never depended on it. Do not reintroduce the Touhou figure.

Controls stay as boxed: steering, autofire, and the one button. The belch's binding is its own record (Hungry Grave ADR 0038).

Decision log entries 8 and 12.
