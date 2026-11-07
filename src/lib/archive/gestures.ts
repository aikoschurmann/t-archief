/**
 * One wheel/trackpad swipe = one step. Trackpad momentum keeps sending ever-smaller deltas
 * after a swipe; those are ignored, but a delta that jumps up again means a fresh swipe.
 */
export function wheelStepper(onStep: (direction: 1 | -1) => void) {
  let locked = false;
  let travelled = 0;
  let lastDelta = 0;
  let steppedAt = 0;
  let idle: ReturnType<typeof setTimeout>;

  return (e: WheelEvent) => {
    const delta = Math.abs(e.deltaY) > Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
    const size = Math.abs(delta);
    const now = performance.now();

    clearTimeout(idle);
    idle = setTimeout(() => {
      locked = false;
      travelled = 0;
    }, 120);

    const freshSwipe = locked && now - steppedAt > 250 && size > 8 && size > lastDelta * 1.6;
    lastDelta = size;
    if (freshSwipe) {
      locked = false;
      travelled = 0;
    }
    if (locked) return;

    travelled += delta;
    if (Math.abs(travelled) > 30) {
      locked = true;
      steppedAt = now;
      onStep(travelled > 0 ? 1 : -1);
    }
  };
}
