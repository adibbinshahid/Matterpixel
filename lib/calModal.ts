import { getLenis } from "@/components/SmoothScrollProvider";

/**
 * Makes the Cal.com popup behave like a real modal:
 *
 * - The page behind it can't scroll. Cal only sets `body { overflow: hidden }`
 *   the first time the popup is built (not on reopen), and Lenis drives the
 *   scroll position itself, so neither wheel nor touch was actually blocked.
 *   We stop Lenis and lock `<html>` for as long as the popup is visible.
 * - Back (button, Android back, iOS edge swipe) closes the popup instead of
 *   leaving the page. Opening pushes a same-URL history entry; popping it
 *   closes the popup, and closing the popup any other way (X, Esc, backdrop,
 *   booking done) pops it so history stays as it was.
 *
 * Cal appends one `<cal-modal-box>` per popup straight to `<body>`, and hides
 * it with `style.visibility = "hidden"` on close; it dispatches `open` and
 * `close` events on the element (the first `open` fires before we can listen,
 * so state is read from the element on every change, not from the events).
 */
const LOCK_CLASS = "cal-modal-open";
const HISTORY_KEY = "__calModal";

let started = false;
let isOpen = false;
let ownsHistoryEntry = false;

function visibleModal(): HTMLElement | null {
  for (const el of document.querySelectorAll<HTMLElement>("cal-modal-box")) {
    if (el.isConnected && el.style.visibility !== "hidden") return el;
  }
  return null;
}

function lock() {
  document.documentElement.classList.add(LOCK_CLASS);
  getLenis()?.stop();
}

function unlock() {
  document.documentElement.classList.remove(LOCK_CLASS);
  getLenis()?.start();
}

function sync() {
  const open = !!visibleModal();
  if (open === isOpen) return;
  isOpen = open;
  if (open) {
    lock();
    // Next's patched pushState copies its router state onto this entry, so
    // popping back to the previous one is a same-URL no-op for the router.
    window.history.pushState({ [HISTORY_KEY]: true }, "");
    ownsHistoryEntry = true;
  } else {
    unlock();
    if (ownsHistoryEntry) {
      ownsHistoryEntry = false;
      // Closed from inside the popup: drop the entry we pushed, unless the
      // visitor already moved on to a different one.
      if ((window.history.state as Record<string, unknown> | null)?.[HISTORY_KEY]) window.history.back();
    }
  }
}

function onPopState() {
  if (!isOpen || !ownsHistoryEntry) return;
  // The entry we pushed is gone: back was pressed. Close the popup the same
  // way Cal's own close does.
  ownsHistoryEntry = false;
  visibleModal()?.setAttribute("state", "closed");
  sync();
}

function watch(el: Element) {
  if (el.tagName !== "CAL-MODAL-BOX" || (el as HTMLElement).dataset.mpWatched) return;
  (el as HTMLElement).dataset.mpWatched = "1";
  el.addEventListener("open", sync);
  el.addEventListener("close", sync);
  new MutationObserver(sync).observe(el, { attributes: true, attributeFilter: ["style", "state"] });
}

/** Starts the guard once. Safe to call repeatedly. */
export function guardCalModal() {
  if (started || typeof window === "undefined") return;
  started = true;
  document.querySelectorAll("cal-modal-box").forEach(watch);
  new MutationObserver((records) => {
    for (const r of records) r.addedNodes.forEach((n) => n instanceof Element && watch(n));
    sync();
  }).observe(document.body, { childList: true });
  window.addEventListener("popstate", onPopState);
  sync();
}
