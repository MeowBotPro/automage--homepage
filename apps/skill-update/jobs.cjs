'use strict';
const fs = require('node:fs');
const path = require('node:path');
const { randomUUID, createHash } = require('node:crypto');
const { Transform } = require('node:stream');
const { pipeline } = require('node:stream/promises');
const { spawn } = require('node:child_process');
const { atomic } = require('./config.cjs');
const MAX = 300 * 1024 * 1024;
const terminal = new Set(['published', 'rejected', 'failed']);
class Jobs {
  constructor(conf) {
    this.conf = conf; this.dir = path.join(conf.home, 'data/jobs'); this.running = false; this.uploading = 0;
    fs.mkdirSync(this.dir, { recursive: true, mode: 0o700 });
    for (const job of this.list()) {
      if (job.status === 'receiving') { job.status = 'failed'; job.errors = ['上传中断，请重新提交']; this.save(job); fs.rmSync(this.file(job.id, 'upload.part'), { force: true }); }
      else if (!terminal.has(job.status)) { job.recover = job.phase === 'processing'; job.status = 'queued'; this.save(job); }
    }
  }
  file(id, name = 'job.json') { if (!/^[a-f0-9-]{36}$/.test(id)) throw new Error('任务编号无效'); return path.join(this.dir, id, name); }
  save(job) { job.updatedAt = new Date().toISOString(); atomic(this.file(job.id), job); }
  get(id) { const file = this.file(id); return fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : null; }
  list() { return fs.readdirSync(this.dir).filter((id) => /^[a-f0-9-]{36}$/.test(id)).map((id) => this.get(id)).filter(Boolean).sort((a,b) => b.receivedAt.localeCompare(a.receivedAt)); }
  view(job) { const { sha256: _sha, inboxKey: _key, recover: _recover, owner: _owner, phase: _phase, ...safe } = job; return safe; }
  async receive(stream, name, owner, length) {
    if (this.uploading >= 3) throw Object.assign(new Error('同时上传过多，请稍后重试'), { status: 429 });
    if (typeof name !== 'string' || !/^[^/\\\x00-\x1f]{1,160}\.zip$/i.test(name) || name.includes('..')) throw new Error('请选择 ZIP 文件，文件名不可包含路径');
    if (length > MAX) throw Object.assign(new Error('单包上传上限 300 MiB'), { status: 413 });
    const disk = fs.statfsSync(this.dir); if (disk.bavail * disk.bsize < MAX * 2) throw Object.assign(new Error('暂存空间不足，请联系管理员'), { status: 507 });
    const waiting = this.list().filter((job) => !terminal.has(job.status));
    if (waiting.length >= 50) throw Object.assign(new Error('待处理队列已满，请稍后重试'), { status: 429 });
    const job = { id: randomUUID(), name, owner, status: 'receiving', phase: 'receiving', receivedAt: new Date().toISOString(), errors: [], warnings: [], size: 0, attempts: 0 };
    this.save(job); this.uploading++;
    const part = this.file(job.id, 'upload.part'); const hash = createHash('sha256'); let size = 0;
    try {
      const limit = new Transform({ transform(chunk, _encoding, done) { size += chunk.length; if (size > MAX) return done(Object.assign(new Error('单包上传上限 300 MiB'), { status: 413 })); hash.update(chunk); done(null, chunk); } });
      await pipeline(stream, limit, fs.createWriteStream(part, { flags: 'wx', mode: 0o600 }));
      if (!size) throw new Error('文件为空');
      fs.renameSync(part, this.file(job.id, 'package.zip'));
      Object.assign(job, { status: 'queued', phase: 'queued', size, sha256: hash.digest('hex'), inboxKey: `inbox/${job.id}.zip` }); this.save(job);
      this.kick(); return this.view(job);
    } catch (error) { job.status = 'failed'; job.errors = [error.message]; this.save(job); fs.rmSync(part, { force: true }); throw error; }
    finally { this.uploading--; }
  }
  async child(script, args, timeout = 120000) {
    return new Promise((resolve, reject) => {
      const proc = spawn(script.endsWith('.cjs') ? process.execPath : script, script.endsWith('.cjs') ? [script, ...args] : args, { env: { ...process.env, SKILL_UPDATE_HOME: this.conf.home, OSSUTIL: path.join(__dirname, 'oss-cli.cjs') }, stdio: ['ignore', 'pipe', 'pipe'], detached: true });
      let output = ''; const collect = (chunk) => { output = (output + chunk.toString()).slice(-24000); };
      proc.stdout.on('data', collect); proc.stderr.on('data', collect);
      let expired = false;
      const timer = setTimeout(() => { expired = true; try { process.kill(-proc.pid, 'SIGKILL'); } catch (error) { if (error.code !== 'ESRCH') console.error(error.message); } }, timeout);
      proc.on('error', (error) => { clearTimeout(timer); reject(error); });
      proc.on('close', (code) => { clearTimeout(timer); if (expired || code !== 0) reject(new Error(expired ? '处理超时，任务已保留，可重试' : output.trim() || `处理程序退出 ${code}`)); else resolve(output); });
    });
  }
  retry(id) {
    const job = this.get(id); if (!job || job.status !== 'failed') throw new Error('只有处理失败的任务可重试；校验拒绝请修改后重新提交');
    if (!fs.existsSync(this.file(id, 'package.zip'))) throw new Error('上传未完成，请重新提交文件');
    job.recover = job.phase === 'processing'; job.status = 'queued'; job.errors = []; this.save(job); this.kick(); return this.view(job);
  }
  async kick() {
    if (this.running) return;
    this.running = true;
    try {
      // One worker at a time. It also consumes ZIPs submitted directly to OSS inbox.
      for (const job of this.list().reverse().filter((item) => item.status === 'queued')) {
        try {
          job.status = 'uploading'; job.attempts++; this.save(job);
          await this.child(path.join(__dirname, 'oss-cli.cjs'), ['cp', this.file(job.id, 'package.zip'), `${this.conf.privateAt}/${job.inboxKey}`, '-f']);
          job.status = 'processing'; job.phase = 'processing'; this.save(job);
        } catch (error) { job.status = 'failed'; job.errors = [error.message]; this.save(job); }
      }
      const working = this.list().filter((job) => job.status === 'processing');
      try {
        await this.child(path.join(__dirname, 'worker-run.cjs'), [], 30 * 60 * 1000);
        // A locked/skipped worker or unavailable report is not proof of completion.
        for (const job of working) { const current = this.get(job.id); if (current.status === 'processing') { current.status = 'queued'; current.recover = true; this.save(current); } }
      } catch (error) {
        console.error(new Date().toISOString(), 'worker:', error.message);
        for (const job of working) { const current = this.get(job.id); if (current.status === 'processing') { current.status = 'failed'; current.errors = [error.message]; this.save(current); } }
      }
      // Published originals are durably archived in OSS. Failed/rejected packages remain available for 7 days.
      for (const job of this.list()) if (terminal.has(job.status) && (job.status === 'published' || Date.now() - Date.parse(job.updatedAt) > 7 * 86400000)) fs.rmSync(this.file(job.id, 'package.zip'), { force: true });
    } finally { this.running = false; }
    if (this.list().some((job) => job.status === 'queued') && this.list().some((job) => job.phase === 'queued')) setImmediate(() => this.kick());
  }
}
module.exports = { Jobs, MAX };
