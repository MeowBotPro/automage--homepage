#!/usr/bin/env node
'use strict';
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { config } = require('./config.cjs');
const { Auth } = require('./auth.cjs');
async function main() {
  const conf = config(); const [command, ...args] = process.argv.slice(2);
  function request(method, route, data, file) {
    return new Promise((resolve, reject) => {
      const headers = file ? { 'X-File-Name': encodeURIComponent(path.basename(file)), 'Content-Length': fs.statSync(file).size, 'Content-Type': 'application/zip' } : { 'Content-Type': 'application/json' };
      const req = http.request({ socketPath: path.join(conf.home, 'control.sock'), path: route, method, headers }, (res) => {
        let text = ''; res.on('data', (chunk) => text += chunk); res.on('end', () => { try { const value = JSON.parse(text); if (res.statusCode >= 400) reject(new Error(value.error)); else resolve(value); } catch (error) { reject(error); } });
      }); req.on('error', reject); if (file) { const stream = fs.createReadStream(file); stream.on('error', (error) => req.destroy(error)); stream.pipe(req); } else req.end(data ? JSON.stringify(data) : undefined);
    });
  }
  if (command === 'init') {
    if (!conf.adminPassword) throw new Error('初始化时请在受限 config.json 中配置 adminPassword');
    const created = new Auth(conf.home).init(conf.adminPassword);
    delete conf.adminPassword;
    require('./config.cjs').atomic(path.join(conf.home, 'config.json'), conf);
    console.log('上传密码仅显示一次，请保存：'); console.log(JSON.stringify(created, null, 2)); return;
  }
  if (command === 'submit') {
    let files = args;
    if (args[0] === '--dir') {
      if (!args[1] || args.length !== 2) throw new Error('用法：submit --dir <目录>');
      files = fs.readdirSync(args[1], { withFileTypes: true }).filter((item) => item.isFile() && /\.zip$/i.test(item.name)).map((item) => path.join(args[1], item.name)).sort();
    }
    if (!files.length) throw new Error('没有 ZIP 文件可提交');
    let failed = false;
    for (const file of files) { try { const stat = fs.lstatSync(file); if (!stat.isFile() || !/\.zip$/i.test(file)) throw new Error('只支持普通 ZIP 文件'); console.log(JSON.stringify(await request('POST', '/api/uploads', null, file))); } catch (error) { failed = true; console.error(`${file}: ${error.message}`); } }
    if (failed) process.exitCode = 1; return;
  }
  if (command === 'status') { console.log(JSON.stringify(await request('GET', args[0] ? `/api/jobs/${args[0]}` : '/api/jobs'), null, 2)); return; }
  if (command === 'retry') { console.log(JSON.stringify(await request('POST', `/api/jobs/${args[0]}/retry`), null, 2)); return; }
  if (command === 'passwords') {
    const [action, value] = args;
    if (!action || action === 'list') console.log(JSON.stringify(await request('GET', '/api/admin/passwords'), null, 2));
    else console.log(JSON.stringify(await request('POST', '/api/admin/passwords', { action, id: value, name: action === 'add' ? value : undefined }), null, 2));
    return;
  }
  console.log('skill-update submit <多个 ZIP> | submit --dir <目录> | status [任务编号] | retry <任务编号>\npasswords [list | add <名称> | reset <ID> | disable <ID> | delete <ID> | reset-all]');
}
main().catch((error) => { console.error(error.message); process.exitCode = 1; });
