'use strict';
// Explicit, opt-in integration check. Only writes under a fresh UUID prefix, then removes those objects.
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const assert = require('node:assert/strict');
const { randomUUID, createHash } = require('node:crypto');
const OSS = require('ali-oss');
const { config, atomic } = require('../config.cjs');
const { Jobs } = require('../jobs.cjs');
const { zip, filled } = require('../../../tests/skill-fixtures.cjs');
async function main() {
  const base = config(); const prefix = `_delivery-smoke/${randomUUID()}`; const home = fs.mkdtempSync(path.join(os.tmpdir(), 'skill-oss-smoke-')); fs.chmodSync(home, 0o700);
  const client = (bucket) => new OSS({ region: `oss-${base.region}`, bucket, accessKeyId: base.accessKeyId, accessKeySecret: base.accessKeySecret, secure: true, timeout: 90000 });
  const pub = client('automage'); const priv = client('automage-skills-private');
  const conf = { ...base, home, privateAt: `oss://automage-skills-private/${prefix}`, publicAt: `oss://automage/${prefix}/skills`, toolRoot: path.resolve(__dirname, '../../../scripts/skills') }; atomic(path.join(home, 'config.json'), conf);
  const before = await pub.get('skills/index.json'); const originalHash = createHash('sha256').update(before.content).digest('hex');
  try {
    await pub.put(`${prefix}/skills/index.json`, before.content, { headers: { 'Content-Type': 'application/json', 'Cache-Control': 'max-age=60' } });
    const jobs = new Jobs(conf); const kick = jobs.kick.bind(jobs); jobs.kick = () => {};
    const packages = [['probe-one-1.0.0.zip', filled('probe-one')], ['probe-two-1.0.0.zip', filled('probe-two')], ['duplicate.zip', filled('probe-one')]];
    const submitted = [];
    for (const [name, entries] of packages) { const file = path.join(home, name); zip(file, entries); submitted.push(await jobs.receive(fs.createReadStream(file), name, 'smoke-cli', fs.statSync(file).size)); }
    submitted.push(await jobs.receive(require('node:stream').Readable.from('invalid ZIP'), 'invalid.zip', 'smoke-cli', 11));
    await kick();
    const results = submitted.map((job) => jobs.get(job.id));
    assert.deepEqual(results.map((job) => job.status), ['published', 'published', 'rejected', 'rejected']);
    const current = JSON.parse((await pub.get(`${prefix}/skills/index.json`)).content);
    assert.equal(current.skills.length, JSON.parse(before.content).skills.length + 2);
    const clip = await pub.head(`${prefix}/skills/probe-one/1.0.0/demo.mp4`); assert.match(clip.res.headers['cache-control'], /immutable/);
    const indexHead = await pub.head(`${prefix}/skills/index.json`); assert.match(indexHead.res.headers['cache-control'], /max-age=60/);
    const archive = await priv.get(`${prefix}/archive/probe-one/1.0.0.zip`); assert.equal(createHash('sha256').update(archive.content).digest('hex'), results[0].sha256);
    // Simulate interrupted acknowledgment after the index was committed; retry must reconcile the archive.
    const file = path.join(home, 'probe-one-1.0.0.zip'); const pending = await jobs.receive(fs.createReadStream(file), 'probe-one-1.0.0.zip', 'smoke-cli', fs.statSync(file).size);
    const recovery = jobs.get(pending.id); recovery.recover = true; recovery.phase = 'processing'; jobs.save(recovery);
    await kick(); assert.equal(jobs.get(pending.id).status, 'published');
    const after = await pub.get('skills/index.json'); assert.equal(createHash('sha256').update(after.content).digest('hex'), originalHash);
    console.log(JSON.stringify({ statuses: results.map((job) => job.status), recovered: jobs.get(pending.id).status, originalIndexUnchanged: true, mediaCache: clip.res.headers['cache-control'], indexCache: indexHead.res.headers['cache-control'], isolatedPrefix: prefix }, null, 2));
  } finally {
    for (const oss of [pub, priv]) {
      let marker;
      do { const listing = await oss.list({ prefix: `${prefix}/`, marker, 'max-keys': 1000 }); for (const object of listing.objects || []) await oss.delete(object.name); marker = listing.isTruncated ? listing.nextMarker : null; } while (marker);
    }
    fs.rmSync(home, { recursive: true, force: true });
  }
}
main().catch((error) => { console.error(error.message); process.exitCode = 1; });
