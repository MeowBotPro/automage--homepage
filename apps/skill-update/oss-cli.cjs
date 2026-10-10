#!/usr/bin/env node
'use strict';
// Only the ls/cp/rm subset used by the existing inbox worker; backed by the official OSS SDK.
const OSS = require('ali-oss');
const { config } = require('./config.cjs');
async function main() {
  const conf = config();
  const [command, ...rest] = process.argv.slice(2);
  const args = []; const headers = {};
  for (let i = 0; i < rest.length; i++) {
    if (rest[i] === '--content-type') headers['Content-Type'] = rest[++i];
    else if (rest[i] === '--cache-control') headers['Cache-Control'] = rest[++i];
    else if (!rest[i].startsWith('-')) args.push(rest[i]);
  }
  const location = (value) => { const match = /^oss:\/\/([a-z0-9-]+)\/(.*)$/.exec(value); if (!match) throw new Error('OSS 地址无效'); return { bucket: match[1], key: match[2] }; };
  const client = (bucket) => new OSS({ region: `oss-${conf.region}`, bucket, accessKeyId: conf.accessKeyId, accessKeySecret: conf.accessKeySecret, secure: true, timeout: 90000 });
  if (command === 'ls') {
    const { bucket, key } = location(args[0]); const oss = client(bucket); let marker;
    do { const result = await oss.list({ prefix: key, marker, 'max-keys': 1000 }); for (const item of result.objects || []) console.log(`oss://${bucket}/${item.name}`); marker = result.isTruncated ? result.nextMarker : null; } while (marker);
  } else if (command === 'cp') {
    const [from, to] = args;
    if (from.startsWith('oss://') && to.startsWith('oss://')) { const source = location(from), dest = location(to); await client(dest.bucket).copy(dest.key, source.key, source.bucket); }
    else if (from.startsWith('oss://')) { const source = location(from); await client(source.bucket).get(source.key, to); }
    else { const dest = location(to); await client(dest.bucket).put(dest.key, from, { headers }); }
  } else if (command === 'rm') { const target = location(args[0]); await client(target.bucket).delete(target.key); }
  else throw new Error('不支持的 OSS 操作');
}
main().catch((error) => { console.error(`${error.code || 'OSSFailure'}: ${error.message}`); process.exitCode = 1; });
