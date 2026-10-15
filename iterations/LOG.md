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

## iter-02 · Tighter hero rhythm so the CTA fits the first desktop screen
- Hypothesis: smaller gaps and a narrower Fig. 1 on desktop bring the CTA and code box into the first 900 px at 1440.
- Tried: margins 12→8 around status, figure and hero foot; first max-height on the SVG (broke the 3D canvas sizing contract), then max-width 66rem on the figure.
- Result: phones and tablets slightly tighter; at 1440 the CTA still lands just below 900 px, and the narrower figure no longer aligns with the right-aligned code box (new alignment flaw).
- Critique: marginal gain, new flaw. Not better than best.
- Scores: H7 T7 C7 S6 D7 M7 I7 K7 A9 P9 = 73.
- Decision: REJECTED.

## iter-03 · Studio cards become paper cards with a coloured top edge
- Hypothesis: solid lime and cobalt Studio blocks between the lime and cobalt bands cause colour fatigue; paper cards with a 10 px coloured top edge let the bands own the colour.
- Change: index.astro .side-a/.side-b -> paper, hard shadow, coloured top edge, cobalt headline on the Automate card.
- Verify: all checks pass; LH 97/100/100/100; axe 0; no overflow.
- Critique: C 7→8, the cobalt Tools band now reads as the colour event; cards still clearly two-sided. D unchanged.
- Scores: H7 T7 C8 S6 D7 M7 I7 K7 A9 P9 = 74.
- Decision: KEPT.

## iter-04 · About rebalance: bigger photo print, 3-column stats
- Hypothesis: the About room was lopsided (small print, thin 5-up stats strip, empty air); a 16rem print and a 3-column stats grid with bigger numbers balance it.
- Change: .maker 16rem column, centred; .me 16rem; stats 3 columns from 64rem, larger numerals.
- Verify: all checks pass; LH 97/100/100/100; axe 0.
- Critique: S 6→7. Leftover: the second stats row leaves one empty cell; photo source is only 230 px so it is slightly soft at 256 px (needs a bigger photo from Vikas).
- Scores: H7 T7 C8 S7 D7 M7 I7 K7 A9 P9 = 75.
- Decision: KEPT.

## iter-05 · Poster-size section titles
- Hypothesis: 'Free.' and 'Work.' were small next to full-bleed bands; display-scale titles give each room a poster entrance and a clearer type hierarchy.
- Change: .room-h clamp(2.75rem, 1rem + 6.4vw, 7.5rem), tighter tracking; the ( 0n ) label sits at the cap line.
- Verify: all checks pass; LH 97/100/100/100; axe 0.
- Critique: T 7→8 at desktop (scale contrast between titles, rows and labels); on phones the gain is small but no regressions.
- Scores: H7 T8 C8 S7 D7 M7 I7 K7 A9 P9 = 76.
- Decision: KEPT.

## Step-back review after iter-05
- Best 76 vs iter-00 72. Gains: hero CTA (K), paper Studio cards (C), About balance (S), poster titles (T).
- Drift check: palette, logo and core copy unchanged; no new dependencies. Changes were subtractive or structural, not decorative.
- Over-decoration candidate: the margin ledger thread (lime wobble in the left gutter) duplicates the hand→machine idea already carried by Fig. 1 and the colour bands. Next iteration simplifies by testing its removal.

## iter-06 · Simplify: remove the margin ledger thread
- Hypothesis (step-back simplification): the left-gutter thread is ornament duplicating Fig. 1.
- Tried: removed the .room::before/::after thread and nodes.
- Result: paper rooms marginally calmer, but the thread was faint and the page reads the same; it is also the only hand mark on the paper rooms below the hero.
- Critique: equal total, no category improved by a full point. Rule says only strictly better is kept.
- Scores: H7 T8 C8 S7 D7 M7 I7 K7 A9 P9 = 76.
- Decision: REJECTED.

## iter-07 · Hero actions beside Fig. 1 on wide screens
- Hypothesis: putting intro, CTA and code box in a 24rem column beside Fig. 1 (from 72rem) brings every hero action above the fold.
- Change: .hero becomes a 2-column grid on wide screens; headline and status span; handwritten note hidden in this layout (no room). Phones and tablets unchanged.
- Verify: all checks pass; LH 97/100/100/100; axe 0; 3D canvas sizes from the figure width, so it follows.
- Critique: H 7→8 and K 7→8: at 1440x900 the whole hero, both actions and the top of the lime Free band are visible. Small loss: the margin note no longer shows on desktop.
- Scores: H8 T8 C8 S7 D7 M7 I7 K8 A9 P9 = 78.
- Decision: KEPT.
