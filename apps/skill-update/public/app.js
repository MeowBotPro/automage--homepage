'use strict';
const $ = (id) => document.getElementById(id);
let authenticated = false; let admin = false; let files = []; let uploading = false; let refreshing = false;
function node(tag, text, className) { const el = document.createElement(tag); if (text !== undefined) el.textContent = text; if (className) el.className = className; return el; }
function message(id, text, error = false) { $(id).textContent = text; $(id).className = `hint${error ? ' error' : ''}`; }
async function api(route, method = 'GET', value) {
  const res = await fetch(route, { method, headers: value === undefined ? {} : { 'Content-Type': 'application/json' }, body: value === undefined ? undefined : JSON.stringify(value) });
  const data = await res.json();
  if (!res.ok) { if (res.status === 401 && route !== '/api/login') setAuth(false); throw new Error(data.error || '请求失败'); }
  return data;
}
function setAuth(value, isAdmin = false) {
  authenticated = value; admin = isAdmin; $('password').disabled = value; $('login-button').hidden = value; $('logout-button').hidden = !value; $('jobs-section').hidden = !value;
  $('submit-button').disabled = !value || !files.length || uploading;
  message('auth-status', value ? `${isAdmin ? '管理员' : '上传密码'}已验证。可提交文件并查询记录。` : '验证后即可上传，也能查看此前的提交结果。');
}
async function login(password, asAdmin = false) { const value = await api('/api/login', 'POST', { password, admin: asAdmin }); setAuth(true, value.admin); await refreshJobs(); }
$('login-button').addEventListener('click', async () => { $('login-button').disabled = true; try { await login($('password').value); $('password').value = ''; } catch (error) { message('auth-status', error.message, true); } finally { $('login-button').disabled = false; } });
$('password').addEventListener('keydown', (event) => { if (event.key === 'Enter') { event.preventDefault(); $('login-button').click(); } });
$('logout-button').addEventListener('click', async () => { try { await api('/api/logout', 'POST'); setAuth(false); $('jobs').replaceChildren(); } catch (error) { message('auth-status', error.message, true); } });
function choose(list) {
  if (uploading) return;
  files = Array.from(list); $('selected-files').replaceChildren();
  for (const file of files) $('selected-files').append(node('li', `${file.name} · ${(file.size / 1048576).toFixed(1)} MiB${!file.name.toLowerCase().endsWith('.zip') || file.size > 300 * 1048576 ? ' · 不符合上传要求' : ''}`));
  $('submit-button').disabled = !authenticated || !files.length;
}
$('files').addEventListener('change', (event) => choose(event.target.files));
for (const name of ['dragenter', 'dragover']) $('drop-zone').addEventListener(name, (event) => { event.preventDefault(); $('drop-zone').classList.add('dragging'); });
for (const name of ['dragleave', 'drop']) $('drop-zone').addEventListener(name, (event) => { event.preventDefault(); $('drop-zone').classList.remove('dragging'); if (name === 'drop') choose(event.dataTransfer.files); });
function upload(file, index, count) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest(); xhr.open('POST', '/api/uploads'); xhr.setRequestHeader('Content-Type', 'application/zip'); xhr.setRequestHeader('X-File-Name', encodeURIComponent(file.name)); xhr.timeout = 10 * 60000;
    xhr.upload.onprogress = (event) => message('upload-message', `正在上传 ${index}/${count}：${file.name}${event.lengthComputable ? ` · ${Math.round(event.loaded / event.total * 100)}%` : ''}`);
    xhr.onload = () => { let data; try { data = JSON.parse(xhr.responseText); } catch { reject(new Error('服务器返回异常，请刷新记录确认')); return; } if (xhr.status >= 400) { if (xhr.status === 401) setAuth(false); reject(new Error(data.error)); } else resolve(data); };
    xhr.onerror = () => reject(new Error('上传连接中断，请刷新记录确认后再提交')); xhr.ontimeout = () => reject(new Error('上传超时，请刷新记录确认')); xhr.send(file);
  });
}
$('upload-form').addEventListener('submit', async (event) => {
  event.preventDefault(); if (!authenticated || uploading || !files.length) return;
  const batch = [...files]; uploading = true; $('submit-button').disabled = true; $('files').disabled = true; let succeeded = 0; const errors = [];
  for (let index = 0; index < batch.length; index++) {
    const file = batch[index];
    try { if (!file.name.toLowerCase().endsWith('.zip') || file.size > 300 * 1048576) throw new Error('需要 300 MiB 以内的 ZIP'); await upload(file, index + 1, batch.length); succeeded++; await refreshJobs(); }
    catch (error) { errors.push(`${file.name}：${error.message}`); }
  }
  uploading = false; $('files').disabled = false; $('files').value = ''; choose([]);
  message('upload-message', `${succeeded} 个文件已接收，正在后台检查。${errors.length ? ` ${errors.join('；')}` : '请在下方记录中查看发布结果。'}`, errors.length > 0);
});
const labels = { receiving: '正在接收', queued: '排队中', uploading: '同步至私有 OSS', processing: '检查并发布中', published: '已发布', rejected: '校验拒绝', failed: '处理失败' };
async function refreshJobs() {
  if (!authenticated || refreshing) return;
  refreshing = true;
  try {
    const list = await api('/api/jobs'); const elements = [];
    if (!list.length) elements.push(node('p', '还没有提交记录。', 'hint'));
    for (const job of list) {
      const card = node('article', undefined, 'job'); const head = node('div', undefined, 'job-head'); head.append(node('span', job.name, 'job-name'), node('span', labels[job.status] || job.status, `status ${job.status}`)); card.append(head);
      card.append(node('p', `${new Date(job.receivedAt).toLocaleString('zh-CN')} · 任务 ${job.id}`, 'job-meta'));
      for (const [kind, values] of [['errors', job.errors], ['warnings', job.warnings]]) if (values?.length) { const ul = node('ul', undefined, kind); for (const text of values) ul.append(node('li', text)); card.append(ul); }
      if (job.status === 'published' && /^\/market\/[a-z0-9-]+$/.test(job.report?.page || '')) { const link = node('a', '打开官网详情 ↗'); link.href = `https://automage.cn${job.report.page}`; link.target = '_blank'; link.rel = 'noopener'; card.append(link, node('p', '发布已完成，官网通常再需约 1–2 分钟刷新。', 'hint')); }
      if (job.status === 'failed') { const retry = node('button', '重试处理', 'secondary'); retry.addEventListener('click', async () => { retry.disabled = true; try { await api(`/api/jobs/${job.id}/retry`, 'POST'); await refreshJobs(); } catch (error) { message('upload-message', error.message, true); } finally { retry.disabled = false; } }); card.append(retry); }
      elements.push(card);
    }
    $('jobs').replaceChildren(...elements);
  } catch (error) { message('upload-message', error.message, true); }
  finally { refreshing = false; }
}
$('refresh-jobs').addEventListener('click', refreshJobs);
setInterval(() => { if (!document.hidden) refreshJobs(); }, 5000);
async function showPasswords() {
  const data = await api('/api/admin/passwords'); $('admin-content').hidden = false; $('admin-login-form').hidden = true;
  $('password-list').replaceChildren();
  for (const item of data.entries) {
    const row = node('div', undefined, 'password-item'); row.append(node('span', `${item.name}${item.active ? '' : ' · 已停用'}`));
    for (const [action, label] of [['reset', '重置'], ['disable', '停用'], ['delete', '删除']]) {
      if (action === 'disable' && !item.active) continue;
      const button = node('button', label, 'secondary'); button.type = 'button'; button.addEventListener('click', async () => {
        if (!confirm(`确认${label}「${item.name}」？原密码的会话会立即失效。`)) return;
        await changePasswords({ action, id: item.id });
      }); row.append(button);
    }
    $('password-list').append(row);
  }
}
function clearCreated() { $('password-output').textContent = ''; $('created-passwords').hidden = true; }
async function changePasswords(value) {
  clearCreated();
  try { const data = await api('/api/admin/passwords', 'POST', value); await showPasswords(); if (data.created.length) { $('created-passwords').hidden = false; $('password-output').textContent = data.created.map((item) => `${item.name}\n${item.password}`).join('\n\n'); } message('admin-message', '已保存，立即生效。'); }
  catch (error) { message('admin-message', error.message, true); }
}
$('admin-open').addEventListener('click', async () => { $('admin-dialog').showModal(); $('admin-content').hidden = true; $('admin-login-form').hidden = false; message('admin-message', ''); if (authenticated && admin) try { await showPasswords(); } catch (error) { message('admin-message', error.message, true); } });
$('admin-close').addEventListener('click', () => $('admin-dialog').close());
$('admin-dialog').addEventListener('close', () => { clearCreated(); $('admin-password').value = ''; });
$('admin-login-form').addEventListener('submit', async (event) => { event.preventDefault(); try { await login($('admin-password').value, true); $('admin-password').value = ''; await showPasswords(); message('admin-message', ''); } catch (error) { message('admin-message', error.message, true); } });
$('password-add-form').addEventListener('submit', async (event) => { event.preventDefault(); await changePasswords({ action: 'add', name: $('password-name').value }); $('password-name').value = ''; });
$('reset-all').addEventListener('click', async () => { if (confirm('确认重置整份密码列表？所有旧上传密码及会话立即失效，请保存并重新分发新密码。')) await changePasswords({ action: 'reset-all' }); });
$('copy-passwords').addEventListener('click', async () => { try { await navigator.clipboard.writeText($('password-output').textContent); message('admin-message', '已复制，请妥善保存。'); } catch { message('admin-message', '无法自动复制，请选择密码文本手动复制。', true); } });
api('/api/session').then(async (value) => { setAuth(true, value.admin); await refreshJobs(); }).catch(() => setAuth(false));
