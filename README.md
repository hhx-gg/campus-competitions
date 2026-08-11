# 杜绝信息差——大学生友好竞赛消息工具

<p align="center">
  <img src="public/logo.png" width="96" alt="杜绝信息差 Logo" />
</p>

<p align="center">
  <b>把分散在各官网的竞赛信息，整理成可搜索、可核验、可规划的本地工作台。</b>
</p>

<p align="center">
  <a href="https://github.com/hhx-gg/campus-competitions/releases"><img src="https://img.shields.io/github/v/release/hhx-gg/campus-competitions?color=2f7cf6&label=release" alt="Release" /></a>
  <a href="https://github.com/hhx-gg/campus-competitions/actions/workflows/ci.yml"><img src="https://github.com/hhx-gg/campus-competitions/actions/workflows/ci.yml/badge.svg" alt="CI" /></a>
  <a href="LICENSE"><img src="https://img.shields.io/github/license/hhx-gg/campus-competitions?color=green" alt="License" /></a>
  <img src="https://img.shields.io/badge/Windows-10%2F11-blue" alt="Platform" />
  <img src="https://img.shields.io/badge/Stack-Tauri%202%20%2B%20React%20%2B%20Cloudflare%20Workers-8a5cf6" alt="Stack" />
</p>

面向 Windows 10/11 的本地优先竞赛信息桌面应用。自动收集公开可访问的全国大学生竞赛官方信息，集中展示报名状态、截止时间、赛程、来源与官方材料；支持搜索、筛选、收藏、隐藏与恢复、赛程日历和参赛计划。**不做个性化推荐，不把不确定的信息伪装成确定事实。**

- 当前版本：**v0.6.1**（[下载安装包](https://github.com/hhx-gg/campus-competitions/releases)）
- 源码仓库：[https://github.com/hhx-gg/campus-competitions](https://github.com/hhx-gg/campus-competitions)（开源，MIT）

## 功能特性

- **官方来源优先**：只收录可追溯到官方页面的记录，每条保留来源网址与最后核验时间；
- **搜索与筛选**：支持中英文、拼音缩写（如 CUMCM、lanqiao）、别名搜索，按年份、分类、状态、对象、形式、难度等组合筛选；
- **报名时间轴**：精确日期、仅月份、年度归档三种精度明确区分，日期冲突进入待核验队列，不静默覆盖；
- **收藏与规划**：收藏、隐藏（可恢复）、个人备注、参赛计划与任务清单，全部仅保存在本机；
- **赛程日历**：月视图展示报名、初赛、复赛、决赛等节点；
- **双语与主题**：简体中文 / English 一键切换，浅色 / 深色主题；
- **数据每日更新**：应用启动时及每日零点检查最新数据包，失败时自动回退上一版有效数据；
- **应用自动升级**：启动时及每 6 小时检查签名升级包。

## 界面预览

> 概念图：首页、搜索结果、竞赛详情、收藏、赛程日历与个人设置。

<p align="center">
  <img src="image/%E4%B8%BB%E7%95%8C%E9%9D%A2%E5%9B%BE/ChatGPT%20Image%202026%E5%B9%B48%E6%9C%888%E6%97%A5%2012_23_27%20%281%29.png" width="30%" alt="概念图 1" />
  <img src="image/%E4%B8%BB%E7%95%8C%E9%9D%A2%E5%9B%BE/ChatGPT%20Image%202026%E5%B9%B48%E6%9C%888%E6%97%A5%2012_23_27%20%282%29.png" width="30%" alt="概念图 2" />
  <img src="image/%E4%B8%BB%E7%95%8C%E9%9D%A2%E5%9B%BE/ChatGPT%20Image%202026%E5%B9%B48%E6%9C%888%E6%97%A5%2012_23_27%20%283%29.png" width="30%" alt="概念图 3" />
</p>
<p align="center">
  <img src="image/%E4%B8%BB%E7%95%8C%E9%9D%A2%E5%9B%BE/ChatGPT%20Image%202026%E5%B9%B48%E6%9C%888%E6%97%A5%2012_23_27%20%284%29.png" width="30%" alt="概念图 4" />
  <img src="image/%E4%B8%BB%E7%95%8C%E9%9D%A2%E5%9B%BE/ChatGPT%20Image%202026%E5%B9%B48%E6%9C%888%E6%97%A5%2012_23_27%20%285%29.png" width="30%" alt="概念图 5" />
  <img src="image/%E4%B8%BB%E7%95%8C%E9%9D%A2%E5%9B%BE/ChatGPT%20Image%202026%E5%B9%B48%E6%9C%888%E6%97%A5%2012_23_27%20%286%29.png" width="30%" alt="概念图 6" />
</p>

## 技术架构

```text
官方竞赛网站（85 个已登记 HTTPS 来源）
        │  每日 09:00 / 21:00（北京时间）定时抓取
        ▼
Cloudflare Workers（数据抓取、校验、发布）
        │  签名数据包 package.json
        ▼
Windows 桌面应用（Tauri 2 + React + TypeScript）
        │  每日零点检查 / 启动补检
        ▼
本地缓存 + 用户本地数据（收藏 / 隐藏 / 备注 / 计划）
```

- `src/`：React 前端（界面、搜索、数据质量、本地存储、数据与应用更新）；
- `src-tauri/`：Tauri 2 Rust 桌面壳（窗口、外部链接、签名升级）；
- `update-service/`：Cloudflare Worker（每日抓取官方来源、冲突校验、发布数据包）；
- `tools/`：数据导出与审计、Logo/材料同步、发布打包脚本；
- `data/`：来源登记与发布清单。

## 数据与质量

数据门当前为 **450 条逐届记录、150 个品牌、2024—2026 各 150 条**。数据原则：

- 只发布能够追溯到官方页面的记录；
- 日期或来源冲突进入待审核队列，不覆盖已发布数据；
- 附件只提供官网下载链接，不在应用内缓存；
- 官方页面没有明确文件直链时只显示“通知页”，不冒充可下载文件；
- 官方站点公开图标随安装包本地提供；无法合法取得时显示文字标识，不生成假 Logo；
- 收藏、隐藏、备注与参赛计划仅保存在本机，不上传。

## 安装与使用

直接下载安装包：[GitHub Releases](https://github.com/hhx-gg/campus-competitions/releases)

本地开发：

```powershell
npm install
npm run tauri dev
```

环境要求：Node.js、Rust stable-msvc、Visual Studio“使用 C++ 的桌面开发”工作负载。

## 测试与发布

```powershell
npm test                 # 单元测试
npm run build            # 前端构建
npm run data:audit       # 数据质量审计（发布闸门）
npm run data:verify      # 发布清单哈希校验
npm run logo:audit       # 官方图标覆盖率审计
cargo test --manifest-path src-tauri/Cargo.toml
```

正式发布流程：

```powershell
./tools/build-release.ps1     # 构建 → 签名 → 整理唯一最新版发布文件
```

云端数据服务部署（`update-service/`）：

```powershell
npm install
npm run deploy                # 需要 Cloudflare 账号授权（wrangler login）
```

## 目录结构

```text
src/                    前端应用（React + TypeScript）
src-tauri/              Tauri 2 桌面壳（Rust）
update-service/         Cloudflare Worker 数据服务
data/                   来源登记与数据发布清单
tools/                  数据审计、同步与发布脚本
public/                 图标、favicon、界面 Logo
releases/               当前版本安装包与校验和
image/                  界面概念图
```

## 许可证

MIT，详见 [LICENSE](LICENSE)。第三方商标与竞赛名称归各自权利人所有。
