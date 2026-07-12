/**
 * Whether the loader intro already played earlier in this tab session.
 * Computed once at module evaluation (before any component mounts/effects
 * run), so <PageReveal> can time its blur-in without racing <Loader>'s own
 * effect that writes this same sessionStorage key.
 */
export const introAlreadySeen =
  typeof window !== "undefined" && sessionStorage.getItem("mp-loader-seen") === "1";
