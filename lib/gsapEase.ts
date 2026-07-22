import gsap from "gsap";
import { CustomEase } from "gsap/CustomEase";
import { EASE } from "@/lib/utils";

gsap.registerPlugin(CustomEase);

/**
 * Named GSAP ease matching the site's single brand curve (see EASE in
 * lib/utils.ts). GSAP's `ease` option can't take a raw cubic-bezier
 * array/string without CustomEase — this registers it once, under one id,
 * for any non-scrubbed GSAP tween that needs the exact brand curve
 * (scrubbed tweens still correctly use `ease: "none"`, per the Motion
 * Bible's ambient/scrub-vs-discrete split).
 */
CustomEase.create("mp-ease", EASE.join(","));
export const GSAP_EASE = "mp-ease";
