import fs from 'node:fs/promises';
import path from 'node:path';

const APP_URL = process.env.TEST_URL || 'http://localhost:3000';
const DEBUG_URL = process.env.CHROME_DEBUG_URL || 'http://localhost:9222';
const REDUCED_MOTION = process.env.REDUCED_MOTION === '1';
const OUT_DIR = process.env.SCREENSHOT_DIR || '.workflow/.scratchpad';

function assertMetric(condition, message, details = {}) {
  if (condition) {
    console.log(`PASS ${message}`, JSON.stringify(details));
    return;
  }

  console.error(`FAIL ${message}`, JSON.stringify(details));
  throw new Error(message);
}

async function cdpRequest(endpoint, init) {
  const res = await fetch(`${DEBUG_URL}${endpoint}`, init);
  if (!res.ok) {
    throw new Error(`Chrome DevTools request failed: ${endpoint} ${res.status}`);
  }
  return res.json();
}

function createCdpClient(webSocketDebuggerUrl) {
  const socket = new WebSocket(webSocketDebuggerUrl);
  let id = 0;
  const pending = new Map();

  socket.addEventListener('message', (event) => {
    const payload = JSON.parse(event.data);
    if (!payload.id) return;
    const item = pending.get(payload.id);
    if (!item) return;
    pending.delete(payload.id);
    if (payload.error) {
      item.reject(new Error(payload.error.message));
      return;
    }
    item.resolve(payload.result);
  });

  const opened = new Promise((resolve, reject) => {
    socket.addEventListener('open', resolve, { once: true });
    socket.addEventListener('error', reject, { once: true });
  });

  return {
    async send(method, params = {}) {
      await opened;
      const messageId = ++id;
      const result = new Promise((resolve, reject) => {
        pending.set(messageId, { resolve, reject });
      });
      socket.send(JSON.stringify({ id: messageId, method, params }));
      return result;
    },
    close() {
      socket.close();
    },
  };
}

async function evaluate(client, expression, awaitPromise = false) {
  const result = await client.send('Runtime.evaluate', {
    expression,
    awaitPromise,
    returnByValue: true,
  });
  if (result.exceptionDetails) {
    throw new Error(result.exceptionDetails.text || 'Runtime evaluation failed');
  }
  return result.result.value;
}

async function screenshot(client, name, selector, viewport) {
  await evaluate(client, `(() => {
    const el = document.querySelector(${JSON.stringify(selector)});
    if (!el) return false;
    el.scrollIntoView({ behavior: 'instant', block: 'start' });
    return true;
  })()`);

  await new Promise((resolve) => setTimeout(resolve, 900));

  const rect = await evaluate(client, `(() => {
    const el = document.querySelector(${JSON.stringify(selector)});
    if (!el) return null;
    const rect = el.getBoundingClientRect();
    return {
      x: Math.max(0, rect.left + window.scrollX),
      y: Math.max(0, rect.top + window.scrollY),
      width: Math.min(window.innerWidth, rect.width),
      height: Math.min(window.innerHeight, rect.height),
      scale: 1,
    };
  })()`);

  const capture = await client.send('Page.captureScreenshot', {
    format: 'png',
    clip: rect && rect.width > 0 && rect.height > 0 ? rect : undefined,
    captureBeyondViewport: true,
  });
  const absolute = path.resolve(OUT_DIR, name);
  await fs.mkdir(path.dirname(absolute), { recursive: true });
  await fs.writeFile(absolute, Buffer.from(capture.data, 'base64'));
  console.log(`Screenshot ${viewport}: ${absolute}`);
  return absolute;
}

async function setViewport(client, width, height, mobile = false) {
  await client.send('Emulation.setDeviceMetricsOverride', {
    width,
    height,
    deviceScaleFactor: 1,
    mobile,
  });
}

async function main() {
  const target = await cdpRequest(`/json/new?${encodeURIComponent(APP_URL)}`, { method: 'PUT' });
  const client = createCdpClient(target.webSocketDebuggerUrl);

  try {
    await client.send('Page.enable');
    await client.send('Runtime.enable');
    await setViewport(client, 1440, 900, false);
    if (REDUCED_MOTION) {
      await client.send('Emulation.setEmulatedMedia', {
        features: [{ name: 'prefers-reduced-motion', value: 'reduce' }],
      });
    }

    await new Promise((resolve) => setTimeout(resolve, 2200));

    const desktop = await evaluate(client, `(() => {
      const ids = ['section-security', 'section-story', 'section-social', 'section-beta', 'section-faq'];
      const sections = Object.fromEntries(ids.map((id) => [id, document.getElementById(id)]));
      const missing = ids.filter((id) => !sections[id]);
      if (missing.length) return { error: 'missing sections', missing };

      const cssRgba = (el) => {
        const color = getComputedStyle(el).backgroundColor;
        const match = color.match(/rgba?\\((\\d+),\\s*(\\d+),\\s*(\\d+)(?:,\\s*([\\d.]+))?/);
        return match ? match.slice(1, 5).map((value, index) => (
          index === 3 ? Number(value ?? 1) : Number(value)
        )) : null;
      };
      const dark = sections['section-story'];
      dark.scrollIntoView({ behavior: 'instant', block: 'center' });
      const storyActs = Array.from(dark.querySelectorAll('.story-act'));
      const quoteCard = dark.querySelector('[data-story-quote-card]');
      const quoteText = dark.querySelector('[data-story-quote-text]');
      const videoShell = dark.querySelector('[data-story-video-shell]');
      const videoPlaceholder = dark.querySelector('[data-story-video-placeholder]');
      const playButton = dark.querySelector('[data-story-play-button]');
      const insightLine = dark.querySelector('[data-story-insight-line]');
      const insight = dark.querySelector('[data-story-insight]');
      const visible = (el) => {
        if (!el) return false;
        const rect = el.getBoundingClientRect();
        const style = getComputedStyle(el);
        return rect.width > 0 && rect.height > 0 && Number(style.opacity) > 0.01 && style.visibility !== 'hidden';
      };
      const rectSummary = (el) => {
        if (!el) return null;
        const rect = el.getBoundingClientRect();
        return {
          width: Math.round(rect.width),
          height: Math.round(rect.height),
          top: Math.round(rect.top),
          left: Math.round(rect.left),
          right: Math.round(rect.right),
        };
      };
      const isTextNode = (el) => el.getAttribute('aria-hidden') !== 'true' && el.textContent.trim().length > 0;
      const storyTextOk = Array.from(dark.querySelectorAll('h2, h3, p, span'))
        .filter(isTextNode)
        .every((el) => el.scrollWidth <= el.clientWidth + 2 && el.scrollHeight <= el.clientHeight + 2);
      const videoRect = rectSummary(videoShell);
      const placeholderRect = rectSummary(videoPlaceholder);
      const visibleCore = [quoteCard, quoteText, videoShell, videoPlaceholder, playButton, insightLine, insight]
        .filter(visible).length;

      const social = sections['section-social'];
      const socialBg = cssRgba(social);
      const cards = Array.from(social.querySelectorAll('[data-testimonial-card]'));
      const cardRgbs = cards.map(cssRgba);
      const cardTextOk = cards.every((card) => (
        Array.from(card.querySelectorAll('p, span, strong')).filter(isTextNode).every((el) => (
          el.scrollWidth <= el.clientWidth + 2 && el.scrollHeight <= el.clientHeight + 2
        ))
      ));

      const order = Object.fromEntries(ids.map((id) => [id, Math.round(sections[id].getBoundingClientRect().top + window.scrollY)]));
      return {
        order,
        orderOk: order['section-security'] < order['section-story']
          && order['section-story'] < order['section-social']
          && order['section-social'] < order['section-beta']
          && order['section-beta'] < order['section-faq'],
        darkBg: cssRgba(dark),
        storyActCount: storyActs.length,
        hasQuoteCard: Boolean(quoteCard),
        hasQuoteText: Boolean(quoteText),
        hasVideoShell: Boolean(videoShell),
        hasVideoPlaceholder: Boolean(videoPlaceholder),
        hasPlayButton: Boolean(playButton),
        hasInsightLine: Boolean(insightLine),
        hasInsight: Boolean(insight),
        videoRect,
        placeholderRect,
        storyTextOk,
        visibleCore,
        socialBg,
        cardCount: cards.length,
        cardRgbs,
        cardTextOk,
        horizontalOverflow: document.documentElement.scrollWidth - window.innerWidth,
      };
    })()`);

    if (desktop.error) throw new Error(`${desktop.error}: ${desktop.missing?.join(', ')}`);

    assertMetric(desktop.orderOk, 'DOM order follows dawn-break model', desktop.order);
    assertMetric(desktop.darkBg.slice(0, 3).every((v) => v < 35) && desktop.darkBg[3] >= 0.99, 'dark story section background RGB channels are < 35 and alpha is opaque', { darkBg: desktop.darkBg });
    assertMetric(desktop.storyActCount === 3, 'dark story section preserves exactly 3 original story acts', { storyActCount: desktop.storyActCount });
    assertMetric(desktop.hasQuoteCard && desktop.hasQuoteText, 'dark story section preserves original quote card and quote text', {
      hasQuoteCard: desktop.hasQuoteCard,
      hasQuoteText: desktop.hasQuoteText,
    });
    assertMetric(desktop.hasVideoShell && desktop.hasVideoPlaceholder && desktop.hasPlayButton, 'dark story section keeps video shell, placeholder, and play affordance', {
      hasVideoShell: desktop.hasVideoShell,
      hasVideoPlaceholder: desktop.hasVideoPlaceholder,
      hasPlayButton: desktop.hasPlayButton,
      videoRect: desktop.videoRect,
      placeholderRect: desktop.placeholderRect,
    });
    assertMetric(desktop.videoRect.width >= 720 && desktop.videoRect.height >= 360, 'desktop video placeholder has substantial review size', { videoRect: desktop.videoRect });
    assertMetric(desktop.hasInsightLine && desktop.hasInsight, 'dark story section preserves insight line and insight text', {
      hasInsightLine: desktop.hasInsightLine,
      hasInsight: desktop.hasInsight,
    });
    assertMetric(desktop.storyTextOk, 'dark story section text is not clipped on desktop', { storyTextOk: desktop.storyTextOk });
    assertMetric(desktop.socialBg.slice(0, 3).every((v) => v > 230), 'testimonial section background remains light', { socialBg: desktop.socialBg });
    assertMetric(desktop.cardCount === 3, 'testimonial section contains exactly 3 dark cards', { cardCount: desktop.cardCount });
    assertMetric(desktop.cardRgbs.every((rgb) => rgb && rgb.slice(0, 3).every((v) => v < 45)), 'each testimonial card RGB channel is < 45', { cardRgbs: desktop.cardRgbs });
    assertMetric(desktop.cardTextOk, 'testimonial card text is not clipped on desktop', { cardTextOk: desktop.cardTextOk });
    assertMetric(desktop.horizontalOverflow <= 1, 'desktop viewport has no horizontal overflow', { horizontalOverflow: desktop.horizontalOverflow });
    if (REDUCED_MOTION) {
      assertMetric(desktop.visibleCore >= 7, 'reduced-motion keeps dark story core content visible', { visibleCore: desktop.visibleCore });
    }

    const darkShot = REDUCED_MOTION ? 'dawn-dark-section-desktop-reduced.png' : 'dawn-dark-section-desktop.png';
    const cutShot = REDUCED_MOTION ? 'dawn-hard-cut-desktop-reduced.png' : 'dawn-hard-cut-desktop.png';
    await screenshot(client, darkShot, '#section-story', 'desktop');
    await screenshot(client, cutShot, '#section-social', 'desktop');

    await setViewport(client, 390, 844, true);
    await new Promise((resolve) => setTimeout(resolve, 900));

    const mobile = await evaluate(client, `(() => {
      const dark = document.querySelector('#section-story');
      const social = document.querySelector('#section-social');
      if (!dark || !social) return { error: 'missing mobile sections' };
      dark.scrollIntoView({ behavior: 'instant', block: 'start' });

      const storyActs = Array.from(dark.querySelectorAll('.story-act'));
      const quoteCard = dark.querySelector('[data-story-quote-card]');
      const videoShell = dark.querySelector('[data-story-video-shell]');
      const videoPlaceholder = dark.querySelector('[data-story-video-placeholder]');
      const playButton = dark.querySelector('[data-story-play-button]');
      const insight = dark.querySelector('[data-story-insight]');
      const cards = Array.from(social.querySelectorAll('[data-testimonial-card]'));
      const rectSummary = (el) => {
        if (!el) return null;
        const rect = el.getBoundingClientRect();
        return { top: Math.round(rect.top), bottom: Math.round(rect.bottom), left: Math.round(rect.left), right: Math.round(rect.right), width: Math.round(rect.width), height: Math.round(rect.height) };
      };
      const actRects = storyActs.map(rectSummary);
      const stacksCleanly = actRects.every((rect, i) => rect && (
        rect.left >= -1 && rect.right <= window.innerWidth + 1
          && (i === 0 || rect.top >= actRects[i - 1].bottom - 1)
      ));
      const isTextNode = (el) => el.getAttribute('aria-hidden') !== 'true' && el.textContent.trim().length > 0;
      const textOk = Array.from(dark.querySelectorAll('h2, h3, p, span, strong'))
        .concat(Array.from(cards.flatMap((card) => Array.from(card.querySelectorAll('p, span, strong')))))
        .filter(isTextNode)
        .every((el) => el.scrollWidth <= el.clientWidth + 2 && el.scrollHeight <= el.clientHeight + 2);
      const visible = (el) => {
        if (!el) return false;
        const rect = el.getBoundingClientRect();
        const style = getComputedStyle(el);
        return rect.width > 0 && rect.height > 0 && Number(style.opacity) > 0.01 && style.visibility !== 'hidden';
      };
      return {
        horizontalOverflow: document.documentElement.scrollWidth - window.innerWidth,
        storyActCount: storyActs.length,
        hasQuoteCard: visible(quoteCard),
        hasVideoShell: visible(videoShell),
        hasVideoPlaceholder: visible(videoPlaceholder),
        hasPlayButton: visible(playButton),
        hasInsight: Boolean(insight),
        stacksCleanly,
        textOk,
        actRects,
        videoRect: rectSummary(videoShell),
        placeholderRect: rectSummary(videoPlaceholder),
      };
    })()`);

    if (mobile.error) throw new Error(mobile.error);

    assertMetric(mobile.horizontalOverflow <= 1, 'mobile viewport has no horizontal overflow', { horizontalOverflow: mobile.horizontalOverflow });
    assertMetric(mobile.storyActCount === 3 && mobile.stacksCleanly, 'mobile dark story acts stack cleanly', { storyActCount: mobile.storyActCount, actRects: mobile.actRects });
    assertMetric(mobile.hasQuoteCard && mobile.hasVideoShell && mobile.hasVideoPlaceholder && mobile.hasPlayButton && mobile.hasInsight, 'mobile dark story core layout remains present', {
      hasQuoteCard: mobile.hasQuoteCard,
      hasVideoShell: mobile.hasVideoShell,
      hasVideoPlaceholder: mobile.hasVideoPlaceholder,
      hasPlayButton: mobile.hasPlayButton,
      hasInsight: mobile.hasInsight,
    });
    assertMetric(mobile.videoRect.width >= 300 && mobile.placeholderRect.height >= 240, 'mobile video placeholder keeps usable dimensions', {
      videoRect: mobile.videoRect,
      placeholderRect: mobile.placeholderRect,
    });
    assertMetric(mobile.textOk, 'mobile dark story and testimonial text does not clip', { textOk: mobile.textOk });

    const mobileShot = REDUCED_MOTION ? 'dawn-dark-section-mobile-reduced.png' : 'dawn-dark-section-mobile.png';
    await screenshot(client, mobileShot, '#section-story', 'mobile');
    console.log(`Reduced motion: ${REDUCED_MOTION}`);
  } finally {
    client.close();
    await cdpRequest(`/json/close/${target.id}`).catch(() => {});
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
