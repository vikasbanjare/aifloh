# Hero film: Google Flow prompts

**Goal:** replace the code-built clay room with a real, film-quality animation of the same story. Scrolling plays the video frame by frame, so it must be one continuous shot with no hard cuts. Vikas makes the clips in Google Flow; Claude turns them into the scroll-played hero.

## Step 0: two reference images (do these first)

Make these with Flow's image generator. Attach them to every clip as Ingredients so the character and room stay identical in every shot.

### A. Character reference (attach a clear, front-facing photo of yourself)

```
Character turnaround sheet of the young Indian man in the reference photo, rendered as a premium stylized 3D animated film character (Pixar / Disney feature quality, soft subsurface skin, realistic proportions, not cartoonish, not a caricature). Keep his face, hairstyle, skin tone and beard exactly like the photo. Outfit: plain off-white crew-neck T-shirt, charcoal grey joggers, white socks. Three views side by side: front, three-quarter, side. Neutral pose, relaxed expression. Plain warm grey studio background, soft even light. No text, no logos, no watermark.
```

### B. Room reference

```
Isometric cutaway miniature diorama of a small, tidy creator's bedroom, floating on a deep charcoal background, like a handmade clay and wood scale model photographed with a macro lens. Two walls and a thick floor slab with clean cut edges. Left side: low wooden bed with a cobalt blue blanket and white pillow, a small wooden bedside table with a black digital alarm clock, a cream lamp and a lime green mug. Three bold typographic posters framed on the left wall. A floating wooden shelf with a few colourful books. Right side: white desk under a window with soft curtains, one large monitor, keyboard, mouse, a small plant, and a lime green office chair. Light pale wood floor with an oval cream rug and a tall potted plant. Palette: warm off-white walls, pale wood, cobalt blue and lime green accents only. Soft global illumination, gentle contact shadows, shallow tilt-shift depth of field. Premium, calm, aesthetic. No people, no text, no logos, no watermark.
```

## No reference images? Use these

Ready-made references are in `iterations/flow-refs/`:
- **`ref-you-photo.jpg`:** your site portrait, enlarged. Use it as the face reference in Step 0A. A sharper selfie works even better.
- **`ref-room-wide.jpg`:** the current 3D room, as the layout reference for Step 0B.
- **`ref-bedside-closeup.jpg`:** the opening shot, as the reference for clip 1.

### Text-only character (no photo at all)

Use this as Step 0A. Generate it, pick the best result, then use that image as the character Ingredient in every clip.

```
Character turnaround sheet of one young South Asian man, mid-20s, slim build, warm medium-brown skin, short thick black hair swept up at the front, neat short beard, friendly calm face, as a premium stylized 3D animated film character (Pixar / Disney feature quality, soft subsurface skin, realistic proportions, not cartoonish). Outfit: plain off-white crew-neck T-shirt, charcoal grey joggers, white socks. Three views side by side: front, three-quarter, side. Neutral standing pose, relaxed expression. Plain warm grey studio background, soft even light. No text, no logos, no watermark.
```

### Text-only room

Use the Step 0B room prompt as it is; it needs no images. In Flow choose **Create image**, paste the prompt, and generate 4 options. Pick the one closest to `ref-room-wide.jpg` (bed on the left, desk under the window on the right) and keep using that one.

### Order in Flow

1. **Create image:** character (photo + prompt, or the text-only prompt). Save the best result.
2. **Create image:** room (prompt, optionally with `ref-room-wide.jpg` attached). Save the best result.
3. **Video, Ingredients:** attach both saved images, paste clip 1. For clip 2 onward use **Frames to Video** (first frame = last frame of the previous clip) and keep both images attached.

## Shared style line

Paste this at the end of every clip prompt:

```
Style: premium stylized 3D animated short film, Pixar-quality character animation, miniature diorama world with soft clay and wood textures, warm natural light, soft global illumination, gentle contact shadows, shallow tilt-shift depth of field, smooth slow camera, 24 fps cinematic motion, consistent character and room from the reference images. Palette warm off-white, pale wood, cobalt blue and lime green accents. No text, no subtitles, no logos, no watermark, no cuts, no scene change.
```

## Shot list

Six clips of 8 seconds each, about 48 seconds in total. Use **Frames to Video**: set each clip's first frame to the last frame of the previous clip so the whole film is one unbroken take. Use **Extend** if a clip needs more time.

**Clip 1. 12:57 PM, the bedside table** (first frame: none; Ingredients: room)
```
Extreme close-up macro shot of a black digital alarm clock on a small wooden bedside table, next to a lime green mug and a cream lamp glowing softly. The clock display glows soft green (digits slightly out of focus). Dim, quiet early-afternoon light leaking through closed curtains. The camera slowly dollies backward and rises, revealing the edge of a bed with a cobalt blue blanket. Peaceful, sleepy mood. [shared style line]
```

**Clip 2. He sleeps; the alarm starts** (first frame: last frame of clip 1; Ingredients: character, room)
```
Continuing the same shot: the camera keeps pulling back to reveal the young man from the reference fast asleep on his back in the bed, cobalt blue blanket up to his chest, face relaxed, chest slowly rising and falling. On the bedside table the alarm clock begins to blink and gently vibrate. His eyebrows twitch. Slow, smooth camera drift toward the bed. [shared style line]
```

**Clip 3. He taps the alarm, sits up, stretches** (first frame: last frame of clip 2; Ingredients: character, room)
```
Continuing the same shot: half asleep, he reaches his arm out from under the blanket and taps the alarm clock, which stops blinking. A beat. Then he sits up slowly, pushes the blanket down to his legs and stretches both arms high above his head with a big yawn. The curtains on the right drift open and warm 1 PM sunlight fills the room. Natural, believable body mechanics, weight and timing. Camera holds a medium-wide angle, drifting slightly. [shared style line]
```

**Clip 4. Out of bed, the walk to the desk** (first frame: last frame of clip 3; Ingredients: character, room)
```
Continuing the same shot: he swings his legs off the bed, sits on the edge for a second, rubs his eyes, stands up and walks across the room in socks to the white desk under the sunny window. Relaxed, slightly sleepy walk with natural weight shift. The camera slowly trucks right and rises to follow him, keeping him in a three-quarter view. [shared style line]
```

**Clip 5. He sits and starts editing** (first frame: last frame of clip 4; Ingredients: character, room)
```
Continuing the same shot: he pulls out the lime green chair, sits down, and the large monitor wakes up showing a dark video-editing timeline with colourful clips in cobalt blue and lime green and a bright poster frame in the preview window. He leans in, focused, hands on the keyboard and mouse, typing and scrubbing. The monitor's glow lights his face. The camera slowly moves to an over-the-shoulder view of the screen. [shared style line]
```

**Clip 6. The pull back: a room in the dark** (first frame: last frame of clip 5; Ingredients: room)
```
Continuing the same shot: the camera slowly pulls back and rises in one smooth move, past the desk, up and out of the room, until the whole bedroom is revealed as a small isometric miniature diorama box floating in a deep charcoal void, the tiny figure still working at his desk in a pool of warm sunlight. The room sits slightly right of centre, with empty dark space on the left. Hold the final frame steady for the last two seconds. [shared style line]
```

## Settings and delivery

- **Model:** the highest-quality Veo model available in Flow, at **1080p** (or 4K if offered).
- **Aspect:** make the full set at **16:9** for desktop. If you can, also make a **9:16** set for phones by re-running the same clips with 9:16 selected. One 16:9 set is enough to start; I can crop a phone version.
- **Audio:** not needed. The hero plays silently, so turn sound off or ignore it.
- **Consistency checks before you accept a clip:**
  - Same face, hair, T-shirt and joggers.
  - Same room layout: the bed stays left and the desk right.
  - No extra people.
  - No text or watermark.
  - The last frame matches the next clip's first frame.
- **Clock and screen text:** AI video garbles digits, so blurred or glowing clock digits are fine. The site's on-screen clock (12:57 to 1:14 PM) stays as a crisp overlay on top of the video.
- **Send me:** the six clips (or one stitched MP4), at the highest export quality Flow gives you.

## What I'll do with them

1. Stitch the clips. I'll encode them so every frame is a keyframe, which lets scrolling scrub smoothly forwards and backwards. Each file stays a few MB, with separate desktop and phone versions.
2. Scrolling drives the video's playhead, using the same tall sticky stage that exists now. The clock and captions stay as crisp overlays.
3. The first frame becomes the poster and the main image the browser paints first. Reduced-motion and no-JS visitors get a still frame. The video is self-hosted, with no third-party player.
4. The current clay room stays as a fallback until the video is in and verified.
