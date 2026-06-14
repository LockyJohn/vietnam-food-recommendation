const PRIMARY_CITY = "胡志明";
const HCMC_AREAS = [
  "全部区域",
  "1区/市中心",
  "2区/Thao Dien",
  "2区/An Phu",
  "3区",
  "4区",
  "5区/堤岸",
  "6区",
  "7区/富美兴",
  "7区/新归",
  "10区",
  "11区",
  "Binh Thanh",
  "Phu Nhuan",
  "Tan Binh/机场",
  "Tan Phu",
  "Go Vap",
  "Thu Duc",
  "Binh Tan",
  "Nha Be",
  "其他",
];
const DEFAULT_AREAS = HCMC_AREAS;
const CUISINES = ["全部菜系", "中餐", "火锅", "烧烤", "粤菜", "川湘菜", "粉面", "小吃快餐", "咖啡甜品", "越南菜", "日料韩餐", "西餐", "其他"];

const seedRestaurants = [
  {
    id: "demo-thao-dien-noodles",
    name: "Thao Dien 牛肉粉示例店",
    city: "胡志明",
    area: "2区/Thao Dien",
    cuisine: "粉面",
    googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Thao+Dien+beef+noodle",
    photoUrl: "",
    rating: null,
    reviewCount: null,
    wantCount: 18,
    recommendCount: 3,
    reasons: [
      { nickname: "阿南", text: "汤底清，早上去吃很舒服，刚来胡志明不知道吃什么的时候可以先试这类店。" },
      { nickname: "小林", text: "位置对住在 Thao Dien 的人比较友好，吃完顺路去咖啡店也方便。" },
    ],
  },
  {
    id: "demo-d1-hotpot",
    name: "1区火锅示例店",
    city: "胡志明",
    area: "1区/市中心",
    cuisine: "火锅",
    googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=District+1+hotpot+Ho+Chi+Minh",
    photoUrl: "",
    rating: null,
    reviewCount: null,
    wantCount: 26,
    recommendCount: 5,
    reasons: [
      { nickname: "老周", text: "适合刚认识新朋友时约饭，口味比普通商场火锅更接近国内，点菜也不容易踩坑。" },
      { nickname: "Mia", text: "在 1 区活动时比较好约，几个人一起吃比单点炒菜更稳。" },
    ],
  },
  {
    id: "demo-pmh-cantonese",
    name: "富美兴粤菜示例店",
    city: "胡志明",
    area: "7区/富美兴",
    cuisine: "粤菜",
    googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Phu+My+Hung+Cantonese+restaurant",
    photoUrl: "",
    rating: null,
    reviewCount: null,
    wantCount: 14,
    recommendCount: 2,
    reasons: [
      { nickname: "Echo", text: "适合想吃清淡一点的时候去，带家人或者朋友聚餐都不突兀。" },
    ],
  },
  {
    id: "demo-binh-thanh-bbq",
    name: "Binh Thanh 烧烤示例店",
    city: "胡志明",
    area: "Binh Thanh",
    cuisine: "烧烤",
    googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Binh+Thanh+BBQ+restaurant",
    photoUrl: "",
    rating: null,
    reviewCount: null,
    wantCount: 21,
    recommendCount: 4,
    reasons: [
      { nickname: "一一", text: "适合下班后随便吃点，氛围轻松，不是那种很正式的餐厅。" },
      { nickname: "Tony", text: "朋友聚会比较合适，点几样烤串和小菜就能坐很久。" },
    ],
  },
  {
    id: "demo-tan-binh-vietnamese",
    name: "Tan Binh 越南菜示例店",
    city: "胡志明",
    area: "Tan Binh/机场",
    cuisine: "越南菜",
    googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Tan+Binh+Vietnamese+restaurant",
    photoUrl: "",
    rating: null,
    reviewCount: null,
    wantCount: 9,
    recommendCount: 2,
    reasons: [
      { nickname: "Nico", text: "适合刚来时了解本地口味，价格通常比游客区友好，也更像日常吃饭的地方。" },
    ],
  },
  {
    id: "demo-d3-coffee",
    name: "3区咖啡甜品示例店",
    city: "胡志明",
    area: "3区",
    cuisine: "咖啡甜品",
    googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=District+3+coffee+dessert+Ho+Chi+Minh",
    photoUrl: "",
    rating: null,
    reviewCount: null,
    wantCount: 12,
    recommendCount: 3,
    reasons: [
      { nickname: "小北", text: "适合下午见朋友或者临时办公，环境比网红店安静一点。" },
    ],
  },
];

const storageKeys = {
  submissions: "hcm_food_submissions",
  wants: "hcm_food_wants",
};
const PHOTO_BUCKET = "restaurant-photos";
const MAX_PHOTO_SIZE = 3 * 1024 * 1024;
const ALLOWED_PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"];

const app = document.querySelector("#app");
const appConfig = window.FOOD_APP_CONFIG || {};
const cloudConfig = {
  supabaseUrl: (appConfig.supabaseUrl || "").replace(/\/$/, ""),
  supabaseAnonKey: appConfig.supabaseAnonKey || "",
  tableName: appConfig.tableName || "restaurant_recommendations",
};
let lastCloudError = "";

function isCloudEnabled() {
  return Boolean(cloudConfig.supabaseUrl && cloudConfig.supabaseAnonKey);
}

function getSubmissions() {
  try {
    return JSON.parse(localStorage.getItem(storageKeys.submissions)) || [];
  } catch {
    return [];
  }
}

function setSubmissions(submissions) {
  localStorage.setItem(storageKeys.submissions, JSON.stringify(submissions));
}

function getWantedIds() {
  try {
    return JSON.parse(localStorage.getItem(storageKeys.wants)) || [];
  } catch {
    return [];
  }
}

function setWantedIds(ids) {
  localStorage.setItem(storageKeys.wants, JSON.stringify(ids));
}

async function getRestaurants() {
  const acceptedSubmissions = getSubmissions()
    .filter((item) => item.status === "published")
    .map((item) => ({
      id: item.id,
      name: item.name,
      city: item.city || PRIMARY_CITY,
      area: item.area,
      cuisine: item.cuisine,
      googleMapsUrl: item.mapsUrl,
      photoUrl: item.photoUrl || "",
      rating: item.rating ?? null,
      reviewCount: item.reviewCount ?? null,
      wantCount: 0,
      recommendCount: 1,
      reasons: [{ nickname: item.nickname, text: item.reason }],
    }));

  if (!isCloudEnabled()) return [...seedRestaurants, ...acceptedSubmissions];

  try {
    const cloudRestaurants = await fetchCloudRestaurants();
    lastCloudError = "";
    return cloudRestaurants.length ? cloudRestaurants : [...seedRestaurants, ...acceptedSubmissions];
  } catch (error) {
    lastCloudError = "云端数据暂时连接失败，当前只显示示例数据。";
    console.error(error);
    return seedRestaurants;
  }
}

async function fetchCloudRestaurants() {
  const rows = await cloudRequest(
    `?select=*&status=eq.published&city=eq.${encodeURIComponent(PRIMARY_CITY)}&order=created_at.desc`,
  );
  return rows.map((item) => ({
    id: `cloud-${item.id}`,
    name: item.name,
    city: item.city,
    area: item.area,
    cuisine: item.cuisine,
    googleMapsUrl: item.maps_url,
    photoUrl: item.photo_url || "",
    rating: item.rating ?? null,
    reviewCount: item.review_count ?? null,
    wantCount: item.want_count || 0,
    recommendCount: 1,
    reasons: [{ nickname: item.nickname, text: item.reason }],
  }));
}

async function saveCloudSubmission(data, photoFile) {
  const payload = {
    nickname: data.nickname.trim(),
    name: data.name.trim(),
    maps_url: data.mapsUrl.trim(),
    city: PRIMARY_CITY,
    area: data.area,
    cuisine: data.cuisine,
    reason: data.reason.trim(),
    status: "published",
  };
  const rating = normalizeOptionalRating(data.rating);
  const reviewCount = normalizeOptionalReviewCount(data.reviewCount);
  const photoUrl = await uploadCloudPhoto(photoFile);

  if (rating !== null) payload.rating = rating;
  if (reviewCount !== null) payload.review_count = reviewCount;
  if (photoUrl) payload.photo_url = photoUrl;

  await cloudRequest("", {
    method: "POST",
    headers: { Prefer: "return=minimal" },
    body: JSON.stringify(payload),
  });
}

async function cloudRequest(query = "", options = {}) {
  const headers = {
    apikey: cloudConfig.supabaseAnonKey,
    Authorization: `Bearer ${cloudConfig.supabaseAnonKey}`,
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };
  const response = await fetch(`${cloudConfig.supabaseUrl}/rest/v1/${cloudConfig.tableName}${query}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Cloud request failed: ${response.status}`);
  }

  const text = await response.text();
  return text ? JSON.parse(text) : null;
}

async function uploadCloudPhoto(file) {
  if (!hasPhotoFile(file)) return "";

  const extensionByType = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
  };
  const extension = extensionByType[file.type] || "jpg";
  const photoId = crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const path = `${Date.now()}-${photoId}.${extension}`;
  const response = await fetch(`${cloudConfig.supabaseUrl}/storage/v1/object/${PHOTO_BUCKET}/${path}`, {
    method: "POST",
    headers: {
      apikey: cloudConfig.supabaseAnonKey,
      Authorization: `Bearer ${cloudConfig.supabaseAnonKey}`,
      "Content-Type": file.type,
      "x-upsert": "false",
    },
    body: file,
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Photo upload failed: ${response.status}`);
  }

  return `${cloudConfig.supabaseUrl}/storage/v1/object/public/${PHOTO_BUCKET}/${path}`;
}

async function renderRoute() {
  const [path, id] = location.hash.replace("#/", "").split("/");

  if (path === "submit") {
    renderSubmit();
    return;
  }

  if (path === "admin") {
    renderAdmin();
    return;
  }

  if (path === "restaurant" && id) {
    await renderDetail(id);
    return;
  }

  await renderHome();
}

function cloneTemplate(id) {
  const template = document.querySelector(id);
  return template.content.cloneNode(true);
}

function fillSelect(select, options, placeholderMode = false) {
  select.innerHTML = options
    .map((option, index) => `<option value="${index === 0 && placeholderMode ? "" : option}">${option}</option>`)
    .join("");
}

async function renderHome() {
  app.replaceChildren(cloneTemplate("#home-template"));
  const areaFilter = document.querySelector("#area-filter");
  const cuisineFilter = document.querySelector("#cuisine-filter");
  const resetButton = document.querySelector("#reset-filter");

  fillSelect(areaFilter, DEFAULT_AREAS);
  fillSelect(cuisineFilter, CUISINES);

  const updateList = async () => {
    const area = areaFilter.value;
    const cuisine = cuisineFilter.value;
    const list = document.querySelector("#restaurant-list");
    list.innerHTML = `<div class="empty-state"><p>正在加载餐厅...</p></div>`;

    const restaurants = (await getRestaurants()).filter((restaurant) => {
      const areaMatch = area === "全部区域" || restaurant.area === area;
      const cuisineMatch = cuisine === "全部菜系" || restaurant.cuisine === cuisine;
      return restaurant.city === PRIMARY_CITY && areaMatch && cuisineMatch;
    });

    renderCloudStatus();
    renderHeroCount(restaurants.length);
    renderFeaturedRestaurants(restaurants);
    renderRestaurantList(restaurants);
  };

  areaFilter.addEventListener("change", updateList);
  cuisineFilter.addEventListener("change", updateList);
  resetButton.addEventListener("click", () => {
    fillSelect(areaFilter, DEFAULT_AREAS);
    areaFilter.value = "全部区域";
    cuisineFilter.value = "全部菜系";
    updateList();
  });

  await updateList();
}

function renderHeroCount(count) {
  const heroCount = document.querySelector("#hero-count");
  if (heroCount) heroCount.textContent = `${count} 家推荐`;
}

function renderFeaturedRestaurants(restaurants) {
  const section = document.querySelector("#featured-section");
  if (!section) return;

  if (restaurants.length < 4) {
    section.innerHTML = "";
    return;
  }

  const featured = [...restaurants].sort((a, b) => getRestaurantWeight(b) - getRestaurantWeight(a)).slice(0, 2);
  if (!featured.length) {
    section.innerHTML = "";
    return;
  }

  section.innerHTML = `
    <div class="section-heading">
      <h2>今天先看这几家</h2>
      <span>${featured.length} 家</span>
    </div>
    <div class="featured-grid">
      ${featured.map((restaurant) => renderRestaurantCard(restaurant, true)).join("")}
    </div>
  `;
}

function renderRestaurantList(restaurants) {
  const list = document.querySelector("#restaurant-list");
  const count = document.querySelector("#result-count");
  count.textContent = `${restaurants.length} 家`;

  if (!restaurants.length) {
    list.innerHTML = `
      <div class="empty-state">
        <p>还没有符合条件的餐厅。</p>
        <a class="primary-button" href="#/submit">推荐一家店</a>
      </div>
    `;
    return;
  }

  list.innerHTML = restaurants.map((restaurant) => renderRestaurantCard(restaurant)).join("");
}

function renderRestaurantCard(restaurant, featured = false) {
  const firstReason = restaurant.reasons[0]?.text || "这家店还没有展示推荐理由。";
  const googleMeta = renderGoogleMeta(restaurant);
  const scene = getRestaurantScene(restaurant);
  return `
    <a class="restaurant-card ${featured ? "featured-card" : ""}" href="#/restaurant/${restaurant.id}">
      ${renderRestaurantCover(restaurant, "card-photo")}
      <div class="card-body">
        <div class="card-title-row">
          <div>
            <p class="card-kicker">${escapeHtml(restaurant.area)} · ${escapeHtml(restaurant.cuisine)}</p>
            <h3>${escapeHtml(restaurant.name)}</h3>
          </div>
          ${googleMeta ? `<p class="rating-badge">${googleMeta}</p>` : `<p class="rating-badge quiet">中文推荐</p>`}
        </div>
        <p class="scene-line">${escapeHtml(scene)}</p>
        <p class="reason-preview">${escapeHtml(firstReason)}</p>
        <div class="card-meta">
          <span>${restaurant.recommendCount} 人推荐</span>
          <strong>查看详情</strong>
        </div>
      </div>
    </a>
  `;
}

function renderRestaurantCover(restaurant, className) {
  if (isLikelyEmbeddableImageUrl(restaurant.photoUrl)) {
    return `
      <div class="${className} has-photo">
        <img src="${escapeAttribute(restaurant.photoUrl)}" alt="${escapeAttribute(restaurant.name)}" loading="lazy" onerror="this.parentElement.classList.add('image-broken')" />
        <div class="cover-overlay">
          <span>${escapeHtml(restaurant.cuisine)}</span>
          <strong>${escapeHtml(restaurant.area)}</strong>
        </div>
      </div>
    `;
  }

  const visual = getRestaurantVisual(restaurant);
  return `
    <div class="${className} cover-fallback visual-${visual.slug}">
      <div class="cover-lines" aria-hidden="true"></div>
      <div class="cover-copy">
        <span>${escapeHtml(visual.label)}</span>
        <strong>${escapeHtml(visual.mark)}</strong>
        <small>${escapeHtml(visual.note)}</small>
        <em>${escapeHtml(restaurant.area)}</em>
      </div>
    </div>
  `;
}

function renderGoogleMeta(restaurant) {
  if (!restaurant.rating && !restaurant.reviewCount) return "";
  const parts = [];
  if (restaurant.rating) parts.push(`<strong>${escapeHtml(formatRating(restaurant.rating))}</strong>`);
  if (restaurant.reviewCount) parts.push(`${escapeHtml(formatReviewCount(restaurant.reviewCount))} 条`);
  return `<span class="star">★</span> ${parts.join(" / ")}`;
}

function getRestaurantWeight(restaurant) {
  const rating = Number(restaurant.rating) || 0;
  const reviews = Number(restaurant.reviewCount) || 0;
  const hasPhoto = isLikelyEmbeddableImageUrl(restaurant.photoUrl) ? 80 : 0;
  return rating * 120 + Math.min(reviews, 2000) / 8 + restaurant.recommendCount * 30 + hasPhoto;
}

function getRestaurantScene(restaurant) {
  const scenes = {
    中餐: "适合想吃一顿稳定的中式正餐",
    火锅: "适合朋友小聚和不想踩雷的热闹饭局",
    烧烤: "适合下班后轻松坐一会儿",
    粤菜: "适合家人朋友聚餐，口味相对清淡",
    川湘菜: "适合想吃重口、下饭、够味的一餐",
    粉面: "适合一个人快速解决，也适合刚到胡志明时试口味",
    小吃快餐: "适合临时补一顿，不想花太多时间",
    咖啡甜品: "适合下午见朋友、短暂办公或饭后收尾",
    越南菜: "适合带朋友体验本地日常口味",
    日料韩餐: "适合换口味和轻松约饭",
    西餐: "适合约会、聊天或更安静的一餐",
    其他: "适合收藏起来，等需要时再打开看看",
  };
  return scenes[restaurant.cuisine] || scenes.其他;
}

function getRestaurantVisual(restaurant) {
  const visuals = {
    中餐: { slug: "chinese", label: "Chinese Table", mark: "中餐", note: "热菜 · 米饭 · 聚餐" },
    火锅: { slug: "hotpot", label: "Hot Pot", mark: "火锅", note: "牛肉 · 汤底 · 朋友局" },
    烧烤: { slug: "bbq", label: "Grill", mark: "烧烤", note: "炭火 · 串串 · 小聚" },
    粤菜: { slug: "cantonese", label: "Cantonese", mark: "粤菜", note: "清淡 · 茶点 · 家常" },
    川湘菜: { slug: "spicy", label: "Spicy", mark: "川湘", note: "辣味 · 下饭 · 够劲" },
    粉面: { slug: "noodles", label: "Noodles", mark: "粉面", note: "汤头 · 快吃 · 一个人" },
    小吃快餐: { slug: "snack", label: "Quick Bite", mark: "小吃", note: "简单 · 顺路 · 不费劲" },
    咖啡甜品: { slug: "coffee", label: "Coffee", mark: "甜品", note: "咖啡 · 蛋糕 · 下午" },
    越南菜: { slug: "vietnamese", label: "Local Taste", mark: "越南菜", note: "本地 · 日常 · 带朋友" },
    日料韩餐: { slug: "jpkor", label: "Japan Korea", mark: "日韩", note: "换口味 · 轻松约饭" },
    西餐: { slug: "western", label: "Western", mark: "西餐", note: "聊天 · 约会 · 安静" },
    其他: { slug: "other", label: "Food Note", mark: "好店", note: "收藏 · 想吃时打开" },
  };
  return visuals[restaurant.cuisine] || visuals.其他;
}

function renderCloudStatus() {
  const existing = document.querySelector(".status-note");
  if (existing) existing.remove();
  if (!lastCloudError) return;

  const sectionHeading = document.querySelector(".section-heading");
  sectionHeading.insertAdjacentHTML("afterend", `<p class="status-note">${escapeHtml(lastCloudError)}</p>`);
}

async function renderDetail(id) {
  app.replaceChildren(cloneTemplate("#detail-template"));
  const restaurant = (await getRestaurants()).find((item) => item.id === id);
  const detail = document.querySelector("#detail-content");

  if (!restaurant) {
    detail.innerHTML = `
      <div class="empty-state">
        <p>这家餐厅暂时找不到了。</p>
        <a class="primary-button" href="#/">返回首页</a>
      </div>
    `;
    return;
  }

  const wantedIds = getWantedIds();
  const isWanted = wantedIds.includes(restaurant.id);
  const adjustedWantCount = restaurant.wantCount + (isWanted ? 1 : 0);
  const googleMeta = renderGoogleMeta(restaurant);
  const scene = getRestaurantScene(restaurant);

  detail.innerHTML = `
    <div class="detail-card">
      ${renderRestaurantCover(restaurant, "detail-photo")}
      <div class="detail-main">
        <div>
          <div class="tag-row">
            <span class="tag">${escapeHtml(restaurant.city)}</span>
            <span class="tag">${escapeHtml(restaurant.area)}</span>
            <span class="tag">${escapeHtml(restaurant.cuisine)}</span>
            <span class="tag hot">${restaurant.recommendCount} 人推荐</span>
          </div>
          <h1>${escapeHtml(restaurant.name)}</h1>
          ${googleMeta ? `<p class="google-meta detail-google-meta">${googleMeta}</p>` : ""}
          <p class="intro">${escapeHtml(scene)}。评分、营业时间和导航请以 Google Maps 为准。</p>
        </div>
        <div class="detail-actions">
          <button id="want-button" class="primary-button want-button ${isWanted ? "active" : ""}" type="button">
            ${isWanted ? "已想去" : "想去"} · <span id="want-count">${adjustedWantCount}</span>
          </button>
          <a class="primary-button" href="${escapeAttribute(restaurant.googleMapsUrl)}" target="_blank" rel="noreferrer">
            打开 Google Maps
          </a>
        </div>
        <section>
          <h2>推荐理由</h2>
          <ul class="reason-list">
            ${restaurant.reasons
              .slice(0, 3)
              .map(
                (reason) => `
                  <li class="reason-item">
                    <strong>${escapeHtml(reason.nickname)} 推荐</strong>
                    <p>${escapeHtml(reason.text)}</p>
                  </li>
                `,
              )
              .join("")}
          </ul>
        </section>
      </div>
    </div>
  `;

  const wantButton = document.querySelector("#want-button");
  wantButton.addEventListener("click", () => {
    const ids = getWantedIds();
    if (ids.includes(restaurant.id)) return;
    setWantedIds([...ids, restaurant.id]);
    wantButton.classList.add("active");
    wantButton.innerHTML = `已想去 · <span id="want-count">${restaurant.wantCount + 1}</span>`;
  });
}

function renderSubmit() {
  app.replaceChildren(cloneTemplate("#submit-template"));
  const form = document.querySelector("#submit-form");
  const city = document.querySelector("#city");
  const area = document.querySelector("#area");
  const cuisine = document.querySelector("#cuisine");
  const reason = document.querySelector("#reason");
  const reasonCount = document.querySelector("#reason-count");
  const result = document.querySelector("#submit-result");

  city.value = PRIMARY_CITY;
  fillSelect(area, ["请选择区域", ...DEFAULT_AREAS.slice(1)], true);
  fillSelect(cuisine, ["请选择菜系", ...CUISINES.slice(1)], true);

  reason.addEventListener("input", () => {
    reasonCount.textContent = `${reason.value.length}/300`;
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    clearErrors();
    result.textContent = "";

    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    const photoFile = formData.get("photoFile");
    const errors = validateSubmission(data, photoFile);

    if (Object.keys(errors).length) {
      showErrors(errors);
      return;
    }

    const submission = {
      id: `local-${Date.now()}`,
      nickname: data.nickname.trim(),
      name: data.name.trim(),
      mapsUrl: data.mapsUrl.trim(),
      city: data.city,
      area: data.area,
      cuisine: data.cuisine,
      reason: data.reason.trim(),
      photoUrl: "",
      rating: normalizeOptionalRating(data.rating),
      reviewCount: normalizeOptionalReviewCount(data.reviewCount),
      status: "pending",
      createdAt: new Date().toISOString(),
    };

    if (isCloudEnabled()) {
      result.textContent = "正在提交...";
      form.querySelector("button[type='submit']").disabled = true;
      try {
        await saveCloudSubmission(data, photoFile);
        result.textContent = "提交成功，已同步到公共列表。";
      } catch (error) {
        console.error(error);
        result.textContent = "提交失败，请稍后再试。";
        form.querySelector("button[type='submit']").disabled = false;
        return;
      }
    } else {
      const submissions = getSubmissions();
      setSubmissions([submission, ...submissions]);
      result.textContent = "收到推荐啦，整理后会展示出来。";
    }

    form.reset();
    reasonCount.textContent = "0/300";
    form.querySelector("button[type='submit']").disabled = false;
  });
}

function renderAdmin() {
  app.replaceChildren(cloneTemplate("#admin-template"));
  const adminList = document.querySelector("#admin-list");

  if (isCloudEnabled()) {
    adminList.innerHTML = `
      <div class="empty-state">
        <p>当前是云端真实测试模式。测试者提交后会直接进入公共列表；需要隐藏或删除时，请在 Supabase 数据表里处理。</p>
        <a class="primary-button" href="#/">查看公共列表</a>
      </div>
    `;
    return;
  }

  const submissions = getSubmissions();

  if (!submissions.length) {
    adminList.innerHTML = `
      <div class="empty-state">
        <p>暂无本地提交。</p>
        <a class="primary-button" href="#/submit">去提交一条</a>
      </div>
    `;
    return;
  }

  adminList.innerHTML = submissions
    .map(
      (item) => `
        <article class="admin-item" data-id="${escapeAttribute(item.id)}">
          <div class="admin-item-header">
            <div>
              <h3>${escapeHtml(item.name)}</h3>
              <div class="tag-row">
                <span class="tag">${escapeHtml(item.status)}</span>
                <span class="tag">${escapeHtml(item.city || "胡志明")}</span>
                <span class="tag">${escapeHtml(item.area)}</span>
                <span class="tag">${escapeHtml(item.cuisine)}</span>
                <span class="tag hot">${escapeHtml(item.nickname)} 推荐</span>
              </div>
            </div>
            <a class="ghost-button" href="${escapeAttribute(item.mapsUrl)}" target="_blank" rel="noreferrer">看地图</a>
          </div>
          <p>${escapeHtml(item.reason)}</p>
          <div class="admin-actions">
            <button class="primary-button" type="button" data-action="publish" data-id="${escapeAttribute(item.id)}">发布</button>
            <button class="ghost-button" type="button" data-action="pending" data-id="${escapeAttribute(item.id)}">待整理</button>
            <button class="danger-button" type="button" data-action="hidden" data-id="${escapeAttribute(item.id)}">隐藏</button>
          </div>
        </article>
      `,
    )
    .join("");

  adminList.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-action]");
    if (!button) return;
    const nextStatus = button.dataset.action === "publish" ? "published" : button.dataset.action;
    const nextSubmissions = getSubmissions().map((item) =>
      item.id === button.dataset.id ? { ...item, status: nextStatus } : item,
    );
    setSubmissions(nextSubmissions);
    renderAdmin();
  });
}

function validateSubmission(data, photoFile) {
  const errors = {};
  const nickname = data.nickname.trim();
  const name = data.name.trim();
  const mapsUrl = data.mapsUrl.trim();
  const reason = data.reason.trim();
  const rating = normalizeOptionalRating(data.rating);
  const reviewCount = normalizeOptionalReviewCount(data.reviewCount);

  if (nickname.length < 2 || nickname.length > 20) errors.nickname = "请填写 2-20 字的昵称";
  if (name.length < 2 || name.length > 60) errors.name = "请填写 2-60 字的店名";
  if (!isValidMapsUrl(mapsUrl)) errors.mapsUrl = "请填写有效的 Google Maps 链接";
  if (data.rating.trim() && rating === null) errors.rating = "评分请填写 0-5 之间的数字";
  if (data.reviewCount.trim() && reviewCount === null) errors.reviewCount = "评论数请填写非负整数";
  const photoError = validatePhotoFile(photoFile);
  if (photoError) errors.photoFile = photoError;
  if (!data.city) errors.city = "请选择城市";
  if (!data.area) errors.area = "请选择区域";
  if (!data.cuisine) errors.cuisine = "请选择菜系";
  if (reason.length < 10 || reason.length > 300) errors.reason = "请写 10-300 字的推荐理由";

  return errors;
}

function isValidMapsUrl(url) {
  try {
    const parsed = new URL(url);
    return parsed.hostname.includes("google.") || parsed.hostname === "maps.app.goo.gl";
  } catch {
    return false;
  }
}

function hasPhotoFile(file) {
  return file && typeof file.size === "number" && file.size > 0;
}

function validatePhotoFile(file) {
  if (!hasPhotoFile(file)) return "";
  if (!ALLOWED_PHOTO_TYPES.includes(file.type)) return "请上传 JPG、PNG 或 WebP 图片";
  if (file.size > MAX_PHOTO_SIZE) return "图片不能超过 3MB";
  return "";
}

function isValidImageUrl(url) {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:";
  } catch {
    return false;
  }
}

function isGoogleMapsPageUrl(url) {
  try {
    const parsed = new URL(url);
    return parsed.hostname === "maps.app.goo.gl" || parsed.hostname.includes("google.") && parsed.pathname.includes("/maps");
  } catch {
    return false;
  }
}

function isLikelyEmbeddableImageUrl(url) {
  if (!url || !isValidImageUrl(url) || isGoogleMapsPageUrl(url)) return false;
  return true;
}

function normalizeOptionalRating(value) {
  if (!value.trim()) return null;
  const rating = Number(value);
  if (!Number.isFinite(rating) || rating < 0 || rating > 5) return null;
  return Math.round(rating * 10) / 10;
}

function normalizeOptionalReviewCount(value) {
  if (!value.trim()) return null;
  const count = Number(value);
  if (!Number.isInteger(count) || count < 0 || count > 999999) return null;
  return count;
}

function formatRating(value) {
  const rating = Number(value);
  if (!Number.isFinite(rating)) return value;
  return rating.toFixed(1);
}

function formatReviewCount(value) {
  const count = Number(value);
  if (!Number.isFinite(count)) return value;
  return new Intl.NumberFormat("zh-CN").format(count);
}

function clearErrors() {
  document.querySelectorAll(".field-error").forEach((item) => {
    item.textContent = "";
  });
}

function showErrors(errors) {
  Object.entries(errors).forEach(([field, message]) => {
    const target = document.querySelector(`[data-error-for="${field}"]`);
    if (target) target.textContent = message;
  });
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escapeAttribute(value) {
  return escapeHtml(value).replaceAll("`", "&#096;");
}

window.addEventListener("hashchange", renderRoute);
renderRoute();
