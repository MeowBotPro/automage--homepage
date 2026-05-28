import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * Tests if GSAP core is functional. Cached after first call.
 */
let _gsapOk: boolean | null = null;
function gsapReady(): boolean {
  if (_gsapOk !== null) return _gsapOk;
  try {
    const p = { x: 0 };
    gsap.set(p, { x: 1 });
    _gsapOk = p.x === 1;
  } catch {
    _gsapOk = false;
  }
  return _gsapOk;
}

/**
 * Safe wrapper around gsap.context that catches Turbopack compatibility errors.
 * When GSAP is entirely non-functional, skips the callback and resets
 * scope elements to visible (they may have opacity:0 from JSX initial state).
 */
function safeContext(callback: () => void | (() => void), scope?: Element | object) {
  if (!gsapReady()) {
    // GSAP broken — make scope elements visible
    if (scope instanceof Element) {
      scope.querySelectorAll('*').forEach((el) => {
        const htmlEl = el as HTMLElement;
        if (htmlEl.style?.opacity === '0') htmlEl.style.opacity = '1';
        if (htmlEl.style?.transform) htmlEl.style.transform = 'none';
      });
    }
    return { revert() {} } as gsap.Context;
  }

  try {
    return gsap.context(callback, scope);
  } catch {
    // gsap.context broken but core GSAP works — run callback directly
    let revertFn: (() => void) | void;
    try {
      revertFn = callback();
    } catch { /* ignore callback errors */ }
    return {
      revert() {
        try { revertFn?.(); } catch { /* ignore */ }
        try { gsap.killTweensOf('*'); } catch { /* ignore */ }
      },
    } as gsap.Context;
  }
}

/**
 * Animate an element along an SVG path using native SVG geometry APIs.
 * Replaces MotionPathPlugin which crashes in Turbopack dev mode.
 *
 * @param target - The element to animate (SVG or HTML)
 * @param pathEl - The SVG <path> element to follow
 * @param progress - Object with a `value` property (0-1) to drive the animation
 * @param opts - Optional alignment settings
 */
function motionPathTo(
  target: { x: number; y: number } | SVGElement,
  pathEl: SVGGeometryElement,
  progress: { value: number },
  opts?: { align?: boolean; offsetX?: number; offsetY?: number },
) {
  const totalLength = pathEl.getTotalLength();
  const svg = pathEl.ownerSVGElement;
  if (!svg) return;

  const ctm = pathEl.getCTM();
  const svgPoint = svg.createSVGPoint();

  function setTargetPosition(x: number, y: number) {
    if (target instanceof SVGElement) {
      target.setAttribute('cx', String(x));
      target.setAttribute('cy', String(y));
      return;
    }

    target.x = x;
    target.y = y;
  }

  function updatePosition() {
    const point = pathEl.getPointAtLength(progress.value * totalLength);
    if (ctm) {
      svgPoint.x = point.x;
      svgPoint.y = point.y;
      const screenPoint = svgPoint.matrixTransform(ctm);
      setTargetPosition(screenPoint.x + (opts?.offsetX ?? 0), screenPoint.y + (opts?.offsetY ?? 0));
    } else {
      setTargetPosition(point.x + (opts?.offsetX ?? 0), point.y + (opts?.offsetY ?? 0));
    }
  }

  return {
    update: updatePosition,
    length: totalLength,
  };
}

export { gsap, ScrollTrigger, safeContext, gsapReady, motionPathTo };
