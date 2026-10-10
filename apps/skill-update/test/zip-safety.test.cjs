'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const zlib = require('node:zlib');
const { check, zipEntries } = require('../../../scripts/skills/skillpack.cjs');
const { zip, tmp, filled } = require('../../../tests/skill-fixtures.cjs');
function central(data) { return data.indexOf(Buffer.from([0x50,0x4b,0x01,0x02])); }
test('unsafe paths, duplicate names, symlinks and forged ZIP bounds are rejected', () => {
  const root = tmp(); const file = path.join(root, 'probe.zip');
  zip(file, [...filled(), ['../evil', Buffer.from('x')]]); assert.equal(check(file).ok, false);
  const entries = filled(); zip(file, [...entries, entries[0]]); assert.match(check(file).errors.join(' '), /重复路径/);
  zip(file, filled()); let bytes = fs.readFileSync(file); bytes.writeUInt32LE((0xa1ff << 16) >>> 0, central(bytes) + 38); fs.writeFileSync(file, bytes); assert.match(check(file).errors.join(' '), /链接/);
  zip(file, filled()); bytes = fs.readFileSync(file); bytes.writeUInt32LE(0xffffff00, bytes.length - 22 + 12); fs.writeFileSync(file, bytes); assert.throws(() => zipEntries(file), /越界/);
  fs.rmSync(root, { recursive: true });
});
test('a false small expanded length cannot inflate an arbitrarily large body', () => {
  const root = tmp(); const file = path.join(root, 'bomb.zip');
  const packed = zlib.deflateRawSync(Buffer.alloc(1024 * 1024)); const name = Buffer.from('skill.json');
  const local = Buffer.alloc(30); local.writeUInt32LE(0x04034b50); local.writeUInt16LE(8,8); local.writeUInt32LE(packed.length,18); local.writeUInt32LE(1,22); local.writeUInt16LE(name.length,26);
  const c = Buffer.alloc(46); c.writeUInt32LE(0x02014b50); c.writeUInt16LE(8,10); c.writeUInt32LE(packed.length,20); c.writeUInt32LE(1,24); c.writeUInt16LE(name.length,28);
  const end = Buffer.alloc(22); end.writeUInt32LE(0x06054b50); end.writeUInt16LE(1,8); end.writeUInt16LE(1,10); end.writeUInt32LE(c.length+name.length,12); end.writeUInt32LE(local.length+name.length+packed.length,16);
  fs.writeFileSync(file, Buffer.concat([local,name,packed,c,name,end])); assert.equal(check(file).ok, false);
  fs.rmSync(root, { recursive: true });
});
test('corrupt ZIP is a validation rejection with a reason, not an infrastructure failure', () => {
  const root = tmp(); const file = path.join(root, 'broken.zip'); fs.writeFileSync(file, 'not a ZIP');
  const result = check(file); assert.equal(result.ok, false); assert.match(result.errors.join(' '), /不是有效的 zip/);
  fs.rmSync(root, { recursive: true });
});
