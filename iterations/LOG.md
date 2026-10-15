# Iteration log

Stop at 2026-10-16 08:30 IST. One hypothesis per iteration. Screens in `iterations/screens/iter-NN/` (home at 375 / 768 / 1440 and /free at 375).
Rejected iterations are not committed as code: the working tree is reset to `best` and only the log, scoreboard and screens are committed.

## iter-00 · baseline
- State: paper hero with Fig. 1 (SVG; 3D on capable desktops), lime Free band, ink gallery wall of 6 approved covers, Studio cards, cobalt Tools band, About, footer.
- Checks: build, typecheck, 12 unit, 21 e2e pass; no console errors or overflow at 375/768/1440; Lighthouse mobile 97/100/100/100 (LCP 2.3 s, CLS 0.013, TBT 0); axe 0 on / and /free.
- Scores: H7 T7 C7 S6 D7 M7 I7 K6 A9 P9 = 72.
  - H 7: headline lands first; but the strongest asset (the work) sits third, below a long Free list.
  - T 7: display type is strong; mono labels are 12 px and hard to read at 1440; section titles small next to the bands.
  - C 7: bold bands, but Studio repeats lime + cobalt blocks right between the lime and cobalt bands: colour fatigue.
  - S 6: About is sparse and lopsided; Studio short; Tools plate tiny; uneven band heights.
  - D 7: gallery wall and Fig. 1 feel authored; the bands alone read a bit "template".
  - M 7: fine but long (≈7,000 px); hero figure small.
  - I 7: draw-your-line, 3D, print hover, highlighter; good.
  - K 6: no clear "hire me" action in the hero; intro line is weak.
  - A 9: axe clean, focus visible, alt text.
  - P 9: LH 97.
- Decision: baseline, tagged `best`.

## iter-01 · Hero CTA: one clear 'Start a project →' under the intro
- Hypothesis: hiring visitors had no obvious next step above the fold; one ink button plus a quiet 'or see the work ↓' raises copy/CTA clarity without the banned two-big-buttons hero.
- Change: src/pages/index.astro hero-foot gets .who-cta.
- Verify: build/check/unit/21 e2e pass; no console errors or overflow; LH 97/100/100/100; axe 0.
- Critique: K 6→7 (clear action). At 1440 the CTA sits just below the first fold because Fig. 1 is tall: note for a later hierarchy iteration. No other category moved.
- Scores: H7 T7 C7 S6 D7 M7 I7 K7 A9 P9 = 73.
- Decision: KEPT.
