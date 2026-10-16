/**
 * Language and theme preferences loaded before the page renders.
 * Provides: language, t(), systemTheme, themePreference, applyTheme().
 */
let language = "en";
try {
  if (localStorage.getItem("doodle_language_v1") === "zh-CN") language = "zh-CN";
} catch (_) {}

const EN = {
  "⚙ 管理": "⚙ Manage",
  "⚙ 主页管理": "⚙ Homepage manager",
  "关闭": "Close",
  "← 返回菜单": "← Back to menu",
  "站点管理": "Websites",
  "分类管理": "Categories",
  "主页设置": "Page settings",
  "配置备份": "Backup",
  "添加、编辑与排序 →": "Add, edit & reorder →",
  "添加、修改与排序 →": "Add, rename & reorder →",
  "标题、简介与主题 →": "Title, bio & theme →",
  "导出配置 →": "Export configuration →",
  "＋ 添加站点": "＋ Add website",
  "＋ 添加": "＋ Add",
  "✎ 标题、图标与简介": "✎ Title, icon & bio",
  "⇩ 导出配置 JSON": "⇩ Export configuration JSON",
  "使用 ↑ ↓ 调整站点顺序，首页和分类筛选会按此顺序显示。": "Use ↑ ↓ to reorder websites. The homepage and category filters follow this order.",
  "使用 ↑ ↓ 排列标签。重命名会同步更新站点；删除分类后，站点归入“未分类”。": "Use ↑ ↓ to reorder categories. Renaming updates websites; deleting moves them to Uncategorized.",
  "新分类名称": "New category name",
  "分类名称": "Category name",
  "✎ 添加或编辑站点卡片": "✎ Add or edit a website",
  "站点名称": "Website name",
  "站点地址 (URL)": "Website address (URL)",
  "分类标签": "Category",
  "一句话简介": "Short description",
  "例如：我的个人博客 / 家庭 NAS 面板": "e.g. My blog / Home NAS dashboard",
  "简单描述这个站点的功能或用途...": "Briefly describe this website...",
  "删除站点": "Delete website",
  "取消": "Cancel",
  "保存站点": "Save website",
  "保存设置": "Save settings",
  "✎ 修改标题、图标与简介": "✎ Edit title, icon & bio",
  "主页主标题": "Homepage title",
  "个人简介 / 欢迎语": "Bio / welcome message",
  "✎ 随手涂鸦板 (在下方空白处画两笔)": "✎ Doodle pad (draw something below)",
  "擦除重画": "Clear drawing",
  "搜索名称、简介、分类或网址…": "Search title, description, category or URL…",
  "全部": "All",
  "未分类": "Uncategorized",
  "访问 ↗": "Visit ↗",
  "保存": "Save",
  "删除": "Delete",
  "✎ 编辑": "✎ Edit",
  "上移分类": "Move category up",
  "下移分类": "Move category down",
  "上移网页": "Move website up",
  "下移网页": "Move website down",
  "还没有站点，点击上方“添加站点”。": "No websites yet. Choose “Add website” above.",
  "请输入 1–40 个字符的分类名称，不能使用“全部”或“未分类”。": "Enter a category name of 1–40 characters. “All” and “Uncategorized” are reserved.",
  "这个分类已经存在。": "This category already exists.",
  "☀ 浅色模式": "☀ Light mode",
  "☾ 深色模式": "☾ Dark mode",
  "界面语言": "Interface language",
  "导入成功。": "Configuration imported.",
  "导入失败：": "Import failed: ",
  "配置 JSON 链接": "Configuration JSON URL",
  "导入中…": "Importing…",
  "填写可直接访问的 JSON 链接；跨站链接需要允许跨域访问（CORS）。": "Use a direct JSON URL. Cross-origin links must allow CORS.",
  "请求超时，请重试。": "Request timed out. Try again.",
  "无法读取链接，请检查地址、网络及跨域权限（CORS）。": "Unable to read the URL. Check the address, network and CORS permissions.",
  "只支持 HTTP 或 HTTPS 链接。": "Only HTTP and HTTPS URLs are supported.",
  "导入来源": "Import source",
  "导出备份": "Export backup",
  "恢复备份": "Restore backup",
  "本地文件": "Local file",
  "URL 链接": "URL link",
  "选择 JSON 文件": "Choose JSON file",
  "保存当前标题、简介、分类、站点及顺序，方便以后恢复。": "Save the current title, bio, categories, websites and order for later restoration.",
  "文件读取并校验后，会请你确认是否替换当前配置。": "After reading and validating the backup, you will be asked to confirm replacing the current configuration.",
  "读取链接并导入": "Read URL & import",
  "卡片图标": "Card icon",
  "星星": "Star",
  "齿轮": "Gear",
  "书本": "Book",
  "闪电": "Lightning",
  "地球": "Globe",
  "代码": "Code",
  "房屋": "Home",
  "爱心": "Heart",
  "网站图标": "Website icon",
  "自定义": "Custom",
  "上传自定义图标": "Upload custom icon",
  "图标文件不能超过 5 MB。": "Icon file must not exceed 5 MB.",
  "请选择 PNG、JPEG、WebP 或 ICO 图片。": "Choose a PNG, JPEG, WebP or ICO image.",
  "裁切图标": "Crop icon",
  "拖动图片调整位置": "Drag the image to reposition it",
  "缩放": "Zoom",
  "使用裁切": "Use crop",
  "清空搜索": "Clear search",
  "没有找到匹配的站点": "No matching websites",
  "试试更少的关键词，或清除筛选。": "Try fewer keywords or clear the filters.",
  "清除搜索和分类筛选": "Clear search and category filters",
  "搜索站点": "Search websites",
  "浏览器标签页标题": "Browser tab title",
  "留空使用默认标题": "Leave blank to use the default title",
  "显示在浏览器标签页，与页面主标题独立。": "Shown in the browser tab, independently of the homepage heading.",
  "浏览器标签页图标": "Browser tab icon",
  "与标题一起保存，刷新后保留。": "Saved together with the title and retained after refresh.",
  "外观模式": "Appearance",
  "跟随系统": "Follow system",
  "切换为浅色": "Switch to light",
  "切换为深色": "Switch to dark",
  "恢复默认设置": "Restore defaults",
  "重置站点、分类、标题、图标、语言和主题。": "Reset websites, categories, titles, icons, language and theme."
};

function t(text) {
  return language === "en" ? (EN[text] || text) : text;
}

document.documentElement.lang = language;

const systemTheme = window.matchMedia("(prefers-color-scheme: dark)");
let themePreference = "light";
try {
  const saved = localStorage.getItem("doodle_theme_v1");
  if (["system", "light", "dark"].includes(saved)) themePreference = saved;
} catch (_) {}

function applyTheme() {
  const dark = themePreference === "dark" || (themePreference === "system" && systemTheme.matches);
  document.documentElement.setAttribute("data-theme", dark ? "chalk" : "paper");
  const button = document.getElementById("manual-theme-btn");
  const follow = document.getElementById("follow-system");
  if (button && follow) {
    follow.checked = themePreference === "system";
    button.disabled = follow.checked;
    button.textContent = t(dark ? "☾ 深色模式" : "☀ 浅色模式");
    button.setAttribute("aria-pressed", String(dark));
    button.setAttribute("aria-label", t(dark ? "切换为浅色" : "切换为深色"));
  }
}
applyTheme();
systemTheme.addEventListener("change", applyTheme);
