# 越南餐厅推荐 H5 原型

这是一个无依赖的静态 H5 原型，用于快速验证“越南中国人餐厅推荐目录”的方向。当前阶段先聚焦胡志明，其他城市后续根据需求开放。

## 使用方式

直接用浏览器打开 `index.html`。

## 当前功能

- 首页按胡志明区域、菜系筛选餐厅
- 餐厅详情页展示精选推荐理由
- 一键打开 Google Maps
- 提交推荐表单，城市固定为胡志明，6 个展示字段全部必填
- 餐厅卡片支持展示首图、Google 评分和评论数
- “想去”按钮，使用浏览器本地记录
- 用户提交内容先进入本地待整理状态，不直接公开
- 本地整理台：打开 `#/admin`，可把测试提交标为发布、待整理或隐藏
- 可配置 Supabase 云端数据表，用于多人提交、多人查看同一份真实测试数据

## 说明

当前种子餐厅为示例数据，不代表真实推荐。正式上线前建议替换为你和朋友确认过的 30 家餐厅。

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

## Google 信息补全

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
