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
      wantCount: 0,
      recommendCount: 1,
      reasons: [{ nickname: item.nickname, text: item.reason }],
    }));

  if (!isCloudEnabled()) return [...seedRestaurants, ...acceptedSubmissions];

  try {
    const cloudRestaurants = await fetchCloudRestaurants();
    lastCloudError = "";
    return [...seedRestaurants, ...cloudRestaurants];
  } catch (error) {
    lastCloudError = "云端数据暂时连接失败，当前只显示示例数据。";
    console.error(error);
    return seedRestaurants;
  }
}

async function fetchCloudRestaurants() {
  const rows = await cloudRequest(
    `?select=id,nickname,name,maps_url,city,area,cuisine,reason,want_count,created_at&status=eq.published&city=eq.${encodeURIComponent(PRIMARY_CITY)}&order=created_at.desc`,
  );
  return rows.map((item) => ({
    id: `cloud-${item.id}`,
    name: item.name,
    city: item.city,
    area: item.area,
    cuisine: item.cuisine,
    googleMapsUrl: item.maps_url,
    wantCount: item.want_count || 0,
    recommendCount: 1,
    reasons: [{ nickname: item.nickname, text: item.reason }],
  }));
}

async function saveCloudSubmission(data) {
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

  list.innerHTML = restaurants
    .map((restaurant) => {
      const firstReason = restaurant.reasons[0]?.text || "这家店还没有展示推荐理由。";
      return `
        <a class="restaurant-card" href="#/restaurant/${restaurant.id}">
          <div class="card-top">
            <div class="tag-row">
              <span class="tag">${escapeHtml(restaurant.area)}</span>
              <span class="tag">${escapeHtml(restaurant.city)}</span>
              <span class="tag">${escapeHtml(restaurant.cuisine)}</span>
              <span class="tag hot">${restaurant.recommendCount} 人推荐</span>
            </div>
            <h3>${escapeHtml(restaurant.name)}</h3>
            <p class="reason-preview">${escapeHtml(firstReason)}</p>
          </div>
          <div class="card-meta">
            <span>${restaurant.wantCount} 人想去</span>
            <strong>查看详情</strong>
          </div>
        </a>
      `;
    })
    .join("");
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

  detail.innerHTML = `
    <div class="detail-card">
      <div class="detail-main">
        <div>
          <div class="tag-row">
            <span class="tag">${escapeHtml(restaurant.city)}</span>
            <span class="tag">${escapeHtml(restaurant.area)}</span>
            <span class="tag">${escapeHtml(restaurant.cuisine)}</span>
            <span class="tag hot">${restaurant.recommendCount} 人推荐</span>
          </div>
          <h1>${escapeHtml(restaurant.name)}</h1>
          <p class="intro">这里展示的是中文推荐线索。评分、营业时间和导航请以 Google Maps 为准。</p>
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

    const data = Object.fromEntries(new FormData(form).entries());
    const errors = validateSubmission(data);

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
      status: "pending",
      createdAt: new Date().toISOString(),
    };

    if (isCloudEnabled()) {
      result.textContent = "正在提交...";
      form.querySelector("button[type='submit']").disabled = true;
      try {
        await saveCloudSubmission(data);
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

function validateSubmission(data) {
  const errors = {};
  const nickname = data.nickname.trim();
  const name = data.name.trim();
  const mapsUrl = data.mapsUrl.trim();
  const reason = data.reason.trim();

  if (nickname.length < 2 || nickname.length > 20) errors.nickname = "请填写 2-20 字的昵称";
  if (name.length < 2 || name.length > 60) errors.name = "请填写 2-60 字的店名";
  if (!isValidMapsUrl(mapsUrl)) errors.mapsUrl = "请填写有效的 Google Maps 链接";
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
