// Scroll-scrubbed hero video: scroll progress drives video.currentTime (no autoplay, no sound).
// The file is encoded with a very short keyframe interval (scripts/encode-hero.sh) so seeking is instant
// in both directions. Self-hosted; paused off-screen; the poster stays until the first frame is ready.
export type Scrub = { dispose: () => void };

export function mountScrub(stage: HTMLElement, video: HTMLVideoElement, getProgress: () => number, onReady: () => void): Scrub {
  // H.264 where the browser has it (Safari, Chrome, Edge, Firefox), VP9 WebM otherwise; tall cut on portrait screens
  const h264 = video.canPlayType('video/mp4; codecs="avc1.640028"') !== '';
  const portrait = innerWidth / innerHeight < 0.8;
  const d = video.dataset;
  const pick = (mp4?: string, webm?: string) => (h264 ? mp4 : webm) ?? mp4 ?? webm;
  const src = (portrait && pick(d.tall, d.tallWebm)) || pick(d.wide, d.wideWebm)!;
  video.muted = true;
  video.playsInline = true;
  video.preload = 'auto';
  video.src = src;

  let raf = 0, visible = true, ready = false, shown = 0;
  const loop = () => {
    raf = 0;
    if (!ready || !visible) return;
    const d = video.duration || 0;
    // ease toward the scroll position so fast flicks still look like smooth motion
    const target = Math.min(d - 0.04, Math.max(0, getProgress() * d));
    shown += (target - shown) * 0.22;
    if (Math.abs(target - shown) < 0.004) shown = target;
    if (!video.seeking && Math.abs(video.currentTime - shown) > 1 / 60) video.currentTime = shown;
    raf = requestAnimationFrame(loop);
  };
  const start = () => { if (!raf) raf = requestAnimationFrame(loop); };

  const onMeta = async () => {
    // iOS only paints seeks after one play() call; play and pause at once, muted
    try { await video.play(); } catch { /* autoplay may be blocked: seeking still works */ }
    video.pause();
    shown = getProgress() * (video.duration || 0);
    video.currentTime = shown;
    ready = true;
    video.addEventListener('seeked', () => onReady(), { once: true });
    start();
  };
  video.addEventListener('loadedmetadata', onMeta, { once: true });

  const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting && !document.hidden; if (visible) start(); });
  io.observe(stage);
  const onVis = () => { visible = !document.hidden; if (visible) start(); };
  document.addEventListener('visibilitychange', onVis);

  return {
    dispose() {
      cancelAnimationFrame(raf);
      io.disconnect();
      document.removeEventListener('visibilitychange', onVis);
      video.removeAttribute('src');
      video.load();
    },
  };
}
