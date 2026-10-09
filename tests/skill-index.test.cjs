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

const { BUNDLED_SKILLS, bundledCatalog, createSkillCatalog } = require('../src/lib/skill-catalog.ts');
const { SKILL_INDEX_FORMAT, readSkillIndex, toSkillIndexEntry } = require('../src/lib/skill-index.ts');
const { SKILL_GROUPS, groupSkills, findGroups } = require('../src/lib/skill-groups.ts');

const BASE = 'https://media.example.invalid/skills/';
const indexOf = (skills) => ({ format: SKILL_INDEX_FORMAT, generatedAt: '2026-10-09T00:00:00Z', skills });
const media = (id) => ({ video: `${id}/1.0.0/demo.mp4`, poster: `${id}/1.0.0/poster.jpg` });

test('the bundled snapshot survives a trip through the index unchanged', () => {
  const index = JSON.parse(JSON.stringify(indexOf(BUNDLED_SKILLS.map((skill) => toSkillIndexEntry(skill, '1.0.0', null)))));
  const { skills, problems } = readSkillIndex(index, BASE);
  assert.deepEqual(problems, []);
  assert.deepEqual(skills, BUNDLED_SKILLS);
});

test('media paths resolve against the asset base; absolute URLs are kept', () => {
  const [a, b] = BUNDLED_SKILLS;
  const { skills, problems } = readSkillIndex(indexOf([
    toSkillIndexEntry(a, '1.0.0', media(a.id)),
    toSkillIndexEntry(b, '1.0.0', { video: 'https://cdn.example.invalid/x.mp4' }),
  ]), 'https://media.example.invalid/skills');
  assert.deepEqual(problems, []);
  assert.deepEqual(skills[0].video, { src: `${BASE}${a.id}/1.0.0/demo.mp4`, poster: `${BASE}${a.id}/1.0.0/poster.jpg` });
  assert.deepEqual(skills[1].video, { src: 'https://cdn.example.invalid/x.mp4' });
});

test('a bad entry is left out and reported while the rest still show', () => {
  const [a, b, c] = BUNDLED_SKILLS;
  const { skills, problems } = readSkillIndex(indexOf([
    toSkillIndexEntry(a, '1.0.0', null),
    { ...toSkillIndexEntry(b, '1.0.0', null), domain: '不存在的分类' },
    toSkillIndexEntry(a, '1.0.1', null),
    { ...toSkillIndexEntry(c, '1.0.0', { video: 'javascript:alert(1)' }), groups: [...c.groups, 'no-such-group'] },
  ]), BASE);
  assert.deepEqual(skills.map((skill) => skill.id), [a.id, c.id]);
  assert.equal(skills[1].video, null);
  assert.deepEqual(skills[1].groups, c.groups);
  assert.equal(problems.length, 4);
  assert.match(problems[0], new RegExp(`\\(${b.id}\\) left out`));
  assert.match(problems[1], /id already listed/);
});

test('something that is not an index yields no skills, only a problem', () => {
  for (const raw of [null, [], { skills: [] }, { format: 'automage.skill-index/0', generatedAt: 'x', skills: [] }]) {
    const { skills, problems } = readSkillIndex(raw, BASE);
    assert.deepEqual(skills, []);
    assert.equal(problems.length, 1);
  }
});

test('a skill new to the index joins its group after the editorial members, and the door counts it', () => {
  const group = SKILL_GROUPS.find((item) => item.id === 'customer-retention');
  const probe = { id: 'retention-probe', version: '1.0.0', domain: 'CRM', title: '流失预警', summary: '从续约记录里找出可能流失的客户。', inputs: ['续约记录'], output: '预警名单', groups: ['customer-retention'], media: media('retention-probe') };
  const index = indexOf([...BUNDLED_SKILLS.map((skill) => toSkillIndexEntry(skill, '1.0.0', null)), probe]);
  const { skills, problems } = readSkillIndex(index, BASE);
  assert.deepEqual(problems, []);
  const catalog = createSkillCatalog(skills);
  assert.deepEqual(groupSkills(group, catalog).map((skill) => skill.id), [...group.skillIds, 'retention-probe']);
  assert.ok(findGroups(catalog, '流失预警').some((item) => item.id === 'customer-retention'));
  assert.equal(catalog.getAll().length, bundledCatalog.getAll().length + 1);
});

test('a group left with no skill in the index is not offered', () => {
  const brand = SKILL_GROUPS.find((item) => item.id === 'brand-discovery');
  const catalog = createSkillCatalog(BUNDLED_SKILLS.filter((skill) => !brand.skillIds.includes(skill.id)));
  assert.equal(groupSkills(brand, catalog).length, 0);
  assert.ok(!findGroups(catalog, '').includes(brand));
  assert.equal(findGroups(catalog, '').length, SKILL_GROUPS.length - 1);
});
