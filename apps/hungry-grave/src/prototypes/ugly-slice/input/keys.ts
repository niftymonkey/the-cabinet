// Keyboard movement mapping (decision-log entry 12): keys command a
// designated speed the player tunes with a multiplier. Normalization lives
// here, not in the sim; the sim treats Input as a bare velocity command.

export function keysToMove(
  held: ReadonlySet<string>,
  multiplier: number,
): { moveX: number; moveY: number } {
  const left = held.has('ArrowLeft') || held.has('KeyA') ? 1 : 0;
  const right = held.has('ArrowRight') || held.has('KeyD') ? 1 : 0;
  const up = held.has('ArrowUp') || held.has('KeyW') ? 1 : 0;
  const down = held.has('ArrowDown') || held.has('KeyS') ? 1 : 0;
  const x = right - left;
  const y = down - up;
  const mag = Math.hypot(x, y);
  if (mag === 0) return { moveX: 0, moveY: 0 };
  return { moveX: (x / mag) * multiplier, moveY: (y / mag) * multiplier };
}
