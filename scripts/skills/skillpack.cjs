#!/usr/bin/env node
/* skillpack — the skill delivery kit's one tool. Rules: docs/skill-delivery/README.md.

     check   <package.zip|folder> [--denylist file]           is this package fit to go on the site
     stage   <package.zip|folder> --index index.json --out dir  the files to upload for it: media + the new index
     unlist  <id> --index index.json --out dir                 the index without that skill
     inspect <video.mp4 …>                                     can a browser stream this video as it is
     export  --media dir --out dir [--version 1.0.0]           first fill: the site's bundled skills as an index
                                                               (run inside the website repository)

   check, stage, unlist and inspect need only Node 18+; the pipeline runs the same commands. */
"use strict";

const fs = require("node:fs");
const path = require("node:path");
const zlib = require("node:zlib");

const INDEX_FORMAT = "automage.skill-index/1";
const KB = 1024;
const MB = 1024 * KB;
const LIMIT = { video: 100 * MB, videoSoft: 50 * MB, poster: 1 * MB, posterSoft: 400 * KB, body: 100 * MB, total: 300 * MB, seconds: 300 };
const SCHEMA_FILE = [path.join(__dirname, "skill.schema.json"), path.join(__dirname, "../../docs/skill-delivery/skill.schema.json")].find((file) => fs.existsSync(file));

/* ── reading a package: a zip, or a folder before it is zipped ─────────────────────────────── */

function zipEntries(file) {
  const fd = fs.openSync(file, "r");
  try {
    const size = fs.fstatSync(fd).size;
    const tail = Buffer.alloc(Math.min(size, 65557));
    fs.readSync(fd, tail, 0, tail.length, size - tail.length);
    let end = -1;
    for (let i = tail.length - 22; i >= 0; i--) if (tail.readUInt32LE(i) === 0x06054b50) { end = i; break; }
    if (end < 0) throw new Error("不是有效的 zip 文件");
    const count = tail.readUInt16LE(end + 10);
    const dirSize = tail.readUInt32LE(end + 12);
    const dirAt = tail.readUInt32LE(end + 16);
    if (count === 0xffff || dirAt === 0xffffffff) throw new Error("压缩包超过 4GB 或文件太多（zip64），请先压缩视频");
    if (count > 10000 || dirSize > 16 * 1024 * 1024 || dirAt + dirSize > size - tail.length + end) throw new Error("zip 目录越界或文件数量过多");
    const dir = Buffer.alloc(dirSize);
    fs.readSync(fd, dir, 0, dirSize, dirAt);
    const entries = [];
    let expanded = 0;
    for (let at = 0, n = 0; n < count; n++) {
      if (at + 46 > dir.length) throw new Error("zip 目录截断");
      if (dir.readUInt32LE(at) !== 0x02014b50) throw new Error("zip 目录损坏");
      const flags = dir.readUInt16LE(at + 8);
      const method = dir.readUInt16LE(at + 10);
      const crc = dir.readUInt32LE(at + 16);
      const packed = dir.readUInt32LE(at + 20);
      const size = dir.readUInt32LE(at + 24);
      const nameLength = dir.readUInt16LE(at + 28);
      const offset = dir.readUInt32LE(at + 42);
      const raw = dir.subarray(at + 46, at + 46 + nameLength);
      if (at + 46 + nameLength + dir.readUInt16LE(at + 30) + dir.readUInt16LE(at + 32) > dir.length) throw new Error("zip 文件名越界");
      expanded += size;
      if (expanded > LIMIT.total) throw new Error("整个包解开超过 300 MB 上限");
      if (offset + 30 > dirAt || packed > dirAt - offset - 30) throw new Error("zip 内容越界");
      const unixMode = dir.readUInt32LE(at + 38) >>> 16;
      const utf8 = Boolean(flags & 0x800) || isUtf8(raw);
      const name = raw.toString(utf8 ? "utf8" : "latin1");
      at += 46 + nameLength + dir.readUInt16LE(at + 30) + dir.readUInt16LE(at + 32);
      entries.push({
        name, size, link: (unixMode & 0xf000) === 0xa000, unclearName: !utf8, encrypted: Boolean(flags & 1),
        read() {
          const fd2 = fs.openSync(file, "r");
          try {
            const head = Buffer.alloc(30);
            fs.readSync(fd2, head, 0, 30, offset);
            if (head.readUInt32LE(0) !== 0x04034b50) throw new Error(`${name}：压缩包损坏`);
            const start = offset + 30 + head.readUInt16LE(26) + head.readUInt16LE(28);
            if (start + packed > dirAt) throw new Error(`${name}：zip 数据越界`);
            const data = Buffer.alloc(packed);
            if (fs.readSync(fd2, data, 0, packed, start) !== packed) throw new Error(`${name}：zip 数据截断`);
            const out = method === 0 ? data : method === 8 ? zlib.inflateRawSync(data, { maxOutputLength: Math.max(1, size) }) : null;
            if (!out) throw new Error(`${name}：不支持的压缩方式（${method}）`);
            if (out.length !== size || (zlib.crc32 && zlib.crc32(out) !== crc)) throw new Error(`${name}：内容校验不通过，压缩包可能损坏`);
            return out;
          } finally {
            fs.closeSync(fd2);
          }
        },
      });
    }
    return entries;
  } finally {
    fs.closeSync(fd);
  }
}

function isUtf8(buffer) {
  try {
    new TextDecoder("utf-8", { fatal: true }).decode(buffer);
    return true;
  } catch {
    return false;
  }
}

function folderEntries(root) {
  const entries = [];
  const walk = (dir) => {
    for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
      const abs = path.join(dir, item.name);
      const name = path.relative(root, abs).split(path.sep).join("/");
      if (item.isDirectory()) { entries.push({ name: `${name}/`, size: 0 }); walk(abs); }
      else if (item.isFile()) entries.push({ name, size: fs.statSync(abs).size, read: () => fs.readFileSync(abs) });
      else entries.push({ name, size: 0, link: true });
    }
  };
  walk(root);
  return entries;
}

const JUNK = /(^|\/)(__MACOSX\/|\.DS_Store$|Thumbs\.db$|desktop\.ini$|\.gitkeep$|\._[^/]*$)/;
const FORBIDDEN = /(^|\/)(\.env(\.[^/]*)?$|[^/]*\.(pem|key|p12|pfx)$|id_rsa[^/]*$|\.git\/|node_modules\/|__pycache__\/|\.venv\/|venv\/)/;

/** The package's files by their path inside it, whether zipped with its folder or without. */
function openPackage(source) {
  const isZip = fs.statSync(source).isFile();
  const all = isZip ? zipEntries(source) : folderEntries(source);
  const errors = [];
  const ignored = [];
  const files = new Map();
  for (const entry of all) {
    if (entry.link) { errors.push(`不要放链接文件：${entry.name}`); continue; }
    if (entry.name.endsWith("/")) continue;
    if (JUNK.test(entry.name)) { ignored.push(entry.name); continue; }
    if (entry.name.startsWith("/") || /^[a-z]:/i.test(entry.name) || entry.name.includes("\0") || entry.name.includes("\\") || entry.name.split("/").some((part) => part === ".." || part === "." || part === "")) { errors.push(`不安全的路径：${entry.name}`); continue; }
    if (entry.link) { errors.push(`不要放链接文件：${entry.name}`); continue; }
    if (entry.encrypted) { errors.push(`不要加密压缩：${entry.name}`); continue; }
    if (files.has(entry.name)) { errors.push(`重复路径：${entry.name}`); continue; }
    files.set(entry.name, entry);
  }
  const tops = new Set([...files.keys()].map((name) => name.split("/")[0]));
  let folder = null;
  if (!files.has("skill.json") && tops.size === 1) {
    folder = [...tops][0];
    for (const [name, entry] of [...files]) { files.delete(name); files.set(name.slice(folder.length + 1), entry); }
  }
  return { files, folder, ignored, errors, isZip, name: path.basename(source) };
}

/* ── the manifest: a small JSON Schema reader for exactly what skill.schema.json uses ─────────── */

const TYPE_NAME = { string: "文字", integer: "整数", number: "数字", boolean: "true 或 false", array: "列表", object: "对象" };

function validate(schema, value, at = "", errors = []) {
  const here = at || "skill.json";
  const child = (key) => (at ? `${at}.${key}` : key);
  if ("const" in schema && value !== schema.const) return errors.push(`${here} 应为 ${JSON.stringify(schema.const)}`), errors;
  if (schema.enum && !schema.enum.includes(value)) return errors.push(`${here} 只能是：${schema.enum.join(" / ")}（现在是 ${JSON.stringify(value)}）`), errors;
  const type = schema.type;
  if (type) {
    const ok = type === "integer" ? Number.isInteger(value) : type === "array" ? Array.isArray(value) : type === "object" ? value !== null && typeof value === "object" && !Array.isArray(value) : typeof value === type;
    if (!ok) return errors.push(`${here} 应为${TYPE_NAME[type]}`), errors;
  }
  if (typeof value === "string") {
    const length = [...value].length;
    if (value !== value.trim()) errors.push(`${here} 首尾有空格`);
    if (schema.minLength !== undefined && length < schema.minLength) errors.push(`${here} 太短：${length} 个字，至少 ${schema.minLength}`);
    if (schema.maxLength !== undefined && length > schema.maxLength) errors.push(`${here} 太长：${length} 个字，最多 ${schema.maxLength}`);
    if (schema.pattern && !new RegExp(schema.pattern, "u").test(value)) errors.push(`${here} 格式不对：${JSON.stringify(value)}`);
  }
  if (typeof value === "number" && schema.minimum !== undefined && value < schema.minimum) errors.push(`${here} 不能小于 ${schema.minimum}`);
  if (Array.isArray(value)) {
    if (schema.minItems !== undefined && value.length < schema.minItems) errors.push(`${here} 至少 ${schema.minItems} 条`);
    if (schema.maxItems !== undefined && value.length > schema.maxItems) errors.push(`${here} 最多 ${schema.maxItems} 条`);
    if (schema.uniqueItems && new Set(value.map((item) => JSON.stringify(item))).size !== value.length) errors.push(`${here} 有重复`);
    if (schema.items) value.forEach((item, i) => validate(schema.items, item, `${here}[${i}]`, errors));
  }
  if (value && typeof value === "object" && !Array.isArray(value)) {
    for (const key of schema.required ?? []) if (!(key in value)) errors.push(`${child(key)} 没填`);
    for (const [key, item] of Object.entries(value)) {
      if (schema.properties?.[key]) validate(schema.properties[key], item, child(key), errors);
      else if (schema.additionalProperties === false) errors.push(`${child(key)}：不认识这个字段`);
    }
    if (schema.if && schema.then && validate(schema.if, value, at, []).length === 0) validate(schema.then, value, at, errors);
  }
  return errors;
}

function strings(value, at = "", out = []) {
  if (typeof value === "string") out.push([at, value]);
  else if (Array.isArray(value)) value.forEach((item, i) => strings(item, `${at}[${i}]`, out));
  else if (value && typeof value === "object") for (const [key, item] of Object.entries(value)) strings(item, at ? `${at}.${key}` : key, out);
  return out;
}

const PLACEHOLDER = /<[^<>]{1,40}>|\b(TODO|TBD|FIXME|XXX)\b|待补充|待定|lorem ipsum/i;
/* The site is a stable service: public copy never says it is in development (see the handoff, §1.5). */
const DEV_WORDS = /内测|公测|测试版|开发中|即将上线|敬请期待|已经能用|演示版|\bbeta\b|coming soon|\bdemo版/i;

/* ── media: what a browser needs to stream the video and draw the poster ───────────────────── */

/** The boxes of an MP4/MOV, read without decoding: container brand, codecs, size, length, and whether
    the index (moov) comes before the data, which a browser needs to start playing before it has it all. */
function inspectVideo(read, size) {
  const at = (pos, length) => read(pos, length);
  const result = { size, brand: null, faststart: null, seconds: null, video: null, audio: null };
  const top = [];
  for (let pos = 0; pos + 8 <= size;) {
    const head = at(pos, Math.min(16, size - pos));
    let length = head.readUInt32BE(0);
    const type = head.toString("latin1", 4, 8);
    let header = 8;
    if (length === 1) { length = Number(head.readBigUInt64BE(8)); header = 16; } else if (length === 0) length = size - pos;
    if (length < header) break;
    top.push({ type, start: pos, length, header });
    pos += length;
  }
  const ftyp = top.find((box) => box.type === "ftyp");
  if (ftyp) result.brand = at(ftyp.start + ftyp.header, 4).toString("latin1");
  const moov = top.find((box) => box.type === "moov");
  const mdat = top.find((box) => box.type === "mdat");
  if (!moov) return result;
  result.faststart = !mdat || moov.start < mdat.start;
  const buf = at(moov.start, moov.length);
  const boxes = (start, end) => {
    const list = [];
    for (let pos = start; pos + 8 <= end;) {
      let length = buf.readUInt32BE(pos);
      let header = 8;
      if (length === 1) { length = Number(buf.readBigUInt64BE(pos + 8)); header = 16; } else if (length === 0) length = end - pos;
      if (length < header || pos + length > end) break;
      list.push({ type: buf.toString("latin1", pos + 4, pos + 8), start: pos, end: pos + length, body: pos + header });
      pos += length;
    }
    return list;
  };
  const find = (list, type) => list.find((box) => box.type === type);
  const inner = boxes(moov.header, buf.length);
  const mvhd = find(inner, "mvhd");
  if (mvhd) {
    const v1 = buf[mvhd.body] === 1;
    const scale = buf.readUInt32BE(mvhd.body + (v1 ? 20 : 12));
    const duration = v1 ? Number(buf.readBigUInt64BE(mvhd.body + 24)) : buf.readUInt32BE(mvhd.body + 16);
    if (scale) result.seconds = Math.round((duration / scale) * 10) / 10;
  }
  for (const trak of inner.filter((box) => box.type === "trak")) {
    const mdia = find(boxes(trak.body, trak.end), "mdia");
    if (!mdia) continue;
    const media = boxes(mdia.body, mdia.end);
    const hdlr = find(media, "hdlr");
    const handler = hdlr ? buf.toString("latin1", hdlr.body + 8, hdlr.body + 12) : "";
    const minf = find(media, "minf");
    const stbl = minf && find(boxes(minf.body, minf.end), "stbl");
    const stsd = stbl && find(boxes(stbl.body, stbl.end), "stsd");
    if (!stsd) continue;
    const entry = stsd.body + 8;
    const codec = buf.toString("latin1", entry + 4, entry + 8);
    if (handler === "vide" && !result.video) result.video = { codec, width: buf.readUInt16BE(entry + 32), height: buf.readUInt16BE(entry + 34) };
    if (handler === "soun" && !result.audio) result.audio = { codec };
  }
  return result;
}

/** What stops a browser playing it as it is (errors), and what is merely off the recommendation (warnings). */
function judgeVideo(info, label) {
  const errors = [];
  const warnings = [];
  const fix = "（用 ffmpeg 转一次，命令见 README“视频和封面”）";
  if (!info.brand && !info.video) errors.push(`${label} 读不出视频内容，不是 MP4`);
  else {
    if (info.brand === "qt  ") errors.push(`${label} 是 QuickTime（.mov）格式，要转成 MP4${fix}`);
    if (!info.video) errors.push(`${label} 里没有视频画面`);
    else if (!["avc1", "avc3"].includes(info.video.codec)) errors.push(`${label} 的视频编码是 ${info.video.codec.trim()}，网页要 H.264${fix}`);
    if (info.audio && info.audio.codec !== "mp4a") errors.push(`${label} 的声音编码是 ${info.audio.codec.trim()}，网页要 AAC${fix}`);
    if (info.faststart === false) errors.push(`${label} 不能边下边播（moov 在文件末尾）${fix}`);
  }
  if (info.size > LIMIT.video) errors.push(`${label} 有 ${mb(info.size)}，上限 ${mb(LIMIT.video)}${fix}`);
  else if (info.size > LIMIT.videoSoft) warnings.push(`${label} 有 ${mb(info.size)}，建议 ${mb(LIMIT.videoSoft)} 以内`);
  if (info.seconds > LIMIT.seconds) warnings.push(`${label} 长 ${clock(info.seconds)}，建议 5 分钟以内`);
  if (info.video) {
    const { width, height } = info.video;
    if (width < 1280) warnings.push(`${label} 只有 ${width}×${height}，建议 1280×720 或 1920×1080`);
    else if (width > 1920) warnings.push(`${label} 是 ${width}×${height}，超过 1920×1080 没有必要，文件会很大`);
    if (height && Math.abs(width / height - 16 / 9) > 0.02) warnings.push(`${label} 是 ${width}×${height}，不是 16:9，播放时会有黑边`);
  }
  return { errors, warnings };
}

function inspectImage(buf) {
  if (buf.length > 24 && buf.readUInt32BE(0) === 0x89504e47) return { type: "png", width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
  if (buf.length > 4 && buf[0] === 0xff && buf[1] === 0xd8) {
    for (let i = 2; i + 9 < buf.length;) {
      if (buf[i] !== 0xff) { i++; continue; }
      const marker = buf[i + 1];
      if (marker === 0xff) { i++; continue; }
      if (marker === 0xda) break;
      if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker)) return { type: "jpg", width: buf.readUInt16BE(i + 7), height: buf.readUInt16BE(i + 5) };
      if (marker === 0xd8 || marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) { i += 2; continue; }
      i += 2 + buf.readUInt16BE(i + 2);
    }
    return { type: "jpg", width: null, height: null };
  }
  if (buf.length > 30 && buf.toString("latin1", 0, 4) === "RIFF" && buf.toString("latin1", 8, 12) === "WEBP") {
    const chunk = buf.toString("latin1", 12, 16);
    if (chunk === "VP8X") return { type: "webp", width: 1 + buf.readUIntLE(24, 3), height: 1 + buf.readUIntLE(27, 3) };
    if (chunk === "VP8L") { const b = buf.subarray(21, 25); return { type: "webp", width: 1 + (b[0] | ((b[1] & 0x3f) << 8)), height: 1 + ((b[1] >> 6) | (b[2] << 2) | ((b[3] & 0x0f) << 10)) }; }
    return { type: "webp", width: buf.readUInt16LE(26) & 0x3fff, height: buf.readUInt16LE(28) & 0x3fff };
  }
  return { type: null };
}

const mb = (bytes) => `${(bytes / MB).toFixed(1)} MB`;
const clock = (seconds) => `${Math.floor(seconds / 60)}:${String(Math.round(seconds % 60)).padStart(2, "0")}`;

/* ── check ─────────────────────────────────────────────────────────────────────────────────── */

function check(source, { denylist = [], packageName } = {}) {
  let pkg;
  try { pkg = openPackage(source); }
  catch (error) {
    return { ok: false, errors: [`压缩包读取失败：${error.message}`], warnings: [], ignored: [], manifest: null, video: null, poster: null, pkg: { name: path.basename(source), files: new Map() } };
  }
  if (packageName) pkg.name = packageName;
  const errors = [...pkg.errors];
  const warnings = [];
  const { files } = pkg;
  const result = () => ({ ok: errors.length === 0, errors, warnings, ignored: pkg.ignored, manifest, pkg, video, poster });
  let manifest = null;
  let video = null;
  let poster = null;

  for (const name of files.keys()) {
    if (FORBIDDEN.test(name)) errors.push(`不要带上：${name}（密钥、环境文件或依赖目录）`);
    if (files.get(name).unclearName && /[^\x20-\x7e]/.test(name)) warnings.push(`文件名编码不明：${name}，建议用英文文件名`);
  }
  const total = [...files.values()].reduce((sum, entry) => sum + entry.size, 0);
  if (total > LIMIT.total) { errors.push(`整个包解开有 ${mb(total)}，上限 ${mb(LIMIT.total)}`); return result(); }

  if (!files.has("skill.json")) {
    errors.push("找不到 skill.json：它要在包的最外层（或唯一的那个文件夹里）");
    return result();
  }
  try {
    manifest = JSON.parse(files.get("skill.json").read().toString("utf8").replace(/^﻿/, ""));
  } catch (error) {
    errors.push(`skill.json 不是合法的 JSON：${error.message}`);
    return result();
  }
  if (!SCHEMA_FILE) throw new Error("找不到 skill.schema.json：把它和 skillpack.cjs 放在同一个文件夹");
  errors.push(...validate(JSON.parse(fs.readFileSync(SCHEMA_FILE, "utf8")), manifest));
  for (const [at, text] of strings(manifest)) {
    if (PLACEHOLDER.test(text)) errors.push(`${at} 还是占位内容：${JSON.stringify(text)}`);
    if (at.startsWith("listing") && DEV_WORDS.test(text)) errors.push(`${at} 有开发阶段的说法（${text.match(DEV_WORDS)[0]}）：官网文案要按稳定服务来写`);
    if (at.startsWith("listing")) for (const term of denylist) if (text.includes(term)) errors.push(`${at} 含有不能公开的词：${term}`);
  }
  const id = typeof manifest.id === "string" ? manifest.id : "";
  const version = typeof manifest.version === "string" ? manifest.version : "";
  if (pkg.folder && id && pkg.folder !== id) errors.push(`文件夹名 ${pkg.folder} 要和 id 一致（${id}）`);
  if (pkg.isZip && id && version && pkg.name !== `${id}-${version}.zip`) warnings.push(`压缩包建议命名为 ${id}-${version}.zip（现在是 ${pkg.name}）`);

  const posterPath = typeof manifest.media?.poster === "string" ? manifest.media.poster : null;
  for (const name of files.keys()) {
    const known = name === "skill.json" || name.startsWith("skill/") || name === "README.md" || name === "CHANGELOG.md" || name === "media/demo.mp4" || name === posterPath;
    if (!known) errors.push(name.startsWith("media/") ? `media/ 里只放 demo.mp4 和清单里写的封面：${name}` : `不认识的文件：${name}（包里只放 skill.json、skill/、media/）`);
  }

  const body = files.get("skill/SKILL.md");
  if (!body) errors.push("找不到 skill/SKILL.md：skill 本体放在 skill/ 目录下");
  else {
    const text = body.read().toString("utf8").replace(/^﻿/, "");
    const front = text.match(/^---\r?\n([\s\S]*?)\r?\n---/);
    if (!front || !/^name:\s*\S/m.test(front[1]) || !/^description:\s*\S/m.test(front[1])) errors.push("skill/SKILL.md 开头要有 --- 包起来的 name: 和 description:");
    else {
      const name = front[1].match(/^name:\s*(.+)$/m)[1].trim().replace(/^["']|["']$/g, "");
      if (id && name !== id) warnings.push(`skill/SKILL.md 的 name 是 ${name}，和 id（${id}）不一样`);
    }
  }
  const bodySize = [...files].filter(([name]) => name.startsWith("skill/")).reduce((sum, [, entry]) => sum + entry.size, 0);
  if (bodySize > LIMIT.body) errors.push(`skill/ 有 ${mb(bodySize)}，上限 ${mb(LIMIT.body)}：大文件不要放进 skill 本体`);

  const clip = files.get("media/demo.mp4");
  if (!clip) errors.push("找不到 media/demo.mp4：每个 skill 都要带演示视频");
  else {
    const data = clip.read();
    video = inspectVideo((pos, length) => data.subarray(pos, pos + length), data.length);
    const verdict = judgeVideo(video, "media/demo.mp4");
    errors.push(...verdict.errors);
    warnings.push(...verdict.warnings);
  }
  if (posterPath && files.has(posterPath)) {
    const data = files.get(posterPath).read();
    poster = { ...inspectImage(data), size: data.length, ext: posterPath.split(".").pop() };
    const wanted = poster.ext === "jpeg" ? "jpg" : poster.ext;
    if (poster.type !== wanted) errors.push(`${posterPath} 的内容不是 ${wanted} 图片`);
    if (data.length > LIMIT.poster) errors.push(`${posterPath} 有 ${mb(data.length)}，上限 ${mb(LIMIT.poster)}`);
    else if (data.length > LIMIT.posterSoft) warnings.push(`${posterPath} 有 ${Math.round(data.length / KB)} KB，建议 ${LIMIT.posterSoft / KB} KB 以内`);
    if (poster.width && poster.height && Math.abs(poster.width / poster.height - 16 / 9) > 0.03) warnings.push(`${posterPath} 是 ${poster.width}×${poster.height}，封面要 16:9，和视频一样`);
    if (poster.width && poster.width < 1280) warnings.push(`${posterPath} 只有 ${poster.width} 像素宽，建议 1280 以上`);
  } else if (posterPath) errors.push(`找不到 ${posterPath}`);
  return result();
}

function report(title, outcome) {
  const lines = [title];
  for (const error of outcome.errors) lines.push(`  ✗ ${error}`);
  for (const warning of outcome.warnings) lines.push(`  ! ${warning}`);
  if (outcome.ignored?.length) lines.push(`  已忽略 ${outcome.ignored.length} 个系统生成的文件（__MACOSX、.DS_Store 等）`);
  return lines.join("\n");
}

/* ── the index ─────────────────────────────────────────────────────────────────────────────── */

/** The index entry a checked package becomes. Its paths are relative to the index's folder; a published
    version's files are never written again, so these paths can be cached for good. Preview is always the
    generic document card: the other previews on the site are drawn for particular skills. */
function entryOf(manifest, posterExt, updatedAt) {
  const { id, version, listing } = manifest;
  return {
    id, version, domain: listing.domain, title: listing.title, summary: listing.summary, inputs: listing.inputs, output: listing.output,
    groups: listing.groups, keywords: listing.keywords ?? [], subSkills: listing.subSkills ?? 0,
    story: { ...listing.story, preview: "document" },
    media: { video: `${id}/${version}/demo.mp4`, poster: `${id}/${version}/poster.${posterExt}` },
    updatedAt,
  };
}

function readIndex(file) {
  const index = JSON.parse(fs.readFileSync(file, "utf8"));
  if (index?.format !== INDEX_FORMAT || !Array.isArray(index.skills)) throw new Error(`${file} 不是 ${INDEX_FORMAT} 格式的索引`);
  return index;
}

const newer = (a, b) => {
  const [x, y] = [a, b].map((v) => String(v).split(".").map(Number));
  for (let i = 0; i < 3; i++) if ((x[i] || 0) !== (y[i] || 0)) return (x[i] || 0) > (y[i] || 0);
  return false;
};

function emptyOut(out) {
  if (fs.existsSync(out) && fs.readdirSync(out).length) throw new Error(`${out} 不是空文件夹：每次用一个新的输出目录，免得把旧文件一起传上去`);
  fs.mkdirSync(out, { recursive: true });
}

function writeIndex(out, skills) {
  const index = { format: INDEX_FORMAT, generatedAt: new Date().toISOString(), skills };
  fs.writeFileSync(path.join(out, "index.json"), `${JSON.stringify(index, null, 2)}\n`);
  return index;
}

/** Why a package cannot go up, as opposed to something going wrong while handling it. */
class Rejection extends Error {}

const CACHE = { media: "public, max-age=31536000, immutable", index: "public, max-age=60" };
const TYPE = { mp4: "video/mp4", jpg: "image/jpeg", png: "image/png", webp: "image/webp", json: "application/json; charset=utf-8" };

/** Writes what a checked, fit package becomes into `out`: its video and poster at <id>/<version>/, and the
    current index with its entry added (or replaced, where the older version stood). Returns the uploads,
    media first and the index last, which is the order they must go up in. */
function stageFiles(outcome, current, out) {
  const { manifest } = outcome;
  const at = current.skills.findIndex((skill) => skill.id === manifest.id);
  if (at >= 0 && current.skills[at].version === manifest.version) throw new Rejection(`${manifest.id} ${manifest.version} 已经发布过：有改动请升版本号再交`);
  if (at >= 0 && !newer(manifest.version, current.skills[at].version)) throw new Rejection(`${manifest.id} 线上是 ${current.skills[at].version}，交上来的 ${manifest.version} 不比它新`);
  emptyOut(out);
  const folder = path.join(out, manifest.id, manifest.version);
  fs.mkdirSync(folder, { recursive: true });
  const poster = `poster.${outcome.poster.ext}`;
  fs.writeFileSync(path.join(folder, "demo.mp4"), outcome.pkg.files.get("media/demo.mp4").read());
  fs.writeFileSync(path.join(folder, poster), outcome.pkg.files.get(manifest.media.poster).read());
  const entry = entryOf(manifest, outcome.poster.ext, new Date().toISOString().slice(0, 10));
  const skills = [...current.skills];
  if (at >= 0) skills[at] = entry; else skills.push(entry);
  writeIndex(out, skills);
  const key = (name) => `${manifest.id}/${manifest.version}/${name}`;
  return {
    manifest, replaced: at >= 0, count: skills.length,
    uploads: [
      { file: path.join(folder, "demo.mp4"), key: key("demo.mp4"), type: TYPE.mp4, cache: CACHE.media },
      { file: path.join(folder, poster), key: key(poster), type: TYPE[outcome.poster.ext], cache: CACHE.media },
      { file: path.join(out, "index.json"), key: "index.json", type: TYPE.json, cache: CACHE.index },
    ],
  };
}

function stage(source, { index: indexFile, out, newIndex, denylist }) {
  const outcome = check(source, { denylist });
  console.log(report(`检查 ${outcome.pkg.name}`, outcome));
  if (!outcome.ok) throw new Error("包不合格，没有生成上传文件");
  const staged = stageFiles(outcome, newIndex ? { skills: [] } : readIndex(indexFile), out);
  const { id, version } = staged.manifest;
  console.log(`\n${staged.replaced ? "更新" : "新增"} ${id} ${version}（索引共 ${staged.count} 个）。已生成：\n  ${path.join(out, id, version)}/ （先传，永久缓存）\n  ${path.join(out, "index.json")} （最后传，短缓存）`);
}

function unlist(id, { index: indexFile, out }) {
  const current = readIndex(indexFile);
  const skills = current.skills.filter((skill) => skill.id !== id);
  if (skills.length === current.skills.length) throw new Error(`索引里没有 ${id}`);
  emptyOut(out);
  writeIndex(out, skills);
  console.log(`已从索引撤下 ${id}（剩 ${skills.length} 个）：上传 ${path.join(out, "index.json")} 即生效。视频文件留在原处，不影响。`);
}

/* ── export: the first fill, from the snapshot bundled with the site ───────────────────────── */

function loadSiteModules() {
  const root = path.join(__dirname, "../..");
  const ts = require(require.resolve("typescript", { paths: [root] }));
  require.extensions[".ts"] = (module, filename) => {
    const { outputText } = ts.transpileModule(fs.readFileSync(filename, "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 }, fileName: filename });
    module._compile(outputText, filename);
  };
  return { ...require(path.join(root, "src/lib/skill-catalog.ts")), ...require(path.join(root, "src/lib/skill-index.ts")) };
}

function exportIndex({ media, out, version = "1.0.0" }) {
  const { BUNDLED_SKILLS, toSkillIndexEntry, readSkillIndex } = loadSiteModules();
  const ids = new Set(BUNDLED_SKILLS.map((skill) => skill.id));
  const available = new Map();
  for (const name of fs.readdirSync(media)) {
    const match = name.match(/^(.+)\.(mp4|jpg|png|webp)$/);
    if (!match) continue;
    if (!ids.has(match[1])) { console.log(`  ! ${name}：官网清单里没有这个 id，跳过`); continue; }
    const item = available.get(match[1]) ?? {};
    if (match[2] === "mp4") item.video = path.join(media, name); else item.poster = { file: path.join(media, name), ext: match[2] };
    available.set(match[1], item);
  }
  emptyOut(out);
  const held = [];
  let posters = 0;
  const skills = BUNDLED_SKILLS.map((skill) => {
    const item = available.get(skill.id);
    if (!item?.video) return toSkillIndexEntry(skill, version, null);
    const fd = fs.openSync(item.video, "r");
    const size = fs.fstatSync(fd).size;
    const info = inspectVideo((pos, length) => { const buf = Buffer.alloc(length); fs.readSync(fd, buf, 0, length, pos); return buf; }, size);
    fs.closeSync(fd);
    const verdict = judgeVideo(info, `${skill.id}.mp4`);
    if (verdict.errors.length) { held.push(...verdict.errors); return toSkillIndexEntry(skill, version, null); }
    const folder = path.join(out, skill.id, version);
    fs.mkdirSync(folder, { recursive: true });
    place(item.video, path.join(folder, "demo.mp4"));
    let poster;
    if (item.poster) { place(item.poster.file, path.join(folder, `poster.${item.poster.ext}`)); poster = `${skill.id}/${version}/poster.${item.poster.ext}`; posters++; }
    return toSkillIndexEntry(skill, version, poster ? { video: `${skill.id}/${version}/demo.mp4`, poster } : { video: `${skill.id}/${version}/demo.mp4` });
  });
  const index = writeIndex(out, skills);
  const { problems } = readSkillIndex(JSON.parse(JSON.stringify(index)), "https://example.invalid/skills/");
  if (problems.length) throw new Error(`生成的索引官网读不了：\n  ${problems.join("\n  ")}`);
  const withVideo = skills.filter((skill) => skill.media).length;
  console.log(`索引：${skills.length} 个 skill，${withVideo} 个带视频（${posters} 个带封面）→ ${path.join(out, "index.json")}`);
  if (held.length) console.log(`这些视频先不上，处理后重新导出：\n  ✗ ${held.join("\n  ✗ ")}`);
  const missing = skills.filter((skill) => skill.media && !skill.media.poster).map((skill) => skill.id);
  if (missing.length) console.log(`  ! ${missing.length} 个视频没有封面：iPhone 上加载前会是空白，建议补上`);
}

function place(from, to) {
  try { fs.linkSync(from, to); } catch { fs.copyFileSync(from, to); }
}

/* ── command line ──────────────────────────────────────────────────────────────────────────── */

function options(args) {
  const flags = {};
  const rest = [];
  for (let i = 0; i < args.length; i++) {
    if (!args[i].startsWith("--")) { rest.push(args[i]); continue; }
    const key = args[i].slice(2).replace(/-([a-z])/g, (_, c) => c.toUpperCase());
    if (["newIndex", "json"].includes(key)) flags[key] = true; else flags[key] = args[++i];
  }
  if (flags.denylist) flags.denylist = fs.readFileSync(flags.denylist, "utf8").split(/\r?\n/).map((line) => line.trim()).filter((line) => line && !line.startsWith("#"));
  return { flags, rest };
}

function main([command, ...args]) {
  const { flags, rest } = options(args);
  const need = (value, what) => { if (!value) { console.error(`缺少 ${what}。用法见 scripts/skills/skillpack.cjs 开头。`); process.exit(2); } return value; };
  if (command === "check") {
    const outcome = check(need(rest[0], "要检查的压缩包或文件夹"), flags);
    if (flags.json) console.log(JSON.stringify({ ok: outcome.ok, errors: outcome.errors, warnings: outcome.warnings, video: outcome.video, poster: outcome.poster }, null, 2));
    else {
      console.log(report(`检查 ${outcome.pkg.name}`, outcome));
      const m = outcome.manifest;
      const v = outcome.video;
      console.log(outcome.ok ? `结果：合格 — ${m.id} ${m.version}${v?.video ? `，视频 ${clock(v.seconds ?? 0)} ${v.video.width}×${v.video.height} ${mb(v.size)}` : ""}` : `结果：不合格（${outcome.errors.length} 处要改${outcome.warnings.length ? `，${outcome.warnings.length} 条提醒` : ""}）`);
    }
    process.exit(outcome.ok ? 0 : 1);
  }
  if (command === "stage") return stage(need(rest[0], "要上架的压缩包"), { ...flags, index: flags.newIndex ? null : need(flags.index, "--index 当前线上的 index.json（第一次用 --new-index）"), out: need(flags.out, "--out 输出目录") });
  if (command === "unlist") return unlist(need(rest[0], "要撤下的 id"), { index: need(flags.index, "--index 当前线上的 index.json"), out: need(flags.out, "--out 输出目录") });
  if (command === "export") return exportIndex({ media: need(flags.media, "--media 视频所在目录（<id>.mp4，可带 <id>.jpg 封面）"), out: need(flags.out, "--out 输出目录"), version: flags.version });
  if (command === "inspect") {
    let bad = 0;
    for (const file of need(rest.length ? rest : null, "要看的视频文件")) {
      const fd = fs.openSync(file, "r");
      const size = fs.fstatSync(fd).size;
      const info = inspectVideo((pos, length) => { const buf = Buffer.alloc(length); fs.readSync(fd, buf, 0, length, pos); return buf; }, size);
      fs.closeSync(fd);
      const verdict = judgeVideo(info, path.basename(file));
      if (verdict.errors.length) bad++;
      if (flags.json) console.log(JSON.stringify({ file, ...info, ...verdict }));
      else console.log(`${verdict.errors.length ? "✗" : "✓"} ${path.basename(file)}  ${mb(size)}  ${info.video ? `${info.video.codec.trim()} ${info.video.width}×${info.video.height}` : "无画面"}  ${info.audio ? info.audio.codec.trim() : "无声"}  ${info.seconds !== null ? clock(info.seconds) : "?"}  ${info.faststart ? "可边下边播" : "不能边下边播"}${[...verdict.errors, ...verdict.warnings].map((line) => `\n    ${line}`).join("")}`);
    }
    process.exit(bad ? 1 : 0);
  }
  console.error("用法：skillpack.cjs check|stage|unlist|inspect|export …（见文件开头）");
  process.exit(2);
}

if (require.main === module) {
  try {
    main(process.argv.slice(2));
  } catch (error) {
    console.error(`✗ ${error.message}`);
    process.exit(1);
  }
}

module.exports = { check, report, stageFiles, readIndex, Rejection, entryOf, inspectVideo, judgeVideo, inspectImage, validate, zipEntries, INDEX_FORMAT, CACHE, TYPE };
