/** JSON backup export, validation, and import from files or URLs. */
function exportConfig() {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({ profile, categories, sites }, null, 2));
  const a = document.createElement("a");
  a.setAttribute("href", dataStr);
  a.setAttribute("download", "my-homepage-config.json");
  document.body.appendChild(a);
  a.click();
  a.remove();
}

document.getElementById("export-config-btn").addEventListener("click", exportConfig);
document.getElementById("choose-import-file-btn").addEventListener("click", () => {
  document.getElementById("import-config").click();
});

function normalizeConfig(data) {
  const fail = () => {
    throw new Error(language === "en" ? "Invalid configuration format." : "配置格式不正确。");
  };
  if (!data || typeof data !== "object" || !data.profile ||
      typeof data.profile.title !== "string" || !data.profile.title.trim() ||
      typeof data.profile.bio !== "string" || !Array.isArray(data.sites)) fail();
  if (data.profile.browserTitle !== undefined &&
      (typeof data.profile.browserTitle !== "string" || data.profile.browserTitle.length > 200)) fail();

  const importedSites = data.sites.map(site => {
    if (!site || typeof site.title !== "string" || !site.title.trim() ||
        typeof site.url !== "string" || typeof site.desc !== "string" ||
        typeof site.category !== "string") fail();
    let url;
    try { url = new URL(site.url); } catch (_) { fail(); }
    if (!["http:", "https:"].includes(url.protocol)) fail();
    return {
      title: site.title.trim(),
      url: url.href,
      desc: site.desc,
      category: site.category,
      icon: site.icon === "custom" && validCustomIcon(site.customIcon)
        ? "custom"
        : (site.icon === "website" || Object.hasOwn(ICONS, site.icon) ? site.icon : "star"),
      ...(site.icon === "custom" && validCustomIcon(site.customIcon)
        ? { customIcon: site.customIcon }
        : {})
    };
  });

  if (data.categories !== undefined && (!Array.isArray(data.categories) ||
      data.categories.some(c => typeof c !== "string" || !c.trim()))) fail();
  const importedCategories = [...new Set([
    ...(data.categories || []),
    ...importedSites.map(site => site.category).filter(Boolean)
  ])];
  if (importedCategories.some(c => c.length > 40 ||
      ["all", "全部", "未分类", "All", "Uncategorized"].includes(c))) fail();

  return {
    profile: {
      title: data.profile.title.trim(),
      bio: data.profile.bio,
      browserTitle: (data.profile.browserTitle || "").trim(),
      favicon: data.profile.favicon === "custom" && validCustomIcon(data.profile.customFavicon)
        ? "custom"
        : (Object.hasOwn(ICONS, data.profile.favicon) ? data.profile.favicon : "star"),
      ...(data.profile.favicon === "custom" && validCustomIcon(data.profile.customFavicon)
        ? { customFavicon: data.profile.customFavicon }
        : {})
    },
    categories: importedCategories,
    sites: importedSites
  };
}

function importConfiguration(imported) {
  const message = language === "en"
    ? `Import ${imported.sites.length} websites and ${imported.categories.length} categories? This replaces the current configuration.`
    : `导入 ${imported.sites.length} 个站点和 ${imported.categories.length} 个分类？将替换当前配置。`;
  if (!confirm(message)) return;
  const changes = [
    ["doodle_profile_v1", imported.profile],
    ["doodle_categories_v1", imported.categories],
    ["doodle_sites_v1", imported.sites]
  ];
  const previous = changes.map(([key]) => [key, localStorage.getItem(key)]);
  try {
    changes.forEach(([key, value]) => localStorage.setItem(key, JSON.stringify(value)));
  } catch (error) {
    previous.forEach(([key, value]) => {
      try {
        if (value === null) localStorage.removeItem(key);
        else localStorage.setItem(key, value);
      } catch (_) {}
    });
    throw error;
  }
  profile = imported.profile;
  categories = imported.categories;
  sites = imported.sites;
  activeCategory = "all";
  searchQuery = "";
  document.getElementById("search-input").value = "";
  renderProfile();
  applyLanguage();
  alert(t("导入成功。"));
}

document.getElementById("import-config").addEventListener("change", async e => {
  const input = e.target;
  const file = input.files[0];
  if (!file) return;
  try {
    const imported = normalizeConfig(JSON.parse(await file.text()));
    importConfiguration(imported);
  } catch (error) {
    alert(t("导入失败：") + error.message);
  } finally {
    input.value = "";
  }
});

async function readConfigURL(value) {
  const url = new URL(value);
  if (!["https:", "http:"].includes(url.protocol)) throw new Error(t("只支持 HTTP 或 HTTPS 链接。"));
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);
  try {
    const response = await fetch(url.href, { signal: controller.signal, credentials: "omit" });
    if (!response.ok) throw new Error("HTTP " + response.status);
    const content = await response.text();
    return normalizeConfig(JSON.parse(content.replace(/^\uFEFF/, "")));
  } catch (error) {
    if (error.name === "AbortError") throw new Error(t("请求超时，请重试。"));
    if (error instanceof TypeError) throw new Error(t("无法读取链接，请检查地址、网络及跨域权限（CORS）。"));
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

document.querySelectorAll('input[name="import-method"]').forEach(input => {
  input.addEventListener("change", () => {
    document.getElementById("import-file-panel").hidden = input.value !== "file";
    document.getElementById("import-url-panel").hidden = input.value !== "url";
  });
});

let importingURL = false;
document.getElementById("import-url-form").addEventListener("submit", async e => {
  e.preventDefault();
  if (importingURL) return;
  importingURL = true;
  const button = document.getElementById("import-url-btn");
  button.disabled = true;
  button.textContent = t("导入中…");
  try {
    const config = await readConfigURL(document.getElementById("import-url").value.trim());
    importConfiguration(config);
  } catch (error) {
    alert(t("导入失败：") + error.message);
  } finally {
    importingURL = false;
    button.disabled = false;
    button.textContent = t("读取链接并导入");
  }
});
