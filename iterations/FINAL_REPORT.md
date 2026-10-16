# aifloh.com: final report of the design iteration loop

Loop: 15 Oct 2026, 21:00 IST, to 16 Oct 2026, 08:30 IST. Branch `claude/new-session-skts1d`; every kept iteration was pushed and deployed to https://aifloh.com.
Winning iteration: **iter-37** (local tag `best`; git tags cannot be pushed through this environment's proxy, so `SCOREBOARD.md` is the durable record).

## Two halves of one night

1. **iter-00 to iter-26: the catalogue site.** The site was polished from **72 to 93**. The 93 is iter-24, re-measured with gzip the way GitHub Pages serves it.
2. **iter-27: brand-level change, on Vikas's direct request.** He asked for the site to feel like a movie: a premium 3D clay miniature room where scrolling plays his day. The home hero was rebuilt, the rubric restarted from a new baseline of **86**, and iterations 28 to 37 brought it to **93**.

| | H | T | C | S | D | M | I | K | A | P | Total |
|---|---|---|---|---|---|---|---|---|---|---|---|
| iter-00 (start) | 7 | 7 | 7 | 6 | 7 | 7 | 7 | 6 | 9 | 9 | **72** |
| iter-24 (best catalogue) | 9 | 9 | 9 | 9 | 9 | 9 | 10 | 9 | 10 | 10 | **93** |
| iter-27 (film baseline) | 8 | 9 | 8 | 8 | 9 | 8 | 9 | 8 | 10 | 9 | **86** |
| **iter-37 (final)** | 9 | 9 | 9 | 9 | 10 | 9 | 10 | 9 | 10 | 9 | **93** |

**Final measurements** (Lighthouse on mobile, served with gzip like GitHub Pages):
- Scores: performance 98, accessibility 100, best practices 100, SEO 100.
- LCP 2.3 s, TBT 60 ms, CLS 0.001.
- axe found 0 issues on `/` and `/free/` at both 390 and 1440 px.
- `verify.sh` passes: build, typecheck, unit tests and 21 end-to-end flows.

## Before and after

- Before (iter-00): `final/before-home-1440.jpg`, `final/before-home-375.jpg`
- After, the film as people see it: `final/after-film-frames-1440.jpg` and `final/after-film-frames-390.jpg`. The 1440 sheet shows 12:57, the 1:00 alarm, the walk, the edit and the closing room; the 390 sheet shows phone frames.
- After, the still version (reduced motion or no JavaScript, plus the rest of the page): `final/after-home-1440-still.jpg`, `final/after-home-375-still.jpg`

## Top 10 changes

1. **The film hero (iter-27).** It's a miniature clay bedroom built in Three.js, all in code with no downloaded models:
   - The story runs from 12:57 PM asleep, to the 1:00 PM alarm and curtains opening, to sitting up, stretching, walking to the desk, and editing a video with his IMPACT poster in the viewer.
   - The camera then pulls back to the room floating in the dark, and the headline lands as the title.
   - An on-screen clock ticks as you scroll.
   - Scrolling is native: a sticky stage inside a tall section, with no scroll hijacking.
   - Reduced motion, no JavaScript and slow devices get a still frame.
2. **Scroll animation was silently broken since the start (found in iter-19).** The minifier merged `animation-timeline` into the `animation` shorthand, which Chrome rejects, so no scroll-driven animation had ever run. Writing the properties out separately (longhands) fixed the row reveals and the margin thread.
3. **Tilt-shift depth of field (iter-31).** The shallow focus makes the room read as a real miniature. Desktop only.
4. **The alarm tap (iter-34).** Half asleep, he reaches out and the alarm stops. It's the beat that makes him a character.
5. **Work follows the film in one dark space (iter-36).** The strongest proof now comes first, with no colour break.
6. **Skip intro, and the film runs full-bleed under the nav (iter-30).** The film never stands between a recruiter and the work. A 66 px offset that pushed the controls off phone screens was also fixed.
7. **Reliable slow-device fallback (iter-27 follow-up).** The probe now also gives up when too few frames arrive, which fixed a page hang in Lighthouse's throttled-phone test. Shaders compile before the first frame.
8. **The intro plays only on arrival from outside (iter-24).** It no longer replays every time someone returns to home.
9. **The closing shot frames the title on dark (iter-32), and the film runs into the end card with no seam (iter-33).** Tone mapping darkens the background, so the page was matched to the rendered colour.
10. **Catalogue polish (iter-07 to iter-22):**
    - Hero actions sit beside the figure on wide screens.
    - Swipeable work wall on phones.
    - Live code-word confirmation.
    - Visible focus on dark backgrounds.
    - Inlined CSS: LCP went from 2.5 s to 2.3 s.
    - Poster-size room titles on phones.
    - True-lime full stops.

## Rejected ideas

- **iter-02:** tighter hero rhythm. It broke the 3D canvas sizing.
- **iter-06:** removing the margin thread. No gain.
- **iter-08:** three Free rows on phones. It saved only 163 px.
- **iter-18:** 2×2 process steps on tablet. Tied the best score.
- **iter-20:** dropping the Tools plate. The section lost its only product shot.
- **iter-23:** one Free item of each type. Better, but tied at the rubric ceiling; the patch is in BACKLOG #6.
- **iter-26:** a shorter intro. No LCP change. It led to finding that the local server lacked gzip.
- **iter-29:** sunbeams through the window. They read as glass panels, not light.
- **Before the room (not scored):**
  - A cartoon mascot pair. Vikas called it laughable.
  - A trailer cut from his work images. He picked it, then replaced it with the room brief.

## Remaining issues and owner-only items

- **The character is stylised clay, not photorealistic.** A realistic, animated "you" needs a rigged model: for example, Higgsfield's generate_3d from his photo plus rigging. That uses credits, and Vikas has not approved it.
- **The room's slow-device fallback is the still poster.** Mid-range phones that fail the probe see a still image, not the film.
- **His photo is only 230 px.** A larger portrait would help /about.
- **Naming question:** "Pulse" vs "CutPilot Caption Studio" in Tools.
- **New Behance projects** have not been added.
- **Owner-only security items:**
  - Rotate the ContentIntel README key.
  - Add the BLOCKLIST secret in CI.
- **Old git history** still contains employer names. The current files are scrubbed, but history was not rewritten.
- **The `best` tag is local only**, because the proxy blocks tag pushes.
- **About six hours of loop time were lost.** The session's worker restarted around 01:00 IST and the 01:36 check-in was held until 07:22 IST. The loop resumed for the last hour.
- **Backlog items still open:** #6 (Free range), #7 (larger Tools plate), #9 (phone page length after the film), and calmer colour bands after the Work wall (from the iter-35 review).
