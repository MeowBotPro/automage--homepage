'use strict';
const fs = require('node:fs');
const path = require('node:path');
function config() {
  const home = path.resolve(process.env.SKILL_UPDATE_HOME || path.join(require('node:os').homedir(), 'skill-update'));
  const file = path.join(home, 'config.json');
  const value = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : {};
  return { home, port: 3120, origin: 'https://skill-update.automage.cn', privateAt: 'oss://automage-skills-private', publicAt: 'oss://automage/skills', region: 'cn-hangzhou', ...value };
}
function atomic(file, value) {
  fs.mkdirSync(path.dirname(file), { recursive: true, mode: 0o700 });
  const temp = `${file}.${require('node:crypto').randomUUID()}.part`;
  fs.writeFileSync(temp, JSON.stringify(value, null, 2) + '\n', { mode: 0o600 });
  fs.renameSync(temp, file);
}
module.exports = { config, atomic };
