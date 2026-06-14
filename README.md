# 越南餐厅推荐 H5 原型

这是一个无依赖的静态 H5 原型，用于快速验证“越南中国人餐厅推荐目录”的方向。当前阶段先聚焦胡志明，其他城市后续根据需求开放。

## 使用方式

直接用浏览器打开 `index.html`。

## 当前功能

- 首页按胡志明区域、菜系筛选餐厅
- 首页餐厅卡片带菜系氛围图，没有上传照片时也不会退化成纯文字列表
- 餐厅详情页展示封面、场景判断和精选推荐理由
- 一键打开 Google Maps
- 提交推荐表单，城市固定为胡志明，基础推荐字段必填
- 可选补充 Google 评分、评论数，并上传一张自己拍的餐厅照片
- 餐厅卡片支持展示真实照片、评分和评论数；真实照片缺失时自动使用通用菜系氛围图
- “想去”按钮，使用浏览器本地记录
- 用户提交内容先进入本地待整理状态，不直接公开
- 本地整理台：打开 `#/admin`，可把测试提交标为发布、待整理或隐藏
- 可配置 Supabase 云端数据表，用于多人提交、多人查看同一份真实测试数据

## 说明

当前种子餐厅为示例数据，不代表真实推荐。接入 Supabase 后，只要云端已有真实推荐，首页会优先展示真实推荐，不再混入示例店。

## 多人真实测试

默认情况下，项目仍然使用浏览器本地数据。要让其他人提交的数据也能被你和所有测试者看到：

1. 在 Supabase 创建项目。
2. 打开 SQL Editor，执行 `supabase-setup.sql`。
3. 在 Supabase Project Settings → API 找到 Project URL 和 anon public key。
4. 把这两个值填入 `config.js`：

```js
window.FOOD_APP_CONFIG = {
  supabaseUrl: "https://你的项目.supabase.co",
  supabaseAnonKey: "你的 anon public key",
  tableName: "restaurant_recommendations",
};
```

配置后，提交推荐会写入云端，并直接出现在所有人的公共列表里。需要隐藏或删除测试数据时，先在 Supabase 表里手动处理。

## 评分和图片信息

当前推荐先不依赖 Google Places API。提交者可以手动补充 Google Maps 上看到的评分、评论数，并上传一张自己拍的餐厅照片；这些字段为空时不影响提交。图片会上传到 Supabase Storage 的 `restaurant-photos` bucket，再把公开图片地址写入推荐数据。

如果餐厅暂时没有上传照片，页面会展示项目内置的通用菜系氛围图。这些图片只用于提升浏览体验，不代表具体餐厅实拍；一旦用户上传真实照片，会优先展示真实照片。

如果后续能开通 Google Cloud，页面也已经支持从云端字段 `photo_url`、`rating`、`review_count` 展示自动补全结果。

## Google 信息自动补全（可选）

页面已支持展示 `photo_url`、`rating`、`review_count`。要从 Google Maps 补全首图、评分和评论数：

1. 在 Google Cloud 开通 Places API。
2. 在 Supabase SQL Editor 重新执行 `supabase-setup.sql`，补齐字段和图片 bucket。
3. 复制 `.env.example` 为 `.env`，填入 `GOOGLE_MAPS_API_KEY`、`SUPABASE_URL` 和 `SUPABASE_SERVICE_ROLE_KEY`。
4. 运行：

```bash
set -a
source .env
set +a
node scripts/enrich-google-places.js
```

脚本会用店名、区域和胡志明作为搜索条件，补全 Google place id、评分、评论数，并把首图下载到 Supabase Storage 后写回公开图片地址。
