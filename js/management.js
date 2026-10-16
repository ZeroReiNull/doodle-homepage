/**
 * Dialog navigation and handlers for categories, websites, profile, search,
 * language, theme, and reset actions.
 */
document.getElementById("category-form").addEventListener("submit", e => {
  e.preventDefault();
  const input = document.getElementById("new-category");
  const name = input.value.trim();
  if (!validCategory(name)) return;
  categories.push(name);
  input.value = "";
  saveCategories();
});

function renameCategory(i) {
  const old = categories[i];
  const name = document.getElementById("category-name-" + i).value.trim();
  if (!validCategory(name, old)) return;
  categories[i] = name;
  sites.forEach(s => { if (s.category === old) s.category = name; });
  if (activeCategory === old) activeCategory = name;
  saveCategories();
}

function deleteCategory(i) {
  const name = categories[i];
  const count = sites.filter(s => s.category === name).length;
  const message = language === "en"
    ? `Delete “${name}”?${count ? " " + count + " websites will move to Uncategorized. They will be kept." : ""}`
    : `删除“${name}”？${count ? count + " 个站点将移至未分类，站点不会删除。" : ""}`;
  if (!confirm(message)) return;
  categories.splice(i, 1);
  sites.forEach(s => { if (s.category === name) s.category = ""; });
  if (activeCategory === name) activeCategory = "all";
  saveCategories();
}

function openDialog(id) {
  const alreadyOpen = document.querySelector(".modal-backdrop.open");
  const modal = document.getElementById(id);
  modal.classList.toggle("dialog-enter", !alreadyOpen);
  document.querySelectorAll(".modal-backdrop").forEach(m => {
    if (m !== modal) m.classList.remove("open", "dialog-enter");
  });
  modal.classList.add("open");
  document.body.classList.add("modal-open");
  const panel = modal.querySelector(".modal-content");
  panel.setAttribute("role", "dialog");
  panel.setAttribute("aria-modal", "true");
  panel.setAttribute("tabindex", "-1");
  panel.focus();
}

function openManagement() {
  renderManagement();
  showManagementPage(managementPage, false);
  openDialog("manage-modal");
}

function closeManagement() {
  document.getElementById("manage-modal").classList.remove("open");
  document.body.classList.remove("modal-open");
  document.getElementById("manage-btn").focus();
}

document.getElementById("manage-btn").addEventListener("click", () => {
  managementPage = "home";
  openManagement();
});

document.getElementById("close-management-btn").addEventListener("click", closeManagement);

document.getElementById("manage-modal").addEventListener("click", e => {
  const button = e.target.closest("[data-management-page]");
  if (button) showManagementPage(button.dataset.managementPage);
});

document.getElementById("category-manager").addEventListener("click", e => {
  const button = e.target.closest("[data-category-action]");
  if (!button) return;
  const index = Number.parseInt(button.dataset.index, 10);
  if (button.dataset.categoryAction === "move") {
    moveCategory(index, Number.parseInt(button.dataset.direction, 10));
  } else if (button.dataset.categoryAction === "rename") {
    renameCategory(index);
  } else if (button.dataset.categoryAction === "delete") {
    deleteCategory(index);
  }
});

document.getElementById("site-manager").addEventListener("click", e => {
  const button = e.target.closest("[data-site-action]");
  if (!button) return;
  const index = Number.parseInt(button.dataset.index, 10);
  if (button.dataset.siteAction === "move") {
    moveSite(index, Number.parseInt(button.dataset.direction, 10));
  } else if (button.dataset.siteAction === "edit") {
    openEditSiteModal(index);
  }
});

document.querySelectorAll(".modal-backdrop").forEach(modal => {
  modal.addEventListener("click", e => {
    if (e.target !== modal) return;
    if (modal.id === "manage-modal") closeManagement();
    else if (modal.id === "icon-crop-modal") finishIconCrop(null);
    else openManagement();
  });
});

document.addEventListener("keydown", e => {
  const modal = document.querySelector(".modal-backdrop.open");
  if (!modal) return;
  if (e.key === "Escape") {
    if (modal.id === "manage-modal") {
      if (managementPage === "home") closeManagement();
      else showManagementPage("home");
    } else if (modal.id === "icon-crop-modal") {
      finishIconCrop(null);
    } else {
      openManagement();
    }
  }
  if (e.key === "Tab") {
    const items = [...modal.querySelectorAll("button, input, select, textarea, [href]")]
      .filter(el => !el.disabled && el.type !== "hidden" && el.getClientRects().length);
    const first = items[0];
    const last = items[items.length - 1];
    const panel = modal.querySelector(".modal-content");
    if (e.shiftKey && (document.activeElement === first || document.activeElement === panel)) {
      e.preventDefault();
      last?.focus();
    } else if (!e.shiftKey && (document.activeElement === last || document.activeElement === panel)) {
      e.preventDefault();
      first?.focus();
    }
  }
});

function applyLanguage() {
  document.documentElement.lang = language;
  updateBrowserTitle();
  document.querySelectorAll("[data-i18n]").forEach(el => {
    el.textContent = t(el.dataset.i18n);
  });
  for (const attr of ["placeholder", "aria-label"]) {
    document.querySelectorAll("[data-i18n-" + attr + "]").forEach(el => {
      el.setAttribute(attr, t(el.getAttribute("data-i18n-" + attr)));
    });
  }
  document.getElementById("language-select").value = language;
  renderIconPicker();
  renderFaviconPicker(document.querySelector('input[name="favicon-icon"]:checked')?.value);

  const drafts = new Map(categories.map((c, i) => [c, document.getElementById("category-name-" + i)?.value]));
  renderCategories();
  renderSites();
  renderManagement();
  categories.forEach((c, i) => {
    if (drafts.get(c) !== undefined) document.getElementById("category-name-" + i).value = drafts.get(c);
  });
  showManagementPage(managementPage, false);
  applyTheme();
}

document.getElementById("language-select").addEventListener("change", e => {
  language = e.target.value === "en" ? "en" : "zh-CN";
  try {
    localStorage.setItem("doodle_language_v1", language);
  } catch (_) {}
  applyLanguage();
});

document.getElementById("category-filters").addEventListener("click", e => {
  const btn = e.target.closest("button[data-cat]");
  if (!btn) return;
  document.querySelectorAll("#category-filters .sketch-btn").forEach(b => b.classList.remove("active"));
  btn.classList.add("active");
  activeCategory = btn.dataset.cat;
  renderSites();
});

const searchInput = document.getElementById("search-input");
let composingSearch = false;
function updateSearch() {
  searchQuery = searchInput.value;
  renderSites();
}
searchInput.addEventListener("compositionstart", () => { composingSearch = true; });
searchInput.addEventListener("compositionend", () => {
  composingSearch = false;
  updateSearch();
});
searchInput.addEventListener("input", () => {
  if (!composingSearch) updateSearch();
});
document.getElementById("clear-search-btn").addEventListener("click", () => {
  searchInput.value = "";
  updateSearch();
  searchInput.focus();
});
searchInput.addEventListener("keydown", e => {
  if (e.key === "Escape" && !e.isComposing && searchInput.value) {
    e.preventDefault();
    searchInput.value = "";
    updateSearch();
  }
});

function resetSearchFilters() {
  activeCategory = "all";
  searchInput.value = "";
  searchQuery = "";
  renderCategories();
  renderSites();
  searchInput.focus();
}

document.getElementById("sites-grid").addEventListener("click", e => {
  if (e.target.closest('[data-action="reset-search"]')) resetSearchFilters();
});

function saveThemeChoice() {
  try {
    localStorage.setItem("doodle_theme_v1", themePreference);
  } catch (_) {}
  applyTheme();
  redrawCanvas();
}

document.getElementById("manual-theme-btn").addEventListener("click", () => {
  if (themePreference === "system") return;
  themePreference = themePreference === "dark" ? "light" : "dark";
  saveThemeChoice();
});

document.getElementById("follow-system").addEventListener("change", e => {
  themePreference = e.target.checked ? "system" : (systemTheme.matches ? "dark" : "light");
  saveThemeChoice();
});

document.getElementById("reset-settings-btn").addEventListener("click", () => {
  const message = language === "en"
    ? "Restore defaults? Your websites, categories and settings will be cleared. Export a backup first if you want to keep them."
    : "恢复默认设置？当前站点、分类和设置将被清空。需要保留的话，请先导出备份。";
  if (!confirm(message)) return;
  const keys = ["doodle_sites_v1", "doodle_categories_v1", "doodle_profile_v1", "doodle_theme_v1", "doodle_language_v1"];
  const previous = keys.map(key => [key, localStorage.getItem(key)]);
  try {
    keys.forEach(key => localStorage.removeItem(key));
  } catch (_) {
    previous.forEach(([key, value]) => {
      try { if (value !== null) localStorage.setItem(key, value); } catch (_) {}
    });
    alert(language === "en" ? "Unable to reset settings." : "无法清空设置，请重试。");
    return;
  }
  window.location.reload();
});

// Add / Edit Site Modal
document.getElementById("add-site-btn").addEventListener("click", () => {
  document.getElementById("site-index").value = "-1";
  document.getElementById("site-title").value = "";
  document.getElementById("site-url").value = "https://";
  document.getElementById("site-cat").value = categories[0] || "";
  pendingCustomSiteIcon = "";
  renderIconPicker("website");
  document.getElementById("custom-site-icon-file").value = "";
  document.getElementById("delete-site-btn").hidden = true;
  openDialog("site-modal");
});

function openEditSiteModal(idx) {
  managementPage = "sites";
  const s = sites[idx];
  document.getElementById("site-index").value = String(idx);
  document.getElementById("site-title").value = s.title;
  document.getElementById("site-url").value = s.url;
  document.getElementById("site-cat").value = s.category;
  pendingCustomSiteIcon = validCustomIcon(s.customIcon) ? s.customIcon : "";
  renderIconPicker(s.icon === "website" || s.icon === "custom" || Object.hasOwn(ICONS, s.icon) ? s.icon : "star");
  document.getElementById("custom-site-icon-file").value = "";
  document.getElementById("delete-site-btn").hidden = false;
  openDialog("site-modal");
}

const closeSiteModal = openManagement;

document.getElementById("cancel-site-btn").addEventListener("click", closeSiteModal);

document.getElementById("custom-site-icon-file").addEventListener("change", async e => {
  const input = e.target;
  const file = input.files[0];
  if (!file) return;
  try {
    const source = await readCustomIcon(file);
    input.value = "";
    const cropped = await openIconCropper(source, "site-modal");
    if (!cropped) return;
    pendingCustomSiteIcon = cropped;
    renderIconPicker("custom");
  } catch (error) {
    input.value = "";
    alert(error.message);
  }
});

document.getElementById("site-form").addEventListener("submit", e => {
  e.preventDefault();
  const idx = parseInt(document.getElementById("site-index").value, 10);
  const selectedIcon = document.querySelector('input[name="site-icon"]:checked')?.value || "star";
  if (selectedIcon === "custom" && !validCustomIcon(pendingCustomSiteIcon)) {
    document.getElementById("custom-site-icon-file").click();
    return;
  }
  const newSite = {
    title: document.getElementById("site-title").value.trim(),
    url: document.getElementById("site-url").value.trim(),
    category: document.getElementById("site-cat").value,
    desc: idx >= 0 ? (sites[idx].desc || "") : "",
    icon: selectedIcon,
    ...(selectedIcon === "custom" && validCustomIcon(pendingCustomSiteIcon)
      ? { customIcon: pendingCustomSiteIcon }
      : {})
  };
  if (idx >= 0) sites[idx] = newSite;
  else sites.push(newSite);
  localStorage.setItem("doodle_sites_v1", JSON.stringify(sites));
  renderSites();
  closeSiteModal();
});

document.getElementById("delete-site-btn").addEventListener("click", () => {
  const idx = parseInt(document.getElementById("site-index").value, 10);
  if (idx >= 0) {
    sites.splice(idx, 1);
    localStorage.setItem("doodle_sites_v1", JSON.stringify(sites));
    renderSites();
    closeSiteModal();
  }
});

// Profile Modal
function openEditProfileModal() {
  managementPage = "settings";
  pendingCustomFavicon = validCustomIcon(profile.customFavicon) ? profile.customFavicon : "";
  renderFaviconPicker();
  document.getElementById("custom-favicon-file").value = "";
  document.getElementById("input-browser-title").value = profile.browserTitle || "";
  document.getElementById("input-owner-title").value = profile.title;
  document.getElementById("input-owner-bio").value = profile.bio;
  openDialog("profile-modal");
}

const closeProfileModal = openManagement;

document.getElementById("edit-profile-btn").addEventListener("click", openEditProfileModal);
document.getElementById("cancel-profile-btn").addEventListener("click", closeProfileModal);

document.getElementById("custom-favicon-file").addEventListener("change", async e => {
  const input = e.target;
  const file = input.files[0];
  if (!file) return;
  try {
    const source = await readCustomIcon(file);
    input.value = "";
    const cropped = await openIconCropper(source, "profile-modal");
    if (!cropped) return;
    pendingCustomFavicon = cropped;
    renderFaviconPicker("custom");
  } catch (error) {
    input.value = "";
    alert(error.message);
  }
});

document.getElementById("profile-form").addEventListener("submit", e => {
  e.preventDefault();
  profile.favicon = document.querySelector('input[name="favicon-icon"]:checked')?.value || "star";
  if (profile.favicon === "custom" && !validCustomIcon(pendingCustomFavicon)) {
    document.getElementById("custom-favicon-file").click();
    return;
  }
  if (profile.favicon === "custom" && validCustomIcon(pendingCustomFavicon)) {
    profile.customFavicon = pendingCustomFavicon;
  } else {
    profile.favicon = Object.hasOwn(ICONS, profile.favicon) ? profile.favicon : "star";
    delete profile.customFavicon;
  }
  profile.browserTitle = document.getElementById("input-browser-title").value.trim();
  profile.title = document.getElementById("input-owner-title").value.trim();
  profile.bio = document.getElementById("input-owner-bio").value.trim();
  localStorage.setItem("doodle_profile_v1", JSON.stringify(profile));
  renderProfile();
  closeProfileModal();
});
