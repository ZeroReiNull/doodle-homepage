/**
 * Persistent application state and all homepage/manager rendering functions.
 * Provides the shared sites, profile, categories, search, and render helpers.
 */
let sites = JSON.parse(localStorage.getItem("doodle_sites_v1")) || DEFAULT_SITES;
let profile = JSON.parse(localStorage.getItem("doodle_profile_v1")) || {
  title: "My Sketchbook Portal",
  bio: "A collection of websites I build and experiment with. Click a card to visit a website, or use the manager in the bottom-right corner to organize websites and categories."
};

function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, c => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[c]));
}

let categories;
try {
  categories = JSON.parse(localStorage.getItem("doodle_categories_v1"));
} catch (_) {}
if (!Array.isArray(categories)) {
  categories = ["Tools & Services", "Personal Projects", "Blog & Notes", "Experiments"];
}
categories = [...new Set([...categories, ...sites.map(s => s.category)].filter(c => typeof c === "string" && c && c !== "all"))];

let activeCategory = "all";
let searchQuery = "";

const siteMotionIDs = new WeakMap();
let nextMotionID = 0;
function siteMotionKey(site) {
  if (!siteMotionIDs.has(site)) siteMotionIDs.set(site, "site-" + (++nextMotionID));
  return siteMotionIDs.get(site);
}

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const activeMotions = new Set();
reduceMotion.addEventListener("change", () => {
  if (reduceMotion.matches) activeMotions.forEach(animation => animation.cancel());
});

function capturePositions(container) {
  const positions = new Map();
  container.querySelectorAll("[data-motion-key]").forEach(el => {
    const rect = el.getBoundingClientRect();
    if (rect.width && rect.height) positions.set(el.dataset.motionKey, rect);
  });
  return positions;
}

function animatePositions(container, positions) {
  if (reduceMotion.matches) return;
  container.querySelectorAll("[data-motion-key]").forEach(el => {
    if (typeof el.animate !== "function") return;
    const current = el.getBoundingClientRect();
    if (!current.width || !current.height) return;
    const previous = positions.get(el.dataset.motionKey);
    const resting = getComputedStyle(el).transform;
    const base = resting === "none" ? "" : resting;
    let frames;
    if (previous) {
      const x = previous.left - current.left;
      const y = previous.top - current.top;
      if (Math.abs(x) < 0.5 && Math.abs(y) < 0.5) return;
      frames = [
        { transform: `translate(${x}px, ${y}px) ${base}`, opacity: 0.85 },
        { transform: `translate(0, 0) ${base}`, opacity: 1 }
      ];
    } else {
      frames = [
        { transform: `translateY(8px) ${base}`, opacity: 0 },
        { transform: `translateY(0) ${base}`, opacity: 1 }
      ];
    }
    const animation = el.animate(frames, {
      duration: previous ? 280 : 180,
      easing: "cubic-bezier(0.22, 1, 0.36, 1)"
    });
    activeMotions.add(animation);
    const release = () => activeMotions.delete(animation);
    animation.onfinish = release;
    animation.oncancel = release;
  });
}

function updateFavicon() {
  if (profile.favicon === "custom" && validCustomIcon(profile.customFavicon)) {
    document.getElementById("site-favicon").setAttribute("href", profile.customFavicon);
    return;
  }
  const key = Object.hasOwn(ICONS, profile.favicon) ? profile.favicon : "star";
  const svg = ICONS[key]
    .replace("<svg ", '<svg xmlns="http://www.w3.org/2000/svg" ')
    .replace(/width="22" height="22"/, 'width="32" height="32"')
    .replace(/currentColor/g, "#444444");
  document.getElementById("site-favicon").setAttribute("href", "data:image/svg+xml," + encodeURIComponent(svg));
}

function updateBrowserTitle() {
  document.title = profile.browserTitle?.trim() ||
    (language === "en" ? "My Doodle Space | Personal Portal" : "My Doodle Space | 个人导航主页");
}

function renderFooter() {
  document.getElementById("site-footer").innerHTML = `<p class="footer-links">
    <span>© ${new Date().getFullYear()} ZeroReiNull</span>
    <span aria-hidden="true">·</span><a href="https://github.com/ZeroReiNull/doodle-homepage" target="_blank" rel="noopener noreferrer">GitHub ↗</a>
    <span aria-hidden="true">·</span><a href="https://opensource.org/license/mit" target="_blank" rel="noopener noreferrer">MIT License ↗</a>
  </p>`;
}

function renderProfile() {
  renderFooter();
  updateFavicon();
  updateBrowserTitle();
  document.getElementById("owner-title").textContent = profile.title;
  document.getElementById("owner-bio").textContent = profile.bio;
}

function normalizeSearch(value) {
  return String(value ?? "")
    .normalize("NFKC")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

function matchesSearch(site, tokens) {
  let decodedURL = site.url || "";
  try {
    decodedURL = decodeURIComponent(decodedURL);
  } catch (_) {}
  const fields = [site.title, site.desc, site.category || t("未分类"), site.url, decodedURL].map(normalizeSearch);
  return tokens.every(token => fields.some(field => field.includes(token)));
}

function paperDetails(site) {
  let seed = 2166136261;
  for (const char of site.url + "|" + site.title) {
    seed = Math.imul(seed ^ char.charCodeAt(0), 16777619) >>> 0;
  }
  function random() {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 4294967296;
  }
  const angle = (random() * 2 - 1).toFixed(2);
  const trim = 6 + random() * 16;
  const inset = random() * trim;
  const drop = (random() * 27).toFixed(1);
  const height = (175 + random() * 38).toFixed(1);
  const tape = random() < 0.72;
  const left = (28 + random() * 43).toFixed(1);
  const width = (58 + random() * 27).toFixed(1);
  const tapeAngle = (random() * 17 - 8.5).toFixed(1);
  return {
    tape,
    style: `--paper-angle:${angle}deg;--paper-counter-angle:${-Number(angle)}deg;--paper-mobile-angle:${Number(angle) * 0.3}deg;--paper-mobile-counter-angle:${Number(angle) * -0.3}deg;--paper-trim:${trim.toFixed(1)}px;--paper-inset:${inset.toFixed(1)}px;--paper-drop:${drop}px;--paper-height:${height}px;--tape-left:${left}%;--tape-width:${width}px;--tape-angle:${tapeAngle}deg`
  };
}

function websiteIconMarkup(site) {
  if (site.icon === "custom" && validCustomIcon(site.customIcon)) {
    return `<img class="custom-icon-preview" src="${site.customIcon}" alt="" />`;
  }
  if (site.icon !== "website") return ICONS[site.icon] || ICONS.star;
  let favicons = [];
  try {
    const url = new URL(site.url);
    if (["http:", "https:"].includes(url.protocol)) {
      favicons = ["/favicon.ico", "/favicon.png", "/favicon.svg", "/apple-touch-icon.png"]
        .map(path => new URL(path, url.origin).href);
    }
  } catch (_) {}
  if (!favicons.length) return ICONS.globe;
  return `<img class="website-favicon" src="${escapeHTML(favicons[0])}" data-fallback-srcs="${escapeHTML(favicons.slice(1).join("|"))}" alt="" loading="lazy" referrerpolicy="no-referrer" />${ICONS.globe}`;
}

function tryNextWebsiteIcon(image) {
  const sources = (image.dataset.fallbackSrcs || "").split("|").filter(Boolean);
  const next = sources.shift();
  image.dataset.fallbackSrcs = sources.join("|");
  if (next) image.src = next;
  else image.hidden = true;
}

document.addEventListener("error", event => {
  if (event.target.matches?.(".website-favicon")) tryNextWebsiteIcon(event.target);
}, true);

function renderSites() {
  const grid = document.getElementById("sites-grid");
  const positions = capturePositions(grid);
  document.getElementById("site-count-label").textContent = language === "en"
    ? `${sites.length} websites saved`
    : `已收录 ${sites.length} 个站点`;

  const tokens = normalizeSearch(searchQuery).split(" ").filter(Boolean);
  const filtered = sites
    .map((item, idx) => ({ ...item, idx, motionKey: siteMotionKey(item) }))
    .filter(item => (activeCategory === "all" || item.category === activeCategory) && matchesSearch(item, tokens));

  document.getElementById("clear-search-btn").hidden = !searchQuery;
  const status = document.getElementById("search-status");
  status.hidden = !tokens.length && activeCategory === "all";
  status.textContent = language === "en"
    ? `${filtered.length} of ${sites.length} websites`
    : `找到 ${filtered.length} / ${sites.length} 个站点`;

  if (!filtered.length) {
    grid.innerHTML = `<div class="search-empty sketch-box">
      <strong>${t("没有找到匹配的站点")}</strong>
      <p class="manage-note">${t("试试更少的关键词，或清除筛选。")}</p>
      <button class="sketch-btn" type="button" data-action="reset-search">${t("清除搜索和分类筛选")}</button>
    </div>`;
  } else {
    grid.innerHTML = filtered.map((site, i) => {
      const boxClass = i % 2 === 0 ? "sketch-box" : "sketch-box-alt";
      const iconSvg = websiteIconMarkup(site);
      const paper = paperDetails(site);
      return `
        <a data-motion-key="${site.motionKey}" style="${paper.style}" class="site-card ${boxClass}" href="${escapeHTML(site.url)}" target="_blank" rel="noopener noreferrer">
          ${paper.tape ? '<span class="paper-tape" aria-hidden="true"></span>' : ""}
          <div>
            <div class="card-top">
              <div class="card-icon">${iconSvg}</div>
              <div class="card-meta">
                <span class="card-tag">${escapeHTML(site.category || t("未分类"))}</span>
              </div>
            </div>
            <h3 class="card-title">${escapeHTML(site.title)}</h3>
          </div>
          <div class="card-footer">
            <span class="card-url">${escapeHTML(site.url)}</span>
            <span>${t("访问 ↗")}</span>
          </div>
        </a>
      `;
    }).join("");
  }
  animatePositions(grid, positions);
}

function renderCategories() {
  const filters = [
    { value: "all", label: t("全部") },
    ...categories.map(c => ({ value: c, label: c }))
  ];
  if (sites.some(s => !s.category)) filters.push({ value: "", label: t("未分类") });

  document.getElementById("category-filters").innerHTML = filters.map(c =>
    `<button class="sketch-btn ${activeCategory === c.value ? "active" : ""}" data-motion-key="category-${escapeHTML(c.value)}" data-cat="${escapeHTML(c.value)}" type="button">${escapeHTML(c.label)}</button>`
  ).join("");

  const select = document.getElementById("site-cat");
  const selected = select.value;
  select.innerHTML = `<option value="">${t("未分类")}</option>` + categories.map(c =>
    `<option value="${escapeHTML(c)}">${escapeHTML(c)}</option>`
  ).join("");
  select.value = categories.includes(selected) ? selected : "";
}

function renderManagement() {
  const categoryContainer = document.getElementById("category-manager");
  const siteContainer = document.getElementById("site-manager");
  const categoryPositions = capturePositions(categoryContainer);
  const sitePositions = capturePositions(siteContainer);

  categoryContainer.innerHTML = categories.map((c, i) =>
    `<div class="manage-row" data-motion-key="category-${escapeHTML(c)}">
      <div class="form-group form-group--flush category-name"><input id="category-name-${i}" value="${escapeHTML(c)}" aria-label="${t("分类名称")}" maxlength="40" /></div>
      <div class="sort-actions">
        <button class="sketch-btn" type="button" data-category-action="move" data-index="${i}" data-direction="-1" aria-label="${t("上移分类")}" ${i === 0 ? "disabled" : ""}>↑</button>
        <button class="sketch-btn" type="button" data-category-action="move" data-index="${i}" data-direction="1" aria-label="${t("下移分类")}" ${i === categories.length - 1 ? "disabled" : ""}>↓</button>
      </div>
      <button class="sketch-btn" type="button" data-category-action="rename" data-index="${i}">${t("保存")}</button>
      <button class="sketch-btn" type="button" data-category-action="delete" data-index="${i}">${t("删除")}</button>
    </div>`
  ).join("");

  siteContainer.innerHTML = sites.map((site, i) =>
    `<div class="manage-row" data-motion-key="${siteMotionKey(site)}">
      <span class="row-name">${escapeHTML(site.title)} <small class="manager-tag">${escapeHTML(site.category || t("未分类"))}</small></span>
      <div class="sort-actions">
        <button class="sketch-btn" type="button" data-site-action="move" data-index="${i}" data-direction="-1" aria-label="${t("上移网页")}" ${i === 0 ? "disabled" : ""}>↑</button>
        <button class="sketch-btn" type="button" data-site-action="move" data-index="${i}" data-direction="1" aria-label="${t("下移网页")}" ${i === sites.length - 1 ? "disabled" : ""}>↓</button>
      </div>
      <button class="sketch-btn" type="button" data-site-action="edit" data-index="${i}">${t("✎ 编辑")}</button>
    </div>`
  ).join("") || `<p class="manage-note">${t("还没有站点，点击上方“添加站点”。")}</p>`;

  animatePositions(categoryContainer, categoryPositions);
  animatePositions(siteContainer, sitePositions);
}

function moveItem(items, index, direction) {
  const target = index + direction;
  if (!Number.isInteger(index) || ![-1, 1].includes(direction) ||
      index < 0 || target < 0 || index >= items.length || target >= items.length) return false;
  [items[index], items[target]] = [items[target], items[index]];
  return true;
}

function moveCategory(index, direction) {
  const drafts = new Map(categories.map((c, i) => [c, document.getElementById("category-name-" + i).value]));
  if (!moveItem(categories, index, direction)) return;
  saveCategories();
  categories.forEach((c, i) => {
    document.getElementById("category-name-" + i).value = drafts.get(c);
  });
  document.querySelectorAll("#category-manager .manage-row")[index + direction]
    ?.querySelector(direction === -1 ? `[aria-label="${t("上移分类")}"]` : `[aria-label="${t("下移分类")}"]`)?.focus();
}

function moveSite(index, direction) {
  if (!moveItem(sites, index, direction)) return;
  localStorage.setItem("doodle_sites_v1", JSON.stringify(sites));
  renderSites();
  renderManagement();
  document.querySelectorAll("#site-manager .manage-row")[index + direction]
    ?.querySelector(direction === -1 ? `[aria-label="${t("上移网页")}"]` : `[aria-label="${t("下移网页")}"]`)?.focus();
}

let managementPage = "home";
function showManagementPage(page, focus = true) {
  const titles = {
    home: "⚙ 主页管理",
    sites: "站点管理",
    categories: "分类管理",
    settings: "主页设置",
    backup: "配置备份"
  };
  if (!Object.hasOwn(titles, page)) return;
  managementPage = page;
  Object.keys(titles).forEach(key => {
    document.getElementById("manage-" + key).hidden = key !== page;
  });
  document.getElementById("manage-back").hidden = page === "home";
  document.getElementById("manage-title").textContent = t(titles[page]);
  if (focus) document.getElementById("manage-modal").querySelector(".modal-content").focus();
}

function saveCategories() {
  localStorage.setItem("doodle_categories_v1", JSON.stringify(categories));
  localStorage.setItem("doodle_sites_v1", JSON.stringify(sites));
  renderCategories();
  renderSites();
  renderManagement();
}

function validCategory(name, previous) {
  if (!name || name.length > 40 || ["all", "全部", "未分类", "All", "Uncategorized"].includes(name)) {
    alert(t("请输入 1–40 个字符的分类名称，不能使用“全部”或“未分类”。"));
    return false;
  }
  if (name !== previous && categories.includes(name)) {
    alert(t("这个分类已经存在。"));
    return false;
  }
  return true;
}
