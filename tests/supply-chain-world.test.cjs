const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');

require.extensions['.ts'] = (module, filename) => {
  const { outputText } = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
    fileName: filename,
  });
  module._compile(outputText, filename);
};

const world = require('../src/lib/supply-chain-world.ts');
const { N, projectionAt, feedForDay, spotExtra, autoResolves, statusAt, claimsAt, tasksAt, summarizeRun, LAST_DAY } = world;

const signedBoth = { v1Signed: true, v2Signed: true };
const ctx = (patch) => ({ run: 'first', rule: 'confirm_all', v1: null, v2: null, ...patch });

test('without action the stock breaches the safety line on day 12 and runs out on day 15', () => {
  const day0 = projectionAt(0, ctx({}), { v1Signed: false, v2Signed: false });
  assert.equal(day0.breachDay, 12);
  const day1 = projectionAt(1, ctx({}), { v1Signed: false, v2Signed: false });
  assert.equal(day1.breachDay, 12);
  assert.equal(day1.series.findIndex((value) => value <= 0), 15);
});

test('both v1 options cover the 100t gap until the regular batch', () => {
  for (const v1 of ['split', 'single']) {
    const projection = projectionAt(5, ctx({ v1 }), { v1Signed: true, v2Signed: false });
    assert.equal(projection.breachDay, null, v1);
    assert.equal(projection.series[16], N.safety, v1);
  }
});

test('the day 6 change breaks the v1 premise and every fix restores the plan', () => {
  const broken = { split: 16, single: 15 };
  for (const v1 of ['split', 'single']) {
    const reopened = projectionAt(6, ctx({ v1 }), { v1Signed: true, v2Signed: false });
    assert.equal(reopened.breachDay, broken[v1], v1);
    assert.ok(reopened.previous, 'the superseded v1 projection stays visible');
    for (const v2 of ['spot', 'reschedule']) {
      const fixed = projectionAt(9, ctx({ v1, v2 }), signedBoth);
      assert.equal(fixed.breachDay, null, `${v1}/${v2}`);
      assert.ok(Math.min(...fixed.series.slice(0, 17)) >= N.safety, `${v1}/${v2}`);
    }
  }
});

test('the spot fix stays inside the 5% replay boundary for either v1 choice', () => {
  assert.deepEqual(spotExtra('split'), { wan: 2, pct: 2.2 });
  assert.deepEqual(spotExtra('single'), { wan: 4, pct: 2.3 });
  assert.ok(autoResolves({ run: 'replay', rule: 'within_5', v1: 'split', v2: null }));
  assert.ok(!autoResolves({ run: 'replay', rule: 'confirm_all', v1: 'split', v2: null }));
  assert.ok(!autoResolves({ run: 'first', rule: 'within_5', v1: 'split', v2: null }));
});

test('replay differs from the first run only after the rule applies', () => {
  for (const v1 of ['split', 'single']) {
    const first = ctx({ v1, v2: 'spot' });
    const replay = { run: 'replay', rule: 'within_5', v1, v2: null };
    for (let day = 0; day <= 5; day += 1) {
      assert.deepEqual(feedForDay(day, replay), feedForDay(day, first), `day ${day}`);
    }
    assert.ok(feedForDay(3, first).some((item) => item.kind === 'you'), 'the first decision is visible as a human act');
    const shared = ['f6-1', 'f6-2', 'f6-3', 'f6-3b', 'f6-3c'];
    const sameEvent = (items) => items.filter((item) => shared.includes(item.id));
    assert.equal(sameEvent(feedForDay(6, first)).length, shared.length);
    assert.deepEqual(sameEvent(feedForDay(6, replay)), sameEvent(feedForDay(6, first)));
    assert.equal(statusAt(6, first, { v1Signed: true, v2Signed: false }), 'reopened');
    assert.equal(statusAt(6, replay, { v1Signed: true, v2Signed: false }), 'following');
    assert.ok(feedForDay(6, replay).some((item) => item.tone === 'report'));
    assert.ok(!feedForDay(6, replay).some((item) => item.tone === 'return'));
    assert.ok(!feedForDay(6, replay).some((item) => item.kind === 'you'), 'replay asks nothing of the visitor on day 6');
    assert.ok(feedForDay(6, first).some((item) => item.kind === 'you'), 'the re-decision is visible as a human act');
  }
});

test('the work closes on the last day with every task receipted', () => {
  for (const v1 of ['split', 'single']) {
    for (const v2 of ['spot', 'reschedule']) {
      const c = ctx({ v1, v2 });
      assert.equal(statusAt(LAST_DAY, c, signedBoth), 'closed');
      assert.ok(tasksAt(LAST_DAY, c).every((task) => task.status === 'done'), `${v1}/${v2}`);
      const open = claimsAt(LAST_DAY, c, signedBoth).filter((claim) => claim.kind === 'unknown' && !claim.resolved);
      assert.deepEqual(open.map((claim) => claim.id), [], `${v1}/${v2}`);
    }
  }
});

test('a replay started before the first re-decision does not invent that decision', () => {
  const undecided = summarizeRun('first', 'confirm_all', 'split', null);
  assert.equal(undecided.interrupted, true);
  assert.match(undecided.resolution, /还没定/);
  assert.equal(undecided.extra, '—');
  const replay = summarizeRun('replay', 'within_5', 'split', null);
  assert.equal(replay.interrupted, false);
  assert.match(replay.resolution, /^AutoMage/);
});
