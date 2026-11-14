/**
 * The light sections' moving ground: three soft brand-colour pools (blue,
 * magenta, periwinkle) drifting slowly behind the content. Pure CSS loops
 * on transform (.aurora in globals.css), still under reduced motion. The
 * parent must be `relative isolate overflow-hidden`.
 */
export function Aurora() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
      <span className="aurora aurora-a" />
      <span className="aurora aurora-b" />
      <span className="aurora aurora-c" />
    </div>
  );
}
