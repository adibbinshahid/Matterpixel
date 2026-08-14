/**
 * gsap + ScrollTrigger are a real chunk of JS (scroll-pin math, easing
 * tables, ticker) that no route needs before first paint/input — every
 * caller dynamically imports them through here instead of a static
 * top-level `import gsap from "gsap"`, which would pull the whole thing
 * back into the initial bundle regardless of when it's actually used.
 * Memoized so concurrent/repeat callers share one import + one
 * `registerPlugin` call.
 */
let modules: Promise<{
  gsap: typeof import("gsap").default;
  ScrollTrigger: typeof import("gsap/ScrollTrigger").ScrollTrigger;
}> | null = null;

export function loadGsap() {
  if (!modules) {
    modules = Promise.all([import("gsap"), import("gsap/ScrollTrigger")]).then(
      ([{ default: gsap }, { ScrollTrigger }]) => {
        gsap.registerPlugin(ScrollTrigger);
        return { gsap, ScrollTrigger };
      },
    );
  }
  return modules;
}

let refreshQueued = false;

/**
 * Coalesced `ScrollTrigger.refresh()`.
 *
 * A refresh re-measures every registered trigger against live layout, which
 * means a forced synchronous reflow of the whole document — the single most
 * expensive thing this site asks the main thread to do. Several independent
 * callers legitimately want one during hydration (each pinned section after
 * it registers, the provider once fonts settle, ServicesFold whenever its
 * measured bottom-align margin changes), and they all landed in the same
 * few hundred ms — so the page paid that full reflow four or five times
 * over, back to back, for what is ultimately one final layout.
 *
 * Collapsing them onto a single rAF means N callers cost one reflow, and it
 * lands after the browser has finished the style/layout work those callers
 * just triggered rather than interleaving with it.
 */
export function refreshScrollTrigger() {
  if (refreshQueued) return;
  refreshQueued = true;
  requestAnimationFrame(() => {
    refreshQueued = false;
    void loadGsap().then(({ ScrollTrigger }) => ScrollTrigger.refresh());
  });
}
