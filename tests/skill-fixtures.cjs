/* Test fixtures for the skill kit: packages built from the template, with a minimal MP4 and PNG that carry
   only what the tool reads, zipped without compression. Not a test file itself (no .test in its name). */
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const zlib = require('node:zlib');

const TEMPLATE = path.join(__dirname, '../docs/skill-delivery/template/churn-autopsy');

/* A minimal MP4: only the boxes the tool reads. */
const box = (type, ...parts) => {
  const body = Buffer.concat(parts);
  const head = Buffer.alloc(8);
  head.writeUInt32BE(body.length + 8);
  head.write(type, 4, 'latin1');
  return Buffer.concat([head, body]);
};
const u32 = (...values) => Buffer.concat(values.map((v) => { const b = Buffer.alloc(4); b.writeUInt32BE(v); return b; }));
function mp4({ codec = 'avc1', width = 1920, height = 1080, seconds = 90, faststart = true, brand = 'isom' } = {}) {
  const mvhd = box('mvhd', Buffer.alloc(4), u32(0, 0, 1000, seconds * 1000), Buffer.alloc(80));
  const entry = Buffer.alloc(78);
  entry.writeUInt32BE(78);
  entry.write(codec, 4, 'latin1');
  entry.writeUInt16BE(width, 32);
  entry.writeUInt16BE(height, 34);
  const track = (handler, sample) => box('trak', box('mdia', box('hdlr', Buffer.alloc(8), Buffer.from(handler, 'latin1'), Buffer.alloc(13)), box('minf', box('stbl', box('stsd', Buffer.alloc(4), u32(1), sample)))));
  const audio = Buffer.alloc(36);
  audio.writeUInt32BE(36);
  audio.write('mp4a', 4, 'latin1');
  const moov = box('moov', mvhd, track('vide', entry), track('soun', audio));
  const mdat = box('mdat', Buffer.alloc(2048, 7));
  const ftyp = box('ftyp', Buffer.from(brand, 'latin1'), u32(512), Buffer.from('isomavc1', 'latin1'));
  return Buffer.concat(faststart ? [ftyp, moov, mdat] : [ftyp, mdat, moov]);
}
function png(width = 1280, height = 720) {
  const head = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 13, 0x49, 0x48, 0x44, 0x52]);
  return Buffer.concat([head, u32(width, height), Buffer.from([8, 2, 0, 0, 0]), u32(0)]);
}
/* A stored (uncompressed) zip with UTF-8 names. */
function zip(file, entries) {
  const locals = [];
  const centrals = [];
  let offset = 0;
  for (const [name, data] of entries) {
    const n = Buffer.from(name, 'utf8');
    const local = Buffer.alloc(30);
    local.writeUInt32LE(0x04034b50, 0); local.writeUInt16LE(20, 4); local.writeUInt16LE(0x800, 6);
    local.writeUInt32LE(zlib.crc32(data), 14); local.writeUInt32LE(data.length, 18); local.writeUInt32LE(data.length, 22); local.writeUInt16LE(n.length, 26);
    const central = Buffer.alloc(46);
    central.writeUInt32LE(0x02014b50, 0); central.writeUInt16LE(20, 4); central.writeUInt16LE(20, 6); central.writeUInt16LE(0x800, 8);
    central.writeUInt32LE(zlib.crc32(data), 16); central.writeUInt32LE(data.length, 20); central.writeUInt32LE(data.length, 24); central.writeUInt16LE(n.length, 28); central.writeUInt32LE(offset, 42);
    locals.push(local, n, data);
    centrals.push(central, n);
    offset += 30 + n.length + data.length;
  }
  const dir = Buffer.concat(centrals);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0); end.writeUInt16LE(entries.length, 8); end.writeUInt16LE(entries.length, 10); end.writeUInt32LE(dir.length, 12); end.writeUInt32LE(offset, 16);
  fs.writeFileSync(file, Buffer.concat([...locals, dir, end]));
  return file;
}

const tmp = () => fs.mkdtempSync(path.join(os.tmpdir(), 'skillpack-'));
/** The template, filled in as a new skill: id, folder and placeholders changed, media added. */
function filled(id = 'retention-probe', change = (m) => m) {
  const manifest = JSON.parse(fs.readFileSync(path.join(TEMPLATE, 'skill.json'), 'utf8'));
  Object.assign(manifest, { id, version: '1.0.0' });
  Object.assign(manifest.skill, { upstream: 'https://example.invalid/upstream', license: 'MIT', maintainer: '交付组' });
  manifest.media.poster = 'media/poster.png';
  const skillMd = fs.readFileSync(path.join(TEMPLATE, 'skill/SKILL.md'), 'utf8').replace('name: churn-autopsy', `name: ${id}`);
  return [
    [`${id}/skill.json`, Buffer.from(JSON.stringify(change(manifest)))],
    [`${id}/skill/SKILL.md`, Buffer.from(skillMd)],
    [`${id}/media/demo.mp4`, mp4()],
    [`${id}/media/poster.png`, png()],
    [`__MACOSX/${id}/._skill.json`, Buffer.from('x')],
    [`${id}/.DS_Store`, Buffer.from('x')],
  ];
}

module.exports = { mp4, png, zip, tmp, filled };
