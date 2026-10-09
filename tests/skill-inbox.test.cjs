const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');

require.extensions['.ts'] = (module, filename) => {
  const { outputText } = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
    fileName: filename,
  });
  module._compile(outputText, filename);
};

const { run, LOCK } = require('../scripts/skills/inbox-worker.cjs');
const { zip, tmp, filled } = require('./skill-fixtures.cjs');
const { BUNDLED_SKILLS } = require('../src/lib/skill-catalog.ts');
const { readSkillIndex, toSkillIndexEntry, SKILL_INDEX_FORMAT } = require('../src/lib/skill-index.ts');

/** A private and a public location as folders, the public one already holding the site's live index. */
function setup(packages, { liveIndex = true } = {}) {
  const root = tmp();
  const priv = path.join(root, 'private');
  const pub = path.join(root, 'public/skills');
  fs.mkdirSync(path.join(priv, 'inbox'), { recursive: true });
  fs.mkdirSync(pub, { recursive: true });
  if (liveIndex) fs.writeFileSync(path.join(pub, 'index.json'), JSON.stringify({ format: SKILL_INDEX_FORMAT, generatedAt: 'x', skills: BUNDLED_SKILLS.map((skill) => toSkillIndexEntry(skill, '1.0.0', null)) }));
  for (const [name, entries] of packages) zip(path.join(priv, 'inbox', name), entries);
  return { priv, pub, lines: [], files: (dir) => (fs.existsSync(path.join(priv, dir)) ? fs.readdirSync(path.join(priv, dir)).sort() : []) };
}
const live = (pub) => JSON.parse(fs.readFileSync(path.join(pub, 'index.json'), 'utf8'));
const reports = (priv) => fs.readdirSync(path.join(priv, 'reports')).sort().map((name) => JSON.parse(fs.readFileSync(path.join(priv, 'reports', name), 'utf8')));

test('every zip in the inbox is handled in one run: fit ones published, the rest sent back with reasons', () => {
  const box = setup([
    ['retention-probe-1.0.0.zip', filled()],
    ['bad.zip', filled('retention-probe', (m) => ({ ...m, listing: { ...m.listing, summary: '内测中：从续约记录里找出可能流失的客户。' } }))],
    ['churn-autopsy-1.0.0.zip', filled('churn-autopsy')],
  ]);
  assert.equal(run({ privateAt: box.priv, publicAt: box.pub, log: (line) => box.lines.push(line) }), 0);

  assert.deepEqual(box.files('inbox'), []);
  assert.ok(fs.existsSync(path.join(box.pub, 'retention-probe/1.0.0/demo.mp4')));
  assert.ok(fs.existsSync(path.join(box.pub, 'retention-probe/1.0.0/poster.png')));
  assert.ok(fs.existsSync(path.join(box.priv, 'archive/retention-probe/1.0.0.zip')));
  assert.equal(box.files('index-history').length, 1);
  assert.equal(box.files('rejected').length, 2);
  assert.equal(box.files('failed').length, 0);

  const { skills, problems } = readSkillIndex(live(box.pub), 'https://media.example.invalid/skills/');
  assert.deepEqual(problems, []);
  assert.equal(skills.length, BUNDLED_SKILLS.length + 1);
  assert.equal(skills.at(-1).id, 'retention-probe');

  const byName = Object.fromEntries(reports(box.priv).map((r) => [r.package, r]));
  assert.equal(byName['retention-probe-1.0.0.zip'].status, 'published');
  assert.equal(byName['retention-probe-1.0.0.zip'].page, '/market/retention-probe');
  assert.equal(byName['bad.zip'].status, 'rejected');
  assert.match(byName['bad.zip'].errors.join(' '), /开发阶段/);
  assert.equal(byName['churn-autopsy-1.0.0.zip'].status, 'rejected');
  assert.match(byName['churn-autopsy-1.0.0.zip'].errors.join(' '), /已经发布过/);
  assert.equal(box.lines.length, 3);

  // Nothing waiting: a run changes nothing.
  const before = JSON.stringify(live(box.pub));
  assert.equal(run({ privateAt: box.priv, publicAt: box.pub, log: () => {} }), 0);
  assert.equal(JSON.stringify(live(box.pub)), before);
});

test('a dry run reads and checks but writes nothing', () => {
  const box = setup([['retention-probe-1.0.0.zip', filled()]]);
  const before = JSON.stringify(live(box.pub));
  assert.equal(run({ privateAt: box.priv, publicAt: box.pub, dryRun: true, log: (line) => box.lines.push(line) }), 0);
  assert.deepEqual(box.files('inbox'), ['retention-probe-1.0.0.zip']);
  assert.deepEqual(box.files('reports'), []);
  assert.equal(JSON.stringify(live(box.pub)), before);
  assert.match(box.lines[0], /会发布 retention-probe 1\.0\.0/);
});

test('without a live index the run stops and leaves the inbox alone', () => {
  const box = setup([['retention-probe-1.0.0.zip', filled()]], { liveIndex: false });
  assert.equal(run({ privateAt: box.priv, publicAt: box.pub, log: (line) => box.lines.push(line) }), 1);
  assert.deepEqual(box.files('inbox'), ['retention-probe-1.0.0.zip']);
  assert.deepEqual(box.files('reports'), []);
  assert.ok(!fs.existsSync(path.join(box.pub, 'index.json')));
  assert.match(box.lines.join(' '), /skillpack\.cjs export/);
});

test('a run that finds another still working leaves everything to it', () => {
  const box = setup([['retention-probe-1.0.0.zip', filled()]]);
  fs.writeFileSync(LOCK, String(process.pid));
  try {
    assert.equal(run({ privateAt: box.priv, publicAt: box.pub, log: (line) => box.lines.push(line) }), 0);
  } finally {
    fs.rmSync(LOCK, { force: true });
  }
  assert.deepEqual(box.files('inbox'), ['retention-probe-1.0.0.zip']);
  assert.match(box.lines[0], /跳过/);
});

test('through ossutil the same channel publishes, with long cache on media and a short one on the index', () => {
  const root = tmp();
  const fake = path.join(root, 'ossutil');
  // A stand-in for ossutil over a folder (oss://<bucket>/<key> is <root>/oss/<bucket>/<key>); it records headers.
  fs.writeFileSync(fake, `#!/usr/bin/env node
const fs = require('fs'), path = require('path');
const ROOT = ${JSON.stringify(path.join(root, 'oss'))};
const [command, ...rest] = process.argv.slice(2);
const flags = {}, args = [];
for (let i = 0; i < rest.length; i++) { if (rest[i] === '--content-type' || rest[i] === '--cache-control') flags[rest[i]] = rest[++i]; else if (!rest[i].startsWith('-')) args.push(rest[i]); }
const local = (u) => u.startsWith('oss://') ? path.join(ROOT, u.slice(6)) : u;
if (command === 'ls') {
  const prefix = args[0].slice(6); const bucket = prefix.split('/')[0]; const out = [];
  const walk = (d) => { if (!fs.existsSync(d)) return; for (const e of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, e.name); if (e.isDirectory()) walk(p); else out.push(path.relative(ROOT, p)); } };
  walk(path.join(ROOT, bucket));
  const keys = out.filter((k) => k.startsWith(prefix));
  for (const k of keys) console.log('oss://' + k);
  console.log('Object Number is: ' + keys.length);
} else if (command === 'cp') {
  const [from, to] = args.map(local);
  if (!fs.existsSync(from)) { console.error('Error: oss: service returned error: StatusCode=404, ErrorCode=NoSuchKey'); process.exit(1); }
  fs.mkdirSync(path.dirname(to), { recursive: true }); fs.copyFileSync(from, to);
  if (args[1].startsWith('oss://')) { const meta = path.join(${JSON.stringify(path.join(root, 'meta'))}, args[1].slice(6) + '.json'); fs.mkdirSync(path.dirname(meta), { recursive: true }); fs.writeFileSync(meta, JSON.stringify(flags)); }
} else if (command === 'rm') { fs.rmSync(local(args[0]), { force: true }); }
else { console.error('unknown command ' + command); process.exit(2); }
`, { mode: 0o755 });
  const bucket = (key) => path.join(root, 'oss', key);
  fs.mkdirSync(bucket('private-bucket/inbox'), { recursive: true });
  fs.mkdirSync(bucket('public-bucket/skills'), { recursive: true });
  fs.writeFileSync(bucket('public-bucket/skills/index.json'), JSON.stringify({ format: SKILL_INDEX_FORMAT, generatedAt: 'x', skills: BUNDLED_SKILLS.map((skill) => toSkillIndexEntry(skill, '1.0.0', null)) }));
  zip(bucket('private-bucket/inbox/retention-probe-1.0.0.zip'), filled());

  process.env.OSSUTIL = fake;
  try {
    assert.equal(run({ privateAt: 'oss://private-bucket', publicAt: 'oss://public-bucket/skills', log: () => {} }), 0);
  } finally {
    delete process.env.OSSUTIL;
  }
  assert.ok(!fs.existsSync(bucket('private-bucket/inbox/retention-probe-1.0.0.zip')));
  assert.ok(fs.existsSync(bucket('private-bucket/archive/retention-probe/1.0.0.zip')));
  assert.ok(fs.existsSync(bucket('public-bucket/skills/retention-probe/1.0.0/demo.mp4')));
  const meta = (key) => JSON.parse(fs.readFileSync(path.join(root, 'meta', `${key}.json`), 'utf8'));
  assert.deepEqual(meta('public-bucket/skills/retention-probe/1.0.0/demo.mp4'), { '--content-type': 'video/mp4', '--cache-control': 'public, max-age=31536000, immutable' });
  assert.deepEqual(meta('public-bucket/skills/index.json'), { '--content-type': 'application/json; charset=utf-8', '--cache-control': 'public, max-age=60' });
  assert.equal(JSON.parse(fs.readFileSync(bucket('public-bucket/skills/index.json'), 'utf8')).skills.at(-1).id, 'retention-probe');
});
