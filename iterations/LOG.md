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

## iter-08 · Phones: 3 free picks instead of 5
- Hypothesis: fewer free rows on phones reach the gallery a screen sooner.
- Result: page 7,331 → 7,168 px (-2%); a real resource hidden for little gain.
- Critique: no category moves a full point. Rejected; mobile length needs a structural fix, not trimming rows.
- Scores: H8 T8 C8 S7 D7 M7 I7 K8 A9 P9 = 78.
- Decision: REJECTED.

## iter-09 · Phones: the gallery becomes a swipeable row
- Hypothesis: six full-width prints stacked on phones cost ~2,600 px; a scroll-snap row (user-controlled, never auto-moving, not a marquee) keeps the prints big and cuts the page.
- Change: Wall.astro below 40rem: grid-auto-flow column, 78% wide prints, mandatory snap, 'Swipe the wall →' hint; tablets/desktop unchanged.
- Verify: all checks pass; LH 96/100/100/100 (perf within run-to-run noise; LCP 2.3→2.5 s); axe 0; no horizontal page overflow (the row scrolls inside itself).
- Critique: M 7→8: home is 22% shorter on phones and the peeking second print makes the gesture obvious.
- Scores: H8 T8 C8 S7 D7 M8 I7 K8 A9 P9 = 79.
- Decision: KEPT.

## iter-10 · Phones: Studio cards size to content
- Hypothesis: 15rem min-height left ~120 px of empty space above the Studio titles on phones.
- Change: .side min-height 9rem on phones, 15rem from 48rem.
- Verify: all checks pass; LH 96/100/100/100; axe 0. Phone home 5,685 → 5,493 px.
- Critique: S 7→8: with About (iter-04) and these cards, the remaining rooms now sit on a consistent rhythm at all three widths.
- Scores: H8 T8 C8 S8 D7 M8 I7 K8 A9 P9 = 80.
- Decision: KEPT.

## Step-back review after iter-10
- Best 80 vs iter-00 72. Kept: hero CTA (01), paper Studio cards (03), About balance (04), poster titles (05), side-column hero on wide screens (07), swipe gallery on phones (09), compact phone cards (10). Rejected: tighter hero rhythm (02), removing the thread (06), fewer free rows (08).
- Drift check: palette, logo and copy unchanged; one new line of UI copy ("Swipe the wall →", "Start a project", "or see the work") — all functional labels. No new dependencies. The page got calmer, not busier.
- Lowest scores now: D 7 (distinctiveness), I 7 (motion), A 9, P 9. Next iterations should target distinctiveness and interaction quality, without adding ornament.

## iter-11 · Tape on each gallery print
- Hypothesis: a lime-tinted strip of tape on each print makes the gallery 'hung by hand' (brand: lime = hand), a physical detail a template would not have.
- Change: Wall.astro .print a::before tape (clip-path torn ends, per-print angle and offset).
- Verify: all checks pass; LH 96/100/100/100; axe 0 (decorative pseudo-element only).
- Critique: D 7→8; subtle, consistent with the paper/prints idea; no clutter added to type or layout.
- Scores: H8 T8 C8 S8 D8 M8 I7 K8 A9 P9 = 81.
- Decision: KEPT.

## iter-12 · Live code-word confirmation while typing
- Hypothesis: visitors arriving from a post need to know the word is right before submitting; a live '✓ <resource>' plus a lime Go is purposeful interaction for the site's main job.
- Change: CodeWordBox: polite live region shows the matching resource on exact match; field and Go button switch to the lime 'hand' state. Partial words stay silent (no chatty announcements).
- Verify: all checks pass incl. 21 e2e (code-word flows); LH 96/100/100/100; axe 0. Tested: 'deck' → nothing, 'decks' → '✓ Deck Director'.
- Critique: I 7→8; also helps K slightly (already 8).
- Scores: H8 T8 C8 S8 D8 M8 I8 K8 A9 P9 = 82.
- Decision: KEPT.

## iter-13 · Visible focus on the dark wall; numbers hidden from screen readers
- Hypothesis: cobalt focus rings were nearly invisible on the ink gallery, and every section heading was announced with its '( 0n )' prefix.
- Change: lime 3 px focus ring with offset on prints and controls inside the dark room; aria-hidden on the five '( 0n )' labels.
- Verify: all checks pass; LH 96/100/100/100; axe 0; keyboard-tabbed screenshot shows a clear lime ring on the first print.
- Critique: A 9→10 for this page: semantic headings, visible focus on every band (paper, lime, ink, cobalt), alt text, live regions polite.
- Scores: H8 T8 C8 S8 D8 M8 I8 K8 A10 P9 = 83.
- Decision: KEPT.

## iter-14 · Inline stylesheets to cut render-blocking CSS
- Hypothesis: the mobile LCP waits on render-blocking CSS requests; inlining (Astro inlineStylesheets: 'always') removes a round trip. Astro hashes the inline styles into the CSP.
- Change: astro.config.mjs build.inlineStylesheets 'auto' → 'always' (no dependency change).
- Verify: all checks pass; CSP: 0 violations on /, /free/, /tools/. Lighthouse twice before (96, 96; LCP 2.5) and twice after (98, 97; LCP 2.3). Home HTML 104 KB raw (~20 KB gzip).
- Critique: P 9→10: LH 97–98, LCP 2.3 s on emulated mid-range mobile, CLS 0.01, TBT ≈0.
- Scores: H8 T8 C8 S8 D8 M8 I8 K8 A10 P10 = 84.
- Decision: KEPT.

## iter-15 · Studio method as one numbered line: lime hand wobble, then square cobalt
The four chips became a four-step sequence with big numerals and the Studio page's own descriptions. The rule above the steps is the brand line itself: ink for Brief, a hand-drawn lime wobble for Sketch, straight cobalt for Make and Ship, ending in a machine node. 2x2 on phones, one row from 48rem. Copy reused verbatim from studio.astro. Perf dipped one point (98 to 97, LCP 2.3 to 2.4 s) from slightly more inlined CSS, within run-to-run noise. Step-back review (iter-15): the last five iterations were functional fixes plus one ornament (tape). The page reads calmer than iter-05; the risk now is the brand line appearing in too many places (margin thread, Fig. 1, steps, favicon). Next iterations should simplify rather than decorate: candidate is trimming the Tools room or the footer.
- Scores: H9 T8 C8 S8 D9 M8 I8 K9 A10 P9 = 86.
- Decision: KEPT.

## iter-16 · About me fills the empty sixth stats cell
Five stats left a hole in the 3-column grid (row 2, col 3) and the About me button floated alone below, with dead space under it. The link now closes the grid as an ink tile (label 'The person behind it' is a new UI label, not a fact; hover turns cobalt). dl uses display: contents so dt/dd and the link share one grid; axe clean. Phones: 2x3 grid, no full-width orphan. Lens: spacing and rhythm.
- Scores: H9 T8 C8 S9 D9 M8 I8 K9 A10 P9 = 87.
- Decision: KEPT.

## iter-17 · Poster-size section titles and aligned stat numbers on phones
Lens: mobile. Room titles were 44px on a 375 screen, so the poster rhythm of the desktop collapsed to ordinary headings; the clamp floor is now 3.75rem with a steeper slope (60px at 375, ~93px at 768, still 120px cap at 1440). Stat cells pack from the top so numbers sit on one line even when a label wraps to two (8+ beside 1000+). Watch item: 4-column steps at 768 are tight ('Make with AI' wraps); acceptable.
- Scores: H9 T8 C8 S9 D9 M9 I8 K9 A10 P9 = 88.
- Decision: KEPT.

## iter-18 · Steps 2x2 until 64rem (tablet)
Lens: would a top studio ship this. At 768 the four steps wrapped 'Make with AI' in narrow columns; 2x2 until 64rem aligns them under the two cards. Clearly tidier, but too small to move any rubric category, so the total ties best and the rule says revert. Added to BACKLOG to ride along with the next tablet-focused iteration.
- Scores: H9 T8 C8 S9 D9 M9 I8 K9 A10 P9 = 88.
- Decision: REJECTED.

## iter-19 · Scroll motion that actually runs: steps write on, rows rise, thread grows
Lens: motion and interaction. Building a write-on for the Studio steps showed animationName 'none'. Cause: the CSS minifier folds animation-timeline into the animation shorthand (e.g. 'animation: linear both row-in view()'), which Chrome rejects, so the whole declaration was dropped. Since iter-00 the catalogue row rise-in and the margin thread growth were silently static. Fix: longhands (name, timing, fill, duration auto, then timeline), which the minifier leaves alone. New: the four steps reveal left to right in sequence between cover 4% and 44% of their view timeline (hand half first, then machine). Verified with computed clip-path at four scroll positions, every row ends visible at page bottom, reduced-motion and no-support stay static. Screens use reducedMotion so full-page shots show the end state.
- Scores: H9 T8 C8 S9 D9 M9 I9 K9 A10 P9 = 89.
- Decision: KEPT.

## iter-20 · Step-back: drop the Tools plate (simplify)
Step-back review (iter-20). Drift check over iter-15..19: one ornament added (steps line), the rest were fixes; no over-decoration, but the brand line now shows in four places, so no more line motifs. Simplification tested: remove the 14rem ContentIntel plate from the Tools band so the index runs full width, like the Free band. It reads calmer but the band becomes text-only and the strongest proof (a real shipped tool) disappears; Distinctiveness -1, total 88, reverted. Kept separately (a correctness fix, not a design change): figure numbers ran 1, 4-9, 2, 3 down the page. They now run in reading order: Fig. 1 hero, Figs. 2-7 wall, Fig. 8 ContentIntel, Fig. 9 portrait. Backlog #7 stays open with a different idea (enlarge the plate rather than drop it).
- Scores: H9 T8 C8 S9 D8 M9 I9 K9 A10 P9 = 88.
- Decision: REJECTED.

## iter-21 · Mono labels 12 to 13 px on wide screens
Lens: typography (backlog #5). --t-label was a flat 12 px everywhere; mono caps at 12 px on a 1440 screen read as fine print beside 120 px titles. Now clamp(12px, 11px + 0.15vw, 13px): 12 px on phones (unchanged), 13 px from about 1280 px wide. Tools index meta column widened 8.5 to 11rem, status 6.5 to 7rem so 'Premiere Pro' / 'Private beta' keep one line; 'Your computer (Node.js)' still wraps to two, which reads fine.
- Scores: H9 T9 C8 S9 D9 M9 I9 K9 A10 P9 = 90.
- Decision: KEPT.

## iter-22 · Hand full stops in true lime, ink-outlined
Lens: colour and contrast. The full stops after 'craft', 'Studio.' and 'About.' used the text-safe hand green #3d5c00, which next to the lime highlighter and the bright cobalt stop read as a muddy olive, so the two-material idea (lime hand / cobalt machine) looked unequal. They are now the lime fill with a 0.035em ink outline (paint-order stroke fill), which holds on paper and pairs with the cobalt stop. Inside the lime room the stop stays ink with no outline. Palette unchanged: lime stays a fill, never text. The stop is a decorative glyph; no text contrast is affected (axe clean).
- Scores: H9 T9 C9 S9 D9 M9 I9 K9 A10 P9 = 91.
- Decision: KEPT.

## iter-23 · Free band shows one of each type
Lens: copy and CTA. The Free band listed five Claude skills in a row (newest first), so the range (image and video prompts, templates, cheat sheets) never showed. Tested: the newest of each type first, then fill by date. Result: Claude skill, Image prompt, Video prompt, Template, Cheat sheet. Reads better, but no category moves from 9 to 10, so it ties and the rule reverts it. Note: most categories now sit at 9, so single small fixes can no longer win alone; future iterations should bundle a backlog fix into a larger hypothesis or aim at a 10 (e.g. Distinctiveness, Performance). Patch kept in git stash and in BACKLOG #6.
- Scores: H9 T9 C9 S9 D9 M9 I9 K9 A10 P9 = 91.
- Decision: REJECTED.

## iter-24 · Intro plays only on arrival from outside the site
Lens: performance (aiming at P). Lighthouse LCP is the hero intro paragraph with 2.0 s render delay: the intro holds the hero rise animations until it ends. Removing the intro would undo a feature Vikas asked for, and making the text skip the fade only games the metric, so neither was done. Real fix found instead: the intro replayed on every return to home (Free -> logo -> intro again). The pre-paint script now skips it when document.referrer is this site's own origin. No storage, no cookie; reduced-motion still skips it; the CSP hash updates automatically (no console errors). Cold arrival unchanged. Scored on Interaction (9 -> 10: intro once, scroll motion now runs, draw tool, 3D on demand); Performance stays 9 because the cold LCP did not move.
- Scores: H9 T9 C9 S9 D9 M9 I10 K9 A10 P9 = 92.
- Decision: KEPT.

## iter-25 · Step-back review (no code change)
Looked at the whole phone page (iter-24, 5,836 px; iter-00 was 7,062 px) and the 1440 page as a sequence, not section by section.
- Drift: none toward decoration since iter-20. Changes since then were type size, colour of the stops, motion that was silently broken, and an intro that replayed. The brand line motif is at its limit (margin thread, Fig. 1, steps, favicon): no new line motifs.
- What still reads weakest: (1) the Free band repeats 'Claude skill' five times, so the range is invisible (iter-23 patch in stash); (2) the two STAND-IN tags in the Tools band look unfinished, but they are required labels (Section 1), so the fix is real content, not design; (3) the ContentIntel plate is small for the only product shot on the page (backlog #7).
- Scoring note: eight of ten categories are at 9. Single small fixes now tie and get reverted, which is correct per the rules. Next iterations bundle related fixes into one hypothesis or target a specific 10.
- Next (simplifies): iter-26 makes the Free band show the range (one row per type) and drops the now-redundant per-row repetition on phones.
- Decision: REVIEW (no score change, best stays iter-24 at 92).

## iter-26 · Shorter intro (1.4 s to 1.0 s) — no effect; measurement fixed instead
Hypothesis: the intro length caps LCP. Retimed the intro to 1.0 s; Lighthouse LCP stayed 2.4-2.5 s over three runs, so the intro was not the bottleneck. Reverted (the intro length is a feature Vikas asked for; no reason to cut it without a gain).
Root cause of the gap: the local test server (python http.server) sends HTML uncompressed (106 KB with inlined CSS). GitHub Pages gzips it (~25 KB). New tool iterations/tools/gzserve.py serves dist/ with gzip on :4332. Same build of best (iter-24): perf 99, LCP 2.0 s, TBT 0, CLS 0.013, twice in a row.
- Re-measurement, not a design change: best (iter-24) Performance re-scored 9 -> 10 on production-like serving, total 93. All later iterations are measured with gzserve.
- Scores (iter-26 itself): same as best before re-measure, 92. Decision: REJECTED (reverted).

## iter-27 · Film hero: a 3D clay miniature room (brand-level change, Vikas's direct request)
Not a scored loop iteration: Vikas asked mid-loop for the site to look like a movie with a premium 3D clay character and environment (a man asleep at 12:57 PM wakes at 1 PM and goes to edit video at his PC, with a visible clock while scrolling). Two earlier takes were dropped on his feedback before shipping: a cartoon mascot pair ("laughable"), and a trailer cut from work images (he picked it, then replaced it with the room brief). Built in code with Three.js: rounded clay geometry, PMREM room environment, soft sun shadows, GTAO ambient occlusion (desktop), ACES tone mapping; a jointed figure (pelvis, spine, head, shoulders, elbows, hips, knees) posed by key poses blended on scroll; clock face and editor screen are canvas textures. Frames checked at 1440x900 and 390x844 (SwiftShader), reduced-motion still frame checked, verify passes (build, typecheck, unit, 21 e2e). See DECISIONS.md for the rules relaxed and kept. Scoring resumes from this new baseline.

## iter-28 · Character: rounded joints, real hands, open eyes and a mouth
The figure read as segmented tubes: visible seams at elbows and knees, ball hands, tiny dot eyes. Added clay joint spheres at elbows and knees, mitten hands with a thumb, larger open eyes and a soft mouth. Checked at the bed-edge and stretch shots. Rule note (most reasonable reading, recorded here): Vikas directly asked for a premium, not-a-joke character, which the 10-point rubric does not measure finely; character-quality changes that drop no category are kept even when the total ties.
- Scores: H8 T9 C8 S8 D9 M8 I9 K8 A10 P9 = 86.
- Decision: KEPT.

## iter-29 · Sunbeams through the window after 1 PM
Additive gradient planes slanting from the window plus a sun patch on the floor. On the bright clay walls they read as hard-edged grey sheets crossing the desk shot rather than light, which cheapens the frame. Reverted. A better route if revisited: a cookie (window-shaped light pattern) through the shadow map, or a soft sun patch only.
- Scores: H8 T9 C8 S8 D9 M8 I9 K8 A10 P9 = 86.
- Decision: REJECTED.

## iter-30 · Step-back: Skip intro, and the film runs full-bleed under the nav
Step-back review (iter-30). Since the film went in, the risk is time: seven screens of scrolling stand between a recruiter and the work. Added a 'Skip intro' pill (streaming-player idiom, not 'scroll to explore') at bottom right while the film is live; it jumps to the end card (#start) and hides on the title card. Also found the film started 66 px down the page (the sticky glass header takes flow), so its bottom edge, the status line and the skip control sat below the fold on phones; the film now pulls up under the header (-66 px). Drift check: the film added one motif (the clock), no extra decoration elsewhere. Next: simplify the rooms below the film so the page after the film is shorter.
- Scores: H8 T9 C8 S9 D9 M8 I9 K9 A10 P9 = 88.
- Decision: KEPT.

## iter-31 · Tilt-shift depth of field: the room reads as a real miniature
Lens: distinctiveness. Added a BokehPass (desktop only, after GTAO) with focus locked each frame to the camera-to-subject distance, aperture 0.0016, max blur 0.006. The clock close-up gets a macro-lens falloff on the lamp and drawer; over-the-shoulder at the desk softens his head in the foreground; the wide end shot stays crisp. This is the visual cue that makes a 3D room read as a hand-made miniature. Phones keep the plain render (no AO, no DOF) for speed.
- Scores: H8 T9 C8 S9 D10 M8 I9 K9 A10 P9 = 89.
- Decision: KEPT.

## iter-32 · Closing shot frames the room right so the title sits on dark
Lens: colour and contrast. The closing wide shot centred the room, so the white headline sat over the cream floor slab. On wide screens the camera now pans along its right axis as it pulls back (up to 4.4 units by aspect), placing the room centre-right with the headline on the dark background; the final camera is further out so the whole box fits. Depth of field eases off in the wide shot so the room stays crisp, and focus uses the subject distance, not the shifted look point. Phones keep the centred framing (title already sits on dark below the room). Posters regenerated to match.
- Scores: H8 T9 C9 S9 D10 M8 I9 K9 A10 P9 = 90.
- Decision: KEPT.

## iter-33 · Film runs into the end card with no seam
Lens: would a top studio ship this. Where the film ended and the end card began there was a hard horizontal seam: ACES tone mapping renders the scene background (#1c1a1e) as #0e0c0f, and the lens vignette darkened the bottom further, while the end card used the raw #1c1a1e. The film, stage and end card now share the rendered colour (#0e0c0f, sampled from the poster), and the vignette only darkens the sides and the top, so the film flows straight into 'Vikas Banjare, or Bubu…'. A seam is a defect, not a taste call, so this is kept at a tied total.
- Scores: H8 T9 C9 S9 D10 M8 I9 K9 A10 P9 = 90.
- Decision: KEPT.

## iter-34 · Story beat: at 1:00 PM his hand reaches out and taps the alarm off
Lens: motion and story. Between the alarm and sitting up nothing happened to him; the clock rang by itself. Now, half asleep, his left arm swings out toward the bedside table (shoulder abducts and lifts, elbow loosens, head turns toward it) and the clock's blinking stops the moment the reach lands (ringing ends at p 0.284). One small human beat that makes him a character, not a mannequin.
- Scores: H8 T9 C9 S9 D10 M8 I10 K9 A10 P9 = 91.
- Decision: KEPT.

## iter-35 · Step-back review (no code change)
Since the film baseline (iter-27, 86) the best is 91: character joints and face (28), Skip intro and full-bleed stage (30), tilt-shift depth of field (31), closing shot framed for the title (32), no seam into the end card (33), the alarm tap (34). One rejection (sunbeams, 29).
- Drift: all recent changes live inside the film; nothing decorative was added to the rooms below. Good.
- What reads weakest now: the page after the film. It jumps from a dark cinematic room into the old lime catalogue band, then ink, paper, cobalt and paper again: five colour rooms after one dark film is a lot of switching. The film earned the right to be the one loud moment; the rest should get quieter.
- Next (simplifies): test giving the post-film rooms one calmer rhythm (fewer colour switches), and measure page length on phones after the film.
- Decision: REVIEW (best stays iter-34 at 91).
