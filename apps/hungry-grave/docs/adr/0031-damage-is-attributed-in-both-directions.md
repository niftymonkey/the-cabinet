# Damage is attributed in both directions

A `SimEvent` says a mob was damaged and by which weapon line, and it says the grave was hit and by what: mob fire naming the type that fired it, or a body landing on the player. This is a rule about the record rather than a detail of an event type: attributing only the damage the player deals lets the record say which line carried a run and never say what ended it, the two failures have opposite fixes, so one undifferentiated hit count describes neither, and the record-time rule (Hungry Grave ADR 0018) makes it a format matter, because attribution not captured at record time cannot be reconstructed later.

Extracted from Hungry Grave ADR 0018 on 2026-08-26, decision unchanged. Ruled by Mark 2026-08-23; the argument is in [../design/analytics-and-replay-grill-2026-08-22.md](../design/analytics-and-replay-grill-2026-08-22.md).
