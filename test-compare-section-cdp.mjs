import fs from 'node:fs/promises';
import path from 'node:path';

const APP_URL = process.env.TEST_URL || 'http://localhost:3000';
const DEBUG_URL = process.env.CHROME_DEBUG_URL || 'http://localhost:9222';
const SCREENSHOT_PATH = process.env.SCREENSHOT_PATH || '.workflow/.scratchpad/test-compare-section-cdp.png';
const REDUCED_MOTION = process.env.REDUCED_MOTION === '1';

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

async function main() {
  const target = await cdpRequest(`/json/new?${encodeURIComponent(APP_URL)}`, { method: 'PUT' });
  const client = createCdpClient(target.webSocketDebuggerUrl);

  await client.send('Page.enable');
  await client.send('Runtime.enable');
  await client.send('Emulation.setDeviceMetricsOverride', {
    width: 1440,
    height: 900,
    deviceScaleFactor: 1,
    mobile: false,
  });
  if (REDUCED_MOTION) {
    await client.send('Emulation.setEmulatedMedia', {
      features: [{ name: 'prefers-reduced-motion', value: 'reduce' }],
    });
  }

  await new Promise((resolve) => setTimeout(resolve, 2000));
  await evaluate(client, `
    document.getElementById('section-compare')?.scrollIntoView({ behavior: 'instant', block: 'center' });
  `);
  await new Promise((resolve) => setTimeout(resolve, REDUCED_MOTION ? 1200 : 4600));

  const metrics = await evaluate(client, `(() => {
    const section = document.querySelector('#section-compare');
    const desktop = document.querySelector('[data-compare-desktop]');
    if (!section || !desktop) {
      return { error: 'missing compare section or desktop layout' };
    }

    const sectionRect = section.getBoundingClientRect();
    const leftZone = desktop.querySelector('.relative');
    const rightZone = desktop.querySelector('.flex.flex-col');
    const leftRect = leftZone?.getBoundingClientRect();
    const rightRect = rightZone?.getBoundingClientRect();

    const cards = Array.from(desktop.querySelectorAll('[data-noise-card]'));
    const decisions = Array.from(desktop.querySelectorAll('[data-decision-card]'));
    const visibleNoise = cards.filter((card) => Number(getComputedStyle(card).opacity) >= 0.45);
    const convertedVisible = cards.filter((card) => (
      card.dataset.noiseMode === 'convert' && Number(getComputedStyle(card).opacity) >= 0.1
    ));
    const retainedVisible = cards.filter((card) => (
      card.dataset.noiseMode !== 'convert' && Number(getComputedStyle(card).opacity) >= 0.45
    ));
    const visibleDecisions = decisions.filter((card) => Number(getComputedStyle(card).opacity) >= 0.95);

    const visibleNoiseInLeftZone = leftRect
      ? visibleNoise.filter((card) => {
        const rect = card.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        return cx >= leftRect.left - 24 && cx <= leftRect.right + 80
          && cy >= leftRect.top - 24 && cy <= leftRect.bottom + 24;
      }).length
      : 0;

    const visibleDecisionInRightZone = rightRect
      ? visibleDecisions.filter((card) => {
        const rect = card.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        return cx >= rightRect.left && cx <= rightRect.right
          && cy >= rightRect.top && cy <= rightRect.bottom;
      }).length
      : 0;

    return {
      transformedNoiseCount: Number(section.dataset.transformedNoiseCount),
      retainedNoiseCount: Number(section.dataset.retainedNoiseCount),
      totalNoiseCards: cards.length,
      totalDecisionCards: decisions.length,
      visibleNoiseCount: visibleNoise.length,
      retainedVisibleCount: retainedVisible.length,
      convertedVisibleCount: convertedVisible.length,
      visibleDecisionCount: visibleDecisions.length,
      visibleNoiseInLeftZone,
      visibleDecisionInRightZone,
      sectionHeight: Math.round(sectionRect.height),
      desktopVisible: getComputedStyle(desktop).display !== 'none',
    };
  })()`);

  if ('error' in metrics) {
    throw new Error(metrics.error);
  }

  assertMetric(metrics.desktopVisible === true, 'desktop compare layout is active', metrics);
  assertMetric(metrics.totalNoiseCards === 8, 'renders exactly 8 desktop noise cards', metrics);
  assertMetric(metrics.transformedNoiseCount === 3, 'marks exactly 3 noise cards for conversion', metrics);
  assertMetric(metrics.retainedNoiseCount === 5, 'marks exactly 5 noise cards for residual display', metrics);
  assertMetric(metrics.convertedVisibleCount === 0, 'converted cards are hidden after animation', metrics);
  assertMetric(metrics.retainedVisibleCount >= 5, 'at least 5 residual noise cards remain visible', metrics);
  assertMetric(metrics.visibleNoiseInLeftZone >= 5, 'left zone is not empty after animation', metrics);
  assertMetric(metrics.totalDecisionCards === 3, 'renders exactly 3 decision cards', metrics);
  assertMetric(metrics.visibleDecisionCount === 3, 'all 3 decision cards are visible after animation', metrics);
  assertMetric(metrics.visibleDecisionInRightZone === 3, 'right zone keeps all generated decision cards visible', metrics);
  assertMetric(metrics.sectionHeight >= 500, 'compare section keeps stable vertical presence', metrics);

  const screenshot = await client.send('Page.captureScreenshot', { format: 'png' });
  const screenshotPath = path.resolve(SCREENSHOT_PATH);
  await fs.mkdir(path.dirname(screenshotPath), { recursive: true });
  await fs.writeFile(screenshotPath, Buffer.from(screenshot.data, 'base64'));
  console.log(`Screenshot: ${screenshotPath}`);
  console.log(`Reduced motion: ${REDUCED_MOTION}`);

  client.close();
  await cdpRequest(`/json/close/${target.id}`).catch(() => {});
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
