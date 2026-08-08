"use client";

/**
 * Tiny localStorage-backed draft store for the contact forms, so a visitor
 * who fills half the wizard and then closes the tab (or reloads, or follows
 * a link out and comes back) picks up exactly where they left off instead
 * of retyping eleven answers.
 *
 * Deliberately not sessionStorage: the point is surviving a *restart*, not
 * just a soft navigation. Everything is wrapped in try/catch — Safari
 * private mode and storage-full both throw on write, and a failed draft
 * save must never break the form itself.
 */

const PREFIX = "mp:draft:";

/** Drafts older than this are dropped on read — a month-old half-answered
 * inquiry is stale context, not a useful resume point. */
const MAX_AGE_MS = 14 * 24 * 60 * 60 * 1000;

export interface FormDraft<T> {
  /** Epoch ms of the last write, used for expiry. */
  savedAt: number;
  /** Wizard step index, so multi-step forms resume on the right question. */
  step?: number;
  values: Partial<T>;
}

export function readDraft<T>(key: string): FormDraft<T> | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(PREFIX + key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as FormDraft<T> | null;
    if (!parsed || typeof parsed !== "object" || typeof parsed.values !== "object" || !parsed.values) {
      return null;
    }
    if (Date.now() - (parsed.savedAt ?? 0) > MAX_AGE_MS) {
      clearDraft(key);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function saveDraft<T>(key: string, values: Partial<T>, step?: number): void {
  if (typeof window === "undefined") return;
  try {
    const payload: FormDraft<T> = { savedAt: Date.now(), step, values };
    window.localStorage.setItem(PREFIX + key, JSON.stringify(payload));
  } catch {
    // Storage unavailable or full — drafts are a convenience, not a contract.
  }
}

export function clearDraft(key: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(PREFIX + key);
  } catch {
    // Same as above.
  }
}

/** True when every field is blank/empty — nothing worth persisting, and
 * writing it would make a fresh visit look like a "restored draft". */
export function isDraftEmpty(values: Record<string, unknown>): boolean {
  return Object.values(values).every((v) => {
    if (Array.isArray(v)) return v.length === 0;
    if (typeof v === "string") return v.trim().length === 0;
    return v === undefined || v === null;
  });
}
