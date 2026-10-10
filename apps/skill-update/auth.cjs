'use strict';
const fs = require('node:fs');
const path = require('node:path');
const { randomBytes, randomUUID, scryptSync, timingSafeEqual } = require('node:crypto');
const { atomic } = require('./config.cjs');
const hash = (password) => { const salt = randomBytes(16).toString('hex'); return `${salt}:${scryptSync(password, salt, 32).toString('hex')}`; };
const verify = (password, encoded) => {
  if (typeof password !== 'string' || password.length > 256 || !encoded) return false;
  const [salt, value] = encoded.split(':');
  const expected = Buffer.from(value, 'hex');
  const actual = scryptSync(password, salt, 32);
  return expected.length === actual.length && timingSafeEqual(actual, expected);
};
const generate = () => randomBytes(18).toString('base64url');
class Auth {
  constructor(home) { this.file = path.join(home, 'passwords.json'); }
  read() { return JSON.parse(fs.readFileSync(this.file, 'utf8')); }
  init(adminPassword) {
    if (fs.existsSync(this.file)) throw new Error('密码列表已初始化');
    const initial = Array.from({ length: 5 }, (_, i) => ({ name: `团队 ${i + 1}`, password: generate() }));
    atomic(this.file, { admin: hash(adminPassword), entries: initial.map((item) => ({ id: randomUUID(), name: item.name, hash: hash(item.password), active: true, revision: 1 })) });
    return initial;
  }
  login(password, admin = false) {
    const data = this.read();
    if (admin) return verify(password, data.admin) ? { id: 'admin', revision: 1, admin: true } : null;
    const entry = data.entries.find((item) => item.active && verify(password, item.hash));
    return entry ? { id: entry.id, revision: entry.revision, admin: false } : null;
  }
  valid(session) {
    if (!session || session.expires < Date.now()) return false;
    if (session.admin) return true;
    return this.read().entries.some((item) => item.active && item.id === session.id && item.revision === session.revision);
  }
  list() { return this.read().entries.map(({ hash: _hash, ...item }) => item); }
  change(action, id, name) {
    const data = this.read();
    const created = [];
    const add = (label) => { const password = generate(); const entry = { id: randomUUID(), name: label, hash: hash(password), active: true, revision: 1 }; data.entries.push(entry); created.push({ id: entry.id, name: label, password }); };
    if (action === 'add') {
      if (data.entries.length >= 100) throw new Error('密码列表最多 100 项');
      if (typeof name !== 'string' || !name.trim() || name.length > 40) throw new Error('名称需为 1–40 个字符');
      add(name.trim());
    } else if (action === 'reset-all') {
      const labels = data.entries.filter((item) => item.active).map((item) => item.name);
      data.entries = [];
      for (const label of labels.length ? labels : Array.from({ length: 5 }, (_, i) => `团队 ${i + 1}`)) add(label);
    } else {
      const entry = data.entries.find((item) => item.id === id);
      if (!entry) throw new Error('密码项不存在');
      if (action === 'disable') entry.active = false;
      else if (action === 'delete') data.entries = data.entries.filter((item) => item.id !== id);
      else if (action === 'reset') { const password = generate(); entry.hash = hash(password); entry.active = true; created.push({ id, name: entry.name, password }); }
      else throw new Error('不支持的操作');
      entry.revision++;
    }
    atomic(this.file, data);
    return { entries: this.list(), created };
  }
}
module.exports = { Auth, hash, verify };
