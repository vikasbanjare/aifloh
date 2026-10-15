# AI-Floh site: master build guide for Claude Code

Owner: Vikas Banjare ("Bubu"). Studio: AI-Floh. Version 1.0, 15 Oct 2026.
This is the single source of truth for building the site. Read all of it before writing code.

## 0. How to use this file

1. Put this file in the repo root as SITE-BUILD.md. Put the Claude Design export in /design.
2. Work one step at a time (Section 4). Start with: "Read SITE-BUILD.md fully. Do Step 1 and stop. Report against its Done-when list." Every step ends with something Vikas can open in a browser.
3. When two sources disagree: (a) Section 1 and Section 13 beat everything; (b) this file decides behavior, data, performance and structure; (c) /design decides how things look (tokens, layout, components). If /design has no page for something, build it from the same tokens and components and label the pull request "LAYOUT DRAFT".
4. Never invent a fact. Use a visible STAND-IN label and list it in /STAND-INS.md.
5. Ask Vikas only when blocked by a [CONFIRM] item (full list in Section 16). Otherwise decide and add one line to /DECISIONS.md.
6. Vikas works in Claude Code on the web with no local folder. Everything must be testable through CI and a deployed preview URL.

## 1. Hard rules (never break; tests are in Sections 13 and 14)

PRIVACY
- No cookies, localStorage, sessionStorage, IndexedDB, fingerprinting, session replay, ad pixels or tag managers. UI state lives in memory only and resets on reload.
- Self-host everything the browser loads: fonts, Three.js, images, posters, scripts. The only third-party requests a page may make are to the analytics host and, on submit, the email provider. Embeds load only after a click (click-to-load placeholder).
- Call GitHub at build time only. The browser never calls GitHub or any other API.
- Never send free text, email addresses, names or handles to analytics.

PUBLIC-SAFE REPO
- Assume this repo is public. It must never contain secrets, tokens, client names, employer material, unpublished drafts or the block list.
- Nothing is published unless its manifest says publish: true.
- A BLOCKLIST secret (comma-separated strings, held as a CI secret, never in the repo) makes the build fail if any listed string appears in any generated HTML, JSON, XML or image text.
- Work made for an employer or a client is excluded unless approval.status is "approved" with who and when. Employer-linked repos and skills are never auto-listed.

HONESTY
- Use only supplied facts. No invented clients, logos, metrics, testimonials, awards, prices or dates.
- Every stand-in is visibly labelled STAND-IN until real content replaces it.
- Never claim "first", "only" or "never seen before". A novelty note says what is the same and what differs.
- Prompts, skills and tools show a tested stamp (tool, version, date). After 90 days it turns into a visible "may need tweaks" state.

QUALITY
- Mobile first at 390 px, then 1440 px. WCAG 2.2 AA. Keyboard works everywhere. prefers-reduced-motion is respected.
- Content pages work without JavaScript (progressive enhancement). Only games and the 3D hero need it.
- Works inside Instagram, Facebook, X and LinkedIn in-app browsers: no dependence on downloads, a clear "Open in your browser" path.
- Budgets in Section 14.

BANNED PATTERNS
Editing-suite or timeline skins, contact sheets with grease marks, infinite canvas, OS or desktop simulation, AI-chat UI, bento grid, floating gradient orbs, glassmorphism, glowing brain visuals, sparkle icons, chat bubbles, "scroll to explore", custom cursors, preloader screens, marquees, scroll hijacking, parallax text.
Words to avoid in copy: crafting, elevate, seamless, leverage, passionate, "in today's world", "AI-powered", "next-gen", "cutting-edge". Keep em dashes rare.

## 2. Facts, traffic and voice

FACTS (use only these)
- Studio: AI-Floh, founded by Vikas Banjare ("Bubu"), Mumbai, India [CONFIRM city shown publicly].
- Two pillars: Studio (done-for-you creative: AI video, motion, design) and Automate (built-for-you workflows and tools).
- Verticals: finance/fintech, edtech, medical/health [CONFIRM finance stays public].
- 8 years and 1000+ projects across video production, motion graphics, brand design, UI/UX and content strategy.
- Products are named "[Product Name] by AI-Floh".
- Tools he built: CutPilot and Pulse (Premiere Pro plugins), ContentIntel (pre-publish checker for creators, own site contentintel.in [CONFIRM it should be linked]).
- Locked hero headline, verbatim: "We keep the craft. We automate the grind." The first full stop uses color A, the second color B. [REMOVE this line if the site is not AI-Floh]
- Handles: @[handle] placeholders on LinkedIn, Instagram, Threads, X, Facebook, YouTube. GitHub: vikasbanjare. Behance: behance.net/vikas-banjare.
- Current employer or role: [CONFIRM what to show]. Default: leave it out.
- Color A means "made by hand". Color B means "AI or automated". The meaning is fixed on every page, tag, receipt and game. Both colors come from the Claude Design tokens.

TRAFFIC REALITY
Visitors arrive from posts on LinkedIn, Instagram, Threads, X, Facebook and YouTube, mostly on phones, often inside an in-app browser, often because a post said "type the word". Job 1: get them to one free resource fast. Job 2: be the company site for a creative-automation studio. Job 3: show the founder's range.

VOICE
Warm, lightly casual, human. It must not read as AI-written. First person (Vikas) on Free, Lab, Play, Code and About; "we" on Studio and Automate. Plain words, short sentences. Write 3 options for every headline except the locked one and let Vikas pick.

## 3. Site map

Navigation on every page: Free (always visible and highlighted, also on mobile), Work, Tools, Play, Studio, About, Let's talk, plus a search icon. The Play link stays hidden until /play exists.
Footer: Library, Lab, Code, Skills, Prompts (image, video), the six social links, GitHub, the privacy line, email capture.

| Route | What it is | Data | Step |
|---|---|---|---|
| / | Home: Craft Stack hero, Free this week, Inside, Studio/Automate, selected work, proof, follow, closing CTA | all | 5, 11 |
| /free | Free hub: one-column ledger of everything you can take | resources | 3 |
| /free/[slug] | Resource page | resources | 3 |
| /[word] | Code-word page: static redirect to /free/[slug] | resources | 3 |
| /prompts/image, /prompts/video | Pre-filtered views of /free | resources | 3 |
| /skills | Pre-filtered view of /free: Claude skills | resources (GitHub) | 8 |
| /code | GitHub section, built at build time | repos | 8 |
| /tools, /tools/[slug] | Software he built (video, image, plugins, apps) | tools | 9 |
| /work, /work/[slug] | Pieces and the video library: Watch, Peel, Record | work | 9 |
| /lab, /lab/[slug] | Experiments, including failed ones | experiments | 9 |
| /library | Everything in one searchable list | all | 9 |
| /studio, /about, /contact | Company pages | markdown | 10 |
| /play, /play/[game] | Mini-games | games | 12 |
| /privacy | Plain-language privacy notice | markdown | 4 |
| /404 | Code-word box plus "did you mean" | resources | 3 |

Reserved words (never a slug or code word): free, prompts, skills, library, work, lab, tools, code, play, studio, about, contact, privacy, 404, files, og, story, assets, search, admin, api, sitemap, robots.

## 4. Build steps

Each step: Do, Done when, Needs from Vikas. Do not start the next step before the Done-when list passes. Deploy after every step from Step 6 on.

### Step 0: Set up (Vikas, about 15 minutes)
- Do: create the GitHub repo aifloh-site. Commit this file as SITE-BUILD.md. Commit the Claude Design export under /design. Decide the hosting path (Section 15): A GitHub Pages or B Cloudflare.
- Done when: the repo exists with both files and a Claude Code session is open on it.

### Step 1: Scaffold and tokens
- Do: Astro static output (version pinned), TypeScript, no UI framework. Scripts: dev, build, preview, check, test, new:resource, new:tool, new:experiment, new:work. Env: SITE_URL, BASE_PATH (default /), DEPLOY_TARGET (github-pages or cloudflare), ANALYTICS_TOOL (plausible, umami or none), ANALYTICS_SRC, ANALYTICS_DOMAIN. Port the /design tokens to CSS variables. Self-host fonts (add a Devanagari face if the design has none, and list it in DECISIONS.md). Base layout, nav, footer, skip link, focus styles, reduced-motion defaults. One helper href() used for every internal link so a preview under a sub-path works.
- Done when: npm run build passes; two empty pages render with BASE_PATH=/ and BASE_PATH=/aifloh-site/; accessibility score 95 or more on the shell.

### Step 2: Content model and gates
- Do: schemas and loaders (Section 5), npm run check, the new:* scaffolders, and the build gates from Section 1 (publish flag, approval, BLOCKLIST, slug and code-word rules, reserved words, remote images). Stand-in content, all labelled: 8 resources across the six types, 2 tools, 2 experiments, 3 work items, 4 game rounds.
- Done when: npm run check passes on the stand-ins and fails with a clear message for each of: duplicate code word, reserved word, bad slug, missing approval, BLOCKLIST hit, remote image.

### Step 3: Free hub (the page social posts link to)
- Do: Section 8 in full: /free, /free/[slug], /prompts/image, /prompts/video, code-word pages, /404 with suggestions, filter sentence, tested stamps, in-app mode, Copy first, share cards.
- Done when: the Section 8 acceptance list passes.

### Step 4: Tracking and privacy
- Do: Section 13 in full: the shim, data-track markup on every Step 3 element, the footer line, /privacy (marked DRAFT), UTM handling, query stripping.
- Done when: Section 13 tests 1 to 7 pass.

### Step 5: Home with the static Craft Stack
- Do: Section 7 Home sections with the static exploded-view hero, "Free this week" (latest 3), and "Inside" (live counts).
- Done when: Home works with JavaScript off; the poster is the LCP; Section 14 budgets pass.

### Step 6: CI and preview
- Do: the Section 15 workflow (check, build, deploy). Preview URL on the chosen host.
- Done when: the preview URL works. Vikas tests on an iPhone and an Android phone inside the Instagram and LinkedIn in-app browsers. Results go in /QA.md.

### Step 7: Go live on the domain (Vikas, about 30 minutes plus DNS wait)
- Do: follow Section 15 (domain steps) for the chosen path. Then start posting with UTM links (Section 13).
- Done when: https://DOMAIN shows Home; www redirects; HTTPS is enforced; one code-word URL works; the analytics dashboard shows one test visit.

### Step 8: GitHub as a content source
- Do: Section 9 in full: sources.yml, fetch script, /code, /skills, skill zips, repo cards.
- Needs from Vikas: the opt-in list for content/sources.yml (use the private publish inventory, never this file), and a README plus aifloh.yml in each listed repo.
- Done when: the Section 9 acceptance list passes.

### Step 9: Tools, Work, Lab, Library
- Do: Sections 10 and 11: /tools (with ContentIntel), /work (video library, Watch and Record, Peel v1), /lab, /library with static search.
- Done when: every route in Section 3 for this step renders from manifests; search works offline of any service; Section 14 gates pass.

### Step 10: Studio, About, Contact
- Studio: the two pillars, three verticals, how we work in 4 steps, tools we built (link to /tools), CTA studio-talk. Facts only, no client logos.
- About: first person; 8 years and 1000+ projects; what he posts and why; the A and B idea in one paragraph; links to Behance, GitHub and the six socials; CTA about-talk. [CONFIRM] role line.
- Contact: mailto link plus an outbound booking link (UTM tagged); no form until Step 14.
- Done when: all three render with real or STAND-IN-labelled copy and 3 headline options each, awaiting Vikas's pick.

### Step 11: 3D Craft Stack
- Do: Section 7, 3D build. Needs the six layer images from Vikas (content/hero/layers.json). If they are not ready, keep the static hero and skip this step; do not block later steps.
- Done when: the 3D budget, probe, fallbacks and Hero Mode event all pass.

### Step 12: Play
- Do: Section 12: /play and the four games.
- Done when: every game passes the Section 12 rules, and each works with the stand-in rounds.

### Step 13: Polish
- Do: Peel v2 (synced layer videos), Record timecoded notes, prompt anatomy toggle (colored underline of subject, style, camera, light inside a prompt), dual-script captions on video pieces (Roman and Devanagari).
- Done when: each feature has a still fallback and respects reduced motion.

### Step 14: Backend items and the move to Cloudflare if needed
- Do: email capture through a provider API behind a serverless function (confirmed-success events, consent timestamp, notice version), analytics proxy, contact form if wanted. Move hosting to Path B if GitHub Pages cannot do it (Section 15).
- Done when: Email Signup fires only on confirmed success; test 3 and test 7 still pass; the notice is updated and reviewed.

### Step 15: Launch checklist and routine
- Launch: all tests in Sections 13 and 14 green; /STAND-INS.md empty or knowingly accepted; every [CONFIRM] resolved; privacy notice reviewed by a qualified person; OG images checked in a share debugger.
- Weekly routine: add a resource (npm run new:resource), tag the post link with UTMs, check the analytics, retest anything older than 90 days.


## 5. Content model

Everything on the site is an item in a manifest: a markdown file with frontmatter or a JSON file under /content, or an item fetched from GitHub at build time (Section 9). One schema per kind, validated with zod by npm run check.

```
COMMON (every item)
slug        /^[a-z0-9-]{1,40}$/, unique within its kind, not a reserved word
kind        resource | tool | experiment | work | repo | game
title       string            titleHi?  Devanagari line, optional
summary     string, max 140 characters
status      live | beta | private-beta | in-development | archived
date        ISO date          tags  string[]      tools  string[] (models and software, plain names)
publish     boolean, default false. Nothing renders unless true
standIn     boolean. true renders a STAND-IN label
approval    { status: own | approved | pending, by?, on? }   pending never publishes
source      { type: local } or { type: github, repo: "owner/name", path? }
links       { post?, repo?, demo?, site? }   cover? { src, alt, w, h }
receipt?    { tool, attempts?, time?, cost?, failed?, worked? }
tested?     { on, tool, version }            version?  changelog?

RESOURCE (free to take)
type        prompt-image | prompt-video | skill | template | cheat-sheet | guide
codeWord    /^[a-z0-9-]{3,24}$/, unique, not reserved
body        the text to copy       files? each at most 10 MB (larger goes to external storage)
openInClaude boolean, allowed only when body is under 2000 characters
related     slugs                  sourcePost? url
prompt-image  { prompt, negative?, model, aspect, outputs[] }
prompt-video  { prompt: { en, zh? }, shots?[{ n, seconds, camera, action, audio }], model, aspect, seconds, refs?[], outputs[] }
skill         { skillPath, installNote }   zip is built from the skill folder

TOOL         category video | image | audio | writing | automation | plugin | app
             cta open | download | beta | talk | none, url?, platforms[], screenshots[] (real, labelled), howItWorks[3]
EXPERIMENT   question, result worked | partly | failed | ongoing, body with fixed sections
WORK         type video | image | design, media (file under 3 MB or an external id),
             layers?[] (for Peel), shots?[] (for Record), vertical?
REPO         repo "owner/name", group tool | experiment | skills | site, builtWith?, fetched fields (Section 9)
GAME         rounds file path (Section 12)
```

Checks (npm run check fails the build with a plain message):
- slug and code-word rules; no code word equals a slug of another resource; reserved words refused.
- publish false items never render. approval pending never renders. Client or employer work needs approval.status approved.
- openInClaude with a body of 2000 characters or more is refused.
- tested date in the future is refused. Missing alt text is refused. Remote image URLs are refused.
- Counts used on Home ("Inside") come only from items that pass these checks.

## 6. Motion language (animation style)

Principles
1. Motion explains who made what (color A by hand, color B automated) or what changed. It is never decoration.
2. One featured motion per screen. Everything else is quiet.
3. Every state has a still version that is complete on its own.
4. Enter with ease-standard, leave with ease-exit and a shorter time. No bounce, no overshoot, no elastic.

Tokens (CSS variables, one file)
--dur-fast 120ms, --dur-base 200ms, --dur-slow 360ms, --ease-standard cubic-bezier(0.2, 0, 0, 1), --ease-exit cubic-bezier(0.4, 0, 1, 1).
Animate transform and opacity only. The two exceptions are the ledger row expanding (grid-template-rows from 0fr to 1fr) and the A or B wipe (clip-path).

Signature motions
- Stamp: tested stamps and the "Copied" confirmation press in (scale 1.06 to 1, opacity 0 to 1, fast). Once per action.
- Expand in place: a ledger row opens where it is. Its content fades in after the height settles.
- Peel: layers slide apart along a depth axis, each tagged A or B. Hero and Work pages only.
- Merge: the layers collapse into the locked headline at the end of the hero scroll.
- Reveal: a game answer reveals with the A or B color wipe (200 ms clip-path). No confetti, no fireworks.

Component motion (anything not listed changes instantly)

| Element | Motion | Time | Reduced motion |
|---|---|---|---|
| Buttons and links | Press: scale 0.98 and back. Pointer devices also get an underline or color shift on hover, never as the only cue | 120 ms | color change only |
| Copy button | The label swaps to "Copied" with the Stamp, then back after 1.6 s | 200 ms | label swap only |
| Ledger row | Expand in place | 200 to 360 ms | instant |
| Filter sentence | The ledger cross-fades (opacity only) when a filter changes. Rows never fly in | 200 ms | instant |
| Tested stamp | Stamps in the first time the row is seen, once per page load | 200 ms | static |
| Page change | None. Normal navigation, no wipe. A same-document view transition is allowed for the ledger only, and everything must work without it | 0 | none |
| Errors and notices | Appear in place, no slide. Errors stay until fixed | 120 ms | instant |
| Video cards | Poster only. The video loads on tap. No hover autoplay | n/a | n/a |
| Game reveal | The A or B wipe | 200 ms | instant swap |

Forbidden: custom cursors, cursor trails, preloader screens, marquees, scroll hijacking or smooth-scroll libraries, parallax text, hover-only interactions (touch has no hover), autoplaying audio, any loop longer than 3 s outside the hero, page-transition wipes.

Rules
- Native scroll only. Scroll-linked motion lives in the Home hero only.
- prefers-reduced-motion: no scroll-linked motion, no camera drift, the stack is static, state changes are instant or a one-frame opacity change.
- CSS first, then the Web Animations API. GSAP is allowed only inside the hero island and only if CSS cannot do the job.
- CSS scroll-driven animations are an enhancement only (Chrome and Safari 26 support them, Firefox is preview only as of the Oct 2026 notes; recheck caniuse at build time). The non-animated layout must be complete. Same-document view transitions work in all three engines; cross-document ones do not in Firefox, so do not depend on them.
- At most 2 animations run at once outside the hero. Pause everything that is off-screen or in a hidden tab.
- Sound: none by default. If a game adds sound it is muted until the visitor taps unmute. Web Audio needs a user gesture, and iPhone ignores the media element volume property, so use a gain node.

## 7. Home and the 3D hero (the Craft Stack)

Home sections, in order
1. Hero: the Craft Stack (below). The locked headline appears when the layers merge.
2. Free this week: the latest 3 resources, linking to /free. This is the bridge for direct visitors.
3. Inside: one list, not a grid. Rows with live counts computed at build: Free resources, Image prompts, Video prompts, Skills, Tools, Experiments, Videos, Games, Repos. Each row links to its page. A row with 0 published items is hidden.
4. Studio / Automate: two panels, same A and B color meaning.
5. Selected work: 3 slots linking to /work (STAND-IN until real).
6. Proof line: "8 years. 1000+ projects." Facts only: no logos, no testimonials.
7. Follow: the six platforms.
8. Closing CTA: Let's talk (CTA id home-talk) plus email capture (labelled NEEDS BACKEND until Step 14).

The Craft Stack
- One finished piece is built from 6 thin layers: sketch, comp, AI render, motion, grade, sound. At rest the stack is assembled and reads as the finished frame. On scroll (and pointer tilt on desktop) the layers separate in depth, the camera drifts, and each layer gets a small tag saying who made it: color A "by hand" or color B "AI or automated", for example "AI render, 14 attempts" or "resized x14, automated". At the end of the scroll the layers merge into the locked headline.
- Material: thin paper or film, soft shadow, light depth blur by distance. No glass, no glow, no orbs.
- Layers are 6 images (WebP or AVIF, at most 250 KB each, 1024 px on the long edge) read from content/hero/layers.json as { id, label, madeBy: A or B, tag, src, alt }. Replacing an image never needs a code change. Until real art exists they are generated procedurally and labelled STAND-IN.
- Step 5 ships a static exploded view of the same stack as the hero. Step 11 adds the 3D.
- 3D build: Three.js self-hosted, version pinned, tree-shaken, loaded after first paint and only when the hero is in view and the device passes the probe. Textured planes only, no heavy models. Render on demand (when scroll or pointer changes), not in a constant loop. devicePixelRatio capped at 2. Pause when off-screen or the tab is hidden. Total 3D payload under 2 MB.
- Probe: after 30 frames, if the median frame time is above 28 ms, switch to the static stack (mode static-low-power).
- Fall back to the static stack for prefers-reduced-motion (static-reduced-motion) and for no WebGL (static-no-webgl).
- The poster image is the LCP element. The page works fully without the 3D.
- Fire the Hero Mode event once per load with mode 3d, static-reduced-motion, static-no-webgl or static-low-power.

## 8. Free hub, prompts and skills (the funnel)

/free is the page social links land on. Clean, fast, no WebGL, no heavy video, readable at 390 px.

Top: a one-line promise and the code-word box: "Got a word from a post? Type it." Typing a word jumps to that resource. Every post ends with one word, and the word is also the URL (domain/word).

Body: a single-column ledger, never a card grid. Row = number, title (optional Devanagari line under it), one line on what you get, a type tag, the tested stamp, and the primary action on the row itself (Copy, Open or Download). Tapping a row expands it in place.

Filter as one sentence: "I want to [make a thumbnail] with [any tool]". The task options come from the manifest (that value is the intent property); the tool slot filters by tools. Event: Filter Used.

Tested stamp on every row: "Tested 15 Oct 2026 · Claude Design · v1.2". After 90 days: "Last tested 112 days ago, may need tweaks". Computed in the browser from the date. No storage.

Types and views: prompt-image, prompt-video, skill, template, cheat-sheet, guide. Pre-filtered pages: /prompts/image, /prompts/video, /skills. Ledger shows 24 rows, then a "Show 24 more" button (no infinite scroll).

Email: one soft ask after the first copy or download, never before. Everything works without it. Until Step 14 the ask is a clearly labelled stand-in (NEEDS BACKEND).

In-app browser mode
Detect from the user agent (tokens: Instagram, FBAN or FBAV, LinkedInApp, Twitter or X). In that mode hide Download, show Copy first, and show the banner "Open in your browser" with a "Copy page link" button. Always keep a quiet "Having trouble? Open in browser" link on resource pages, because detection can fail. Until Step 14 the "Email me the file link" option is a stand-in; "Copy page link" is the working path.

Resource page /free/[slug]
1. What you get, in one sentence, with a preview of the output.
2. The thing itself. Copy first (for text), with a fallback if the Clipboard API fails (select-all text area). "Open in Claude with this prompt" only when the prompt is under about 2,000 characters; show the exact text that will be sent. The link is https://claude.ai/new?q= plus the URL-encoded prompt. This form is undocumented: verify it before launch and remove the button if it stops working. Then Download (hidden in in-app mode).
3. How it was made: a five-line receipt panel (tool or model, attempts, time, what failed, what finally worked).
4. Tested stamp, version, one-line changelog.
5. From the post: a link to the social post it came from, plus the six follow links.
6. Next: three related resources, then one soft line, "Want this done for you?" (CTA id resource-studio).

Prompt resources
- Image prompts show the prompt, negative prompt, model, aspect ratio and labelled outputs.
- Video prompts show the shot list (shot, seconds, camera, action, audio), model, aspect, seconds, references, and the clip (click to play). If the prompt is bilingual (English and Chinese), show one tab per language with its own Copy button.
- Each prompt resource has its receipt: attempts, what failed, what finally worked.

Skill resources
- Row and page show: skill name, a "Use it when" line (from the SKILL.md description), file count and size, tested stamp (product and date), Copy skill text (primary), Download .zip, an install note that links to Anthropic's current skills documentation (do not hardcode menu steps), and an optional "how I built it" receipt.
- Before publishing any skill, scan its text for employer or client names and personal data. The BLOCKLIST gate runs on the zip contents too.

Share cards
Generated at build for every resource: 1200x630 and 1080x1920, each with the title, the code word and the tested stamp. Use satori and resvg (no browser). Output public/og/[slug].png and public/story/[slug].png.

Code words
Manifest codeWord, unique, /^[a-z0-9-]{3,24}$/, not reserved. The build writes /[word]/index.html: a static noindex page that redirects to /free/[slug] with JavaScript (location.replace, keeping the query string and adding vanity UTMs when none exist, see Section 13) plus a meta-refresh fallback inside noscript. Exclude these pages from the sitemap. /404 shows the code-word box and suggests close matches (edit distance up to 2) from the manifest.

Acceptance (Step 3)
1. 8 stand-in rows across the six types.
2. Each code-word URL lands on its resource with its query string intact.
3. A wrong word shows suggestions.
4. In-app mode works with the user agent spoofed for Instagram, LinkedIn, Facebook and X.
5. The stale state appears when tested is more than 90 days old.
6. Copy works on iOS Safari and Android Chrome, with the fallback when the Clipboard API is blocked.
7. /free transfers under 150 KB before images, with JavaScript under 60 KB gzip.
8. Every row is keyboard operable.


## 9. GitHub as a content source, and the Code section

Why: Vikas builds in GitHub. The site reads what he already wrote there and shows it well, so adding a skill, tool or experiment means adding a folder, not editing the site.

Limits
- Build time only (CI). The browser never calls GitHub. No GitHub avatars, badges or hotlinked README images.
- Opt-in only. Only repos and folders listed in content/sources.yml with publish: true are fetched. Never "all repos". A repo is never listed because it exists.
- Public repos by default. A private repo needs allowPrivate: true in sources.yml plus a read-only fine-grained token (GH_READ_TOKEN, scoped to those repos, stored as a CI secret). Its card shows only the name, the summary and "Private. Available on request." (no README, no stats). Anything an item deliberately publishes, such as a skill zip, reaches the built site but never git history.
- Fetched Markdown is untrusted. Sanitize it (no script, iframe, form, style or on* attributes), add rel="noopener noreferrer" to links, and drop remote images (download and self-host them at build, or omit them).
- Fail the build if a listed item disappears, if the BLOCKLIST hits, or if more than 20% of items vanish between runs. Never publish an empty section silently. Keep the last good snapshot in the CI cache.

content/sources.yml
```
owner: vikasbanjare
items:
  - repo: owner/name
    path: optional/sub/folder     # a folder inside a repo, for example one skill per folder
    group: tool | experiment | skills | site
    publish: true
    allowPrivate: false
    note: why it is listed (internal)
```

Metadata each source provides: aifloh.yml at the repo or folder root (falls back to the GitHub description and topics)
kind, title, titleHi?, summary, status, tags, tools, date, tested { on, tool, version }, version, codeWord?, cover?, links { post, demo, site }, builtWith?, question? and result? (experiments only, result is worked, partly, failed or ongoing), publish: true.
Skills also carry SKILL.md frontmatter (name, description). Use the description as the "Use it when" line.

What the fetch step does (scripts/fetch-github.ts, runs before the build)
1. For each item, call the GitHub REST API: repo metadata (description, topics, language, languages, pushed_at, default_branch, license, archived, visibility, homepage), the README, aifloh.yml and SKILL.md. Use ETag conditional requests. Read default_branch from the API; never assume "main".
2. Render the README to sanitized HTML. Keep about 600 characters as the card excerpt and the full text for the page.
3. For skills, build [slug].zip from the skill folder into public/files/skills/. Check the packaging format in Anthropic's current skills documentation first and link to the official install steps instead of copying them.
4. Write .generated/github.json (git-ignored). Never commit generated output.
5. Rebuild daily (cron) and on manual dispatch.

Code page (/code)
- Grouped by tool, experiment, skills, site. Repo card: name, one-line purpose, status, language bar (inline SVG from the languages API), last push date, topics, "built with" if set, README excerpt, buttons Read the README and Open the repo (Repo Click event).
- Optional: a weekly commit sparkline from the stats API (retry on 202, omit if unavailable). No third-party chart services.
- A private repo card appears only with allowPrivate and shows no README or live data: "Private. Available on request."
- Two ways people read "video repo": the video library (Section 11) and the GitHub repo that holds the Premiere tools. Both exist: the repo appears on /code and on its tool pages, and the videos live in /work.

Acceptance (Step 8)
1. With two items listed, only those two render.
2. A repo that is not in sources.yml never appears.
3. A private repo without allowPrivate fails the build.
4. A README containing a script, a remote image and an iframe renders safely and makes no third-party request.
5. A BLOCKLIST hit fails the build.
6. The network tab on /code shows zero requests to github.com or githubusercontent.com.
7. No fetch to GitHub happens in the browser.

## 10. Tools (software he built) and the ContentIntel connection

/tools lists software. Skills live on /skills. Categories: video, image, audio, writing, automation, plugin, app, with a category filter.

Card: name ("[Product] by AI-Floh" where it applies), one line, category tag, status chip, platform (for example Premiere Pro, web), a real screenshot (STAND-IN until supplied), and one primary action by status: open, download, join beta, talk, or "Not public yet".
Page /tools/[slug]: what it does (3 lines), who it is for, how it works (3 steps), requirements, status and version, changelog, FAQ, a link to its repo if public (Repo Click), and "Want this built for your team?" (CTA id tool-talk).
No performance claims, numbers or user counts unless Vikas supplies a source.

Seeds (all [CONFIRM] before publishing)
- CutPilot: Premiere Pro extension for podcast and multi-camera editing. A browser caption editor also carries this name [CONFIRM: one product or two].
- Pulse by AI-Floh: Premiere Pro plugin for silence removal, captions, multi-camera and motion graphics templates.
- ContentIntel: pre-publish checker that grades a script, thumbnail, title and ad copy. Own site: contentintel.in.
- Small thumbnail and image utilities and the prompt tools, each only if Vikas approves it.

ContentIntel connection
- ContentIntel stays its own site and app. Do not embed it, copy its code, proxy its API or store its keys in this repo.
- This site gets a card and /tools/contentintel with a clear outbound button (Tool Click, slug contentintel). The outbound URL carries utm_source=aifloh&utm_medium=tools&utm_campaign=contentintel. Check in CI that the link loads over HTTPS before publishing.
- Name it "ContentIntel by AI-Floh" only if Vikas confirms.
- It keeps its own design. Here it appears in this site's tokens, with a real screenshot.
- Outside this repo: add an AI-Floh link back from contentintel.in.

## 11. Work, Lab, video library and Library search

Work (/work, /work/[slug])
- Index: filter by type (video, image, design), tool, vertical, year. A grid is allowed here because it is the showcase, but not a bento grid: equal tiles at a fixed ratio.
- Piece page, three parts in one page: Watch, Peel, Record.
  - Watch: the piece. Videos under 3 MB are self-hosted (muted, playsinline, poster first, click to play). Longer videos use click-to-load YouTube on the youtube-nocookie.com domain, loaded only after the click; the privacy notice says so. Event: Video Play.
  - Peel v1: the layers of the piece as toggles (cuts, captions, graphics, grade, sound). Each toggle shows or hides that layer's image or short loop. Not frame-synced. Hide the section when no layers are supplied.
  - Peel v2 (Step 13): frame-synced layer videos under one master clock (requestVideoFrameCallback where available, otherwise timeupdate). Up to 5 layers, 10 to 30 s clips, each under 1.5 MB. Tap to start, because many in-app browsers block autoplay.
  - Record: the production receipt. Five lines (tool or model, attempts, time, what failed, what finally worked), plus optional timecoded decision notes per shot and a by-hand or generated flag per shot, in colors A and B.
  - Credits, related pieces, and "Want this done for you?" (CTA id work-talk).
- Video library: /work filtered to type video. Every video entry carries: title, platform links, tools and models, the prompts used (link to the prompt resource if it is shareable), attempts, time, cost if known, version, date.
- Employer or client work appears only with approval.status approved. Otherwise show own experiments.

Lab (/lab, /lab/[slug])
- Experiments, including failures. Page sections: Question, What I tried, What happened (receipt), What I would do next, Try it (links to the prompt, skill or repo).
- Result chip: worked, partly, failed, ongoing. Failed experiments stay visible. That is the trust signal.
- Source: markdown in content/lab or a GitHub folder (Section 9).

Library (/library)
- Everything published in one searchable ledger across all kinds, with filters for kind, tool and year, and counts. Same row design as /free.
- Search is a static index built at build time (Pagefind or equivalent), loaded only when the search box is focused. No external service. Event: Site Search with result only, never the query.

## 12. Play (mini-games)

Goal: fun, fast, shareable and honest. Each game teaches one thing about AI and creative craft, using Vikas's real work. It is not a 3D world: game-like 3D worlds are a crowded award-site family.

Rules for every game
- Starts only after a tap on Play (lazy-loaded; nothing loads on page open). JS under 100 KB gzip per game. No external requests. No sound by default.
- One-thumb on a 390 px phone. Also keyboard and screen-reader playable: real buttons, labelled, results announced.
- No accounts, no stored scores, no leaderboards (no backend, no personal data). State lives in memory.
- Results are shareable through the URL fragment, read client-side only. The analytics tool must never store the fragment.
- Rounds come from content/play/[game].json. Placeholder rounds are labelled STAND-IN.
- Friendly tone. Never mock a wrong answer.
- Events: Game Start, Game Complete, Game Share (property game).

Games (game values: keeper, attempts, hand-or-machine, prompt-fix)
1. keeper, "Pick the keeper". 5 briefs, 3 to 6 AI variants each (labelled). The visitor picks one. Reveal: Vikas's pick, a one-line reason, how many attempts it took. End: "You matched Vikas on 3 of 5". Needs 5 to 10 briefs with licences, his pick and reason.
2. attempts, "How many tries?". 6 finished AI renders. The visitor guesses the attempts with a slider. Reveal: the real count and what failed. Score by closeness.
3. hand-or-machine, "Hand or machine?". 8 production steps shown as before and after. The visitor taps color A (by hand) or color B (automated). Reveal with the A or B wipe. Needs real pairs.
4. prompt-fix, "Fix the prompt". A broken prompt and its failed output. Pick 1 of 3 edits. Reveal what each edit produced, then link to the resource it came from.
Later (not now): dead-air drop, a silence-cut waveform toy using precomputed amplitude JSON.

Novelty note: "which one is AI" quizzes already exist. What differs here is that every answer is Vikas's own pick or production record. Do not claim it is the first.


## 13. Tracking and privacy

Goal: know how many people come, from which platform, and which links they click, using counts only. Never individual people.

Rules: Section 1 (privacy) applies in full. One config constant (ANALYTICS_TOOL) selects Plausible or Umami. Load its script once, deferred, and call it only through its documented JS API. Switching tools must be a one-file change. Plausible custom properties need its Business plan, and a recorded property value cannot be deleted on its own, which is why the allowlist below is enforced in code.

SHIM (src/lib/track.ts)
- One delegated click listener on document for [data-track]. The event name comes from data-track, properties from data-track-* attributes. Count the click, not clipboard success.
- Property allowlist, anything else dropped silently: slug (matches /^[a-z0-9-]{1,40}$/ and exists in a manifest), platform (linkedin|instagram|threads|x|facebook|youtube), location (home|free|resource|footer), id (nav-talk|home-talk|home-studio|resource-studio|work-talk|tool-talk|studio-talk|about-talk), intent (a filter option in a manifest), app (instagram|facebook|x|linkedin), result (match|no-match), mode (3d|static-reduced-motion|static-no-webgl|static-low-power), game (keeper|attempts|hand-or-machine|prompt-fix).
- track(name, props) does nothing if the script is blocked, never throws and never delays the click. Event names live in one constants file, at most 50 characters each.
- Before the analytics script loads, remove every query parameter except utm_source, utm_medium, utm_campaign and utm_content (history.replaceState), so click IDs such as fbclid or igshid are never seen. Configure the tool so the URL fragment is never stored (game share links use fragments).

EVENTS
- From markup (data-track): Resource Copy (slug), Resource Download (slug), Open In Claude (slug), Filter Used (intent), Open In Browser Click (app), Follow Click (platform), CTA Click (id), Source Chip (platform), Tool Click (slug), Repo Click (slug), Video Play (slug), Game Start (game), Game Share (game).
- From code: Email Signup (location) and Email Link Requested (slug), both only on confirmed success; Code Word Search (result, plus slug when matched, never the typed text); Site Search (result only); Hero Mode (mode, once per load); In-App Browser (app, once per load, from the user agent); Game Complete (game).
- Source Chip: after the first copy, a one-tap row "Where did you see this?" with the six platform chips and no text field. It fills the gap left by missing referrers.

LINKS AND UTMs
- Posting scheme (Vikas): ?utm_source=linkedin&utm_medium=post&utm_campaign=[resource-slug]&utm_content=carousel
  - utm_source: linkedin | instagram | threads | x | facebook | youtube | email
  - utm_medium: bio | post | comment | reply | dm | description | story | newsletter
  - utm_campaign: the resource slug ("hub" for bio links)
  - utm_content: reel | carousel | text | video
  - Everything lowercase.
- Keep those four through every redirect. A code-word visit without UTMs gets utm_source=vanity&utm_medium=code-word&utm_campaign=[word], only for words in the manifest.
- Outbound links to Vikas's other properties add utm_source=aifloh&utm_medium=tools&utm_campaign=[slug].

PRIVACY UI
- Footer line on every page: "Anonymous visit counts. No cookies." linking to /privacy. If acceptance test 1 finds any cookie, change this line and the notice before launch.
- Email form: one plain line next to the button: "Your email is used only to send the file link and new drops. Unsubscribe anytime. Privacy notice." States: default, sending, success, error, unsubscribed. Save the consent timestamp and notice version with the subscriber if the provider allows.
- No cookie banner by default. Keep one small notice variant, hidden, in case it is needed later.
- Embeds load only after a click.
- /privacy sections: what we count (list the events), what we never collect, email, DM tools (comment-to-DM tools keep subscriber data on their own servers), video playback (YouTube may set cookies after you press play), GitHub (data is fetched at build time, not by your browser), outbound links, how to ask for deletion or withdraw consent, contact, last updated and version. Mark all of it "DRAFT, not legally reviewed" until a qualified person reviews it.
- Add <meta name="referrer" content="strict-origin-when-cross-origin"> because static hosts cannot always set the header. Best effort: a Content-Security-Policy meta tag allowing only 'self', the analytics host and the email endpoint, with frame-src limited to youtube-nocookie.com. If inline scripts make it impractical, skip it and rely on tests 2 and 6.

ACCEPTANCE TESTS (report each result)
1. DevTools, Application tab: zero cookies and zero localStorage, sessionStorage or IndexedDB entries created by the site. If the host sets any, list them in the notice.
2. Network tab: requests only to the site, the analytics host and, on submit, the email provider. None to github.com, githubusercontent.com, font hosts or CDNs.
3. Fire each event once. The dashboard shows only the event name and allowed properties; stored page URLs have no query string beyond the four utm_* parameters and no fragment.
4. With uBlock Origin or Brave Shields on, the whole site works.
5. Open a UTM-tagged link from Instagram's and LinkedIn's in-app browsers on a phone. The UTMs arrive.
6. View source: no third-party pixels, no tag manager.
7. Read the privacy page next to the shim. Every claim matches the code, including Hero Mode and In-App Browser.
Later: proxy the analytics script through a subdomain of the site. Plausible documents a self-setup proxy (Cloudflare Worker, Vercel rewrite, Netlify redirect or reverse proxy); Umami documents an ad-blocker bypass. GitHub Pages alone cannot do this.

## 14. Performance, accessibility, SEO and quality gates

Budgets (mid-range Android, 4G)
- /free and /free/[slug]: LCP under 2.5 s, JavaScript under 60 KB gzip, no layout shift from late fonts (preload the one text face, font-display swap, size-adjust).
- Home before 3D: the poster is the LCP, total JavaScript under 80 KB gzip. The 3D island is lazy, Three.js tree-shaken, total 3D payload under 2 MB, devicePixelRatio at most 2.
- Each game island under 100 KB gzip, loaded on tap only.
- Images: AVIF or WebP with width and height; lazy below the fold; none over 250 KB except the hero poster (under 150 KB).
- Fonts: self-hosted WOFF2, subset (Latin plus Devanagari for the Hindi lines), at most 2 families.

Accessibility: WCAG 2.2 AA. Skip link, visible focus, 24 px minimum targets, checked contrast, semantic landmarks, lang="hi" on Devanagari text, alt text on every image, captions or transcripts for speech in video, nothing that needs motion to be understood, no time limits in games.

SEO: unique title and description per page, canonical URL, Open Graph and Twitter card per page, sitemap.xml (excluding code-word pages), robots.txt, minimal JSON-LD (Organization and WebSite). Code-word pages are noindex.

CI gates: content check, typecheck, build, link check (internal links, outbound HEAD requests), Lighthouse CI on mobile (performance 90 or more on /free, accessibility 95 or more everywhere), axe or pa11y on key pages, and Playwright flows for: code word, filter, copy, in-app mode (spoofed user agent), stale stamp, 404 suggestions, and the tracking shim (events, allowlist, no storage).

Manual device check before each go-live: iPhone Safari, Android Chrome, the Instagram and LinkedIn in-app browsers, desktop Chrome, Firefox and Safari. Record results in /QA.md.

## 15. Repo, stack, deploy and domain (GitHub first, domain last)

Stack: Astro (static output, version pinned), TypeScript, zod, vanilla JavaScript islands, Three.js (hero only), Pagefind (search), satori and resvg-js (share cards), sharp (images), markdown-it and sanitize-html (fetched Markdown). Replace a library only with a written reason in DECISIONS.md.

Repo layout
```
aifloh-site/
  SITE-BUILD.md  CLAUDE.md  DECISIONS.md  STAND-INS.md  QA.md
  design/                  Claude Design export (source of truth for visuals)
  content/
    resources/  tools/  lab/  work/     manifests
    play/                               game rounds (json)
    hero/layers.json
    sources.yml                         GitHub opt-in list
    pages/                              studio, about, contact, privacy
  src/                     pages, components, layouts, lib/track.ts, lib/events.ts, styles/tokens.css
  scripts/                 check-content, fetch-github, make-cards, new-*
  public/                  fonts, files, og, story
  .github/workflows/deploy.yml
```
Branches: main is production. Work on feature branches through pull requests; CI runs on every pull request.

Workflow outline (.github/workflows/deploy.yml)
- Triggers: push to main, pull requests, a daily schedule, manual dispatch. Permissions: contents read, pages write, id-token write. One concurrency group so deploys never overlap.
- Build job: checkout, set up Node LTS with the npm cache, npm ci, npm run check, npm run fetch:github (GITHUB_TOKEN and, only if needed, GH_READ_TOKEN), npm run build with SITE_URL, BASE_PATH and BLOCKLIST from CI settings, then upload the dist folder with GitHub's Pages artifact action.
- Deploy job (not on pull requests): GitHub's official deploy-pages action. Use the current major version of each action.
- Secrets: BLOCKLIST, optionally GH_READ_TOKEN. Analytics settings are public, so they are plain variables, not secrets. Nothing secret ever goes in the repo.

Choosing the host (decide in Step 0)

| | Path A: GitHub Pages | Path B: Cloudflare |
|---|---|---|
| Fits Steps | 6 to 13 | any, required for Step 14 items |
| Cost | free | free tier |
| Repo | public on a free GitHub plan; private needs a paid plan | private is fine |
| DNS change at GoDaddy | add records only | move the nameservers to Cloudflare |
| Redirects and headers | static pages only, no server rules | _redirects and _headers supported (Cloudflare docs) |
| Server code (email success events, analytics proxy) | none | Workers or Functions |
| Catches | 1 GB site limit; 100 GB a month soft bandwidth; builds soft limit of 10 an hour (not for custom Actions workflows); GitHub says Pages is not for "a free web-hosting service to run your online business" or sites "primarily directed at facilitating commercial transactions" | an apex domain needs Cloudflare nameservers; Workers does not support domains whose nameservers are not on Cloudflare; email DNS records must be carried over |
Default: Path A for Steps 6 to 13. Move to Path B at Step 14, earlier if GitHub objects, or if the repo must be private. The build output is the same static folder either way (DEPLOY_TARGET only changes deploy settings).

Domain steps, Path A (Vikas)
1. GoDaddy: open the domain, then DNS. Screenshot or export every existing record first, so nothing (especially email) is lost.
2. GitHub, profile Settings, Pages, Add a domain. Copy the TXT instruction. In GoDaddy add a TXT record named _github-pages-challenge-vikasbanjare with the value GitHub shows. Wait (immediate to 24 hours), then click Verify. Keep this TXT record permanently. Verification covers immediate subdomains.
3. Repo, Settings, Pages: Source = GitHub Actions. Custom domain = the apex domain (for example aifloh.com) [CONFIRM domain]. With a custom Actions workflow no CNAME file is needed.
4. GoDaddy DNS, host "@": delete any existing A or AAAA records. Add four A records: 185.199.108.153, 185.199.109.153, 185.199.110.153, 185.199.111.153. Add four AAAA records: 2606:50c0:8000::153, 2606:50c0:8001::153, 2606:50c0:8002::153, 2606:50c0:8003::153. Host "www": CNAME to vikasbanjare.github.io (no repo name). Leave MX and other email records alone. Never use wildcard records.
5. Wait up to 24 hours for DNS. Then tick Enforce HTTPS in repo Settings, Pages (the option can take up to 24 hours to appear).
6. Test: the apex, www redirecting to the apex, HTTPS, one code-word URL, the 404 page.

Domain steps, Path B (Vikas)
1. Export every GoDaddy DNS record first.
2. Cloudflare: add the site on the free plan. Compare the records it imports with your export, especially MX and TXT.
3. GoDaddy: change the nameservers to the two Cloudflare names. Allow up to 72 hours.
4. Cloudflare: connect the GitHub repo using whichever product Cloudflare's current docs recommend for new static sites (Pages or Workers static assets). Build command npm run build, output dist. Add the apex and www as custom domains.
5. Test as in Path A.

Preview before the domain: Path A serves the project site at https://vikasbanjare.github.io/aifloh-site/, so the preview build uses BASE_PATH=/aifloh-site/ and the production build uses BASE_PATH=/. Absolute URLs (share cards, canonical, sitemap) come from SITE_URL.

## 16. What Vikas must supply

Decisions and accounts
- Domain name [CONFIRM aifloh.com] and GoDaddy access; GitHub account vikasbanjare; hosting path A or B; analytics tool (Plausible or Umami) and account; email provider (Step 14).
- Visibility choices: city public, finance vertical public, employer or role line, whether the locked headline stays, whether ContentIntel is linked and named "by AI-Floh", whether CutPilot is one product or two.
- Headline picks (3 options per page) and the Devanagari font choice.

Content (all optional until its step; stand-ins fill the gaps)
- Hero: six layer images (sketch, comp, AI render, motion, grade, sound) with attempts and time notes for the tags.
- Launch resources: 8 real ones across the six types, each with code word, tested stamp, receipt and preview.
- Tools: status, URL and a real screenshot for CutPilot, Pulse and ContentIntel.
- GitHub: content/sources.yml opt-in list; a README and aifloh.yml in each listed repo; a repo that holds the skills (one folder per skill with SKILL.md); the BLOCKLIST secret; optionally GH_READ_TOKEN.
- Work: pieces with approval details, receipts, and layer renders for Peel.
- Lab: experiments, including the failed ones.
- Play: 5 to 10 briefs with variants, his picks and reasons (keeper); 6 renders with attempt counts (attempts); 8 before and after pairs (hand-or-machine); 4 broken-prompt cases (prompt-fix).
- Social handles for the six platforms.

## 17. Honest limits

- "None found" is not proof that nothing similar exists. Text search under-indexes visual and interactive sites. Never claim novelty.
- Interface-only tricks get copied within days (editing-suite and contact-sheet skins are already sold as templates). What lasts is what only Vikas has: his receipts, picks, attempt counts and captions. Build around those.
- There is no audience evidence yet that these mechanics raise conversion. Measure first, then decide.
- Analytics will undercount: ad blockers, and in-app browsers that drop the referrer.
- The privacy notice is a draft and not legal advice. India's DPDP Rules were notified on 14 Nov 2025 with notice duties about 18 months later (secondary source). The EU's consent-free audience-measurement exemption was only proposed as of 12 Oct 2026. Have a qualified person review the notice before email capture goes live.
- Hosting limits and rules come from the GitHub and Cloudflare documentation read on 15 Oct 2026. Recheck before relying on them.
- The claude.ai/new?q= link form is undocumented and may change.

## 18. Optional CLAUDE.md (paste these lines into a CLAUDE.md at the repo root)

```
Read SITE-BUILD.md before any change. Its Section 1 (hard rules) and Section 13 (tracking and privacy) override everything else.
Work one step at a time and stop at each Done-when list.
Publish nothing without publish: true. Never add a cookie, a storage key, a third-party request or a secret.
Never invent facts; label stand-ins. Record decisions in DECISIONS.md.
```
