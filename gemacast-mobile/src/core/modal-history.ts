/**
 * Single source of truth for browser-history entries pushed by modal dialogs.
 *
 * A `<dialog>.showModal()` is invisible to the back button, so a modal pushes a
 * history entry when it opens and that entry is popped when it closes. Keeping
 * the bookkeeping here — rather than in each dialog — is what stops a forced
 * close (a tab switch, for instance) from stranding an entry that a later back
 * press would swallow.
 *
 * Entries deliberately carry no URL change: the hash belongs to tab routing, and
 * appending a marker to it made back-navigation depend on what had been open.
 */

type Listener = () => void;

/** Modal entries currently on the history stack. */
let pendingEntries = 0;

/** Back-steps this module requested; each fires a `popstate` that is ours. */
let popsInFlight = 0;

const listeners = new Set<Listener>();

function notify() {
  for (const listener of listeners) listener();
}

/** Ask for one history entry to be added; restore it with `releaseModalEntry`. */
export function pushModalEntry(): boolean {
  if (typeof window === 'undefined') return false;
  pendingEntries += 1;
  window.history.pushState({ modal: true }, '', window.location.href);
  return true;
}

/**
 * Discard one modal entry. The URL does not change either way; only the stack
 * depth does, and only while the entry is still the newest one.
 */
export function releaseModalEntry(): boolean {
  if (typeof window === 'undefined' || pendingEntries === 0) return false;
  pendingEntries = Math.max(0, pendingEntries - 1);
  stepBack(1);
  return true;
}

/**
 * Discard every outstanding modal entry. Used when the view underneath changes
 * and the dialogs are torn down from outside their own handlers.
 */
export function releaseAllModalEntries(): number {
  const released = pendingEntries;
  if (typeof window === 'undefined' || released === 0) return 0;
  pendingEntries = 0;
  stepBack(released);
  return released;
}

/**
 * Decide who owns the `popstate` that just fired, and tell the dialogs.
 *
 * The tab router calls this first. It answers `true` when a dialog owns the
 * event, in which case the router must not change tabs; the dialogs are notified
 * so the owning one can close itself.
 */
export function dispatchPopState(): boolean {
  const ours = popsInFlight > 0 || pendingEntries > 0;
  if (popsInFlight > 0) {
    popsInFlight -= 1;
  } else if (pendingEntries > 0) {
    // A user back press consumed the newest entry.
    pendingEntries -= 1;
  }
  if (ours) notify();
  return ours;
}

/**
 * Subscribe to a `popstate` that `dispatchPopState` attributed to a dialog.
 * Returns the unsubscribe function.
 */
export function onModalPopState(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** Number of modal history entries currently on the stack. */
export function pendingModalEntries(): number {
  return pendingEntries;
}

/** Test-only reset; the module outlives a single test file's render tree. */
export function __resetModalHistoryForTest(): void {
  pendingEntries = 0;
  popsInFlight = 0;
  listeners.clear();
}

/**
 * Step back over `count` entries, but only over ones this module pushed. When
 * something else has navigated since, the entries are no longer on top and
 * stepping back would leave the page rather than close the dialog.
 */
function stepBack(count: number) {
  const state = window.history.state as { modal?: boolean } | null;
  if (state?.modal) {
    popsInFlight += count;
    window.history.go(-count);
  }
}
