# Each input owns its speed

The sim's move command is a bare velocity in base-speed units, and each input source owns its own normalization and cap. Touch is uncapped: the grave lands on the drag target every step, times the drag ratio. The keyboard keeps a designated speed as a player setting (0.75x to 1.5x, persisted) plus a hold-to-focus key for fine dodging. Focus is multiplicative rather than an absolute shared speed, and the factor itself is a tuning number the tuning dispatch owns. On touch, focus is nothing, because drag precision is the fine control.

Capping one input to another's feel is a dont-build: the touch layer once capped drag at keyboard speed for fairness, and that cap was the input lag felt on device. Controls stay as boxed: steering, autofire, and the one button.

Decision log entries 8, 12, and 1.7.

Reopened and ruled by Mark 2026-08-20, on evidence raised by the 3b game design gate. The range was 0.5x to 2.0x and narrowed to 0.75x to 1.5x, because a 4x range collides with the focus key at both ends: at 2.0x, focus returns exactly the default speed and stops being a precision tool, and at 0.5x, normal speed already equals what the genre calls focused. The collision is the whole of the argument and it needs no precedent. Absolute focus, where the multiplier governs traversal and focus resolves to one shared speed for everyone, was considered and rejected: it is two changes rather than one, and it still wants a narrower low end anyway. No shipped shmup offers a player-configurable movement speed alongside an independent focus key, so there is no worked example to copy either way. FOCUS_FACTOR 0.5 was never in question.

A note for anyone re-deriving this. The 3b game design gate argued for absolute focus on the grounds that Touhou gives every character the same focused speed while varying only unfocused speed. That claim did not survive checking: the product vision gate could not reproduce it, and a separate lookup found focused speed varies per character from Mountain of Faith onward, the same as unfocused. The ruling stands because the collision argument never depended on it. Do not reintroduce the Touhou figure.
