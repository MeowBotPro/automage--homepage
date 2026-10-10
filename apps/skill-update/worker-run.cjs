'use strict';
const fs = require('node:fs');
const path = require('node:path');
const { config, atomic } = require('./config.cjs');
const conf = config();
const { run } = require(path.join(conf.toolRoot || path.join(__dirname, '../../scripts/skills'), 'inbox-worker.cjs'));
const dir = path.join(conf.home, 'data/jobs');
const jobs = fs.readdirSync(dir).map((id) => { const file = path.join(dir, id, 'job.json'); return fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : null; }).filter(Boolean);
const code = run({ privateAt: conf.privateAt, publicAt: conf.publicAt, packageOrder: [...jobs].sort((a, b) => a.receivedAt.localeCompare(b.receivedAt)).map((job) => job.inboxKey), packageNames: Object.fromEntries(jobs.map((job) => [job.inboxKey, job.name])), recoverKeys: jobs.filter((job) => job.recover && job.status === 'processing').map((job) => job.inboxKey), onReport(report) {
  const job = jobs.find((item) => item.inboxKey === `inbox/${report.package}`);
  if (!job) return;
  const file = path.join(dir, job.id, 'job.json');
  const latest = JSON.parse(fs.readFileSync(file, 'utf8'));
  Object.assign(latest, { status: report.status, report, errors: report.errors, warnings: report.warnings, updatedAt: new Date().toISOString() });
  atomic(file, latest);
} });
process.exitCode = code;
