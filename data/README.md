# 本地数据目录

## 来源登记

`source-registry.json` 保存允许接入的公开来源、覆盖范围、访问状态和最后核验日期。

抓取器必须遵守以下约束：

- 只访问登记来源及其同域、明确指向的官方页面；
- 每次抓取保留 `sourceUrl`、`sourceId`、`verifiedAt` 和抓取方法；
- 遇到 401、403、429、验证码、登录墙或明确拒绝时停止该来源，不尝试绕过；
- 只提取竞赛元数据和官方链接，不下载或缓存附件；
- 日期冲突生成 `needsReview` 记录，不能静默覆盖旧值；
- 抓取失败时保留旧数据并显示失败状态。

## 竞赛记录建议字段

`id`、`name`、`edition`、`category`、`organizer`、`organizerType`、`level`、`audience`、`startAt`、`registrationDeadline`、`stages`、`format`、`fee`、`officialUrl`、`registrationUrl`、`sourceId`、`sourceUpdatedAt`、`verifiedAt`、`difficulty`、`value`、`difficultyEvidence`、`status`、`needsReview`。
