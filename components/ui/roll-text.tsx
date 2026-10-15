/**
 * Rolling label: on hover or keyboard focus of the parent link, each letter rolls up out of view
 * (slightly staggered) while a copy rolls in from below. Purely visual: the parent link carries the
 * label as its aria-label, so screen readers hear the word once. Styles: .roll in app/globals.css.
 */
export function RollText({ text }: { text: string }) {
  const letters = [...text];
  const row = (clone: boolean) => (
    <span aria-hidden="true" className={clone ? "roll__row roll__row--clone" : "roll__row"}>
      {letters.map((ch, i) => (
        <span key={i} style={{ "--i": i } as React.CSSProperties}>
          {ch === " " ? " " : ch}
        </span>
      ))}
    </span>
  );
  return (
    <span className="roll">
      {row(false)}
      {row(true)}
    </span>
  );
}
