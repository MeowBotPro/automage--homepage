const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const ts = require('typescript');

require.extensions['.ts'] = (module, filename) => {
  const { outputText } = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
    fileName: filename,
  });
  module._compile(outputText, filename);
};

const ROOT = path.join(__dirname, '..');
const TOOL = path.join(ROOT, 'scripts/skills/skillpack.cjs');
const TEMPLATE = path.join(ROOT, 'docs/skill-delivery/template/churn-autopsy');
const { check, entryOf } = require(TOOL);
const { mp4, zip, tmp, filled } = require('./skill-fixtures.cjs');
const { SKILL_DOMAINS, BUNDLED_SKILLS } = require('../src/lib/skill-catalog.ts');
const { SKILL_GROUPS } = require('../src/lib/skill-groups.ts');
const { readSkillIndex, toSkillIndexEntry, SKILL_INDEX_FORMAT } = require('../src/lib/skill-index.ts');

test('skill.schema.json offers exactly the domains and groups the site has', () => {
  const schema = JSON.parse(fs.readFileSync(path.join(ROOT, 'docs/skill-delivery/skill.schema.json'), 'utf8'));
  assert.deepEqual(schema.properties.listing.properties.domain.enum, [...SKILL_DOMAINS]);
  assert.deepEqual(schema.properties.listing.properties.groups.items.enum, SKILL_GROUPS.map((group) => group.id));
});

test('the template as shipped fails only on its placeholders and the media it leaves out', () => {
  const outcome = check(TEMPLATE);
  assert.equal(outcome.ok, false);
  assert.deepEqual(outcome.errors.map((e) => e.split(' ')[0]).sort(), ['skill.license', 'skill.maintainer', 'skill.upstream', '找不到', '找不到'].sort());
});

test('a filled-in package passes, junk ignored, and stages into an index the site reads', () => {
  const dir = tmp();
  const pkg = zip(path.join(dir, 'retention-probe-1.0.0.zip'), filled());
  const outcome = check(pkg);
  assert.deepEqual(outcome.errors, []);
  assert.equal(outcome.ignored.length, 2);
  assert.deepEqual(outcome.video.video, { codec: 'avc1', width: 1920, height: 1080 });
  assert.equal(outcome.video.faststart, true);

  const current = path.join(dir, 'current.json');
  fs.writeFileSync(current, JSON.stringify({ format: SKILL_INDEX_FORMAT, generatedAt: 'x', skills: BUNDLED_SKILLS.map((s) => toSkillIndexEntry(s, '1.0.0', null)) }));
  execFileSync('node', [TOOL, 'stage', pkg, '--index', current, '--out', path.join(dir, 'out')], { stdio: 'pipe' });
  assert.ok(fs.existsSync(path.join(dir, 'out/retention-probe/1.0.0/demo.mp4')));
  assert.ok(fs.existsSync(path.join(dir, 'out/retention-probe/1.0.0/poster.png')));
  const index = JSON.parse(fs.readFileSync(path.join(dir, 'out/index.json'), 'utf8'));
  const { skills, problems } = readSkillIndex(index, 'https://media.example.invalid/skills/');
  assert.deepEqual(problems, []);
  assert.equal(skills.length, BUNDLED_SKILLS.length + 1);
  const probe = skills.at(-1);
  assert.equal(probe.id, 'retention-probe');
  assert.equal(probe.story.preview, 'document');
  assert.deepEqual(probe.video, { src: 'https://media.example.invalid/skills/retention-probe/1.0.0/demo.mp4', poster: 'https://media.example.invalid/skills/retention-probe/1.0.0/poster.png' });

  // A published version is never written again; a newer one replaces the entry where it stands.
  const again = () => execFileSync('node', [TOOL, 'stage', pkg, '--index', path.join(dir, 'out/index.json'), '--out', path.join(dir, 'out2')], { stdio: 'pipe' });
  assert.throws(again, /已经发布过/);
  const next = zip(path.join(dir, 'retention-probe-1.1.0.zip'), filled('retention-probe', (m) => ({ ...m, version: '1.1.0', changes: '换了视频' })));
  execFileSync('node', [TOOL, 'stage', next, '--index', path.join(dir, 'out/index.json'), '--out', path.join(dir, 'out3')], { stdio: 'pipe' });
  const updated = JSON.parse(fs.readFileSync(path.join(dir, 'out3/index.json'), 'utf8')).skills;
  assert.equal(updated.length, BUNDLED_SKILLS.length + 1);
  assert.equal(updated.at(-1).version, '1.1.0');

  execFileSync('node', [TOOL, 'unlist', 'retention-probe', '--index', path.join(dir, 'out3/index.json'), '--out', path.join(dir, 'out4')], { stdio: 'pipe' });
  assert.equal(JSON.parse(fs.readFileSync(path.join(dir, 'out4/index.json'), 'utf8')).skills.length, BUNDLED_SKILLS.length);
});

test('what keeps a package off the site is named, one finding per problem', () => {
  const dir = tmp();
  const cases = [
    [filled('retention-probe', (m) => ({ ...m, listing: { ...m.listing, summary: '内测中：从续约记录里找出可能流失的客户。' } })), /开发阶段/],
    [filled().map(([n, d]) => [n, n.endsWith('demo.mp4') ? mp4({ faststart: false }) : d]), /不能边下边播/],
    [filled().map(([n, d]) => [n, n.endsWith('demo.mp4') ? mp4({ codec: 'hvc1' }) : d]), /网页要 H\.264/],
    [filled().map(([n, d]) => [n, n.endsWith('demo.mp4') ? mp4({ brand: 'qt  ' }) : d]), /QuickTime/],
    [[...filled(), ['retention-probe/skill/.env', Buffer.from('KEY=1')]], /不要带上/],
    [[...filled(), ['retention-probe/notes.txt', Buffer.from('x')]], /不认识的文件/],
    [filled().map(([n, d]) => [n.replace(/^retention-probe\//, 'other-folder/'), d]), /文件夹名/],
    [filled('retention-probe', (m) => ({ ...m, listing: { ...m.listing, groups: ['no-such-group'] } })), /listing\.groups\[0\] 只能是/],
    [filled('retention-probe', (m) => ({ ...m, skill: { entry: 'skill/SKILL.md', source: 'third_party', maintainer: '交付组' } })), /skill\.upstream 没填/],
  ];
  cases.forEach(([entries, expected], i) => {
    const outcome = check(zip(path.join(dir, `case-${i}.zip`), entries));
    assert.equal(outcome.ok, false, `case ${i}`);
    assert.ok(outcome.errors.some((error) => expected.test(error)), `case ${i}: ${outcome.errors.join(' | ')}`);
  });
  const warned = check(zip(path.join(dir, 'small.zip'), filled().map(([n, d]) => [n, n.endsWith('demo.mp4') ? mp4({ width: 1024, height: 640, seconds: 400 }) : d])));
  assert.equal(warned.ok, true);
  assert.equal(warned.warnings.length, 4);
});

test('an index entry from a package carries only what the site shows', () => {
  const manifest = JSON.parse(filled()[0][1].toString());
  const entry = entryOf(manifest, 'png', '2026-10-09');
  assert.deepEqual(Object.keys(entry).sort(), ['domain', 'groups', 'id', 'inputs', 'keywords', 'media', 'output', 'story', 'subSkills', 'summary', 'title', 'updatedAt', 'version']);
  assert.ok(!JSON.stringify(entry).includes('交付组'));
});
