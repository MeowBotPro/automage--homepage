'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { Readable } = require('node:stream');
const { Auth } = require('../auth.cjs');
const { Jobs, MAX } = require('../jobs.cjs');
const { createApp } = require('../server.cjs');
const { atomic } = require('../config.cjs');
const tmp = () => fs.mkdtempSync(path.join(os.tmpdir(), 'skill-update-test-'));

test('password rotation and disabling revoke sessions; hashes never leak through list', () => {
  const home = tmp(); const auth = new Auth(home); const initial = auth.init('admin-test');
  assert.equal(initial.length, 5); assert.equal(auth.login('wrong'), null);
  const session = { ...auth.login(initial[0].password), expires: Date.now() + 10000 };
  assert.equal(auth.valid(session), true); assert.equal(auth.list().some((item) => 'hash' in item), false);
  const result = auth.change('reset', session.id); assert.equal(result.created.length, 1);
  assert.equal(auth.valid(session), false); assert.equal(auth.login(initial[0].password), null);
  const next = { ...auth.login(result.created[0].password), expires: Date.now() + 10000 };
  auth.change('disable', next.id); assert.equal(auth.valid(next), false);
  const active = auth.login(initial[1].password); auth.change('reset-all'); assert.equal(auth.login(initial[1].password), null); assert.equal(auth.list().some((item) => item.id === active.id), false);
  fs.rmSync(home, { recursive: true });
});

test('uploads commit atomically, reject unsafe names and oversized bodies, and recover after restart', async () => {
  const home = tmp(); const jobs = new Jobs({ home }); jobs.kick = () => {};
  await assert.rejects(jobs.receive(Readable.from('data'), '../bad.zip', 'owner', 4), /文件名/);
  await assert.rejects(jobs.receive(Readable.from('data'), 'large.zip', 'owner', MAX + 1), /300/);
  const job = await jobs.receive(Readable.from([Buffer.from('zip contents')]), 'same.zip', 'owner', 12);
  assert.equal(job.status, 'queued'); assert.equal(fs.existsSync(jobs.file(job.id, 'upload.part')), false);
  const second = await jobs.receive(Readable.from('other'), 'same.zip', 'owner', 5); assert.notEqual(job.id, second.id);
  const current = jobs.get(job.id); current.phase = 'processing'; current.status = 'processing'; jobs.save(current);
  const restored = new Jobs({ home }); assert.equal(restored.get(job.id).status, 'queued'); assert.equal(restored.get(job.id).recover, true);
  const interrupted = restored.get(second.id); interrupted.status = 'receiving'; restored.save(interrupted);
  const again = new Jobs({ home }); assert.equal(again.get(second.id).status, 'failed');
  fs.rmSync(home, { recursive: true });
});

test('HTTP authentication, origin, ownership, administrator operations and revocation', async (t) => {
  const home = tmp(); const auth = new Auth(home); const initial = auth.init('admin-test'); const jobs = new Jobs({ home }); jobs.kick = () => {};
  const app = createApp({ home, origin: 'http://localhost', insecureTest: true }, { jobs });
  await new Promise((resolve) => app.web.listen(0, '127.0.0.1', resolve));
  t.after(() => { app.close(); fs.rmSync(home, { recursive: true, force: true }); });
  const base = `http://127.0.0.1:${app.web.address().port}`;
  const request = async (route, { method = 'GET', cookie, value, raw, origin = 'http://localhost', headers = {} } = {}) => {
    const res = await fetch(base + route, { method, headers: { Origin: origin, ...(cookie ? { Cookie: cookie } : {}), ...headers }, body: raw || (value ? JSON.stringify(value) : undefined) });
    return { status: res.status, cookie: res.headers.get('set-cookie')?.split(';')[0], body: await res.json() };
  };
  assert.equal((await request('/api/jobs')).status, 401);
  assert.equal((await request('/api/login', { method: 'POST', value: { password: initial[0].password }, origin: 'https://evil.test' })).status, 403);
  const one = await request('/api/login', { method: 'POST', value: { password: initial[0].password } }); assert.equal(one.status, 200);
  const received = await request('/api/uploads', { method: 'POST', cookie: one.cookie, raw: 'fakezip', headers: { 'X-File-Name': 'test.zip' } }); assert.equal(received.status, 202);
  const two = await request('/api/login', { method: 'POST', value: { password: initial[1].password } });
  assert.equal((await request('/api/jobs/' + received.body.id, { cookie: two.cookie })).status, 404);
  assert.equal((await request('/api/jobs', { cookie: two.cookie })).body.length, 0);
  assert.equal((await request('/api/admin/passwords', { cookie: one.cookie })).status, 403);
  const admin = await request('/api/login', { method: 'POST', value: { password: 'admin-test', admin: true } });
  const entries = (await request('/api/admin/passwords', { cookie: admin.cookie })).body.entries;
  assert.equal((await request('/api/jobs', { cookie: admin.cookie })).body.length, 1);
  const changed = await request('/api/admin/passwords', { method: 'POST', cookie: admin.cookie, value: { action: 'reset', id: entries[0].id } }); assert.equal(changed.body.created.length, 1);
  assert.equal((await request('/api/jobs', { cookie: one.cookie })).status, 401);
  for (let i = 0; i < 7; i++) await request('/api/login', { method: 'POST', value: { password: 'bad' } });
  assert.equal((await request('/api/login', { method: 'POST', value: { password: 'bad' } })).status, 429);
});
