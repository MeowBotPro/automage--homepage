#!/usr/bin/env node
/* The one channel for skills: put a package (zip) in the private bucket's inbox/ at any time; the next
   run checks it and, if it is fit, publishes it. Nobody approves it — the check is the gate. Run it every
   minute; a lock keeps runs from overlapping, and each run takes every zip that is waiting, oldest name first.

     node scripts/skills/inbox-worker.cjs --private oss://<内部bucket> --public oss://<公开bucket>/skills
     node scripts/skills/inbox-worker.cjs --private ./private --public ./public/skills     # plain folders

     --denylist <file>   words that must not appear in public copy, one per line
     --dry-run           read and check everything, write nothing

   oss:// locations go through ossutil (OSSUTIL=/path/to/ossutil if it is not on PATH), with its own
   credentials. Per package, in an order that never leaves the site pointing at something missing:
     fit       → archive/<id>/<version>.zip, video and poster up, live index to index-history/, new index up
     not fit   → rejected/, with the reasons in reports/
     a failure → failed/, with the error in reports/ (move it back to inbox/ to try again)
   With no live index at all it stops and leaves inbox/ alone: the first index comes from skillpack export. */
"use strict";

const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { spawnSync } = require("node:child_process");
const { randomUUID, createHash } = require("node:crypto");
const { check, stageFiles, readIndex, Rejection } = require("./skillpack.cjs");

/* ── where packages and the site's files live: folders, or OSS through ossutil ─────────────── */

function folderStore(root) {
  const at = (key) => path.join(root, ...key.split("/"));
  return {
    list(prefix) {
      const dir = at(prefix);
      return fs.existsSync(dir) ? fs.readdirSync(dir, { withFileTypes: true }).filter((item) => item.isFile()).map((item) => `${prefix}${item.name}`) : [];
    },
    get(key, file) {
      if (!fs.existsSync(at(key))) return false;
      fs.copyFileSync(at(key), file);
      return true;
    },
    put(file, key) {
      fs.mkdirSync(path.dirname(at(key)), { recursive: true });
      fs.copyFileSync(file, `${at(key)}.part`);
      fs.renameSync(`${at(key)}.part`, at(key));
    },
    copy(from, to) {
      fs.mkdirSync(path.dirname(at(to)), { recursive: true });
      fs.copyFileSync(at(from), at(to));
    },
    remove(key) {
      fs.rmSync(at(key), { force: true });
    },
  };
}

function ossStore(root) {
  const bin = process.env.OSSUTIL || "ossutil";
  const base = root.replace(/\/+$/, "");
  const url = (key) => `${base}/${key}`;
  const run = (args, missingIsFine = false) => {
    const result = spawnSync(bin, args, { encoding: "utf8", maxBuffer: 64 * 1024 * 1024, timeout: 120000 });
    if (result.error) throw new Error(`运行 ${bin} 失败：${result.error.message}`);
    if (result.status === 0) return result.stdout;
    const text = `${result.stdout}\n${result.stderr}`.trim();
    if (missingIsFine && /NoSuchKey|404|not exist/i.test(text)) return null;
    throw new Error(`${bin} ${args.join(" ")} 失败：${text.split("\n").slice(-3).join(" ")}`);
  };
  return {
    list(prefix) {
      return run(["ls", url(prefix), "-s"]).split("\n").map((line) => line.trim()).filter((line) => line.startsWith(`${base}/`)).map((line) => line.slice(base.length + 1));
    },
    get: (key, file) => run(["cp", url(key), file, "-f"], true) !== null,
    put: (file, key, { type, cache } = {}) => run(["cp", file, url(key), "-f", ...(type ? ["--content-type", type] : []), ...(cache ? ["--cache-control", cache] : [])]),
    copy: (from, to) => run(["cp", url(from), url(to), "-f"]),
    remove: (key) => run(["rm", url(key), "-f"]),
  };
}

const storeAt = (where) => (where.startsWith("oss://") ? ossStore(where) : folderStore(path.resolve(where)));

/* ── one run ────────────────────────────────────────────────────────────────────────────────── */

const LOCK = path.join(os.tmpdir(), "automage-skill-inbox.lock");

function lock() {
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      fs.writeFileSync(LOCK, String(process.pid), { flag: "wx" });
      return true;
    } catch (error) {
      if (error.code !== "EEXIST") throw error;
      const holder = Number(fs.readFileSync(LOCK, "utf8"));
      try {
        process.kill(holder, 0);
        return false;
      } catch {
        fs.rmSync(LOCK, { force: true });
      }
    }
  }
  return false;
}

/** Stops the whole run with inbox/ untouched: something is wrong with the setup, not with a package. */
class Halt extends Error {}

const stampOf = (date) => date.toISOString().replace(/[-:]/g, "").replace("T", "-").slice(0, 15);

function handle(key, { priv, pub, denylist, dryRun, log, onReport, recoverKeys, packageNames }) {
  const name = key.slice("inbox/".length);
  const work = fs.mkdtempSync(path.join(os.tmpdir(), "skill-inbox-"));
  const started = new Date();
  const stamp = `${stampOf(started)}-${randomUUID()}`;
  const report = { package: name, receivedAt: started.toISOString(), status: null, id: null, version: null, errors: [], warnings: [] };
  const settle = (status, folder) => {
    report.status = status;
    if (dryRun) return;
    if (folder) {
      priv.copy(key, `${folder}/${stamp}-${name}`);
      priv.remove(key);
    }
  };
  try {
    const zip = path.join(work, name);
    if (!priv.get(key, zip)) return;
    const outcome = check(zip, { denylist, packageName: packageNames[key] });
    Object.assign(report, { id: outcome.manifest?.id ?? null, version: outcome.manifest?.version ?? null, errors: outcome.errors, warnings: outcome.warnings });
    if (!outcome.ok) throw new Rejection(outcome.errors[0]);
    const live = path.join(work, "live-index.json");
    if (!pub.get("index.json", live)) throw new Halt("公开位置还没有 index.json：第一份索引用 skillpack.cjs export 生成并上传");
    const current = readIndex(live);
    const archiveKey = `archive/${outcome.manifest.id}/${outcome.manifest.version}.zip`;
    const archive = path.join(work, "archive.zip");
    const archived = priv.get(archiveKey, archive);
    const hash = (file) => createHash("sha256").update(fs.readFileSync(file)).digest("hex");
    if (archived && recoverKeys.includes(key) && hash(zip) !== hash(archive)) throw new Rejection("线上版本已存在且存档不同：请升版本号");
    if (archived && !recoverKeys.includes(key)) throw new Rejection(`${outcome.manifest.id} ${outcome.manifest.version} 已经发布过或存档：有改动请升版本号再交`);
    if (recoverKeys.includes(key) && current.skills.some((entry) => entry.id === outcome.manifest.id && entry.version === outcome.manifest.version)) {
      if (!archived) throw new Error("线上版本存在但存档缺失，需人工核对");
      report.page = `/market/${outcome.manifest.id}`;
      settle("published", null);
      if (!dryRun) priv.remove(key);
      return;
    }
    const staged = stageFiles(outcome, current, path.join(work, "out"));
    const { id, version } = staged.manifest;
    if (dryRun) {
      log(`… ${name}：合格，会发布 ${id} ${version}（${staged.replaced ? "替换旧版本" : "新增"}，索引共 ${staged.count} 个）`);
      report.status = "published";
      return;
    }
    if (!archived) priv.put(zip, `archive/${id}/${version}.zip`);
    const index = staged.uploads.at(-1);
    for (const upload of staged.uploads.slice(0, -1)) pub.put(upload.file, upload.key, upload);
    priv.put(live, `index-history/${stamp}.json`);
    pub.put(index.file, index.key, index);
    Object.assign(report, { page: `/market/${id}`, replaced: staged.replaced });
    settle("published", null);
    priv.remove(key);
    log(`✓ ${name}：已发布 ${id} ${version} → /market/${id}`);
  } catch (error) {
    if (error instanceof Halt) throw error;
    if (error instanceof Rejection) {
      if (!report.errors.includes(error.message)) report.errors.push(error.message);
      settle("rejected", "rejected");
      log(`✗ ${name}：不合格，${report.errors[0]}${report.errors.length > 1 ? `（共 ${report.errors.length} 处）` : ""}`);
    } else {
      report.errors.push(error.message);
      try {
        settle("failed", "failed");
      } catch (move) {
        report.errors.push(`移到 failed/ 也失败了：${move.message}`);
      }
      log(`! ${name}：处理出错，${error.message}`);
    }
  } finally {
    if (!dryRun && report.status !== null) {
      report.finishedAt = new Date().toISOString();
      report.reportKey = `reports/${stamp}-${name.replace(/\.zip$/i, "")}.json`;
      const file = path.join(work, "report.json");
      fs.writeFileSync(file, `${JSON.stringify(report, null, 2)}\n`);
      try {
        priv.put(file, report.reportKey, { type: "application/json; charset=utf-8" });
      } catch (error) {
        log(`! ${name}：报告没写进去，${error.message}`);
      }
      onReport(report);
    }
    fs.rmSync(work, { recursive: true, force: true });
  }
}

function run({ privateAt, publicAt, denylist = [], dryRun = false, log = console.log, onReport = () => {}, recoverKeys = [], packageNames = {}, packageOrder = [] }) {
  if (!lock()) {
    log("上一次处理还没结束，这次跳过");
    return 0;
  }
  try {
    const priv = storeAt(privateAt);
    const pub = storeAt(publicAt);
    const waiting = priv.list("inbox/").filter((key) => /^inbox\/[^/]+\.zip$/i.test(key) && !key.includes("..") && !key.includes("\\") && !key.includes("\0")).sort();
    const order = new Map(packageOrder.map((key, index) => [key, index]));
    waiting.sort((a, b) => (order.get(a) ?? Number.MAX_SAFE_INTEGER) - (order.get(b) ?? Number.MAX_SAFE_INTEGER));
    for (const key of waiting) handle(key, { priv, pub, denylist, dryRun, log, onReport, recoverKeys, packageNames });
    return 0;
  } catch (error) {
    log(`! 停止：${error.message}`);
    return 1;
  } finally {
    fs.rmSync(LOCK, { force: true });
  }
}

if (require.main === module) {
  const args = process.argv.slice(2);
  const value = (flag) => { const at = args.indexOf(flag); return at >= 0 ? args[at + 1] : undefined; };
  const privateAt = value("--private");
  const publicAt = value("--public");
  if (!privateAt || !publicAt) {
    console.error("用法：inbox-worker.cjs --private <内部位置> --public <公开位置的 skills/> [--denylist 文件] [--dry-run]");
    process.exit(2);
  }
  const listFile = value("--denylist");
  const denylist = listFile ? fs.readFileSync(listFile, "utf8").split(/\r?\n/).map((line) => line.trim()).filter((line) => line && !line.startsWith("#")) : [];
  const stamped = (line) => console.log(`${new Date().toISOString()} ${line}`);
  process.exit(run({ privateAt, publicAt, denylist, dryRun: args.includes("--dry-run"), log: stamped }));
}

module.exports = { run, folderStore, ossStore, LOCK };
