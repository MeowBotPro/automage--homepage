const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');

// Run the repository's TypeScript domain modules without an additional test dependency.
require.extensions['.ts'] = (module, filename) => {
  const { outputText } = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
    fileName: filename,
  });
  module._compile(outputText, filename);
};

const { bundledCatalog: catalog } = require('../src/lib/skill-catalog.ts');
const { SKILL_GROUPS, groupSkills, findGroups, groupsForSkill } = require('../src/lib/skill-groups.ts');
const { catalogUrl, normalizeCatalogQuery, pageWindow, detailUrl } = require('../src/lib/market-navigation.ts');
const { parseIntentCookie, safeReturnTo } = require('../src/lib/skill-intent.ts');
const { normalizeBetaApplicationInput } = require('../src/lib/server/beta-application-schema.ts');

test('grouped discovery retains every original Skill and every entry point exists', () => {
  const all = catalog.getAll();
  assert.equal(all.length, 191);
  assert.equal(new Set(all.map((skill) => skill.id)).size, 191);
  const grouped = new Set(SKILL_GROUPS.flatMap((group) => groupSkills(group, catalog).map((skill) => skill.id)));
  assert.deepEqual([...grouped].sort(), all.map((skill) => skill.id).sort());
  assert.equal(new Set(SKILL_GROUPS.map((group) => group.id)).size, SKILL_GROUPS.length);
  // The bundled snapshot keeps each group's editorial order exactly.
  for (const group of SKILL_GROUPS) assert.deepEqual(groupSkills(group, catalog).map((skill) => skill.id), group.skillIds);
});

test('similar methods can be compared while business discovery crosses archive categories', () => {
  const sourcing = SKILL_GROUPS.find((group) => group.id === 'sourcing');
  assert.ok(sourcing.skillIds.includes('1688-sourcing-agent'));
  assert.ok(sourcing.skillIds.includes('1688-procurement-agent'));
  assert.ok(sourcing.skillIds.includes('1688-product-find'));
  assert.ok(groupsForSkill(catalog.getById('docx')).some((group) => group.id === 'office-documents'));
  assert.ok(groupsForSkill(catalog.getById('capacity-planner')).some((group) => group.area === 'service'));
});

test('advertised business phrases and original Skill names find the relevant work', () => {
  assert.ok(findGroups(catalog, '采购比价').some((group) => group.id === 'sourcing'));
  assert.ok(findGroups(catalog, '视频脚本').some((group) => group.id === 'video-writing'));
  assert.ok(findGroups(catalog, '客户流失').some((group) => group.id === 'customer-retention'));
  assert.ok(findGroups(catalog, 'churn-autopsy').some((group) => group.id === 'customer-retention'));
  assert.equal(findGroups(catalog, '采购比价', 'legal').length, 0);
  assert.equal(findGroups(catalog, '不存在的宇宙采矿业务').length, 0);
});

test('pagination preserves browse mode, filter, and search, including legacy URLs', () => {
  const href = catalogUrl({ q: '采购', area: 'trade', page: '2' });
  const url = new URL(href, 'http://localhost');
  assert.equal(url.searchParams.get('view'), 'all');
  assert.equal(url.searchParams.get('page'), '2');
  assert.equal(url.searchParams.get('q'), '采购');
  assert.equal(url.searchParams.get('area'), 'trade');
  assert.equal(normalizeCatalogQuery({ all: '1' }).view, 'all');
  assert.equal(normalizeCatalogQuery({ q: ['采购', '合同'] }).q, '采购');
  assert.equal(pageWindow(32, 'NaN').page, 1);
  assert.equal(pageWindow(32, '999').page, 6);
  assert.equal(pageWindow(0, '-1').page, 1);
});

test('detail preserves the exact browse context and rejects external return locations', () => {
  const back = '/market?view=all&area=customers&page=2&q=客户#catalog';
  const url = new URL(detailUrl('churn-autopsy', back), 'http://localhost');
  assert.equal(safeReturnTo(url.searchParams.get('returnTo')), back);
  for (const unsafe of ['//evil.example', '/\\evil.example', 'https://evil.example', '/market/intent', '/market\r\nX:yes']) {
    assert.equal(safeReturnTo(unsafe), '/market');
  }
});

test('saved intent deduplicates valid Skills and ignores corrupt or obsolete browser data', () => {
  assert.deepEqual(parseIntentCookie('["churn-autopsy","gone","churn-autopsy"]', catalog), ['churn-autopsy']);
  assert.deepEqual(parseIntentCookie('broken', catalog), []);
  assert.deepEqual(parseIntentCookie('{}', catalog), []);
});

test('consultation data retains validated Skill identities and titles in persisted metadata', () => {
  const input = { occupation: '测试采购负责人', use_case: 'Skill 选配咨询', contact: 'qa@example.invalid', skill_ids: ['churn-autopsy', '1688-product-find', 'churn-autopsy'] };
  const data = normalizeBetaApplicationInput(input, catalog);
  assert.deepEqual(data.raw_payload.skill_ids, ['churn-autopsy', '1688-product-find']);
  assert.deepEqual(data.raw_payload.selected_skills.map((skill) => skill.title), ['客户流失复盘', '1688 找货比价']);
  assert.throws(() => normalizeBetaApplicationInput({ ...input, skill_ids: ['unknown'] }, catalog));
  assert.deepEqual(normalizeBetaApplicationInput({ ...input, skill_ids: undefined }, catalog).raw_payload.skill_ids, []);
});
