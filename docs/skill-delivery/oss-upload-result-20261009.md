# OSS 上传结果 · 2026-10-09

> 更新：2026-10-10 已完成上传服务、本机 Nginx HTTPS、密码管理、自动发布及官网运行时接入。当前操作以 [完整闭环部署记录](deployment-20261010.md) 和 [README](README.md) 为准；下文保留 2026-10-09 的历史交接及验证结果，勿重复初始化索引或并行启动 cron worker。

存储、资源域名、HTTPS 和 CDN 已接通；用户已明确同意 85 个视频原样公开。官网生产环境变量和 skill 自动发布 worker 尚未启用。

**正式资源地址：<https://skills.automage.cn/skills/index.json>。** 191 个 skill、85 个视频和封面已全部上传。浏览器已验证终端录屏和长桌面录屏的跨域嵌入播放与拖动。证书自动续期已通过测试并设为每日检查。

## 实际资源

地域：`cn-hangzhou`（杭州）。

| 用途 | OSS 位置 | 结果 |
|---|---|---|
| 公开索引 | `oss://automage/skills/index.json` | 191 个 skill，85 个带视频及封面 |
| 公开演示素材 | `oss://automage/skills/<id>/1.0.0/demo.mp4`、`poster.jpg` | 85 个 MP4、85 个 JPG |
| 原始交付包 | `oss://automage-skills-private/source-packages/20261009/` | 全部 11 个原始 ZIP，保留 skill 本体和原始媒体 |
| 来源清单 | `oss://automage-skills-private/bootstrap/20261009/provenance.json` | 191 个 skill 的原始来源和压缩包 SHA-256 |
| 交付工具 | `oss://automage-skills-private/delivery-kit/20261009/` | 规范、schema、模板、skillpack、inbox worker、预处理脚本，共 9 个文件 |
| 上传清单 | `oss://automage-skills-private/bootstrap/20261009/upload-plan.json` | 198 个内容对象的 key、大小、SHA-256、MIME、缓存策略 |
| 校验记录 | `oss://automage-skills-private/reports/bootstrap-20261009-objects.json` | 逐对象 CRC64、SHA-256 元数据、ETag、上传状态 |
| 本次报告 | `oss://automage-skills-private/reports/bootstrap-20261009.json` | 汇总及尚未完成的播放域名配置 |

公开 bucket 沿用原有的空 bucket `automage`，公共读；仅写入 `skills/`。新建 `automage-skills-private`，私有读写，并开启阻止公共访问。

已初始化私有目录：`inbox/`、`archive/`、`rejected/`、`failed/`、`reports/`、`index-history/`。原始 ZIP 不是新交付格式，放来源存档，不放 `inbox/`。

首批内容合计 **2,110,258,634 字节，198 个对象**：公开 171 个对象，私有内容 27 个对象。首批另有 3 份私有审计文件，共 201 个对象；后续 CDN 和续期报告单独存入 `reports/`。

## 验证结果

- 85 个视频均为网页所需的 H.264 / AAC 或无声，均已 faststart；没有剪掉原录制画面。
- 198 个内容对象及 3 份审计文件均对比本地 CRC64 与 OSS 返回的 CRC64，大小及 SHA-256 元数据也一致。
- 视频和封面先上传并校验，公开索引最后发布。
- 索引匿名 GET 返回 200，内容与本地文件完全相同；`Content-Type: application/json; charset=utf-8`，缓存 60 秒。
- 视频 Range 请求返回 206，类型为 `video/mp4`，缓存一年并标为 immutable。
- 私有原始 ZIP 的匿名访问返回 403。
- 交付工具相关测试 16 项通过。未修改官网代码，未操作 3108、3109、3115。

可读取的索引地址：

<https://automage.oss-cn-hangzhou.aliyuncs.com/skills/index.json>

**此默认域名不能用作官网视频地址。** 本次实测视频响应带 `x-oss-force-download: true` 和 `Content-Disposition: attachment`，即使上传时设置 inline 也一样。Range 206 只能证明分段读取正常，不代表网页播放已接通。

## 已接通自定义资源域名

DNS 使用独立的 RAM 网页账号登录配置，浏览器会话和认证 profile 名为 `automage-dns`。现有 OSS CLI 凭证保持在原文件，域名账号没有创建 AccessKey。

| 配置 | 实际值 |
|---|---|
| 资源域名 | `skills.automage.cn` |
| DNS | `skills` CNAME → `skills.automage.cn.queniuaa.com`，TTL 10 分钟 |
| CDN 业务类型 | `video` |
| CDN 区域 | `overseas`（海外节点，中国用户也可访问） |
| CDN 计费 | 已开通 `PayByTraffic`，按流量计费 |
| 源站 | `automage.oss-cn-hangzhou.aliyuncs.com:443`，HTTPS 回源 |
| Range 回源 | 已开启 |
| 索引缓存 | JSON 60 秒 |
| 视频、封面缓存 | 31536000 秒，沿用源站 immutable 标记 |
| 响应头 | `Content-Disposition: inline`，删除 `x-oss-force-download` |
| HTTPS | Let's Encrypt，HTTP 自动跳转 HTTPS |

中国内地加速配置返回 `DomainNotRegistration`，因此当前使用允许无备案接入的海外区域。后续通过备案检查后，可按访问分布调整加速区域。原有 `@` A 记录、`www` CNAME 和 CAA 记录均保留；新增了 CDN 所有权验证 TXT 和首次签发证书用的 TXT。

验证结果：正式 HTTPS 索引返回 200，字节与上传版本相同；视频 Range 返回 206，类型、缓存和 inline 正确。浏览器跨域嵌入分别播放并跳转了 `churn-autopsy`（165.93 秒）与 `geo-effect-validator`（895.43 秒），均 `readyState=4`、无媒体错误。CDN 域名状态为 `online`。

当前验证记录：`oss://automage-skills-private/reports/cdn-20261009.json`。

## 证书续期

- 当前证书到期：**2027-01-07 10:05:01 UTC**。
- 自动续期已改为 HTTP-01：把临时校验文件上传到公开 OSS 的 `/.well-known/acme-challenge/`，经 CDN 提供验证，完成后清理。后续不需要域名账号、DNS AccessKey 或手机验证码。
- 已通过 Certbot 的模拟续期验证；续期成功后自动把证书更新到阿里云 CDN。
- 持久化运行目录：`/opt/automage-skill-ops/`，独立于仓库和临时生成目录。
- 定时任务：`/etc/cron.d/automage-skill-certificate`，每天本机时间 03:19 检查，到续期窗口才申请新证书。
- 日志：`/opt/automage-skill-ops/tls/renewal.log`。
- 运行依赖：本机持续可用，且 `/root/.ossutilconfig` 中的 OSS / CDN 凭证有效。若迁移机器，需一并迁移续期任务或重新配置。
- 私有续期记录：`oss://automage-skills-private/reports/certificate-renewal-20261009.json`。
- 维护工具包：`oss://automage-skills-private/operations/20261009/https-maintenance-kit.zip`，含校验、部署脚本、定时任务和已验证的依赖版本，不含密码或私钥。

## 官网待应用的运行时变量

将以下变量应用到生产官网并重启即可；无需为资源地址重新构建：

```dotenv
SKILL_INDEX_URL=https://skills.automage.cn/skills/index.json
SKILL_ASSET_BASE=https://skills.automage.cn/skills/
```

本次未写入生产环境变量、重启官网或启动 skill 上架 worker。资源本身已可公开播放。

## 本机续办资料

生成目录：`.workflow/oss-delivery-20261009/`（不进 git）。

- `upload-plan.json`、`upload-results.json`、`bootstrap-report.json`：本次实际上传及校验记录。
- `upload.py`：只在缺失时上传；若已存在的内容不同会停止，不能用于覆盖发布版本。
- `cloud.py`：临时使用本机 ossutil 凭证调用阿里云 CLI，不把密钥写入命令或仓库。
- 本机用户配置文件是 `/root/.ossutilconfig`，权限 0600；已补全地域为 `cn-hangzhou`。文件内容不得提交或公开。
- `cdn-verification.json`、`browser-media-verification.json`、`certificate-renewal.json`：资源域名、浏览器播放、续期测试的实际结果。
- ossutil 的持久化程序位于 `/opt/automage-skill-ops/bin/ossutil`，`/root/.local/bin/ossutil` 指向它。

后续无需重复转码、上传本批内容或重新配置资源域名。
