# Each input owns its speed

The sim's move command is a bare velocity in base-speed units, and each input source owns its own normalization and cap. Touch is uncapped: the grave lands on the drag target every step, times the drag ratio. The keyboard keeps a designated speed as a player setting (0.5x to 2.0x, persisted) plus a hold-to-focus key for fine dodging; on touch, focus is nothing, because drag precision is the fine control.

Capping one input to another's feel is a dont-build: the touch layer once capped drag at keyboard speed for fairness, and that cap was the input lag felt on device. Controls stay as boxed: steering, autofire, and the one button.

Decision log entries 8, 12, and 1.7.
