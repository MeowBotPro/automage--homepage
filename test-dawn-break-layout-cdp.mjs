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
  const rect = await evaluate(client, `(() => {
    const el = document.querySelector(${JSON.stringify(selector)});
    if (!el) return null;
    el.scrollIntoView({ behavior: 'instant', block: 'center' });
    const rect = el.getBoundingClientRect();
    return {
      x: Math.max(0, rect.left),
      y: Math.max(0, rect.top),
      width: Math.min(window.innerWidth, rect.width),
      height: Math.min(window.innerHeight, rect.height),
      scale: 1,
    };
  })()`);

  await new Promise((resolve) => setTimeout(resolve, 900));

  const capture = await client.send('Page.captureScreenshot', {
    format: 'png',
    clip: rect && rect.width > 0 && rect.height > 0 ? rect : undefined,
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
      const ids = ['section-security', 'section-story', 'section-social', 'section-faq', 'section-beta'];
      const sections = Object.fromEntries(ids.map((id) => [id, document.getElementById(id)]));
      const missing = ids.filter((id) => !sections[id]);
      if (missing.length) return { error: 'missing sections', missing };

      const cssRgb = (el) => {
        const color = getComputedStyle(el).backgroundColor;
        const match = color.match(/rgba?\\((\\d+),\\s*(\\d+),\\s*(\\d+)/);
        return match ? match.slice(1, 4).map(Number) : null;
      };
      const dark = sections['section-story'];
      dark.scrollIntoView({ behavior: 'instant', block: 'center' });
      const panels = Array.from(dark.querySelectorAll('[data-dev-panel]'));
      const logs = Array.from(dark.querySelectorAll('[data-log-row]'));
      const indicators = Array.from(dark.querySelectorAll('[data-status-indicator]')).filter((el) => {
        const rect = el.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0 && Number(getComputedStyle(el).opacity) > 0;
      });
      const brief = dark.querySelector('[data-decision-brief]');
      const briefFields = ['owner', 'deadline', 'risk', 'action'].filter((field) => (
        Boolean(brief?.querySelector('[data-decision-field="' + field + '"]'))
      ));
      const visibleCore = Array.from(dark.querySelectorAll('[data-dev-panel], [data-log-row]')).filter((el) => (
        Number(getComputedStyle(el).opacity) > 0.85
      )).length;

      const social = sections['section-social'];
      const socialBg = cssRgb(social);
      const cards = Array.from(social.querySelectorAll('[data-testimonial-card]'));
      const cardRgbs = cards.map(cssRgb);
      const cardTextOk = cards.every((card) => (
        Array.from(card.querySelectorAll('p, span, strong')).every((el) => (
          el.scrollWidth <= el.clientWidth + 2 && el.scrollHeight <= el.clientHeight + 2
        ))
      ));

      const order = Object.fromEntries(ids.map((id) => [id, Math.round(sections[id].getBoundingClientRect().top + window.scrollY)]));
      return {
        order,
        orderOk: order['section-security'] < order['section-story']
          && order['section-story'] < order['section-social']
          && order['section-social'] < order['section-faq']
          && order['section-faq'] < order['section-beta'],
        darkBg: cssRgb(dark),
        panelCount: panels.length,
        logCount: logs.length,
        indicatorCount: indicators.length,
        hasBrief: Boolean(brief),
        briefFields,
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
    assertMetric(desktop.darkBg.every((v) => v < 35), 'dark development section background RGB channels are < 35', { darkBg: desktop.darkBg });
    assertMetric(desktop.panelCount >= 3, 'dark development section has at least 3 UI panels', { panelCount: desktop.panelCount });
    assertMetric(desktop.logCount >= 8, 'dark development section has at least 8 log/status rows', { logCount: desktop.logCount });
    assertMetric(desktop.indicatorCount >= 3, 'dark development section has at least 3 visible status indicators', { indicatorCount: desktop.indicatorCount });
    assertMetric(desktop.hasBrief && desktop.briefFields.length >= 4, 'decision brief includes owner/deadline/risk/action fields', { fields: desktop.briefFields });
    assertMetric(desktop.socialBg.every((v) => v > 230), 'testimonial section background remains light', { socialBg: desktop.socialBg });
    assertMetric(desktop.cardCount === 3, 'testimonial section contains exactly 3 dark cards', { cardCount: desktop.cardCount });
    assertMetric(desktop.cardRgbs.every((rgb) => rgb && rgb.every((v) => v < 45)), 'each testimonial card RGB channel is < 45', { cardRgbs: desktop.cardRgbs });
    assertMetric(desktop.cardTextOk, 'testimonial card text is not clipped on desktop', { cardTextOk: desktop.cardTextOk });
    assertMetric(desktop.horizontalOverflow <= 1, 'desktop viewport has no horizontal overflow', { horizontalOverflow: desktop.horizontalOverflow });
    if (REDUCED_MOTION) {
      assertMetric(desktop.visibleCore >= 10, 'reduced-motion keeps dark section core content visible', { visibleCore: desktop.visibleCore });
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

      const panels = Array.from(dark.querySelectorAll('[data-dev-panel]'));
      const cards = Array.from(social.querySelectorAll('[data-testimonial-card]'));
      const panelRects = panels.map((panel) => {
        const rect = panel.getBoundingClientRect();
        return { top: Math.round(rect.top), bottom: Math.round(rect.bottom), left: Math.round(rect.left), right: Math.round(rect.right), width: Math.round(rect.width) };
      });
      const stacksCleanly = panelRects.every((rect, i) => (
        rect.left >= -1 && rect.right <= window.innerWidth + 1
          && (i === 0 || rect.top >= panelRects[i - 1].bottom - 1)
      ));
      const textOk = Array.from(dark.querySelectorAll('h2, p, span, strong, .am-log-text, .am-task-label'))
        .concat(Array.from(cards.flatMap((card) => Array.from(card.querySelectorAll('p, span, strong')))))
        .every((el) => el.scrollWidth <= el.clientWidth + 2 && el.scrollHeight <= el.clientHeight + 2);
      return {
        horizontalOverflow: document.documentElement.scrollWidth - window.innerWidth,
        panelCount: panels.length,
        stacksCleanly,
        textOk,
        panelRects,
      };
    })()`);

    if (mobile.error) throw new Error(mobile.error);

    assertMetric(mobile.horizontalOverflow <= 1, 'mobile viewport has no horizontal overflow', { horizontalOverflow: mobile.horizontalOverflow });
    assertMetric(mobile.panelCount >= 3 && mobile.stacksCleanly, 'mobile dark section panels stack cleanly', { panelCount: mobile.panelCount, panelRects: mobile.panelRects });
    assertMetric(mobile.textOk, 'mobile dark section and testimonial text does not clip', { textOk: mobile.textOk });

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
