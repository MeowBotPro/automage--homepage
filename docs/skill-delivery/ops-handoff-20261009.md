# 交接：skill 视频上 OSS，官网改读 OSS 上的 skill 索引，开通自动上架通道

> 更新：2026-10-10 已完成上传服务、本机 Nginx HTTPS、密码管理、自动发布及官网运行时接入。当前操作以 [完整闭环部署记录](deployment-20261010.md) 和 [README](README.md) 为准；下文保留 2026-10-09 的历史交接及验证结果，勿重复初始化索引或并行启动 cron worker。

给运维 agent · 2026-10-09 · 规则见同目录 [README.md](README.md)：官网怎么读看附录 B，自动通道看附录 C。

**本次 OSS、资源域名、CDN 和 HTTPS 已完成。** 实际资源地址、浏览器验证结果和证书自动续期配置见 [OSS 上传与部署结果](oss-upload-result-20261009.md)。生产官网接入从第 4 步开始；不要重复执行第 1–3 步覆盖已发布索引。skill 自动上架 worker 尚未启用。

## 要做成什么

1. **官网改读 OSS 上的索引。** 能力库（`/market`、`/market/<id>`）的 skill 清单和演示视频地址，改从 OSS 上的一份索引读。以后上新 skill、换视频只更新 OSS，官网不用发版。
2. **85 个已有讲解视频上线。** 8 月交付的视频全部挂上去，对应 skill 的详情页从占位卡片变成能播放的视频。owner 已确认按原样使用。
3. **开通自动通道。** 往内部 bucket 的 `inbox/` 放一个 skill 压缩包，一分钟内自动检查；合格就发布，不合格退回并写明原因。没有人工审批。

范围：

- 只动资源地址，页面其他内容不变。
- 生产机、bucket 名、域名都不写死，按你们的环境填。
- 开发机上的 3108、3109、3115 是演示和预览，不是生产，不要动。

## 仓库里准备好的

| 东西 | 位置 | 说明 |
|---|---|---|
| 官网代码 | `src/lib/server/skill-source.ts`、`src/lib/skill-index.ts` 等 | 设了 `SKILL_INDEX_URL` 就读 OSS 上的索引，不设就用内置清单。读不到时沿用上一份 |
| 工具 | `scripts/skills/skillpack.cjs` | `export` 首批导出、`check` 检查、`stage` 生成上架文件、`unlist` 下架、`inspect` 看视频 |
| 自动通道 | `scripts/skills/inbox-worker.cjs` | 处理 `inbox/` 里的包，每分钟跑一次 |
| 视频预处理 | `scripts/skills/prepare-backfill-media.sh` | 把 8 月的视频转成网页能边下边播的文件，再截封面（取全长 90% 处）。需要 unzip 和 ffmpeg。开发机上试跑过：85 个约 2 分钟，全部通过检查，约 520 MB |

**部署版本**：`feat/homepage-vnext` 分支的最新提交，包含新首页等这一阶段的全部改动。

## 第 1 步：准备 OSS

- **公开 bucket**：公共读。
  - 挂自定义域名，走 CDN，开 HTTPS。中国内地加速需要 ICP 备案；本次已配置海外加速区域。
  - CDN 打开 Range 回源，视频拖动要用。
  - 浏览器要走自定义域名：OSS 默认域名在部分地域会加 `x-oss-force-download` 和 `Content-Disposition: attachment`，变成下载。
  - 不需要 CORS：索引由官网服务器读，视频由 `<video>` 直接播放。
- **内部 bucket**：私有，目录见 README 附录 C（`inbox/`、`archive/`、`rejected/`、`failed/`、`reports/`、`index-history/`）。

## 第 2 步：转视频、生成索引

在一台有官网仓库、Node 18+、unzip、ffmpeg 的机器上执行。源文件在开发机的 `/root/neko/automage--homepage/skill/` 下（不进 git），别的机器要先拷过去。

```sh
scripts/skills/prepare-backfill-media.sh skill/压缩包.zip skill/交付_geo-effect-validator.zip ./skill-media
node scripts/skills/skillpack.cjs export --media ./skill-media --out ./skill-index
# 期望输出：索引：191 个 skill，85 个带视频（85 个带封面）
```

## 第 3 步：上传

先传视频和封面，最后传索引（ossutil 2.x，参数先用 `ossutil cp -h` 核对一遍）：

```sh
cd ./skill-index
find . -name demo.mp4 | while read -r f; do ossutil cp "$f" "oss://<公开bucket>/skills/${f#./}" -f \
  --content-type video/mp4 --cache-control "public, max-age=31536000, immutable"; done
find . -name 'poster.*' | while read -r f; do ossutil cp "$f" "oss://<公开bucket>/skills/${f#./}" -f \
  --cache-control "public, max-age=31536000, immutable"; done
ossutil cp index.json oss://<公开bucket>/skills/index.json -f \
  --content-type "application/json; charset=utf-8" --cache-control "public, max-age=60"
```

检查：

```sh
curl -sI https://<公开域名>/skills/index.json
# 期望：200，json，没有 attachment
curl -sI -H "Range: bytes=0-99" https://<公开域名>/skills/churn-autopsy/1.0.0/demo.mp4
# 期望：206，video/mp4
```

## 第 4 步：部署官网，加环境变量

- `SKILL_INDEX_URL=https://<公开域名>/skills/index.json`
- 生产机和 bucket 在同一地域、想走内网读索引时：`SKILL_INDEX_URL` 填内网地址，同时设 `SKILL_ASSET_BASE=https://<公开域名>/skills/`，因为浏览器要从公开域名拉视频。
- 这两个都是运行时变量，改了重启就生效，不用为它们重新构建。
- 生产机要能访问这个地址。
- standalone 目录下的 `.next/cache` 要可写：索引的缓存放在这里。

## 第 5 步：验证

- `/market/churn-autopsy` 的“演示视频”能播放，也能拖动；没有视频的 skill（例如 `/market/aigtm-crm`）显示占位卡片。
- `/market`、`/contact`、首页都正常；首页能力库入口写着“32 类工作 · 191 个 Skill”。
- 服务日志里没有 `[skill-index]` 开头的错误。日志里有 `cannot read`，说明读不到索引，页面正在用内置清单，这时查网络和地址。

**回滚**：去掉 `SKILL_INDEX_URL` 重启，回到内置清单，页面和现在一样。

## 第 6 步：开通自动通道

1. 选一台机器跑 worker，生产机就可以。它需要：
   - Node 18+；
   - 官网仓库；
   - ossutil 2.x，并配好凭证：能读写内部 bucket，能写公开 bucket 的 `skills/`。
2. 先空跑一次，确认 ossutil 的参数在你们的版本上能用：
   ```sh
   node scripts/skills/inbox-worker.cjs --private oss://<内部bucket> --public oss://<公开bucket>/skills --dry-run
   ```
3. 实测一次：
   - 照 README 第 1 节用模板做一个测试包（换个 id，比如 `probe-test`），放进 `inbox/`，去掉 `--dry-run` 跑一次；
   - 确认 `reports/` 里是 published，`/market/probe-test` 两三分钟内出现；
   - 再用 `skillpack.cjs unlist probe-test` 撤下，上传新的 `index.json`。
4. 加进 crontab，每分钟一次：
   ```sh
   * * * * * cd /path/to/automage--homepage && node scripts/skills/inbox-worker.cjs \
     --private oss://<内部bucket> --public oss://<公开bucket>/skills >> /var/log/skill-inbox.log 2>&1
   ```
5. 给做 skill 的人开一个只能写 `inbox/`、读 `reports/` 的账号，把 README 发给他们。

## 不要做

- 不要把 skill 本体（SKILL.md、脚本）放进公开 bucket。官网不提供下载。
- 不要覆盖已发布的 `skills/<id>/<version>/` 文件。有改动就用新版本号。
- 不要在两台机器上同时跑 worker；手动改线上 `index.json` 之前，先确认 `inbox/` 是空的。
- 不要为这件事改官网代码或其他内容：环境变量就够了。代码问题请提回来。
- 不要给浏览器用 OSS 默认域名播放视频。
