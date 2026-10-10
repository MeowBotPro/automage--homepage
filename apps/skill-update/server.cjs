'use strict';
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { randomBytes } = require('node:crypto');
const { config } = require('./config.cjs');
const { Auth } = require('./auth.cjs');
const { Jobs } = require('./jobs.cjs');
function createApp(conf, { jobs = new Jobs(conf) } = {}) {
  const auth = new Auth(conf.home); const sessions = new Map(); const limits = new Map();
  const socket = path.join(conf.home, 'control.sock');
  function json(res, code, value) { res.writeHead(code, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' }); res.end(JSON.stringify(value)); }
  async function body(req) { let data = ''; for await (const chunk of req) { data += chunk; if (Buffer.byteLength(data) > 8192) throw Object.assign(new Error('请求过大'), { status: 413 }); } try { return JSON.parse(data); } catch { throw new Error('请求格式无效'); } }
  const handler = (local = false) => async (req, res) => {
    res.setHeader('X-Content-Type-Options', 'nosniff'); res.setHeader('Referrer-Policy', 'same-origin');
    res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'");
    try {
      const url = new URL(req.url, conf.origin); const route = url.pathname;
      const token = (req.headers.cookie || '').match(/(?:^|; )skill_session=([a-f0-9]{64})(?:;|$)/)?.[1];
      const session = local ? { id: 'local-cli', admin: true } : sessions.get(token);
      const valid = local || auth.valid(session);
      if (req.method !== 'GET' && !local && req.headers.origin !== conf.origin) return json(res, 403, { error: '请求来源不匹配' });
      if (req.method === 'GET' && route === '/healthz') return json(res, 200, { status: 'ok' });
      if (route === '/api/login' && req.method === 'POST') {
        const ip = req.socket.remoteAddress === '127.0.0.1' || req.socket.remoteAddress === '::ffff:127.0.0.1' ? String(req.headers['x-real-ip'] || req.socket.remoteAddress) : req.socket.remoteAddress;
        const now = Date.now(); const rate = limits.get(ip) || { count: 0, expires: now + 15 * 60000 };
        if (rate.expires < now) { rate.count = 0; rate.expires = now + 15 * 60000; }
        if (rate.count >= 10) return json(res, 429, { error: '尝试过多，请在 15 分钟后重试' });
        rate.count++; limits.set(ip, rate);
        const value = await body(req); const identity = auth.login(value.password, value.admin === true);
        if (!identity) return json(res, 401, { error: '密码错误或已停用' });
        const secret = randomBytes(32).toString('hex'); sessions.set(secret, { ...identity, expires: now + 8 * 3600000 });
        res.setHeader('Set-Cookie', `skill_session=${secret}; HttpOnly; ${conf.insecureTest ? '' : 'Secure; '}SameSite=Strict; Path=/; Max-Age=28800`);
        return json(res, 200, { admin: identity.admin });
      }
      if (route === '/api/logout' && req.method === 'POST') { sessions.delete(token); res.setHeader('Set-Cookie', 'skill_session=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0'); return json(res, 200, { ok: true }); }
      if (route.startsWith('/api/')) {
        if (!valid) return json(res, 401, { error: '请先输入有效密码' });
        if (route === '/api/session' && req.method === 'GET') return json(res, 200, { admin: session.admin });
        if (route === '/api/uploads' && req.method === 'POST') {
          const job = await jobs.receive(req, decodeURIComponent(req.headers['x-file-name'] || ''), session.id, Number(req.headers['content-length'] || 0));
          return json(res, 202, job);
        }
        if (route === '/api/jobs' && req.method === 'GET') return json(res, 200, jobs.list().filter((job) => session.admin || job.owner === session.id).slice(0, 100).map((job) => jobs.view(job)));
        const jobRoute = /^\/api\/jobs\/([a-f0-9-]{36})(\/retry)?$/.exec(route);
        if (jobRoute) {
          const job = jobs.get(jobRoute[1]);
          if (!job || (!session.admin && job.owner !== session.id)) return json(res, 404, { error: '任务不存在' });
          if (req.method === 'GET' && !jobRoute[2]) return json(res, 200, jobs.view(job));
          if (req.method === 'POST' && jobRoute[2]) return json(res, 200, jobs.retry(job.id));
        }
        if (route === '/api/admin/passwords') {
          if (!session.admin) return json(res, 403, { error: '需要管理员密码' });
          if (req.method === 'GET') return json(res, 200, { entries: auth.list() });
          if (req.method === 'POST') { const value = await body(req); return json(res, 200, auth.change(value.action, value.id, value.name)); }
        }
        return json(res, 404, { error: '接口不存在' });
      }
      if (req.method !== 'GET') return json(res, 405, { error: '不支持的请求方式' });
      const assets = { '/': ['index.html', 'text/html; charset=utf-8'], '/style.css': ['style.css', 'text/css; charset=utf-8'], '/app.js': ['app.js', 'text/javascript; charset=utf-8'], '/logo.svg': ['logo.svg', 'image/svg+xml'], '/delivery/README.md': ['delivery/README.md', 'text/markdown; charset=utf-8'], '/delivery/skill.schema.json': ['delivery/skill.schema.json', 'application/json'], '/delivery/template.zip': ['delivery/template.zip', 'application/zip'], '/delivery/skillpack.cjs': ['delivery/skillpack.cjs', 'text/plain; charset=utf-8'] };
      const asset = assets[route]; if (!asset) return json(res, 404, { error: '页面不存在' });
      const file = path.join(__dirname, 'public', asset[0]);
      if (!fs.existsSync(file)) return json(res, 404, { error: '资源尚未部署' });
      res.writeHead(200, { 'Content-Type': asset[1], 'Cache-Control': 'no-cache' }); fs.createReadStream(file).pipe(res);
    } catch (error) {
      if (!res.destroyed && !res.headersSent) json(res, error.status || 400, { error: error.message });
    }
  };
  const web = http.createServer(handler()); web.requestTimeout = 10 * 60000; web.headersTimeout = 30000;
  const control = http.createServer(handler(true)); control.requestTimeout = 10 * 60000;
  const cleanup = setInterval(() => { for (const [key, value] of sessions) if (value.expires < Date.now()) sessions.delete(key); for (const [key,value] of limits) if (value.expires < Date.now()) limits.delete(key); }, 60000); cleanup.unref();
  return { web, control, jobs, start() {
    if (!fs.existsSync(auth.file)) throw new Error('请先执行 skill-update init 初始化密码');
    if (fs.existsSync(socket)) fs.unlinkSync(socket);
    web.listen(conf.port, '127.0.0.1'); control.listen(socket, () => fs.chmodSync(socket, 0o600));
    jobs.kick(); const timer = setInterval(() => jobs.kick(), 60000); timer.unref();
    console.log(`skill-update listening on 127.0.0.1:${conf.port}`);
  }, close() { clearInterval(cleanup); web.close(); control.close(); } };
}
if (require.main === module) createApp(config()).start();
module.exports = { createApp };
